# API Documentation

# Base URL

```text
http://127.0.0.1:8000/api/v1
```

---

# Authentication

All endpoints require:

```http
x-api-key
```

Example:

```http
x-api-key: your_api_key
```

---

# Rate Limiting

| Endpoint | Limit |
|---|---|
| /scan | 5/minute |
| /history | 30/minute |

---

# 1. Start Scan

## Endpoint

```http
POST /api/v1/scan
```

---

## Headers

```http
x-api-key: your_api_key
Content-Type: application/json
```

---

## Request Body

```json
{
  "target": "domain/url",
  "company_name": "Company name",
  "auditor_name": "Name"
}
```

---

## Required Fields

| Field | Required |
|---|---|
| target | Yes |
| company_name | No |
| auditor_name | No |

Only `target` is required.

`company_name` and `auditor_name` are used for PDF report generation.

---

## Success Response

```json
{
  "scan_id": "uuid",
  "status": "started"
}
```

---

# 2. Get Scan Result

## Endpoint

```http
GET /api/v1/scan/{scan_id}
```

---

---

# 3. Download PDF Report

## Endpoint

```http
GET /api/v1/scan/{scan_id}/report
```

---

## Query Parameters

| Parameter | Required |
|---|---|
| company_name | Yes |
| audit_by | Yes |

---



## Response

```text
PDF File Download
```

---

# 4. Get Scan History

## Endpoint

```http
GET /api/v1/history
```

---


# DNS/WHOIS Data

Responses may include:

- registrar
- creation_date
- expiration_date
- SPF status
- DMARC status
- DNS records

---

# Important Frontend Fields

- findings
- severity
- risk_score
- category
- owasp
- cwe
- affected_url
- started_at
- completed_at
- duration_seconds

---

# Frontend Integration

## Recommended Stack

- React
- Next.js
- Tailwind CSS
- Axios
- Recharts

---

## Frontend Base URL

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

---

## Required Headers

```javascript
headers: {
  "x-api-key": API_KEY
}
```

---

# Recommended Frontend Flow

1. User enters target
2. Frontend starts scan
3. Frontend polls `/scan/{scan_id}`
4. Once completed:
   - show findings
   - show risk charts
   - enable PDF download
5. User enters auditor details
6. Frontend downloads report

---

# Common Error Responses

## Invalid Target

```json
{
  "detail": "Invalid target"
}
```

---

## Unauthorized

```json
{
  "detail": "Invalid API Key"
}
```

---

## Rate Limited

```json
{
  "detail": "Rate limit exceeded"
}
```

---

## Scan Not Found

```json
{
  "detail": "Scan not found"
}
```
