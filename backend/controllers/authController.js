const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Doctor = require('../models/Doctor');
const { JWT_SECRET } = require('../middleware/auth');

exports.register = async (req, res) => {
  try {
    const { name, email, password, nmcNumber, phone, department, specialty, hospital, location, consultationFee, role } = req.body;
    
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor with this email already exists' });
    }

    const doctor = new Doctor({
      name, email, password, nmcNumber, phone, department, specialty, hospital, location, consultationFee,
      role: role || 'doctor'
    });
    await doctor.save();

    const token = jwt.sign({ id: doctor._id, role: doctor.role }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, doctor });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Doctor.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.getAllDoctors = async (req, res) => {
  try {
    const { department, hospital, search } = req.query;
    let query = { isActive: true };
    if (department) query.department = department;
    if (hospital) query.hospital = hospital;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } }
      ];
    }
    const doctors = await Doctor.find(query)
      .select('-password')
      .sort({ name: 1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorSchedule = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('schedule name department specialty hospital');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Doctor.distinct('department', { isActive: true });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await Doctor.distinct('hospital', { isActive: true });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Doctor.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account with that email exists' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    res.json({ message: 'Password reset link sent', resetToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await Doctor.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
