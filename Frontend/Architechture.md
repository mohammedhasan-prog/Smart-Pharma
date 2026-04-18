# 💊 Smart Pharmacy Inventory Management System

A full-stack web application that automates medicine stock tracking, expiry monitoring, and restocking workflows — minimizing manual intervention through intelligent automation and role-based access.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                    React.js Frontend                            │
│    ┌──────────────┐              ┌──────────────────────┐       │
│    │ Seller (Pharmacist)         │ Super User (Wholesaler)│      │
│    │  Dashboard                 │    Order Panel        │       │
│    └──────────────┘              └──────────────────────┘       │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / REST API
┌────────────────────────────▼────────────────────────────────────┐
│                       SERVER LAYER                              │
│               Node.js + Express.js Backend                      │
│                                                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│   │  Auth    │  │Medicine  │  │  Sell /  │  │    Order     │  │
│   │ Module   │  │ Module   │  │ Reorder  │  │   Module     │  │
│   │ JWT + BCrypt│         │  │  Engine  │  │              │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
│                                    │                            │
│                              ┌─────▼──────┐                     │
│                              │  Nodemailer│ → Email to Supplier │
│                              └────────────┘                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ Mongoose ODM
┌────────────────────────────▼────────────────────────────────────┐
│                      DATABASE LAYER                             │
│                    MongoDB Atlas (Cloud)                         │
│                                                                 │
│   ┌──────────┐      ┌─────────────┐      ┌──────────────────┐  │
│   │  Users   │      │  Medicines  │      │     Orders       │  │
│   │Collection│      │ Collection  │      │   Collection     │  │
│   └──────────┘      └─────────────┘      └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 End-to-End Workflow

```
Seller Login
     │
     ▼
Add Medicines (name, salt, stock, reorder level, expiry, supplier)
     │
     ▼
Sell Medicine → Stock Decreases
     │
     ▼
Stock < Reorder Level?
     ├── NO  → Normal operation continues
     └── YES → Auto-Order Created in DB
                    │
                    ▼
              Email Notification → Wholesaler (Nodemailer)
                    │
                    ▼
         Wholesaler Logs In → Views Pending Order
                    │
                    ▼
         Accept Order → Status: "accepted"
                    │
                    ▼
         Mark as Delivered → Status: "delivered"
                    │
                    ▼
         Seller Stock Auto-Updated ✅
```

---

## 👥 User Roles

| Role | Description |
|---|---|
| **Seller (Pharmacist)** | Manages medicines, sells, triggers restocking, monitors expiry |
| **Super User (Wholesaler)** | Receives orders, accepts/rejects, marks as delivered |

---

## ✨ Features

### Core Features
- **Authentication & Authorization** — JWT-based login, registration, and role-based access control
- **Medicine Management** — Add, view, update, and delete medicines with full metadata
- **Auto-Reorder Engine** — Automatically creates an order and emails the supplier when stock drops below threshold
- **Order Management** — Full order lifecycle: pending → accepted → delivered, with automatic stock sync on delivery
- **Expiry Tracking** — Color-coded visual alerts based on expiry proximity
- **Smart Search** — Search medicines by name or by chemical composition (salt)

### Optional Features
- PDF receipt generation after sale
- WhatsApp alert when stock hits zero

---

## 🚨 Expiry Alert System

| Time to Expiry | Color | Action |
|---|---|---|
| Less than 30 days | 🔴 Red | Urgent — remove or return |
| Less than 90 days | 🟡 Yellow | Caution — plan restock |
| 90+ days remaining | ✅ Normal | No action needed |

---

## 🗃️ Database Schema

### Users Collection
```json
{
  "name": "String",
  "email": "String",
  "password": "String (bcrypt hashed)",
  "role": "seller | wholesaler"
}
```

### Medicines Collection
```json
{
  "name": "String",
  "salt": "String",
  "stock": "Number",
  "reorderLevel": "Number",
  "expiryDate": "Date",
  "supplierEmail": "String",
  "sellerId": "ObjectId"
}
```

### Orders Collection
```json
{
  "medicineId": "ObjectId",
  "quantity": "Number",
  "sellerId": "ObjectId",
  "wholesalerId": "ObjectId",
  "status": "pending | accepted | delivered",
  "createdAt": "Date"
}
```

---

## 🌐 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT token |

### Medicines
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/medicines` | Fetch all medicines |
| `POST` | `/medicines` | Add a new medicine |
| `PUT` | `/medicines/:id` | Update medicine details |
| `DELETE` | `/medicines/:id` | Delete a medicine |

### Selling
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/sell` | Sell a medicine; triggers reorder check |

### Orders (Seller)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/orders/my-orders` | View seller's own orders |

### Orders (Wholesaler)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/orders` | View all incoming orders |
| `PUT` | `/orders/:id/accept` | Accept an order |
| `PUT` | `/orders/:id/deliver` | Mark order as delivered |

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (JSON Web Tokens) |
| Password Security | bcrypt |
| Email Service | Nodemailer |
| Cloud Database | MongoDB Atlas |

---

## ⚙️ Non-Functional Requirements

| Requirement | Specification |
|---|---|
| Performance | API response < 1 second |
| Capacity | 100–500 medicine records |
| Browsers | Chrome, Edge |
| OS | Windows, macOS, Linux |
| Security | Input validation + JWT + Password encryption |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd smart-pharmacy

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-jwt-secret>
EMAIL_USER=<your-email>
EMAIL_PASS=<your-email-password>
```

### Running the App

```bash
# Start backend
cd backend
npm start

# Start frontend (in a new terminal)
cd frontend
npm start
```

---

## 🔮 Future Enhancements

- Role-based analytics dashboards
- Sales reports and inventory history
- Barcode scanning for faster data entry
- Mobile application (React Native)
- WhatsApp integration for real-time alerts

---

## 📋 Demo Flow

1. Login as **Seller** → view dashboard with normal stock levels
2. Sell a medicine → observe stock drop below reorder level
3. System **auto-creates order** and sends email to supplier
4. Login as **Wholesaler** → view and accept the order
5. Mark order as **delivered** → seller's stock auto-updates
6. Observe **expiry color alerts** for medicines nearing expiry

---

> **This system demonstrates automation, role-based architecture, and a real-world supply chain simulation for pharmacy operations.**