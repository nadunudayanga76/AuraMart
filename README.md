# 🛍️ AuraMart - Modern E-Commerce Platform

![AuraMart Banner](https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1200&h=400)

AuraMart is a full-stack, professional-grade E-Commerce web application built with the **MERN** stack (MongoDB, Express, React, Node.js). It offers a rich, butter-smooth shopping experience with advanced features like variant-level inventory management, context-aware dynamic filtering, and a powerful Admin Dashboard.

---

## ✨ Key Features

### 👤 For Customers
- **Modern UI/UX**: Fully responsive, beautifully designed interface using Tailwind CSS.
- **Advanced Filtering**: Context-aware dynamic category, size, and brand filtering.
- **Variant Selection**: Choose specific colors and sizes for products with real-time stock updates.
- **Secure Authentication**: JWT-based user login and registration.
- **Cart & Wishlist**: Persistent cart and wishlist tailored per user.
- **Order Tracking**: Seamless checkout process with order history and tracking.
- **Product Reviews**: Read and write reviews and ratings for purchased products.

### 🛡️ For Admins
- **Comprehensive Dashboard**: View sales statistics, total revenue, and manage the store.
- **Variant-Level Inventory**: Add products with specific size/color variants; the system automatically calculates total stock.
- **Order Management**: Track, update, and manage customer orders.
- **Invoice Generation**: One-click professional PDF invoice generation for orders.
- **User Management**: View and manage customer accounts.

---

## 🛠️ Technology Stack

**Frontend:**
- ⚛️ **React.js** (Vite)
- 🎨 **Tailwind CSS** for styling
- 🗃️ **Redux Toolkit** for state management
- 🛣️ **React Router** for navigation
- 📄 **jsPDF** for invoice generation

**Backend:**
- 🟢 **Node.js** & **Express.js**
- 🍃 **MongoDB** with **Mongoose**
- 🔒 **JSON Web Tokens (JWT)** & **Bcrypt** for security
- ☁️ **Cloudinary** for scalable image hosting

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed on your machine. You will also need a MongoDB database and a Cloudinary account.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nadunudayanga76/AuraMart.git
   cd AuraMart
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory and add the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

### Running the App Locally

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

---

## 📸 Screenshots

*(Add your screenshots here!)*

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---
*Built with ❤️ by Nadun Udayanga.*