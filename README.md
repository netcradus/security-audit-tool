# NETCRAD — Security Audit Platform

A professional web security scanning tool built with React + Tailwind CSS.
Brand colours derived from the Netcradus logo (coral-orange + deep navy).

---

## Project Structure

```
netcrad/
├── src/
│   ├── api/
│   │   └── index.js              ← All Axios routes (ready for backend)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx        ← Main layout wrapper
│   │   │   └── Navbar.jsx        ← Top nav + tabs + theme toggle
│   │   ├── results/
│   │   │   └── FindingDrawer.jsx ← Slide-over detail panel per finding
│   │   ├── scanner/
│   │   │   └── StageResultModal.jsx ← Per-scanner result popup
│   │   └── shared/
│   │       ├── GradeBadge.jsx    ← A-F grade circle
│   │       └── SeverityBadge.jsx ← Critical/High/Medium/Low badge
│   ├── context/
│   │   ├── ScanContext.jsx       ← Global scan state
│   │   └── ThemeContext.jsx      ← Dark/light theme
│   ├── data/
│   │   └── mockData.js           ← Full mock scan data + history
│   ├── hooks/
│   │   └── useScanSimulator.js   ← Simulates live scan progress
│   ├── pages/
│   │   ├── HomePage.jsx          ← URL input + feature cards
│   │   ├── ScanProgressPage.jsx  ← Live scan stages + per-stage result view
│   │   ├── ResultsPage.jsx       ← Full results dashboard + findings table
│   │   └── HistoryPage.jsx       ← Scan history table
│   ├── App.jsx                   ← Routes
│   ├── main.jsx                  ← Entry point
│   └── index.css                 ← Tailwind + global styles
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## Setup

```bash
npm install
npm run dev        # development on http://localhost:5173
npm run build      # production build
```

## Environment Variables

Create a `.env` file:
```
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000
```

---

## Features

| Feature | Status |
|---------|--------|
| URL input → scan start | ✅ Working (mock) |
| Live scan progress with 5 stages | ✅ Working (simulated) |
| Per-scanner result view (Nmap raw output, headers, SSL, ZAP) | ✅ Working |
| Merged findings table with filters | ✅ Working |
| Finding detail drawer (CVSS + fix steps) | ✅ Working |
| A–F grade + severity pie chart | ✅ Working |
| Scan history table | ✅ Working (mock) |
| Dark / Light theme toggle | ✅ Working |
| All Axios API routes | ✅ Ready (commented, swap VITE_API_URL) |

## API Routes (src/api/index.js)

```js
scanApi.start(url)             // POST /api/scan
scanApi.getStatus(id)          // GET  /api/scan/:id
scanApi.getHistory()           // GET  /api/scan/history
scanApi.getResults(id)         // GET  /api/scan/:id/results

scannerApi.getPortResult(id)   // GET  /api/scan/:id/port
scannerApi.getHeaderResult(id) // GET  /api/scan/:id/headers
scannerApi.getSslResult(id)    // GET  /api/scan/:id/ssl
scannerApi.getZapResult(id)    // GET  /api/scan/:id/zap
scannerApi.getScoringResult(id)// GET  /api/scan/:id/scoring

reportApi.getPdf(id)           // GET  /api/report/:id/pdf
reportApi.getJson(id)          // GET  /api/report/:id/json

createScanSocket(id, onMsg, onClose)  // WS /ws/:id
```
