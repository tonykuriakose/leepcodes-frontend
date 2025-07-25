
# Leepcodes E-commerce Frontend

## ⚙️ Features

- JWT-based Login (for superadmin/admin)
- Product List, Create, Edit (role-based)
- User List (superadmin only)
- Cart Page (user-specific)
- Functional Admin Dashboard
- Axios for API calls
- JWT stored in `localStorage`


## 🛠️ Tech Stack

- React.js
- Axios
- React Router
- localStorage for JWT


## 🔧 Setup Instructions

### 1. Clone the repository


git clone https://github.com/tonykuriakose/leepcodes-frontend

cd leepcodes-frontend

### 2. Install dependencies
npm install

### 3. Start the app
npm run dev


The frontend will run on `http://localhost:3000`.

## ⚙️ Configuration

const API_URL = "http://localhost:5000/api";


## 🧑‍🤝‍🧑 Role-Based UI Access

* **superadmin**: Access to all features including product delete and admin creation.
* **admin**: Can only add/edit/view products and view cart.


