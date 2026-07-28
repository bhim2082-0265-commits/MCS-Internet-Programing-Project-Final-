const express = require('express');
const router = express.Router();
const { createEmployee, getEmployees, getEmployeeById, updateEmployee, deleteEmployee, getStaffStats } = require('../controllers/employeeController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createEmployee);
router.get('/', auth, getEmployees);
router.get('/stats', auth, getStaffStats);
router.get('/:id', auth, getEmployeeById);
router.put('/:id', auth, updateEmployee);
router.delete('/:id', auth, deleteEmployee);

module.exports = router;
