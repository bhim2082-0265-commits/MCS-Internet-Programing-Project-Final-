# Lincoln Hospital Management System

A full-stack hospital management system with real-time capabilities.

---

## 1. Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Axios, Socket.io Client  
**Backend:** Node.js, Express, MongoDB/Mongoose, JWT, Socket.io, PDFKit

---

## 2. Features

| Module | Description |
|--------|-------------|
| Patients | Register, search, manage records |
| Appointments | Schedule with real-time queue |
| Billing | Invoicing, payments, PDF export |
| Pharmacy | Medicine inventory, prescriptions |
| Laboratory | Test management & reports |
| Inpatient | Admissions, rooms, discharge |
| Staff | Employees, attendance, doctor fees |
| Inventory | Stock tracking, purchase orders |
| Medical Records | Electronic health records |
| Insurance | Claim processing & management |
| Notifications | Real-time alerts |
| Audit Logs | Activity tracking |
| Dashboard | Analytics & key metrics |

---

## 3. Setup

```
# backend
~ cd backend
~ npm install
~ # .env: PORT, MONGODB_URI, JWT_SECRET, FRONTEND_URL
~ npm run dev
done ✔

# frontend (new terminal)
~ cd frontend
~ npm install
~ npm run dev
done ✔
```

---

## 4. Structure

```
backend/
├── config/          Database
├── controllers/     Logic
├── middleware/       Auth
├── models/          Schemas
├── routes/          APIs
├── server.js        Entry
└── seed*.js         Data

frontend/
└── src/
    ├── pages/       Views
    ├── services/    API
    ├── App.jsx      Router
    └── main.jsx     Entry
```
