# DINEVO — Restaurant QR Ordering

A clean, modern table-side food ordering app. Guests scan a QR code (or type a
table code), browse the menu, add items to a cart, place an order, and track
its status live — all without downloading an app.

**Stack:** React (CRA) + Bootstrap grid utilities + custom CSS · Node.js/Express · MongoDB (Mongoose)

**Flow:** Home → Scan QR / Table Entry → Menu → Food Details → Cart → Place Order → Order Tracking

```
dinevo/
├── backend/     Express API + MongoDB models
└── frontend/    React app (Create React App)
```

## 1. Prerequisites

- Node.js 18+
- A MongoDB connection string (local MongoDB, or a free Atlas cluster)

## 2. Backend setup

```bash
cd backend
cp .env.example .env      # then edit MONGO_URI if needed
npm install
npm run seed               # loads a demo restaurant, 5 tables, and a full menu
npm run dev                 # starts the API on http://localhost:5000
```

The seed script prints the demo table codes to use: `DV-T1` … `DV-T5`.

## 3. Frontend setup

In a second terminal:

```bash
cd frontend
cp .env.example .env       # points to the backend API
npm install
npm start                   # opens http://localhost:3000
```

## 4. Try it out

1. Open `http://localhost:3000` and click **Scan to Start** (or go straight to `/table`).
2. Enter a demo table code, e.g. `DV-T1`.
3. Browse the menu, open a dish, add it to your cart.
4. Review your cart and tap **Place Order**.
5. Watch the live order-tracking ticket. In another tab/tool you can move the
   order through its stages by calling the API directly, e.g.:

   ```bash
   curl -X PATCH http://localhost:5000/api/orders/<ORDER_ID>/status \
     -H "Content-Type: application/json" \
     -d '{"status":"preparing"}'
   ```

   Valid statuses: `placed`, `confirmed`, `preparing`, `ready`, `served`, `cancelled`.
   The tracking page polls the API every 6 seconds, so changes appear automatically.

## How the "QR scan" works

Each restaurant table has a short `code` (e.g. `DV-T1`). In a real deployment,
the printed QR on each table encodes a URL like
`https://yourapp.com/table?table=DV-T1`. Scanning it opens the Table Entry
page, which reads the `table` query param and resolves it automatically — no
camera library required in the app itself. Typing the code manually works the
same way, which also makes the app fully usable on desktop for testing.

## Notes

- Tax is a flat 5%, calculated server-side when an order is placed.
- Cart and table session are kept in `localStorage`, so refreshing the page
  keeps the guest's session and cart intact.
- Menu images are served from Unsplash for the demo; swap `image` fields in
  `backend/seed/seed.js` (or your own admin flow) for real dish photography.
- This project intentionally ships a lean guest-facing flow (no auth, no
  admin dashboard, no payments) to keep the codebase simple to read and
  extend. Kitchen-side status updates are exposed as a simple `PATCH`
  endpoint so you can wire up a staff dashboard later.
