from app.scanners.nmap_scanner import run_nmap_scan
from app.scanners.header_analyzer import analyze_headers
from app.scanners.ssl_analyzer import analyze_ssl
from app.scanners.zap_scanner import run_zap_scan

from app.scanners.http_methods import analyze_http_methods
from app.scanners.cookie_analyzer import analyze_cookies
from app.scanners.ssl_expiry import analyze_ssl_expiry

from app.core.aggregator import aggregate_results

from app.core.deduplicator import deduplicate_findings

from app.core.risk_scoring import calculate_asset_risk

from app.core.report_generator import generate_professional_report

from app.storage.history import scan_history
import os

def run_full_scan(scan_id, target):

    # =========================
    # NMAP SCAN
    # =========================

    nmap_data = run_nmap_scan(target)

    # =========================
    # SSL ANALYSIS
    # =========================

    ssl_data = analyze_ssl(target)

    ssl_expiry = analyze_ssl_expiry(target)

    ssl_data.update(ssl_expiry)

    # =========================
    # FINDINGS COLLECTION
    # =========================

    findings = []

    # Header Analysis
    findings.extend(
        analyze_headers(target)
    )

    # HTTP Methods
    findings.extend(
        analyze_http_methods(target)
    )

    # Cookie Security
    findings.extend(
        analyze_cookies(target)
    )

    # OWASP ZAP
    findings.extend(
        run_zap_scan(target)
    )

    # =========================
    # REMOVE DUPLICATES
    # =========================

    findings = deduplicate_findings(findings)

    # =========================
    # AGGREGATE RESULTS
    # =========================

    results = aggregate_results(
        target,
        nmap_data,
        ssl_data,
        findings
    )

    # =========================
    # ASSET RISK SCORE
    # =========================

    results["asset_risk"] = calculate_asset_risk(
        results["summary"]
    )

    # =========================
    # REPORT GENERATION
    # =========================
    reports_dir = os.getenv("REPORTS_DIR", "reports")
    report_path = os.path.join(reports_dir, f"{scan_id}.pdf")

    generate_professional_report(
        report_path,
        results
    )

    report = report_path
    # =========================
    # STORE HISTORY
    # =========================

    scan_history[scan_id]['status'] = 'completed'

    scan_history[scan_id]['results'] = results

    scan_history[scan_id]['report'] = report