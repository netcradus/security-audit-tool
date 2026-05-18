# Web Security Assessment Platform

## Overview

Professional FastAPI-based web security assessment backend designed for automated vulnerability analysis and external attack surface assessment.

The platform integrates multiple security modules including:

- Nmap port and service detection
- OWASP ZAP passive scanning
- HTTP security header analysis
- Cookie security analysis
- SSL/TLS analysis
- SSL certificate expiry analysis
- DNS/WHOIS intelligence
- SPF/DMARC validation
- Risk scoring
- OWASP/CWE vulnerability mapping
- Professional PDF report generation
- Asset risk scoring
- Scan history persistence
- Parallel background scanning

---

# Features

## Security Scanning

- Nmap-based port scanning
- Service and version detection
- HTTP security header analysis
- Cookie security checks
- HTTP methods analysis
- SSL/TLS version detection
- SSL certificate expiry analysis
- OWASP ZAP passive scanning
- DNS reconnaissance
- WHOIS analysis
- SPF validation
- DMARC validation

---

## Vulnerability Intelligence

- Risk scoring
- OWASP Top 10 mapping
- CWE mapping
- Vulnerability categorization
- Asset risk scoring
- Deduplication engine

---

## Reporting

- Professional PDF report generation
- Dynamic executive summary
- Detailed findings section
- Risk overview tables
- DNS/WHOIS intelligence section
- Open ports and services reporting
- Asset information section
- Conclusion and remediation guidance
- Auditor metadata support

---

## Infrastructure & Security

- API key authentication
- Rate limiting using slowapi
- SQLite-based persistence
- Scan lifecycle tracking
- API versioning
- CORS middleware
- Parallel execution using ThreadPoolExecutor

---

# Project Architecture

```text
Client / Frontend
        ↓
FastAPI API Layer
        ↓
Authentication + Rate Limiting
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
 ├── DNS/WHOIS Analyzer
 └── OWASP ZAP Scanner
        ↓
Aggregation Engine
        ↓
Risk Score + OWASP/CWE Enrichment
        ↓
Risk Scoring Engine
        ↓
Professional Report Generator
        ↓
SQLite Persistence Layer
```

---

# Tech Stack

| Component | Technology |
|---|---|
| Backend Framework | FastAPI |
| Language | Python |
| Database | SQLite |
| Port Scanning | Nmap |
| Web Security Scanning | OWASP ZAP |
| PDF Reports | ReportLab |
| DNS Analysis | dnspython |
| WHOIS | python-whois |
| Rate Limiting | slowapi |
| Background Execution | ThreadPoolExecutor |

---

# Installation Guide

## 1. Clone Repository

```bash
git clone https://github.com/netcradus/security-audit-tool.git
cd Backend
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

# Required External Tools

## Install Nmap

https://nmap.org/download.html

Verify:

```bash
nmap --version
```

---

## Install OWASP ZAP

https://www.zaproxy.org/download/

Run ZAP before starting backend.

Expected proxy:

```text
127.0.0.1:8080
```

---

# Environment Variables

Create a `.env` file in project root.

## Example

```env
API_KEY=your_secure_api_key
REPORTS_DIR=reports
ZAP_PROXY=http://127.0.0.1:8080
```

---

# Authentication

All API endpoints require:

```http
x-api-key
```

Example:

```http
x-api-key: your_api_key
```

---

# Running Backend

```bash
uvicorn app.main:app --reload
```

---

# API Versioning

All routes are versioned using:

```text
/api/v1
```

---

# Database

SQLite database:

```text
scan_history.db
```

Tracks:

- scan status
- timestamps
- duration
- findings
- reports

---

# API Documentation

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

---

# PDF Reports

Generated reports include:

- Dynamic Executive Summary
- Risk Overview
- DNS/WHOIS Intelligence
- SSL/TLS Information
- Findings
- Recommendations
- Open Ports
- Asset Risk
- Auditor Information

---

# Security Notes

- Use only on authorized targets
- OWASP ZAP must be running
- Nmap must be installed
- Private/internal IP ranges are blocked
- Rate limiting enabled

---

# Future Improvements

- Real CVSS v3.1 implementation
- JWT authentication
- Docker deployment
- Redis queues
- Scheduled scanning
- WebSocket scan updates
- SIEM integration
- Multi-user support

# License

This project is intended for educational, research, and authorized security assessment purposes only.

---

# Contributors

Backend Security Assessment Platform developed as part of cybersecurity internship and research work.