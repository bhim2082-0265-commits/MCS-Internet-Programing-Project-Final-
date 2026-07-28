const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/vitals', require('./routes/vitals'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/lab-tests', require('./routes/labTests'));
app.use('/api/lab-reports', require('./routes/labReports'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/admissions', require('./routes/admissions'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/audit-logs', require('./routes/auditLogs'));
app.use('/api/insurance', require('./routes/insurance'));
app.use('/api/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/medical-records', require('./routes/medicalRecords'));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join_room', (room) => {
    socket.join(room);
  });
  
  socket.on('queue_update', (data) => {
    io.to('reception').emit('queue_updated', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('io', io);

app.get('/', (req, res) => {
  res.json({ message: 'Lincoln International Hospital and Research center API' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
