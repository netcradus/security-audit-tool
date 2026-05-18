from concurrent.futures import ThreadPoolExecutor

from app.scanners.nmap_scanner import run_nmap_scan
from app.scanners.header_analyzer import analyze_headers
from app.scanners.ssl_analyzer import analyze_ssl
from app.scanners.zap_scanner import run_zap_scan

from app.scanners.http_methods import analyze_http_methods
from app.scanners.cookie_analyzer import analyze_cookies
from app.scanners.ssl_expiry import analyze_ssl_expiry
from app.scanners.dns_whois import analyze_dns_and_whois

from app.core.aggregator import aggregate_results
from app.core.deduplicator import deduplicate_findings
from app.core.risk_scoring import calculate_asset_risk
from app.core.report_generator import generate_professional_report

from app.storage.history import update_scan

import os


def run_full_scan(scan_id, target):

    try:

        findings = []

        # =====================================
        # PARALLEL SCANNER EXECUTION
        # =====================================

        with ThreadPoolExecutor(max_workers=7) as executor:

            future_nmap = executor.submit(
                run_nmap_scan,
                target
            )

            future_ssl = executor.submit(
                analyze_ssl,
                target
            )

            future_ssl_expiry = executor.submit(
                analyze_ssl_expiry,
                target
            )

            future_headers = executor.submit(
                analyze_headers,
                target
            )

            future_http = executor.submit(
                analyze_http_methods,
                target
            )

            future_cookies = executor.submit(
                analyze_cookies,
                target
            )

            future_zap = executor.submit(
                run_zap_scan,
                target
            )

            future_dns = executor.submit(
                analyze_dns_and_whois,
                target
            )

            # =====================================
            # NMAP RESULTS
            # =====================================

            try:

                nmap_data = future_nmap.result()

            except Exception as e:

                nmap_data = []

                findings.append({
                    "title": "Nmap Scan Failed",
                    "severity": "info",
                    "error": str(e)
                })

            # =====================================
            # SSL RESULTS
            # =====================================

            try:

                ssl_data = future_ssl.result()

                ssl_expiry = future_ssl_expiry.result()

                ssl_data.update(ssl_expiry)

                # =====================================
                # LEGACY TLS DETECTION
                # =====================================

                supported_protocols = ssl_data.get(
                    "supported_protocols",
                    {}
                )

                # TLS 1.0

                if supported_protocols.get("TLSv1.0"):

                    findings.append({
                        "title": "TLS 1.0 Supported",
                        "severity": "high",
                        "cvss": 7.5,
                        "category": "Transport Security",
                        "owasp": "A02:2021 Cryptographic Failures",
                        "cwe": "CWE-326"
                    })

                # TLS 1.1

                if supported_protocols.get("TLSv1.1"):

                    findings.append({
                        "title": "TLS 1.1 Supported",
                        "severity": "medium",
                        "cvss": 5.9,
                        "category": "Transport Security",
                        "owasp": "A02:2021 Cryptographic Failures",
                        "cwe": "CWE-326"
                    })

            except Exception as e:

                ssl_data = {
                    "tls_version": "Unknown",
                    "certificate_expiry": "Unknown",
                    "supported_protocols": {}
                }

                findings.append({
                    "title": "SSL Analysis Failed",
                    "severity": "info",
                    "error": str(e)
                })

            # =====================================
            # HEADER ANALYSIS
            # =====================================

            try:

                findings.extend(
                    future_headers.result()
                )

            except Exception as e:

                findings.append({
                    "title": "Header Analysis Failed",
                    "severity": "info",
                    "error": str(e)
                })

            # =====================================
            # HTTP METHODS
            # =====================================

            try:

                findings.extend(
                    future_http.result()
                )

            except Exception as e:

                findings.append({
                    "title": "HTTP Methods Analysis Failed",
                    "severity": "info",
                    "error": str(e)
                })

            # =====================================
            # COOKIE ANALYSIS
            # =====================================

            try:

                findings.extend(
                    future_cookies.result()
                )

            except Exception as e:

                findings.append({
                    "title": "Cookie Analysis Failed",
                    "severity": "info",
                    "error": str(e)
                })

            # =====================================
            # DNS / WHOIS
            # =====================================

            try:

                dns_data = future_dns.result()

                findings.extend(
                    dns_data.get(
                        "findings",
                        []
                    )
                )

            except Exception as e:

                dns_data = {}

                findings.append({
                    "title": "DNS/WHOIS Analysis Failed",
                    "severity": "info",
                    "error": str(e)
                })

            # =====================================
            # OWASP ZAP
            # =====================================

            try:

                findings.extend(
                    future_zap.result()
                )

            except Exception as e:

                findings.append({
                    "title": "ZAP Scan Failed",
                    "severity": "info",
                    "error": str(e)
                })

        # =====================================
        # REMOVE DUPLICATES
        # =====================================

        findings = deduplicate_findings(
            findings
        )

        # =====================================
        # AGGREGATE RESULTS
        # =====================================

        results = aggregate_results(
            target,
            nmap_data,
            ssl_data,
            findings
        )

        
        results["dns_whois"] = dns_data

        # =====================================
        # ASSET RISK SCORE
        # =====================================

        results["asset_risk"] = calculate_asset_risk(
            results["summary"]
        )

        # =====================================
        # REPORT GENERATION
        # =====================================

        reports_dir = os.getenv(
            "REPORTS_DIR",
            "reports"
        )

        os.makedirs(
            reports_dir,
            exist_ok=True
        )

        report_path = os.path.join(
            reports_dir,
            f"{scan_id}.pdf"
        )

        try:

            generate_professional_report(
                report_path,
                results
            )

        except Exception as e:

            report_path = None

            findings.append({
                "title": "Report Generation Failed",
                "severity": "info",
                "error": str(e)
            })

            results["findings"] = findings

        # =====================================
        # UPDATE DATABASE
        # =====================================

        update_scan(
            scan_id=scan_id,
            status="completed",
            results=results,
            report=report_path
        )

        print(f"[INFO] Scan completed: {scan_id}")

    except Exception as e:

        update_scan(
            scan_id=scan_id,
            status="failed",
            error=str(e)
        )

        print(f"[ERROR] Scan failed: {e}")