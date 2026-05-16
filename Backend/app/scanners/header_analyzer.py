import requests
import urllib3

urllib3.disable_warnings(
    urllib3.exceptions.InsecureRequestWarning
)


def analyze_headers(target):

    findings = []

    try:

        # =========================
        # TRY HTTPS FIRST
        # =========================

        try:

            url = f"https://{target}"

            response = requests.get(
                url,
                timeout=10,
                allow_redirects=True,
                verify=False
            )

        # =========================
        # FALLBACK TO HTTP
        # =========================

        except Exception:

            url = f"http://{target}"

            response = requests.get(
                url,
                timeout=10,
                allow_redirects=True
            )

        # =========================
        # SECURITY HEADERS
        # =========================

        headers = headers = [
            {
                "name": "Content-Security-Policy",
                "severity": "medium"
            },
            {
                "name": "Strict-Transport-Security",
                "severity": "medium"
            },
            {
                "name": "X-Frame-Options",
                "severity": "medium"
            },
            {
                "name": "X-Content-Type-Options",
                "severity": "low"
            },
            {
                "name": "Referrer-Policy",
                "severity": "low"
            },
            {
                "name": "Permissions-Policy",
                "severity": "low"
            }
        ]

        for header in headers:

            if header["name"] not in response.headers:

                findings.append({
                    "title": f"Missing {header['name']} Header",
                    "severity": header["severity"],
                    "category": "Security Headers"
                })

        return findings

    except Exception as e:

        return [{
            "title": "Header Analysis Failed",
            "severity": "info",
            "error": str(e)
        }]