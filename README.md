# Lincoln International Hospital & Research Center - Hospital Management System

A comprehensive hospital management system built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring real-time updates via Socket.io.

## Tech Stack

**Frontend:**
- React 18 with React Router DOM
- Vite (build tool)
- Tailwind CSS (styling)
- Axios (HTTP client)
- Socket.io Client (real-time communication)
- Lucide React (icons)
- React Hot Toast (notifications)

**Backend:**
- Node.js / Express.js
- MongoDB with Mongoose ODM
- JWT authentication (bcryptjs + jsonwebtoken)
- Socket.io (real-time bidirectional communication)
- PDFKit (PDF invoice generation)

## Features

- **Authentication & Authorization** - Secure login with JWT, role-based access control
- **Patient Management** - Register, update, search, and manage patient records
- **Appointment Scheduling** - Book, reschedule, and manage appointments with real-time queue updates
- **Billing & Invoicing** - Generate invoices, process payments, PDF invoice export
- **Pharmacy** - Medicine inventory management, prescription fulfillment
- **Laboratory** - Lab test management, report generation
- **Inpatient Management** - Room allocation, admissions, discharge management
- **Staff Management** - Employee records, attendance tracking, doctor fee management
- **Inventory** - Supply chain management, purchase orders, stock tracking
- **Medical Records** - Electronic health records management
- **Insurance** - Insurance claim processing and management
- **Notifications** - Real-time notification system
- **Audit Logs** - Comprehensive activity logging
- **Analytics Dashboard** - Key hospital metrics and insights
- **Real-time Updates** - Queue status, notifications via Socket.io

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bhim2082-0265-commits/MCS-Internet-Programing-Project-Final-.git
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Create a .env file in backend/ with:
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   ```

4. Seed the database (optional):
   ```bash
   node seedDoctors.js
   node seedPatients.js
   node seedEmployees.js
   node seedMedicines.js
   node seedLabTests.js
   node seedRooms.js
   node seedInventory.js
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

6. Set up the frontend (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. Open `http://localhost:5173` in your browser.

## API Endpoints

The backend exposes RESTful API endpoints under `/api/`:
- `/api/auth` - Authentication
- `/api/patients` - Patient records
- `/api/appointments` - Appointment management
- `/api/prescriptions` - Prescription management
- `/api/invoices` - Billing and invoices
- `/api/vitals` - Patient vitals
- `/api/analytics` - Dashboard analytics
- `/api/payments` - Payment processing
- `/api/medicines` - Pharmacy inventory
- `/api/lab-tests` - Laboratory tests
- `/api/lab-reports` - Lab report management
- `/api/rooms` - Room management
- `/api/admissions` - Patient admissions
- `/api/employees` - Staff management
- `/api/attendance` - Staff attendance
- `/api/inventory` - Hospital inventory
- `/api/notifications` - Notification system
- `/api/audit-logs` - Activity audit logs
- `/api/insurance` - Insurance management
- `/api/purchase-orders` - Purchase orders
- `/api/medical-records` - Medical records

## Project Structure

```
MCS-Internet-Programing-Project-Final-/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── invoices/        # Generated PDF invoices
│   ├── middleware/       # Auth & other middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── utils/           # Utility functions
│   ├── server.js        # Entry point
│   ├── seed*.js         # Database seed scripts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/       # React page components
│   │   ├── services/    # API service layer
│   │   ├── App.jsx      # Main app with routing
│   │   ├── main.jsx     # Entry point
│   │   └── index.css    # Tailwind styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```
