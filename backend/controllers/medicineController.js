const Medicine = require('../models/Medicine');

exports.createMedicine = async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Medicine with this name already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

exports.getMedicines = async (req, res) => {
  try {
    const { search, category, isActive } = req.query;
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    const medicines = await Medicine.find(query).sort({ name: 1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json({ message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMedicineStats = async (req, res) => {
  try {
    const totalMedicines = await Medicine.countDocuments();
    const categories = await Medicine.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const lowStock = await Medicine.countDocuments({ stock: { $lt: 10 }, stock: { $gt: 0 } });
    const outOfStock = await Medicine.countDocuments({ stock: 0 });
    res.json({ totalMedicines, categories, lowStock, outOfStock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
