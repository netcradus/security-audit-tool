# API Documentation

## Base URL

```text
http://127.0.0.1:8000
```

---

# Start Scan

## Endpoint

```http
POST /scan
```

## Request

```json
{
  "target": "example.com"
}
```

## Response

```json
{
  "scan_id": "uuid",
  "message": "Scan started"
}
```

---

# Get Scan Result

## Endpoint

```http
GET /scan/{scan_id}
```

## Response

```json
{
  "target": "example.com",
  "status": "completed",
  "results": {
    "summary": {
      "critical": 0,
      "high": 0,
      "medium": 2,
      "low": 0,
      "info": 0
    },
    "ports": [],
    "ssl": {},
    "findings": [],
    "asset_risk": "Medium"
  },
  "report": "reports/report.pdf"
}
```

---

# Get Scan History

## Endpoint

```http
GET /history
```

## Frontend Notes

Important fields:

- findings
- severity
- cvss
- category
- owasp
- cwe

Recommended frontend stack:

- React
- Next.js
- Tailwind CSS
