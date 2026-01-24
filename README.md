# 📦 Sales Order and Invoice Management System

A **Sales Order and Invoice Management System** built using **FastAPI** for the backend and **HTML, CSS, JavaScript** for the frontend.  
This system helps manage customers, products, sales orders, and invoices through RESTful APIs and a simple user interface.

---

## 🚀 Features

- Customer Management (Add, View, Update)
- Product Management
- Sales Order Creation
- Invoice Generation
- REST API built with FastAPI
- Interactive API documentation using Swagger UI
- Simple frontend interface connected to backend APIs

---

## 🛠️ Tech Stack

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic

### Frontend
- HTML
- CSS
- JavaScript

---

## 📁 Project Structure

```
Sales-Order-and-Invoice-Management-System/
│
├── Backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   │
│   ├── routes/
│   │   ├── customer.py
│   │   ├── product.py
│   │   ├── order.py
│   │   └── invoice.py
│   │
│   └── tests/
│       ├── test_customer.py
│       ├── test_product.py
│       ├── test_order.py
│       └── test_invoice.py
│
├── client/
│   ├── pages/
│   │   ├── index.html
│   │   ├── order.html
│   │   └── invoice.html
│   │
│   ├── js/
│   │   └── script.js
│   │
│   └── css/
│       └── style.css
│
└── README.md

```
## ▶️ How to Run the Project
  # 1️⃣ Clone the Repository
  ```
git clone https://github.com/ADHARSH45/Sales-Order-and-Invoice-Management-System.git
cd Sales-Order-and-Invoice-Management-System
```
# 2️⃣ Create Virtual Environment
```
cd Backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
```
# 3️⃣ Install Dependencies
```
uvicorn main:app --reload
```
Backend URL: http://127.0.0.1:8000
Swagger UI: http://127.0.0.1:8000/docs

# 5️⃣ Run Client
Open client/pages/index.html in a browser

## 🧪 Testing

```
cd Backend
pytest -v
```

