import requests
import urllib3

# Disable SSL warnings
urllib3.disable_warnings(
    urllib3.exceptions.InsecureRequestWarning
)


def analyze_cookies(target):

    findings = []

    try:

        response = requests.get(
            f"https://{target}",
            verify=False,
            timeout=10
        )

        # =====================================
        # RAW SET-COOKIE HEADERS
        # =====================================

        raw_cookies = response.headers.get(
            "Set-Cookie",
            ""
        )

        for cookie in response.cookies:

            # =====================================
            # SECURE FLAG
            # =====================================

            if not cookie.secure:

                findings.append({
                    "title": "Cookie Missing Secure Flag",
                    "severity": "medium",
                    "category": "Cookie Security"
                })

            # =====================================
            # HTTPONLY FLAG
            # =====================================

            if "HttpOnly" not in raw_cookies:

                findings.append({
                    "title": "Cookie Missing HttpOnly Flag",
                    "severity": "medium",
                    "category": "Cookie Security"
                })

            # =====================================
            # SAMESITE FLAG
            # =====================================

            if "SameSite" not in raw_cookies:

                findings.append({
                    "title": "Cookie Missing SameSite Attribute",
                    "severity": "medium",
                    "category": "Cookie Security"
                })

        return findings

    except Exception as e:

        return [{
            "title": "Cookie Analysis Failed",
            "severity": "info",
            "error": str(e)
        }]