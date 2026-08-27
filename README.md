# 💰 ExpensePro Tracker

A full-stack expense management application built with **React, TypeScript, Spring Boot, MongoDB, and JWT Authentication**.

ExpensePro Tracker helps users securely manage their personal expenses, track spending, analyze financial trends, and maintain their budget from a modern dashboard.

## 🚀 Features

- 🔐 User Registration & Login
- 🔑 JWT-based Authentication
- 💰 Add, Edit & Delete Expenses
- 📊 Expense Analytics & Monthly Trends
- 📈 Category-wise Expense Breakdown
- 💳 Payment Method Tracking
- 📅 Day-of-Week Spending Analysis
- 💵 Budget Management
- 🔎 Expense Filtering & Search
- 📥 Import & Export Expense Data
- 🗑️ Bulk Delete Expenses
- 👤 User-specific Expense Data
- 📱 Responsive Dashboard
- 🔒 Secure Environment Variables

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS
- Axios

### Backend
- Java
- Spring Boot
- Spring Security
- JWT
- Maven

### Database
- MongoDB

## 📁 Project Structure

```text
ExpensePro-Tracker/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/expenseflow/
│   │       │   ├── config/
│   │       │   ├── controller/
│   │       │   ├── dto/
│   │       │   ├── exception/
│   │       │   ├── model/
│   │       │   ├── repository/
│   │       │   ├── security/
│   │       │   └── service/
│   │       └── resources/
│   ├── pom.xml
│   └── README.md
│
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
