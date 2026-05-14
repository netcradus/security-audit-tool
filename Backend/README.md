# Web Security Assessment Platform

## Overview

This project is a modular web security assessment platform designed to perform automated vulnerability analysis on websites and web applications.

The platform integrates multiple security assessment modules including:

* Nmap port and service detection
* OWASP ZAP passive scanning
* HTTP security header analysis
* Cookie security analysis
* SSL/TLS analysis
* SSL certificate expiry analysis
* CVSS scoring
* OWASP/CWE vulnerability mapping
* Professional PDF report generation
* Asset risk scoring
* Scan history management
* Asynchronous/background scanning

The system is built using FastAPI and follows a modular backend architecture suitable for expansion into a full vulnerability management platform or SOC-oriented security assessment solution.

---

# Features

## Security Scanning

* Nmap-based port scanning
* Service and version detection
* HTTP security header analysis
* Cookie security checks
* HTTP methods analysis
* SSL/TLS version detection
* SSL certificate expiry analysis
* OWASP ZAP passive scanning

## Vulnerability Intelligence

* CVSS scoring
* OWASP Top 10 mapping
* CWE mapping
* Vulnerability categorization
* Asset risk scoring
* Deduplication engine

## Reporting

* Professional PDF report generation
* Executive summary generation
* Detailed findings section
* Risk overview tables
* Open ports and services reporting
* Asset information section
* Conclusion and remediation guidance

## Platform Features

* Async/background scanning
* Scan history tracking
* Modular architecture
* REST API support
* Frontend-ready JSON responses

---

# Project Architecture

```text
Client / Frontend
        ↓
FastAPI API Layer
        ↓
Scan Runner Engine
        ↓
Scanner Modules
 ├── Nmap Scanner
 ├── Header Analyzer
 ├── Cookie Analyzer
 ├── SSL Analyzer
 ├── SSL Expiry Analyzer
 ├── HTTP Methods Analyzer
 └── OWASP ZAP Scanner
        ↓
Aggregation Engine
        ↓
CVSS + OWASP/CWE Enrichment
        ↓
Risk Scoring Engine
        ↓
Professional Report Generator
        ↓
Scan History Storage
```

---

# Tech Stack

| Component             | Technology              |
| --------------------- | ----------------------- |
| Backend Framework     | FastAPI                 |
| Language              | Python                  |
| Port Scanning         | Nmap                    |
| Web Security Scanning | OWASP ZAP               |
| PDF Reports           | ReportLab               |
| Async Processing      | FastAPI BackgroundTasks |
| API Testing           | Postman                 |
| Deployment Ready      | Docker Compatible       |

---

# Installation Guide

## 1. Clone Repository

```bash
git clone <repository-url>
cd websec_phase1
```

---

## 2. Create Virtual Environment

```bash
python -m venv venv
```

---

## 3. Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

---

## 4. Install Requirements

```bash
pip install -r requirements.txt
```

---

## 5. Install Nmap

Download and install Nmap:

