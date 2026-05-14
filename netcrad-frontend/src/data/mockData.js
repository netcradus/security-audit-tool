// ─── Mock scan history ────────────────────────────────────
export const mockHistory = [
  {
    id: 'scan_001',
    url: 'example.com',
    grade: 'C',
    findings: 14,
    cvssAvg: 5.4,
    date: 'May 12, 2026',
    critical: 2, high: 4, medium: 5, low: 3,
  },
  {
    id: 'scan_002',
    url: 'testphp.vulnweb.com',
    grade: 'F',
    findings: 31,
    cvssAvg: 8.9,
    date: 'May 10, 2026',
    critical: 12, high: 9, medium: 7, low: 3,
  },
  {
    id: 'scan_003',
    url: 'myshop.io',
    grade: 'B',
    findings: 6,
    cvssAvg: 3.8,
    date: 'May 8, 2026',
    critical: 0, high: 2, medium: 3, low: 1,
  },
  {
    id: 'scan_004',
    url: 'securedemo.dev',
    grade: 'A',
    findings: 2,
    cvssAvg: 1.4,
    date: 'May 5, 2026',
    critical: 0, high: 0, medium: 1, low: 1,
  },
]

// ─── Mock full result for scan_001 ────────────────────────
export const mockScanResult = {
  id: 'scan_001',
  url: 'example.com',
  scannedAt: 'May 12, 2026 · 14:32 UTC',
  grade: 'C',
  cvssAvg: 5.4,
  riskLabel: 'Moderate risk detected',
  critical: 2, high: 4, medium: 5, low: 3,

  // Per-scanner raw results
  portResult: {
    summary: '6 open ports found on example.com',
    ports: [
      { port: 21,  protocol: 'tcp', service: 'ftp',   state: 'open', version: 'vsftpd 3.0.3', risk: 'high' },
      { port: 22,  protocol: 'tcp', service: 'ssh',   state: 'open', version: 'OpenSSH 7.9',  risk: 'low' },
      { port: 80,  protocol: 'tcp', service: 'http',  state: 'open', version: 'Apache 2.4.41', risk: 'medium' },
      { port: 443, protocol: 'tcp', service: 'https', state: 'open', version: 'Apache 2.4.41', risk: 'low' },
      { port: 3306,protocol: 'tcp', service: 'mysql', state: 'open', version: 'MySQL 5.7.38',  risk: 'critical' },
      { port: 8080,protocol: 'tcp', service: 'http-proxy', state: 'open', version: 'Jetty 9.4', risk: 'medium' },
    ],
    raw: `Starting Nmap 7.95 at 2026-05-12 14:30
Nmap scan report for example.com (93.184.216.34)
Host is up (0.021s latency).

PORT     STATE SERVICE    VERSION
21/tcp   open  ftp        vsftpd 3.0.3
22/tcp   open  ssh        OpenSSH 7.9 (protocol 2.0)
80/tcp   open  http       Apache httpd 2.4.41
443/tcp  open  ssl/https  Apache httpd 2.4.41
3306/tcp open  mysql      MySQL 5.7.38-0ubuntu0.18.04.1
8080/tcp open  http-proxy Jetty 9.4.43

Service detection performed. Report omitted.
Nmap done: 1 IP address (1 host up) scanned in 18.43 seconds`,
  },

  headerResult: {
    summary: '4 security headers missing',
    headers: [
      { name: 'Content-Security-Policy',    present: false, severity: 'critical', value: null,   recommendation: "Add 'Content-Security-Policy: default-src https:' header" },
      { name: 'Strict-Transport-Security',  present: true,  severity: 'ok',       value: 'max-age=31536000; includeSubDomains', recommendation: null },
      { name: 'X-Frame-Options',            present: false, severity: 'medium',   value: null,   recommendation: "Add 'X-Frame-Options: DENY' or 'SAMEORIGIN'" },
      { name: 'X-Content-Type-Options',     present: true,  severity: 'ok',       value: 'nosniff', recommendation: null },
      { name: 'Referrer-Policy',            present: false, severity: 'low',      value: null,   recommendation: "Add 'Referrer-Policy: strict-origin-when-cross-origin'" },
      { name: 'Permissions-Policy',         present: false, severity: 'medium',   value: null,   recommendation: "Add Permissions-Policy to restrict browser features" },
    ],
  },

  sslResult: {
    summary: 'TLS 1.0 and weak ciphers detected',
    certExpiry: 'Aug 14, 2026',
    daysLeft: 94,
    issuer: "DigiCert Inc",
    tlsVersions: [
      { version: 'TLS 1.3', supported: true,  safe: true },
      { version: 'TLS 1.2', supported: true,  safe: true },
      { version: 'TLS 1.1', supported: true,  safe: false },
      { version: 'TLS 1.0', supported: true,  safe: false },
      { version: 'SSL 3.0', supported: false, safe: false },
    ],
    weakCiphers: ['RC4-SHA', 'DES-CBC3-SHA'],
  },

  zapResult: {
    summary: '2 critical OWASP findings from active scan',
    alerts: [
      { name: 'SQL Injection', url: '/search?q=1', risk: 'critical', confidence: 'high', description: 'SQL injection vulnerability detected in search parameter.' },
      { name: 'Cross-Site Scripting (Reflected)', url: '/comment', risk: 'high', confidence: 'medium', description: 'Reflected XSS in comment field.' },
      { name: 'Directory Traversal', url: '/files/../etc/passwd', risk: 'high', confidence: 'low', description: 'Path traversal may expose sensitive files.' },
    ],
  },

  // Merged findings list
  findings: [
    { id: 'f1',  severity: 'critical', title: 'SQL Injection',               owasp: 'A03', cvss: 9.1, scanner: 'ZAP',    description: 'SQL injection detected in /search?q= parameter. Attacker can read/modify database.', fix: "Use parameterized queries / prepared statements. Never concatenate user input into SQL." },
    { id: 'f2',  severity: 'critical', title: 'Missing Content-Security-Policy', owasp: 'A05', cvss: 9.0, scanner: 'Headers', description: 'CSP header absent — allows XSS and data injection attacks.', fix: "Add Content-Security-Policy: default-src 'self'; script-src 'self' to your web server config." },
    { id: 'f3',  severity: 'high',     title: 'TLS 1.0 Enabled',             owasp: 'A02', cvss: 7.5, scanner: 'SSL',     description: 'TLS 1.0 is deprecated and vulnerable to POODLE/BEAST attacks.', fix: "Disable TLS 1.0 and 1.1 in your server SSL config. Enforce TLS 1.2 minimum." },
    { id: 'f4',  severity: 'high',     title: 'Open Port 21 (FTP)',           owasp: 'A01', cvss: 7.2, scanner: 'Nmap',   description: 'FTP port 21 open — transmits credentials in cleartext.', fix: "Disable FTP. Use SFTP (port 22) or FTPS. Block port 21 at firewall level." },
    { id: 'f5',  severity: 'high',     title: 'Cross-Site Scripting (XSS)',   owasp: 'A03', cvss: 7.1, scanner: 'ZAP',    description: 'Reflected XSS in comment field allows session hijacking.', fix: "Escape all output with HTML entity encoding. Implement Content-Security-Policy." },
    { id: 'f6',  severity: 'high',     title: 'MySQL Port 3306 Exposed',      owasp: 'A01', cvss: 7.0, scanner: 'Nmap',   description: 'Database port publicly accessible — direct brute-force risk.', fix: "Bind MySQL to 127.0.0.1 in /etc/mysql/my.cnf. Use firewall to block port 3306 externally." },
    { id: 'f7',  severity: 'medium',   title: 'Missing X-Frame-Options',      owasp: 'A05', cvss: 5.1, scanner: 'Headers', description: 'Page can be framed — enables clickjacking attacks.', fix: "Add X-Frame-Options: DENY to HTTP response headers." },
    { id: 'f8',  severity: 'medium',   title: 'Weak Cipher RC4-SHA',          owasp: 'A02', cvss: 4.8, scanner: 'SSL',    description: 'RC4 cipher suite is cryptographically broken.', fix: "Remove RC4 from SSL cipher list. Use only AEAD cipher suites (AES-GCM, ChaCha20)." },
    { id: 'f9',  severity: 'medium',   title: 'Directory Traversal',          owasp: 'A01', cvss: 4.6, scanner: 'ZAP',    description: 'Path traversal may expose /etc/passwd and server files.', fix: "Canonicalize paths server-side. Reject requests containing ../ sequences." },
    { id: 'f10', severity: 'medium',   title: 'Missing Referrer-Policy',      owasp: 'A05', cvss: 3.5, scanner: 'Headers', description: 'Referrer header leaks URL details to third parties.', fix: "Add Referrer-Policy: strict-origin-when-cross-origin header." },
    { id: 'f11', severity: 'medium',   title: 'Port 8080 Exposed',            owasp: 'A01', cvss: 3.5, scanner: 'Nmap',   description: 'Jetty proxy on 8080 unnecessarily accessible.', fix: "Restrict port 8080 to internal networks via firewall rules." },
    { id: 'f12', severity: 'low',      title: 'SSL Cert Expires in 94 Days',  owasp: 'A02', cvss: 2.1, scanner: 'SSL',    description: 'Certificate will expire Aug 14 2026. Plan renewal.', fix: "Set up auto-renewal with Let\'s Encrypt certbot or your CA\'s ACME client." },
    { id: 'f13', severity: 'low',      title: 'Missing Permissions-Policy',   owasp: 'A05', cvss: 1.8, scanner: 'Headers', description: 'No permissions policy — browser features unrestricted.', fix: "Add Permissions-Policy: geolocation=(), microphone=(), camera=() to headers." },
    { id: 'f14', severity: 'low',      title: 'TLS 1.1 Enabled',             owasp: 'A02', cvss: 1.5, scanner: 'SSL',    description: 'TLS 1.1 is deprecated though not critically vulnerable.', fix: "Disable TLS 1.1 alongside TLS 1.0 in server SSL config." },
  ],
}

// helper
export const getResultById = (id) => {
  if (id === 'scan_001') return mockScanResult
  const h = mockHistory.find(s => s.id === id)
  if (!h) return null
  return { ...mockScanResult, id: h.id, url: h.url, grade: h.grade, cvssAvg: h.cvssAvg, riskLabel: 'Risk summary', critical: h.critical, high: h.high, medium: h.medium, low: h.low, findings: mockScanResult.findings.slice(0, h.findings) }
}
