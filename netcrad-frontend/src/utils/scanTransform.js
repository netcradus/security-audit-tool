const severityOrder = ['critical', 'high', 'medium', 'low', 'info']

const severityScore = {
  critical: 9.5,
  high: 7.5,
  medium: 5,
  low: 2,
  info: 0,
}

const scannerFromFinding = (finding = {}) => {
  if (finding.scanner) return finding.scanner

  const source = String(finding.source || '').toLowerCase()
  const title = String(finding.title || '').toLowerCase()

  if (source.includes('zap')) return 'ZAP'
  if (title.includes('tls') || title.includes('ssl') || title.includes('certificate')) return 'SSL'
  if (title.includes('header') || title.includes('content-security-policy') || title.includes('x-frame') || title.includes('strict-transport-security')) return 'Headers'
  if (title.includes('nmap') || title.includes('port')) return 'Nmap'
  return 'Scanner'
}

const formatDate = (value) => {
  if (!value) return 'Pending'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const gradeFromSummary = (summary = {}) => {
  if ((summary.critical || 0) > 0) return 'F'
  if ((summary.high || 0) > 3) return 'D'
  if ((summary.high || 0) > 0 || (summary.medium || 0) > 4) return 'C'
  if ((summary.medium || 0) > 0 || (summary.low || 0) > 2) return 'B'
  return 'A'
}

const riskLabelFrom = (risk) => {
  if (!risk) return 'Risk not calculated yet'
  return `${risk} risk detected`
}

const normalizeFinding = (finding, index) => {
  const severity = String(finding.severity || 'info').toLowerCase()

  return {
    id: finding.id || `${severity}-${index}`,
    severity,
    title: finding.title || 'Untitled finding',
    owasp: finding.owasp || 'Unmapped',
    cwe: finding.cwe || 'Unmapped',
    category: finding.category || 'Security finding',
    cvss: Number(finding.cvss ?? severityScore[severity] ?? 0),
    scanner: scannerFromFinding(finding),
    source: finding.source,
    description: finding.description || finding.error || finding.affected_url || 'No description provided by backend.',
    fix: finding.fix || finding.solution || 'Review the finding and apply the appropriate vendor or platform hardening guidance.',
    affected_url: finding.affected_url,
    reference: finding.reference,
  }
}

const buildPortResult = (ports = [], target) => ({
  summary: `${ports.length} open/service records found on ${target}`,
  ports: ports.map((port) => ({
    port: port.port || 'N/A',
    protocol: port.protocol || 'tcp',
    service: port.service || port.name || 'unknown',
    state: port.state || 'unknown',
    version: port.version || '',
    risk: port.error ? 'info' : 'low',
  })),
  raw: ports.length
    ? ports.map(port => `${port.port || 'N/A'}/tcp ${port.state || 'unknown'} ${port.service || 'unknown'} ${port.version || ''}`.trim()).join('\n')
    : 'No port data returned by backend.',
})

const buildHeaderResult = (findings = []) => {
  const headers = findings
    .filter(finding => scannerFromFinding(finding) === 'Headers')
    .map(finding => ({
      name: String(finding.title || '').replace(/^Missing\s+/i, '').replace(/\s+Header$/i, ''),
      present: false,
      severity: finding.severity || 'info',
      value: null,
      recommendation: finding.solution || finding.fix || 'Add or harden this HTTP security header.',
    }))

  return {
    summary: headers.length ? `${headers.length} security header findings` : 'No header findings returned',
    headers,
  }
}

const buildSslResult = (ssl = {}) => {
  const supported = ssl.supported_protocols || {}

  return {
    summary: ssl.error || `Negotiated TLS version: ${ssl.tls_version || 'Unknown'}`,
    certExpiry: ssl.certificate_expiry || ssl.cert_expiry || 'Unknown',
    daysLeft: ssl.days_until_expiry ?? ssl.days_left ?? 'Unknown',
    issuer: ssl.issuer || 'Unknown',
    tlsVersions: ['TLSv1.3', 'TLSv1.2', 'TLSv1.1', 'TLSv1.0', 'SSL 3.0'].map(version => {
      const supportedValue = version === 'SSL 3.0' ? false : Boolean(supported[version])
      return {
        version: version.replace('v', ' '),
        supported: supportedValue,
        safe: version === 'TLSv1.3' || version === 'TLSv1.2',
      }
    }),
    weakCiphers: ssl.weak_ciphers || ssl.weakCiphers || [],
  }
}

const buildZapResult = (findings = []) => {
  const alerts = findings
    .filter(finding => scannerFromFinding(finding) === 'ZAP')
    .map(finding => ({
      name: finding.title || 'ZAP alert',
      url: finding.affected_url || '',
      risk: finding.severity || 'info',
      confidence: finding.confidence || 'unknown',
      description: finding.description || finding.error || '',
    }))

  return {
    summary: alerts.length ? `${alerts.length} OWASP ZAP findings` : 'No ZAP findings returned',
    alerts,
  }
}

export const mapBackendScanToResult = (scan = {}, fallbackId) => {
  const results = scan.results || {}
  const summary = results.summary || {}
  const findings = (results.findings || []).map(normalizeFinding)
  const cvssValues = findings.map(finding => finding.cvss).filter(score => Number.isFinite(score))
  const cvssAvg = cvssValues.length
    ? Number((cvssValues.reduce((sum, score) => sum + score, 0) / cvssValues.length).toFixed(1))
    : 0
  const target = results.target || scan.target || ''
  const grade = gradeFromSummary(summary)

  return {
    id: scan.scan_id || fallbackId,
    url: target,
    status: scan.status,
    scannedAt: formatDate(scan.completed_at || scan.started_at),
    startedAt: scan.started_at,
    completedAt: scan.completed_at,
    durationSeconds: scan.duration_seconds,
    report: scan.report,
    error: scan.error,
    grade,
    cvssAvg,
    riskLabel: riskLabelFrom(results.asset_risk),
    critical: summary.critical || 0,
    high: summary.high || 0,
    medium: summary.medium || 0,
    low: summary.low || 0,
    info: summary.info || 0,
    findings,
    portResult: buildPortResult(results.ports || [], target),
    headerResult: buildHeaderResult(findings),
    sslResult: buildSslResult(results.ssl || {}),
    zapResult: buildZapResult(findings),
    scoringResult: { grade, cvssAvg },
    raw: scan,
  }
}

export const mapHistoryResponse = (history = {}) => Object.entries(history).map(([id, scan]) => {
  const result = mapBackendScanToResult({ ...scan, scan_id: id }, id)

  return {
    id,
    url: result.url,
    status: result.status,
    grade: result.grade,
    findings: result.findings.length,
    cvssAvg: result.cvssAvg,
    date: formatDate(scan.completed_at || scan.started_at),
    critical: result.critical,
    high: result.high,
    medium: result.medium,
    low: result.low,
    error: scan.error,
  }
})

export const scanStagesFromStatus = (scanResult) => {
  const status = scanResult?.status || 'running'
  const failed = status === 'failed'
  const completed = status === 'completed'
  const progress = completed || failed ? 100 : 45
  const stageStatus = completed ? 'done' : failed ? 'failed' : 'running'

  return severityOrder.slice(0, 5).map((_, index) => {
    const stages = [
      { key: 'port', label: 'Port scan', sub: 'Nmap service detection', result: scanResult?.portResult },
      { key: 'header', label: 'Header analysis', sub: 'Checking browser security headers', result: scanResult?.headerResult },
      { key: 'ssl', label: 'SSL / TLS audit', sub: 'Verifying certificate and TLS support', result: scanResult?.sslResult },
      { key: 'zap', label: 'OWASP ZAP scan', sub: 'Collecting passive security alerts', result: scanResult?.zapResult },
      { key: 'scoring', label: 'Risk scoring', sub: 'Calculating CVSS summary and grade', result: scanResult?.scoringResult },
    ]

    return {
      ...stages[index],
      status: stageStatus,
      progress,
    }
  })
}
