from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak
)

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter

from datetime import datetime


def generate_professional_report(path, results):

    doc = SimpleDocTemplate(
        path,
        pagesize=letter
    )

    styles = getSampleStyleSheet()

    elements = []

    # ======================================
    # COVER PAGE
    # ======================================

    elements.append(
        Paragraph(
            "Professional Web Security Assessment Report",
            styles['Title']
        )
    )

    elements.append(Spacer(1, 30))

    elements.append(
        Paragraph(
            f"<b>Target:</b> {results.get('target')}",
            styles['Heading2']
        )
    )

    elements.append(Spacer(1, 10))

    elements.append(
        Paragraph(
            f"<b>Generated:</b> {datetime.now()}",
            styles['BodyText']
        )
    )

    elements.append(Spacer(1, 20))

    elements.append(
        Paragraph(
            "<b>Confidential Security Assessment</b>",
            styles['Heading3']
        )
    )

    elements.append(PageBreak())

    # ======================================
    # EXECUTIVE SUMMARY
    # ======================================

    elements.append(
        Paragraph(
            "Executive Summary",
            styles['Heading1']
        )
    )

    elements.append(Spacer(1, 10))

    summary_text = """
    The assessment identified security
    misconfigurations affecting browser-side
    security protections. Immediate remediation
    is recommended to improve the overall
    security posture of the target application.
    """

    elements.append(
        Paragraph(
            summary_text,
            styles['BodyText']
        )
    )

    elements.append(Spacer(1, 20))

    # ======================================
    # RISK TABLE
    # ======================================

    summary = results.get("summary", {})

    risk_data = [
        ["Severity", "Count"],
        ["Critical", str(summary.get("critical", 0))],
        ["High", str(summary.get("high", 0))],
        ["Medium", str(summary.get("medium", 0))],
        ["Low", str(summary.get("low", 0))],
        ["Info", str(summary.get("info", 0))]
    ]

    risk_table = Table(
        risk_data,
        colWidths=[200, 200]
    )

    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.darkblue),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold')
    ]))

    elements.append(risk_table)

    elements.append(Spacer(1, 30))

    # ======================================
    # ASSET INFORMATION
    # ======================================

    elements.append(
        Paragraph(
            "Asset Information",
            styles['Heading1']
        )
    )

    elements.append(Spacer(1, 10))

    ssl = results.get("ssl", {})

    ports = results.get("ports", [])

    port_text = ", ".join([
        str(p.get("port"))
        for p in ports
    ])

    asset_data = [
        ["Property", "Value"],
        ["Target", results.get("target")],
        ["Open Ports", port_text],
        ["TLS Version", ssl.get("tls_version", "Unknown")],
        ["Certificate Expiry", ssl.get("certificate_expiry", "Unknown")],
        ["Asset Risk", results.get("asset_risk", "Unknown")]
    ]

    asset_table = Table(
        asset_data,
        colWidths=[200, 250]
    )

    asset_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.darkgreen),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold')
    ]))

    elements.append(asset_table)

    elements.append(PageBreak())

    # ======================================
    # DETAILED FINDINGS
    # ======================================

    elements.append(
        Paragraph(
            "Detailed Vulnerability Findings",
            styles['Heading1']
        )
    )

    elements.append(Spacer(1, 20))

    findings = results.get("findings", [])

    for finding in findings:

        elements.append(
            Paragraph(
                finding.get("title"),
                styles['Heading2']
            )
        )

        elements.append(Spacer(1, 10))

        meta_data = [
            ["Field", "Value"],
            ["Severity", finding.get("severity", "N/A")],
            ["CVSS", str(finding.get("cvss", "N/A"))],
            ["Category", finding.get("category", "General")],
            ["OWASP", finding.get("owasp", "N/A")],
            ["CWE", finding.get("cwe", "N/A")]
        ]

        meta_table = Table(
            meta_data,
            colWidths=[120, 320]
        )

        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
            ('GRID', (0,0), (-1,-1), 1, colors.black),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold')
        ]))

        elements.append(meta_table)

        elements.append(Spacer(1, 10))

        description = finding.get(
            "description",
            "The vulnerability was identified during assessment."
        )

        recommendation = finding.get(
            "solution",
            "Apply security best practices and remediation guidance."
        )

        elements.append(
            Paragraph(
                f"<b>Description:</b> {description}",
                styles['BodyText']
            )
        )

        elements.append(Spacer(1, 8))

        elements.append(
            Paragraph(
                "<b>Impact:</b> This issue may increase exposure to client-side attacks and security misconfigurations.",
                styles['BodyText']
            )
        )

        elements.append(Spacer(1, 8))

        elements.append(
            Paragraph(
                f"<b>Recommendation:</b> {recommendation}",
                styles['BodyText']
            )
        )

        elements.append(Spacer(1, 20))

    # ======================================
    # OPEN PORTS
    # ======================================

    elements.append(
        Paragraph(
            "Open Ports and Services",
            styles['Heading1']
        )
    )

    elements.append(Spacer(1, 10))

    port_data = [
        ["Port", "State", "Service", "Version"]
    ]

    for port in ports:

        port_data.append([
            str(port.get("port")),
            port.get("state"),
            port.get("service"),
            port.get("version")
        ])

    port_table = Table(
        port_data,
        colWidths=[60, 80, 120, 200]
    )

    port_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.darkred),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold')
    ]))

    elements.append(port_table)

    elements.append(Spacer(1, 20))

    # ======================================
    # CONCLUSION
    # ======================================

    elements.append(
        Paragraph(
            "Conclusion",
            styles['Heading1']
        )
    )

    elements.append(Spacer(1, 10))

    conclusion = """
    The assessment identified multiple
    browser-security misconfigurations.
    Implementing recommended remediation
    measures will improve overall security posture.
    """

    elements.append(
        Paragraph(
            conclusion,
            styles['BodyText']
        )
    )

    # ======================================
    # BUILD PDF
    # ======================================

    doc.build(elements)