const PurchaseOrder = require('../models/PurchaseOrder');

exports.createPO = async (req, res) => {
  try {
    const po = new PurchaseOrder(req.body);
    if (po.items && po.items.length > 0) {
      po.totalAmount = po.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }
    await po.save();
    res.status(201).json(po);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPOs = async (req, res) => {
  try {
    const { status, vendor } = req.query;
    let query = {};
    if (status) query.status = status;
    if (vendor) query.vendor = { $regex: vendor, $options: 'i' };
    const pos = await PurchaseOrder.find(query).sort({ createdAt: -1 });
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPOById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase order not found' });
    res.json(po);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePO = async (req, res) => {
  try {
    const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!po) return res.status(404).json({ message: 'Purchase order not found' });
    res.json(po);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePO = async (req, res) => {
  try {
    await PurchaseOrder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Purchase order deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
