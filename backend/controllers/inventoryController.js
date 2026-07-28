const InventoryItem = require('../models/InventoryItem');

exports.createItem = async (req, res) => {
  try {
    const item = new InventoryItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const { search, category, lowStock } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$minStock'] };
    }
    const items = await InventoryItem.find(query).sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adjustStock = async (req, res) => {
  try {
    const { quantity, type } = req.body;
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (type === 'add') item.quantity += Math.abs(quantity);
    else if (type === 'remove') item.quantity = Math.max(0, item.quantity - Math.abs(quantity));
    else item.quantity = quantity;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await InventoryItem.countDocuments({ isActive: true });
    const lowStock = await InventoryItem.countDocuments({ isActive: true, $expr: { $lte: ['$quantity', '$minStock'] } });
    const totalValue = await InventoryItem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$unitPrice'] } } } }
    ]);
    const byCategory = await InventoryItem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, value: { $sum: { $multiply: ['$quantity', '$unitPrice'] } } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ total, lowStock, totalValue: totalValue[0]?.total || 0, byCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
