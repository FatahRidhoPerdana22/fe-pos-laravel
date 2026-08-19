# 🏪 Point of Sale (POS) Frontend Client

A modern, highly responsive, and feature-rich Point of Sale (POS) frontend web application built using **Vue 3**, **Vite**, **TypeScript**, **PrimeVue**, and **Tailwind CSS v4**. This client communicates with a backend REST API to perform store sales, manage inventory catalog, manage customer relationships, and track daily transaction histories.

---

## 🚀 Key Features

- **🔐 User Authentication**: Secure login, token-based session validation (JWT stored in LocalStorage), and route protection (guest/auth route guards).
- **📊 Interactive Dashboard**: Visual metrics presenting store performance summaries and key metrics.
- **🛒 POS Cashier Checkout**:
  - Direct search and selection of items.
  - Interactive cart system with automatic price, tax, and discount computations.
  - Real-time customer assignment to checkout orders.
  - Transaction processing and checkout workflows.
- **📦 Product Management**:
  - Full CRUD operations for product inventory.
  - Barcode/SKU, category, price, and stock levels tracking.
- **📂 Category Management**: Organise products into categories for easy inventory categorization.
- **👥 Customer Relationship Management**: Maintain and manage customer directories.
- **🧾 Transaction History**: Detailed log of sales transactions, including receipt details.
- **⏳ Global API Loading State**: Integrated UI loading indicator during Axios network requests.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Core Framework** | [Vue 3](https://vuejs.org/) | Composition API, `<script setup>`, and TypeScript. |
| **State Management**| [Pinia](https://pinia.vuejs.org/) | Modular stores managing cart, auth, products, transactions, and loading states. |
| **Routing** | [Vue Router 5](https://router.vuejs.org/) | Clean routes, history mode, and navigational auth guards. |
| **UI Components** | [PrimeVue 4](https://primevue.org/) | High-quality component library, using the `Aura` theme with a customized `emerald` primary color palette. |
| **Icons** | [PrimeIcons](https://github.com/primefaces/primeicons) | Lightweight icon system from PrimeTek. |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first CSS framework configured via Vite integration. |
| **API Client** | [Axios](https://axios-http.com/) | Interceptors for Bearer Token injection and automatic loader toggling. |
| **Build System** | [Vite 8](https://vite.dev/) | Ultra-fast build tool and dev server featuring integrated Vue DevTools. |

---

## 📂 Project Directory Structure

```text
fe-pos/
├── public/                  # Static assets
└── src/
    ├── api/                 # Axios configuration and API request modules
    │   ├── auth.api.ts
    │   ├── axios.ts         # Axios interceptors (JWT auth + Loading spinner)
    │   ├── customers.api.ts
    │   ├── product-categories.api.ts
    │   ├── products.api.ts
    │   └── transactions.api.ts
    ├── assets/              # Global CSS stylesheets
    │   └── main.css
    ├── layout/              # Common UI layouts (AppLayout, sidebar, header)
    │   └── AppLayout.vue
    ├── pages/               # Page views mapped to Router paths
    │   ├── auth/            # Login and sign-in pages
    │   ├── customers/       # Customer forms and list views
    │   ├── pos/             # POS Cashier interface
    │   ├── product-categories/
    │   ├── products/
    │   ├── transactions/
    │   └── Dashboard.vue    # Dashboard view
    ├── router/              # Route definitions & guards
    │   └── index.ts
    ├── stores/              # Pinia state stores (auth, cart, product, etc.)
    ├── types/               # TypeScript interface and type definitions
    ├── App.vue              # Application Root component
    └── main.ts              # Entry point setting up PrimeVue, Router, Pinia
```

---

## 💻 Getting Started

### Prerequisites

- **Node.js**: `^22.18.0` or `>=24.12.0` (as defined in `package.json`).
- **NPM**: standard Node Package Manager.

### 1. Installation

Clone the repository and install project dependencies:

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root directory and set the API Base URL:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

*Note: For local development, point this to your running Laravel backend server.*

### 3. Development Server

Start the local development server with hot-reload and Vue DevTools:

```bash
npm run dev
```

The app will typically be available at [http://localhost:5173/](http://localhost:5173/).

### 4. Build and Compilation

To check types and compile the codebase into a production-ready package:

```bash
npm run build
```

This compiles files and outputs static assets to the `/dist` directory.

### 5. Preview Production Build

To preview the compiled production build locally:

```bash
npm run preview
```

---

## ⚙️ Configuration Details

### Theme & Styling
This application configures PrimeVue with an Aura preset customized with Emerald colors (e.g. `{emerald.50}` to `{emerald.950}`).
Dark mode can be enabled or configured dynamically by toggling the `.app-dark` class on the application root.

### API Routing & Proxy (Vercel)
For Vercel deployments, the application redirects `/api/*` traffic directly to the production backend:
- Production target: `https://kasir-pos.whf.bz/api/:path*`
This configuration is specified in the [vercel.json](file:///c:/laragon/www/fe-pos/vercel.json) file.
