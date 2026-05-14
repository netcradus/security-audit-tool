import requests

def analyze_headers(target):

    findings = []

    try:

        url = f"http://{target}"

        response = requests.get(
            url,
            timeout=10,
            allow_redirects=True,
            verify=False
        )

        headers = [
            "Content-Security-Policy",
            "Strict-Transport-Security",
            "X-Frame-Options"
        ]

        for header in headers:

            if header not in response.headers:

                findings.append({
                    "title": f"Missing {header} Header",
                    "severity": "medium"
                })

        return findings

    except Exception as e:

        return [{
            "title": "Header Analysis Failed",
            "severity": "info",
            "error": str(e)
        }]