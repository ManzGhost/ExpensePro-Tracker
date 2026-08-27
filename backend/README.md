# ExpenseFlow - Java Spring Boot & MongoDB Backend

A robust, secure, and production-ready **Java 17+ Spring Boot & MongoDB** REST API backend designed for the ExpenseFlow personal finance web application.

---

## 🏗️ Architecture Overview

The backend follows a clean, layered enterprise architecture:

```text
backend/
├── pom.xml                                    # Maven project definition & dependencies
├── src/
│   ├── main/
│   │   ├── java/com/expenseflow/
│   │   │   ├── ExpenseFlowApplication.java    # Main Spring Boot application entrypoint
│   │   │   ├── config/                        # CORS, MongoDB Auditing configurations
│   │   │   │   ├── CorsConfig.java
│   │   │   │   └── MongoConfig.java
│   │   │   ├── controller/                    # REST API Controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── UserController.java
│   │   │   │   ├── ExpenseController.java
│   │   │   │   └── HealthController.java
│   │   │   ├── dto/                           # Data Transfer Objects & Validation
│   │   │   │   ├── ApiResponse.java
│   │   │   │   ├── AuthRequest.java
│   │   │   │   ├── AuthResponse.java
│   │   │   │   ├── BulkDeleteRequest.java
│   │   │   │   ├── ExpenseRequest.java
│   │   │   │   ├── ExpenseResponse.java
│   │   │   │   ├── ExpenseSummaryResponse.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   └── UserResponse.java
│   │   │   ├── exception/                     # Global Exception Handler & Custom Exceptions
│   │   │   │   ├── BadRequestException.java
│   │   │   │   ├── ErrorResponse.java
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── UnauthorizedException.java
│   │   │   │   └── UserAlreadyExistsException.java
│   │   │   ├── model/                         # MongoDB Document Entities
│   │   │   │   ├── Expense.java
│   │   │   │   └── User.java
│   │   │   ├── repository/                    # Spring Data MongoDB Repositories
│   │   │   │   ├── ExpenseRepository.java
│   │   │   │   └── UserRepository.java
│   │   │   ├── security/                      # JWT, BCrypt, Security Filters
│   │   │   │   ├── JwtAuthenticationEntryPoint.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── JwtUtils.java
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── UserDetailsImpl.java
│   │   │   │   └── UserDetailsServiceImpl.java
│   │   │   └── service/                       # Business Logic Services
│   │   │       ├── AuthService.java
│   │   │       ├── ExpenseService.java
│   │   │       └── UserService.java
│   │   └── resources/
│   │       └── application.properties         # App properties and environment variable bindings
└── README.md
```

---

## 🔒 Critical User Data Isolation & Security

1. **Token-Extracted Principals**: The backend **never** relies on or trusts `userId` supplied in client request payloads or URL parameters for data manipulation.
2. **Spring Security Context**: The user identity is extracted directly from the verified HMAC-signed JWT token inside `JwtAuthenticationFilter` and injected into `@AuthenticationPrincipal UserDetailsImpl`.
3. **Strict Query Scoping**: Every MongoDB query (`findByUserId`, `findByIdAndUserId`, `deleteByIdAndUserId`, `deleteAllByUserId`, `countByUserId`) enforces `userId` scoping, ensuring User A can never read, modify, or delete records created by User B.
4. **BCrypt Password Hashing**: Passwords are securely hashed using BCrypt (strength 12) before persistence in MongoDB.

---

## 🗄️ MongoDB Schema & Collections

