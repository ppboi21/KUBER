# 🪙 KUBER — Track Every Rupee

> *Inspired by Kubera, the Hindu God of Wealth*

**KUBER** is a real-world, production-level expense tracking web application built with React and Firebase. It empowers users to take full control of their personal finances — log daily expenses, set monthly budgets, visualize spending patterns, and make smarter money decisions. All data is securely stored in the cloud and accessible from any device.

🌐 **Live Demo:** [kuber-expense-tracker.vercel.app](https://kuber-expense-tracker.vercel.app)  
📁 **GitHub:** [github.com/ppboi21/KUBER](https://github.com/ppboi21/KUBER)

---

## 🎯 Problem Statement

Most people have no idea where their money goes every month. Generic banking apps show raw transactions but offer no budget control, no spending insights, and no way to reflect on financial habits. This leads to overspending, poor saving habits, and financial stress — especially for students and young professionals.

**KUBER** solves this by providing:

- A clean, intuitive interface to log and categorize every expense
- Real-time budget tracking so you never overspend
- Visual charts that turn raw numbers into meaningful insights
- Secure cloud storage so your data is always safe and accessible

**Who is the user?**  
Students, young professionals, freelancers, and anyone who wants to build better financial habits and gain clarity over their spending.

**Why does this problem matter?**  
Financial awareness is the first step to financial freedom. When you know where your money goes, you can make better decisions — save more, stress less, and work towards your goals.

---

## ✨ Features

### 🔐 Authentication
- Sign in with **Google** (one click)
- Sign in with **Email & Password**
- Secure session management with Firebase Auth
- Protected routes — only logged-in users can access the app

### 📊 Dashboard
- Overview of total **income**, **expenses**, and **balance**
- Monthly summary at a glance
- Quick access to recent transactions

### ➕ Expense Management
- Add expenses with **category, amount, date, and notes**
- Edit or delete any existing transaction
- Filter and search through your expense history
- Full **CRUD** functionality powered by Firestore

### 📈 Charts & Insights
- **Pie chart** — spending breakdown by category
- **Bar chart** — monthly spending trends
- Powered by **Recharts** for smooth, interactive visuals

### 💰 Budget Tracker
- Set a monthly budget for each category
- Visual progress bars showing how much of your budget is used
- Instant alerts when you're close to or over budget

### 📱 Responsive Design
- Fully responsive — works seamlessly on mobile, tablet, and desktop
- Clean, minimal dark-themed UI for a focused experience

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 |
| Routing | React Router v7 |
| State Management | Context API, useState, useEffect, useMemo |
| Custom Hooks | useExpenses, useBudget |
| Backend / Database | Firebase Firestore |
| Authentication | Firebase Auth (Google + Email/Password) |
| Data Visualization | Recharts |
| Styling | CSS Modules |
| Deployment | Vercel |

---

## ⚛️ React Concepts Used

| Concept | Usage |
|---|---|
| Functional Components | Entire app built with functional components |
| useState | Managing local UI state |
| useEffect | Fetching data from Firestore on mount |
| useContext | Global auth and expense state |
| useMemo | Optimizing chart data calculations |
| useRef | Form input references |
| Custom Hooks | `useExpenses`, `useBudget` for reusable logic |
| React Router | Multi-page navigation with protected routes |
| Conditional Rendering | Auth-based UI rendering |
| Controlled Components | All forms use controlled inputs |

---

## 🗂️ Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Navbar.js
│   ├── Sidebar.js
│   ├── Footer.js
│   ├── ExpenseList.js
│   └── Charts.js
├── pages/            # Route-level pages
│   ├── Login.js
│   ├── Dashboard.js
│   └── Budget.js
├── hooks/            # Custom React hooks
│   ├── useExpenses.js
│   └── useBudget.js
├── context/          # Global state via Context API
│   └── AuthContext.js
└── services/         # Firebase config and Firestore functions
    └── firebase.js
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v16 or above)
- A Firebase account

### 1. Clone the repository
```bash
git clone https://github.com/ppboi21/KUBER.git
cd KUBER
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Firebase
- Go to [Firebase Console](https://console.firebase.google.com)
- Create a new project
- Enable **Authentication** → Google + Email/Password
- Create a **Firestore** database in production mode
- Go to Project Settings → copy your Firebase config

### 4. Create a `.env` file in the root directory
```env
REACT_APP_API_KEY=your_api_key
REACT_APP_AUTH_DOMAIN=your_auth_domain
REACT_APP_PROJECT_ID=your_project_id
REACT_APP_STORAGE_BUCKET=your_storage_bucket
REACT_APP_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_APP_ID=your_app_id
```

> ⚠️ Never commit your `.env` file. It is already added to `.gitignore`.

### 5. Start the development server
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

---

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `/build` folder, ready for deployment.

---

## 🚀 Deployment

This project is deployed on **Vercel**. Any push to the `main` branch automatically triggers a new deployment.

To deploy your own version:
1. Fork this repository
2. Import it on [vercel.com](https://vercel.com)
3. Add your Firebase environment variables in Vercel project settings
4. Deploy!

---

## 👨‍💻 Author

**Praveen Panigrahi**  
GitHub: [@ppboi21](https://github.com/ppboi21)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> *"Know where every rupee goes — because financial clarity is the first step to financial freedom."* 🪙