* [https://nmap.org/download.html](https://nmap.org/download.html)

Ensure Nmap is added to system PATH.

Verify:

```bash
nmap --version
```

---

## 6. Install OWASP ZAP

Download:

* [https://www.zaproxy.org/download/](https://www.zaproxy.org/download/)

Run OWASP ZAP Desktop before starting scans.

Default API Port:

```text
127.0.0.1:8080
```

Verify:

```bash
netstat -ano | findstr 8080
```

---

# Running the Project

## Start FastAPI Server

```bash
uvicorn app.main:app --reload
```

---

## API Documentation

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

---

# Environment Variables

Create a `.env` file in project root.

## Example `.env`

```env
ZAP_API_KEY=your_zap_api_key
ZAP_HOST=127.0.0.1
ZAP_PORT=8080
REPORTS_DIR=reports
SCAN_TIMEOUT=60
```

---

# Recommended `.gitignore`

```gitignore
venv/
__pycache__/
*.pyc
.env
reports/
*.pdf
.history/
.idea/
.vscode/
```

---

# API Documentation

# Base URL

```text
http://127.0.0.1:8000
```

---

# 1. Start Scan

## Endpoint

```http
POST /scan
```

## Request Body

```json
{
  "target": "example.com"
}
```

---

## Example Response

```json
{
  "scan_id": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Scan started"
}
```

---

# 2. Get Scan Result

## Endpoint

```http
GET /scan/{scan_id}
```

---

## Example Response

```json
{
  "target": "example.com",
  "status": "completed",
  "results": {
    "target": "example.com",
    "summary": {
      "critical": 0,
      "high": 0,
      "medium": 2,
      "low": 0,
      "info": 0
    },
    "ports": [
      {
        "port": 80,
        "state": "open",
        "service": "http",
        "version": "nginx"
      }
    ],
    "ssl": {
      "tls_version": "TLSv1.3",
      "certificate_expiry": "2026-10-10"
    },
    "findings": [
      {
        "title": "Missing Content-Security-Policy Header",
        "severity": "medium",
        "cvss": 5.5,
        "category": "Security Misconfiguration",
        "owasp": "A05:2021 Security Misconfiguration",
        "cwe": "CWE-693"
      }
    ],
    "asset_risk": "Medium"
  },
  "report": "reports/report.pdf"
}
```

---

# 3. Get Scan History

## Endpoint

```http
GET /history
```

---

## Example Response

```json
{
  "scan_id": {
    "target": "example.com",
    "status": "completed"
  }
}
```

---

# Frontend Integration Guide

## Recommended Frontend Stack

* React
* Next.js
* Tailwind CSS
* Axios
* Recharts

---

# Frontend Pages Recommendation

| Page           | Purpose                 |
| -------------- | ----------------------- |
| Dashboard      | Scan overview           |
| Start Scan     | Submit targets          |
| Scan Result    | Detailed scan results   |
| Reports        | Download generated PDFs |
| History        | Previous scans          |
| Risk Analytics | Charts and statistics   |

---

# Important Frontend Fields

## Findings Array

Frontend should render:

* title
* severity
* cvss
* category
* owasp
* cwe

---

## Severity Colors

| Severity | Suggested Color |
| -------- | --------------- |
| critical | Red             |
| high     | Orange          |
| medium   | Yellow          |
| low      | Green           |
| info     | Blue            |

---

## Scan Status States

| Status    | Meaning          |
| --------- | ---------------- |
| pending   | Scan queued      |
| running   | Scan in progress |
| completed | Scan completed   |
| failed    | Scan failed      |

---

# Folder Structure

```text
app/
├── api/
│   └── scan.py
│
├── core/
│   ├── aggregator.py
│   ├── cvss_engine.py
│   ├── deduplicator.py
│   ├── report_generator.py
│   ├── risk_scoring.py
│   ├── scan_runner.py
│   └── vulnerability_mapper.py
│
├── scanners/
│   ├── cookie_analyzer.py
│   ├── header_analyzer.py
│   ├── http_methods.py
│   ├── nmap_scanner.py
│   ├── ssl_analyzer.py
│   ├── ssl_expiry.py
│   └── zap_scanner.py
│
├── storage/
│   └── history.py
│
└── main.py
```

---

# Current Limitations

* In-memory scan history storage
* Single-node architecture
* Passive ZAP scanning only
* No authentication yet
* No database persistence yet
* No frontend dashboard yet

---

# Future Improvements

* PostgreSQL integration
* React frontend dashboard
* JWT authentication
* Docker deployment
* WebSocket live scan updates
* Scheduled scans
* Real CVSS v3.1 calculations
* Threat intelligence integration
* SIEM integration
* Multi-user support

---

# Security Notes

* Use only on authorized targets
* Active scanning should be carefully controlled
* Do not scan third-party systems without permission
* OWASP ZAP must be running for ZAP integration

---

# License

This project is intended for educational, research, and authorized security assessment purposes only.

---

# Contributors

Backend Security Assessment Platform developed as part of cybersecurity internship and research work.