### 1. `users` Collection
- **`id`**: String / ObjectId
- **`name`**: String (User's display name)
- **`email`**: String (Unique, case-insensitive index)
- **`password`**: String (BCrypt hashed)
- **`createdAt`**: Instant (Audited creation timestamp)

### 2. `expenses` Collection
- **`id`**: String / ObjectId
- **`userId`**: String (Indexed user reference)
- **`title`**: String (Expense title)
- **`amount`**: Double (Monetary amount)
- **`category`**: String (e.g., Food & Dining, Groceries, Transportation, etc.)
- **`date`**: String (`YYYY-MM-DD` indexed with compound `{userId: 1, date: -1}`)
- **`paymentMethod`**: String (Credit Card, UPI, Cash, Debit Card, etc.)
- **`description` / `notes`**: String (Optional memo/notes)
- **`createdAt`**: Instant (Audited timestamp)
- **`updatedAt`**: Instant (Audited timestamp)

---

## 🚀 Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB connection URI string | `mongodb://localhost:27017/expenseflow` |
| `JWT_SECRET` | Secret key for signing HMAC-SHA JWT tokens | *Default internal secret (Change in production)* |
| `PORT` | Spring Boot HTTP listening port | `8080` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `http://localhost:3000,http://localhost:5173` |

---

## 📡 REST API Reference

### 🔐 Authentication

#### 1. Register New User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Request Body**:
```json
{
  "name": "David Dhawan",
  "email": "david@expenseflow.com",
  "password": "SecurePassword123"
}
```
- **Response** (`201 Created`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "type": "Bearer",
  "user": {
    "id": "66cb019f8e4a902b1156a001",
    "name": "David Dhawan",
    "email": "david@expenseflow.com",
    "createdAt": "2026-08-25T23:15:00Z"
  }
}
```

#### 2. User Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Request Body**:
```json
{
  "email": "david@expenseflow.com",
  "password": "SecurePassword123"
}
```
- **Response** (`200 OK`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "type": "Bearer",
  "user": {
    "id": "66cb019f8e4a902b1156a001",
    "name": "David Dhawan",
    "email": "david@expenseflow.com",
    "createdAt": "2026-08-25T23:15:00Z"
  }
}
```

---

### 👤 User Profile

#### Get Current User Details
- **Method**: `GET`
- **Path**: `/api/users/me`
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response** (`200 OK`):
```json
{
  "id": "66cb019f8e4a902b1156a001",
  "name": "David Dhawan",
  "email": "david@expenseflow.com",
  "createdAt": "2026-08-25T23:15:00Z"
}
```

---

### 💰 Expenses (CRUD & Analytics)

#### 1. List / Filter Expenses
- **Method**: `GET`
- **Path**: `/api/expenses`
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Query Parameters**:
  - `search` (e.g. `groceries`)
  - `category` (e.g. `Food & Dining`)
  - `paymentMethod` (e.g. `Credit Card`)
  - `startDate` (e.g. `2026-08-01`)
  - `endDate` (e.g. `2026-08-31`)
  - `minAmount` (e.g. `10.0`)
  - `maxAmount` (e.g. `500.0`)
  - `sortBy` (`date_desc`, `date_asc`, `amount_desc`, `amount_asc`, `title_asc`, `title_desc`)
- **Response** (`200 OK`):
```json
[
  {
    "id": "66cb021e8e4a902b1156a004",
    "userId": "66cb019f8e4a902b1156a001",
    "title": "Whole Foods Organic Groceries",
    "amount": 114.50,
    "category": "Groceries",
    "date": "2026-08-25",
    "paymentMethod": "Credit Card",
    "description": "Weekly organic vegetables and bread",
    "notes": "Weekly organic vegetables and bread",
    "createdAt": 1787702400000,
    "updatedAt": 1787702400000
  }
]
```

#### 2. Create Expense
- **Method**: `POST`
- **Path**: `/api/expenses`
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Request Body**:
```json
{
  "title": "Specialty Espresso",
  "amount": 8.75,
  "category": "Food & Dining",
  "date": "2026-08-25",
  "paymentMethod": "Digital Wallet",
  "notes": "Morning coffee meeting"
}
```

#### 3. Update Expense
- **Method**: `PUT`
- **Path**: `/api/expenses/{id}`
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Request Body**: Partial or full update payload

#### 4. Delete Expense
- **Method**: `DELETE`
- **Path**: `/api/expenses/{id}`
- **Headers**: `Authorization: Bearer <jwt-token>`

#### 5. Bulk Delete Expenses
- **Method**: `POST`
- **Path**: `/api/expenses/bulk-delete`
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Request Body**:
```json
{
  "ids": ["66cb021e8e4a902b1156a004", "66cb021e8e4a902b1156a005"]
}
```

#### 6. Bulk Import Expenses
- **Method**: `POST`
- **Path**: `/api/expenses/import`
- **Headers**: `Authorization: Bearer <jwt-token>`

#### 7. Clear All Expenses
- **Method**: `DELETE`
- **Path**: `/api/expenses/all`
- **Headers**: `Authorization: Bearer <jwt-token>`

#### 8. Financial Summary & Analytics
- **Method**: `GET`
- **Path**: `/api/expenses/summary`
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response** (`200 OK`):
```json
{
  "totalExpenses": 2435.80,
  "totalTransactions": 16,
  "averageExpense": 152.24,
  "highestExpense": 1250.00,
  "mostFrequentCategory": "Food & Dining",
  "categoryBreakdown": {
    "Food & Dining": 420.50,
    "Groceries": 380.00,
    "Housing & Rent": 1250.00
  },
  "paymentMethodBreakdown": {
    "Credit Card": 1520.00,
    "Debit Card": 435.80
  },
  "monthlyTrends": {
    "2026-07": 1950.00,
    "2026-08": 2435.80
  }
}
```

---

## 🛠️ Build & Run Instructions

### 1. Prerequisites
- **JDK 17+** (`java -version`)
- **Maven 3.8+** (`mvn -v`)
- **MongoDB 6.0+** running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI

### 2. Configure Environment
Set the environment variables or edit `application.properties`:
```bash
export MONGODB_URI="mongodb://localhost:27017/expenseflow"
export JWT_SECRET="your_custom_jwt_secret_with_sufficient_security_entropy"
```

### 3. Build with Maven
```bash
cd backend
mvn clean package -DskipTests
```

### 4. Run Application
```bash
mvn spring-boot:run
# or execute JAR:
java -jar target/expenseflow-backend-1.0.0.jar
```

The server will start on `http://localhost:8080`.
Verify backend health check at: `http://localhost:8080/api/health`.
