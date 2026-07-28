const LabTest = require('../models/LabTest');

exports.createTest = async (req, res) => {
  try {
    const test = new LabTest(req.body);
    await test.save();
    res.status(201).json(test);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTests = async (req, res) => {
  try {
    const { search, category, isActive } = req.query;
    let query = {};
    if (search) query.testName = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    const tests = await LabTest.find(query).sort({ testName: 1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTestById = async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const test = await LabTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    await LabTest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
