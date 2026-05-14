from app.core.cvss_engine import calculate_cvss

from app.core.vulnerability_mapper import enrich_finding


def aggregate_results(
    target,
    nmap_data,
    ssl_data,
    findings
):

    summary = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "info": 0
    }

    enriched = []

    for finding in findings:

        severity = finding.get(
            "severity",
            "info"
        ).lower()

        if severity == "informational":
            severity = "info"

        finding["severity"] = severity

        finding["cvss"] = calculate_cvss(
            severity
        )

        finding = enrich_finding(
            finding
        )

        if severity in summary:
            summary[severity] += 1

        enriched.append(finding)

    return {
        "target": target,
        "summary": summary,
        "ports": nmap_data,
        "ssl": ssl_data,
        "findings": enriched
    }