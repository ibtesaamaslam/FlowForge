
<img width="1774" height="887" alt="02671b31-74c5-4c0b-9812-72333dc544b3" src="https://github.com/user-attachments/assets/4a7b2508-6f4e-4d33-8f78-70db4d8a29a3" />
<br>

<div align="center">

<img src="https://img.shields.io/badge/TypeScript-99.0%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/Tailwind%20CSS-Styling-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
<img src="https://img.shields.io/badge/SheetJS-Excel%20I%2FO-21A366?style=for-the-badge&logo=microsoftexcel&logoColor=white"/>
<img src="https://img.shields.io/badge/Offline--First-localStorage-8B5CF6?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white"/>
<img src="https://img.shields.io/badge/License-MIT-00C853?style=for-the-badge"/>

<br/><br/>

# 📡 FlowForge — ISP Town Manager
### *React 19 · TypeScript · Tailwind CSS · SheetJS · Offline-First*

**A comprehensive, offline-first ISP management platform that replaces paper records and spreadsheets — organizing subscribers by hierarchical area and town, generating monthly bills with LIFO payment logic, tracking full financial ledgers, and importing/exporting Excel files with smart parsing.**

<br/>

🌐 **Live Demo:** https://flowforgeisp.vercel.app/

<br/>

[![GitHub Stars](https://img.shields.io/github/stars/ibtesaamaslam/FlowForge?style=social)](https://github.com/ibtesaamaslam/FlowForge/stargazers)
&nbsp;
[![GitHub Forks](https://img.shields.io/github/forks/ibtesaamaslam/FlowForge?style=social)](https://github.com/ibtesaamaslam/FlowForge/network/members)
&nbsp;
[![GitHub Issues](https://img.shields.io/github/issues/ibtesaamaslam/FlowForge)](https://github.com/ibtesaamaslam/FlowForge/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [LIFO Billing Logic](#-lifo-billing-logic--explained)
- [Role-Based Access Control](#-role-based-access-control)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [TypeScript Interfaces](#-typescript-interfaces)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Excel Import Format](#-excel-import-format)
- [Data Export](#-data-export)
- [Deployment](#-deployment)
- [Limitations & Roadmap](#-limitations--roadmap)
- [Contributing](#-contributing)
- [Author](#-author)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🔍 Overview

**FlowForge — ISP Town Manager** is a production-ready, offline-first web application built specifically for Internet Service Providers (ISPs) who still manage their subscriber base through paper records, physical ledgers, or disconnected spreadsheets. It provides a unified digital platform to organise subscribers by geographic **Area** and **Town**, run monthly billing cycles, accept payments with a psychologically-designed **LIFO clearing system**, and generate Excel reports — all without needing a backend server.

The application runs entirely in the browser using **localStorage** as its persistence layer. This makes it instantly deployable on any static host with zero infrastructure cost, while keeping all subscriber data private on the operator's device.

> 💡 **Real-world context:** This application was built for Pakistani ISP operators who typically use informal record-keeping systems. The 4-area structure (A, B, C, D), CNIC fields, Easypaisa/JazzCash payment methods, and Mbps-based package tracking reflect actual field operator workflows. The LIFO billing logic was specifically designed around the "common man" psychological preference for clearing the current month's bill before tackling old debt.

---

## 🌐 Live Demo

| Environment | URL |
|-------------|-----|
| Production (Vercel) | [net-dev-jade.vercel.app](https://flowforgeisp.vercel.app/) |
| Repository | [github.com/ibtesaamaslam/FlowForge](https://github.com/ibtesaamaslam/FlowForge) |

---

## 🧰 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| [React](https://react.dev/) | 19 | UI framework — Hooks, Context API, useReducer |
| [TypeScript](https://www.typescriptlang.org/) | 5.x (99%) | End-to-end static typing across all components and services |
| [Vite](https://vitejs.dev/) | Latest | Build tool and dev server |
| [Tailwind CSS](https://tailwindcss.com/) | Latest | Utility-first responsive styling |
| [Lucide React](https://lucide.dev/) | Latest | SVG icon set |
| [SheetJS (xlsx)](https://sheetjs.com/) | Latest | Excel `.xlsx` import parsing and export generation |
| [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) | Browser API | Data persistence — no backend or database required |
| ES Modules via importmap | — | `index.html`-based module resolution, no complex bundler needed |
| [Vercel](https://vercel.com/) | — | Production static hosting and CI/CD |

---

## ✨ Key Features

### 🏙️ Area & Town Management

- **4 color-coded areas** (A, B, C, D) — each area groups its own towns and tracks outstanding balances, active subscriber counts, and revenue independently.
- **Full Town CRUD** — create, edit, and delete towns within specific areas with confirmation prompts before destructive actions.
- **Stats at a glance** — every town card shows active subscriber count, total outstanding balance, and monthly revenue in real time.

### 👥 Subscriber Management

- **Detailed profiles** — Name, Phone number, CNIC, Package speed (Mbps), Physical address, and free-text Notes per subscriber.
- **Status tracking** — `Active`, `Suspended`, and `Disconnected` states with colour-coded visual badges.
- **Real-time search & filter** — filter the subscriber list by name, phone number, subscriber ID, or status on every keystroke.
- **Pagination** — optimised tables handle large subscriber lists without UI performance degradation.

### 💰 LIFO Billing & Ledger System

- **Previous Pending vs Current Bill split** — dues are displayed as two distinct cards: old accumulated debt (Previous Pending) and the current month's charge (Current Bill).
- **LIFO payment application** — payments clear the Current Month's Bill first, then reduce Previous Pending. See [LIFO Billing Logic](#-lifo-billing-logic--explained) for a full walkthrough.
- **Full transaction ledger** — complete Debit/Credit history per subscriber in `MemberLedger.tsx`.
- **Bulk monthly billing** — generate bills for all Active subscribers in an entire area with one click via `BillingModal.tsx`.
- **Payment receipt modals** — visual confirmation showing balance before and after every recorded payment.

### 📊 Executive Dashboard

- Revenue tracking across all areas.
- Daily subscriber and payment metrics.
- Active subscriber utilization per area.
- Low-stock and equipment inventory alerts.
- Activity log of recent actions.

### 📥 Excel Import Wizard

- Drag-and-drop `.xlsx` file upload with smart heuristic parsing.
- Auto-detects town header rows and member data rows.
- Preview parsed data before committing — cancel or confirm.
- Bulk creates towns and subscriber profiles in a single operation.

### 📤 Excel / CSV Export

- Download full subscriber lists and financial ledger data for any town.
- Formatted output ready for external accounting or management reporting.

---

## 💡 LIFO Billing Logic — Explained

The payment system uses **Last-In, First-Out (LIFO)** logic — the most recently generated bill is cleared before older debt is reduced.

### Why LIFO?

Psychologically, subscribers feel they have "cleared this month" even with existing old debt. This reduces immediate billing disputes and makes the payment interaction feel productive — the current obligation is resolved first, even if the longer-term backlog remains visible.

### Example Walkthrough

```
Initial State:
  Previous Pending  → PKR 1,200  (accumulated old debt)
  Current Bill      → PKR 500    (February bill just generated)
  Total Owed        → PKR 1,700

Subscriber pays PKR 500:
  LIFO applies 500 to Current Bill first
  → February Bill:    ✅ PAID (cleared)
  → Previous Pending: PKR 1,200 (unchanged — visible, follow-up required)
  → Total Owed:       PKR 1,200

Dashboard reflects:
  Outstanding: PKR 1,200
  Feb billing: Completed
```

### What Happens in the Ledger

| Entry | Type | Amount | Description |
|-------|------|--------|-------------|
| Monthly billing run | Debit | +500 | `BILL OF FEB` |
| Payment received | Credit | -500 | `Payment Received` |
| Running balance | — | 1,200 | Previous Pending unchanged |

---

## 🔐 Role-Based Access Control

| Feature | Admin | Operator |
|---------|-------|---------|
| Executive Dashboard | ✅ | ❌ |
| Create / edit / delete Towns | ✅ | ✅ |
| Add / edit / delete Subscribers | ✅ | ✅ |
| Record payments | ✅ | ✅ |
| Run bulk monthly billing | ✅ | ❌ |
| View full subscriber ledger | ✅ | ✅ |
| Excel import wizard | ✅ | ✅ |
| Excel / CSV export | ✅ | ✅ |
| View inventory / alerts | ✅ | ❌ |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER (Client)                        │
│                                                             │
│   React 19 + TypeScript + Vite                             │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ App.tsx — Main Routing & Layout                      │  │
│   │                                                      │  │
│   │  DashboardView  │  TownView  │  MemberLedger         │  │
│   │  ImportWizard   │  BillingModal                      │  │
│   └──────────────────────────┬───────────────────────────┘  │
│                              │                              │
│   ┌──────────────────────────▼───────────────────────────┐  │
│   │              services/                               │  │
│   │  storageService.ts  ←→  localStorage                 │  │
│   │  excelParser.ts     ←   .xlsx (SheetJS)              │  │
│   │  csvService.ts      →   .xlsx / .csv (SheetJS)       │  │
│   └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Architecture decisions:**

- **No React Router** — navigation between views (Dashboard, Town, Ledger) uses a simple state variable in `App.tsx` keeping the bundle small.
- **Service layer abstraction** — all localStorage CRUD is in `storageService.ts`; components never touch `localStorage` directly. This makes a future database migration a service-layer swap.
- **ES Modules importmap** — `index.html` uses a browser-native importmap for module resolution, eliminating the need for a bundler during basic development.
- **SheetJS for all Excel I/O** — both import parsing and export generation use the same library, ensuring format consistency.

---

## 📂 Project Structure

```
FlowForge/
│
├── index.html                    # Entry point — importmap + Tailwind CDN
├── index.tsx                     # React DOM root mount
├── App.tsx                       # Main routing and layout logic
├── types.ts                      # TypeScript interfaces — Member, Town, LedgerEntry
├── metadata.json                 # App metadata (Google AI Studio template config)
├── package.json                  # Dependencies and npm scripts
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite build configuration
│
├── components/                   # All UI page components
│   ├── DashboardView.tsx         # Executive summary, charts, alerts
│   ├── TownView.tsx              # Subscriber list, CRUD, search, status
│   ├── MemberLedger.tsx          # Full debit/credit history + payment modal
│   ├── ImportWizard.tsx          # Drag-and-drop .xlsx upload + preview
│   ├── BillingModal.tsx          # Bulk monthly billing interface
│   └── (additional components)
│
└── services/                     # Business logic and data access
    ├── storageService.ts         # All localStorage read/write CRUD operations
    ├── excelParser.ts            # Heuristic-based Excel row classification
    └── csvService.ts             # Excel and CSV export generation
```

---

## 🔷 TypeScript Interfaces

All core data shapes are defined in `types.ts` and used across every component and service:

```typescript
// User role
type Role = 'admin' | 'operator';

// Area identifier
type AreaId = 'A' | 'B' | 'C' | 'D';

// Full subscriber profile
interface Member {
  id: string;
  name: string;
  phone: string;
  cnic: string;
  packageMbps: number;
  address: string;
  notes?: string;
  status: 'active' | 'suspended' | 'disconnected';
  totalDue: number;       // running total ever owed
  balance: number;        // current unpaid balance
}

// Town within an area
interface Town {
  id: string;
  areaId: AreaId;
  name: string;
  members: Member[];
}

// Single ledger transaction
interface LedgerEntry {
  id: string;
  memberId: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;    // e.g. "BILL OF FEB" | "Payment Received" | "Clear Full Dues"
  date: string;           // ISO date string
  previousBalance: number;
  newBalance: number;
}
```

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome 80+, Edge 80+, Firefox 75+)
- A local static server (Python, Node, or VS Code Live Server)

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/ibtesaamaslam/FlowForge.git
cd FlowForge

# 2. Install dependencies (for Vite-based development)
npm install

# 3. Start development server
npm run dev
# → http://localhost:5173

# OR serve directly without bundler (ES Modules via importmap)

# Python
python3 -m http.server 8000

# Node
npx http-server .

# → http://localhost:8000
```

### Production Build

```bash
npm run build
# Output → dist/
# Deploy to Vercel, Netlify, GitHub Pages, or any static host
```

---

## 📖 Usage Guide

### Adding Your First Town

1. Open the app and select your role (**Admin** or **Operator**).
2. Navigate to **Area A** (or any area) from the sidebar.
3. Click **"Add Town"** and enter the town name.
4. The town card appears showing 0 subscribers and PKR 0 outstanding.

### Adding Subscribers Manually

1. Click a town to open `TownView`.
2. Click **"Add Subscriber"**.
3. Fill in: Name, Phone, CNIC, Package (Mbps), Address, and optional Notes.
4. Set status to **Active**.
5. Save — the subscriber appears in the paginated list.

### Recording a Payment

1. In `TownView`, click the **Credit Card icon** next to a subscriber.
2. `MemberLedger` opens showing full transaction history.
3. The top section displays:
   - **Previous Pending** — accumulated old debt
   - **Current Bill** — this month's generated bill
4. Click **"Receive Payment"** and enter the amount, or **"Clear Full Dues"** to zero out the balance.
5. A receipt modal confirms the transaction with before/after balances.

### Running Monthly Billing

1. From the Dashboard, click an Area tile.
2. Click **"Run Billing"** (or use `BillingModal`).
3. Confirm the month and amount.
4. The system generates a `BILL OF [MONTH]` debit entry for every **Active** subscriber in that area.

### Resetting All Data

> ⚠️ This permanently deletes all towns, subscribers, and ledger entries.

1. Open browser **DevTools** (`F12`).
2. Navigate to **Application** → **Local Storage** → your domain.
3. Right-click → **Clear**.
4. Refresh the page.

---

## 📥 Excel Import Format

The `ImportWizard` uses heuristic parsing to auto-detect town headers and member rows.

### Required Structure

| Col A | Col B | Col C | Col D |
|-------|-------|-------|-------|
| **01. My Town Name** | | | |
| 1 | John Doe 03001234567 | 5 Mb | 500 |
| 2 | Jane Smith | 10 Mb | 1000 |
| **02. Another Town** | | | |
| 1 | Ahmad Khan | 20 Mb | 2000 |

### Parsing Rules

| Element | Rule |
|---------|------|
| **Town header** | Col A starts with a number followed by a dot: `01.`, `02.`, etc. |
| **Member serial** | Col A is an integer |
| **Name + phone** | Col B contains the subscriber's name; phone number in same cell is extracted automatically |
| **Package** | Col C — e.g. `5 Mb`, `10 Mb`, `20 Mb` |
| **Bill amount** | Col D — numeric bill amount (PKR) |

### Import Steps

1. Go to **Import Excel** in the sidebar.
2. Drag-and-drop or click to upload your `.xlsx` file.
3. Preview the parsed towns and members.
4. Click **Confirm** to create all records, or **Cancel** to discard.

---

## 📤 Data Export

From any `TownView`:

1. Click the **Export** button in the toolbar.
2. Choose `.xlsx` or `.csv` format.
3. The file downloads immediately via `csvService.ts` + SheetJS.

**Exported columns:** Subscriber ID · Name · Phone · CNIC · Package · Status · Balance · Total Due · Last Payment Date

---

## 🚢 Deployment

### Vercel (Live — Recommended)

The project is live at [https://flowforgeisp.vercel.app/](https://flowforgeisp.vercel.app/) via Vercel's GitHub integration:

1. Push to the `main` branch.
2. Vercel runs `npm run build` automatically.
3. The `dist/` output is deployed globally.

### Other Static Hosts

```bash
npm run build

# Netlify
netlify deploy --prod --dir=dist

# GitHub Pages
# Push dist/ to gh-pages branch

# Cloudflare Pages
# Set build command: npm run build · output: dist
```

---

## ⚠️ Limitations & Roadmap

### Current Limitations

| Limitation | Impact |
|-----------|--------|
| localStorage only | Data is device-specific; clearing browser storage deletes all records |
| No real-time sync | Two operators on different devices see different data |
| No authentication | Role selection is not password-protected in this release |
| No payment gateway | Payment recording is manual — no Easypaisa / JazzCash API |
| No SMS notifications | Subscriber reminder preference is stored but no message is sent |
| Single-device use | No cloud backup; device loss = data loss |

### Roadmap

- [ ] **Real backend** — Node.js / Firebase / Supabase to replace localStorage for cross-device sync
- [ ] **JWT authentication** — password-protected Admin and Operator sessions
- [ ] **SMS payment reminders** — auto-notify subscribers before billing due date via local SMS gateway
- [ ] **Easypaisa / JazzCash integration** — online bill collection via mobile wallet APIs
- [ ] **PWA / mobile-first** — Progressive Web App for field operators collecting payments on-site
- [ ] **AI demand prediction** — predict churn and bandwidth demand from subscriber history
- [ ] **Multi-branch support** — manage multiple ISP offices under a single account
- [ ] **Automated monthly billing** — scheduled bill generation instead of manual trigger

---

## 🤝 Contributing

```bash
# 1. Fork the repository

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/FlowForge.git
cd FlowForge

# 3. Install dependencies
npm install

# 4. Create a feature branch
git checkout -b feature/supabase-backend

# 5. Make changes and commit
git add .
git commit -m "feat: replace localStorage with Supabase SDK in storageService.ts"

# 6. Push and open a Pull Request
git push origin feature/supabase-backend
```

Good first contributions: Supabase backend integration, JWT authentication, dark mode toggle, additional Excel export columns, or SMS gateway connection.

---

## 👤 Author

<div align="center">

**Ibtesaam Aslam**

[![GitHub](https://img.shields.io/badge/GitHub-ibtesaamaslam-181717?style=for-the-badge&logo=github)](https://github.com/ibtesaamaslam)

*Full-Stack Developer · ISP Tools · Offline-First Apps*

</div>

---

## 📜 License

```
MIT License

Copyright (c) 2024 Ibtesaam Aslam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

| Permission | Status |
|-----------|--------|
| ✅ Commercial use | Allowed |
| ✅ Modification | Allowed |
| ✅ Distribution | Allowed |
| ✅ Private use | Allowed |
| ❌ Liability | No warranty provided |
| ❌ Trademark use | Not granted |

---

## 🙏 Acknowledgements

- **[SheetJS](https://sheetjs.com/)** — for the robust, battle-tested Excel parsing and generation library that powers both the Import Wizard and all export functionality.
- **[Lucide React](https://lucide.dev/)** — for the clean, consistent SVG icon set used throughout the interface.
- **[Tailwind CSS](https://tailwindcss.com/)** — for the utility-first CSS framework enabling rapid, responsive UI development.
- **[React 19 Team](https://react.dev/)** — for Concurrent Features and improved hook performance that make the real-time filtering and pagination smooth even on large datasets.
- **[Vercel](https://vercel.com/)** — for zero-configuration static hosting with automatic GitHub deployments.

---

<div align="center">

**⭐ If FlowForge helped streamline your ISP operations, please consider starring it on GitHub!**

[![Star on GitHub](https://img.shields.io/github/stars/ibtesaamaslam/FlowForge?style=social)](https://github.com/ibtesaamaslam/FlowForge)

🌐 https://flowforgeisp.vercel.app/

*Replacing paper records with smart ISP management — Built with ❤️ by [Ibtesaam Aslam](https://github.com/ibtesaamaslam)*

</div>
