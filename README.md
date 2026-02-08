# ISP Town Manager 📡

A comprehensive, offline-first web application designed for Internet Service Providers (ISPs) to manage towns, subscribers, billing cycles, and financial ledgers. Built with React 19, TypeScript, and Tailwind CSS.

## 🚀 Overview

**ISP Town Manager** replaces manual paper records and scattered spreadsheets. It allows ISP operators to organize subscribers by Area and Town, generate monthly bills, track payments with a detailed ledger, and visualize outstanding dues. 

The application runs entirely in the browser using `localStorage` for data persistence, making it fast and privacy-focused with no backend setup required.

## ✨ Key Features

### 🏙️ Area & Town Management
- **Hierarchical Structure:** Organize subscribers into 4 main color-coded Areas (A, B, C, D).
- **Town Management:** Create, edit, and delete towns within specific areas.
- **Stats at a Glance:** View active subscribers, total outstanding balance, and revenue per town/area.

### 👥 Subscriber Management
- **Detailed Profiles:** Store Name, Phone, CNIC, Package (Mbps), Address, and Notes.
- **Status Tracking:** Mark users as `Active`, `Suspended`, or `Disconnected`.
- **Search & Filter:** Instantly filter subscribers by name, phone number, ID, or status.
- **Pagination:** optimized tables for managing large lists of users.

### 💰 Billing & Ledger System
- **Smart Financial Visualization:** 
  - Splits dues into **"Previous Pending"** (Old debt) and **"Current Bill"** (This month).
  - **LIFO Payment Logic:** Payments are applied to the *Current Month's Bill* first. If a user owes 1700 (1200 old + 500 new) and pays 500, the system marks the current bill as paid and keeps the 1200 as previous pending.
- **Transaction History:** Full ledger view (Debit/Credit) for every subscriber.
- **Bulk Billing:** Generate monthly bills for all active subscribers in a specific area with one click.
- **Payment Receipts:** Visual confirmation modals when payments are recorded.

### 📊 Data Import/Export
- **Excel Import Wizard:** Drag-and-drop `.xlsx` files to bulk create towns and members.
  - *Smart Parsing:* Detects town headers and member rows automatically.
- **Excel Export:** Download subscriber lists and financial data for any town.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Data Handling:** SheetJS (`xlsx`) for Excel operations.
- **Persistence:** Browser `localStorage` (No database required).
- **Build System:** ES Modules via `importmap` (No complex bundler configuration required for basic usage).

---

## 📂 Project Structure

```text
/
├── index.html              # Entry point with ImportMap and Tailwind CDN
├── index.tsx               # React Root
├── App.tsx                 # Main Routing and Layout Logic
├── types.ts                # TypeScript Interfaces (Member, Town, LedgerEntry)
├── metadata.json           # App metadata
├── components/             # UI Components
│   ├── DashboardView.tsx   # Executive summary and charts
│   ├── TownView.tsx        # Subscriber list and operations
│   ├── MemberLedger.tsx    # Financial history and payment modal
│   ├── ImportWizard.tsx    # Excel file parser and importer
│   ├── BillingModal.tsx    # Bulk monthly billing interface
│   └── ...
└── services/               # Business Logic
    ├── storageService.ts   # LocalStorage CRUD operations
    ├── excelParser.ts      # Excel import heuristics
    └── csvService.ts       # Export logic
```

---

## 🚀 Getting Started

### Prerequisites
You need a modern web browser (Chrome, Edge, Firefox) and a local web server to serve the ES modules.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/isp-town-manager.git
    cd isp-town-manager
    ```

2.  **Run the application:**
    Since this project uses ES Modules directly via `index.html`, you simply need to serve the root directory.

    *Using Python:*
    ```bash
    python3 -m http.server 8000
    ```

    *Using Node (http-server):*
    ```bash
    npx http-server .
    ```

3.  **Open in Browser:**
    Navigate to `http://localhost:8000`.

---

## 📖 Usage Guide

### 1. Importing Data (Excel)
To bulk import data, your Excel sheet should follow this visual structure:

| Col A | Col B | Col C | Col D |
|-------|-------|-------|-------|
| **01. My Town Name** | | | |
| 1 | John Doe 03001234567 | 5 Mb | 500 |
| 2 | Jane Smith | 10 Mb | 1000 |

*   **Town Header:** Must start with a number followed by a dot (e.g., `01. Town Name`).
*   **Member Rows:** 
    *   Col A: Serial Number.
    *   Col B: Name (and optionally phone number).
    *   Col C: Package.
    *   Col D: Bill Amount.

Go to **Import Excel** in the sidebar, upload your file, preview the data, and confirm.

### 2. Managing Payments
1. Navigate to a Town.
2. Click the **Credit Card icon** next to a subscriber.
3. The Ledger View will open.
4. **Previous Pending:** Shows debt from past months.
5. **Current Bill:** Shows the bill generated for the specific month (e.g., "BILL OF FEB").
6. Click **"Receive Payment"** or **"Clear Full Dues"**.

### 3. Monthly Billing Cycle
1. On the Dashboard, click a specific Area (e.g., Area A).
2. (Optional) A "Run Billing" button appears if implemented in the view, or you can manage it via the `BillingModal` (integrated into the flow).
3. The system generates a "Bill" ledger entry for every Active member, increasing their `Total Due` and `Balance`.

### 4. Resetting Data
To wipe all data and start fresh, you can clear your browser's application storage:
1. Open DevTools (F12).
2. Go to Application > Local Storage.
3. Right-click and "Clear".
4. Refresh the page.

---

## 🎨 Visualization Logic

The ledger uses a specific logic to help "Common Man" understanding:

*   **Scenario:** User owes 1700 total (1200 old debt + 500 current Feb bill).
*   **Action:** User pays 500.
*   **Result:** 
    *   The **Current Bill** card becomes "Paid".
    *   The **Previous Pending** card remains at 1200.
    *   *Why?* Psychologically, it feels better to clear the "Current Month" than to chip away at a mountain of old debt without clearing the immediate obligation.

---

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License.
