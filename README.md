# Lincoln Hospital Management System

A full-stack hospital management system built with the MERN stack and real-time capabilities.

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Axios, Socket.io Client  
**Backend:** Node.js, Express, MongoDB/Mongoose, JWT, Socket.io, PDFKit

## Features

- Patient registration & management
- Appointment scheduling with real-time queue
- Billing, invoicing & PDF generation
- Pharmacy & medicine inventory
- Laboratory test management & reports
- Inpatient admission, discharge & room management
- Staff management & attendance tracking
- Hospital inventory & purchase orders
- Medical records (EHR)
- Insurance claim processing
- Real-time notifications
- Audit logging
- Analytics dashboard

## Quick Start

```bash
# Clone
git clone https://github.com/bhim2082-0265-commits/MCS-Internet-Programing-Project-Final-.git

# Backend
cd backend
npm install
# Create .env file (PORT, MONGODB_URI, JWT_SECRET, FRONTEND_URL)
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Project Structure

```
backend/
├── config/          Database config
├── controllers/     Route handlers
├── middleware/       Auth middleware
├── models/          Mongoose schemas
├── routes/          API routes
├── server.js        Entry point
└── seed*.js         Data seeders

frontend/
└── src/
    ├── pages/       Page components
    ├── services/    API service layer
    ├── App.jsx      Router setup
    └── main.jsx     Entry point
```
