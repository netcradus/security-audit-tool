import os
import urllib3
import time
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ZAP_API_KEY")
from zapv2 import ZAPv2

# Disable HTTPS warnings
urllib3.disable_warnings(
    urllib3.exceptions.InsecureRequestWarning
)

# Remove proxy environment variables
os.environ.pop("HTTP_PROXY", None)
os.environ.pop("HTTPS_PROXY", None)

ZAP_HOST = os.getenv("ZAP_HOST")
ZAP_PORT = os.getenv("ZAP_PORT")


def run_zap_scan(target):

    findings = []

    try:

        target_url = f"https://{target}"

        # Disable proxy inheritance
        zap = ZAPv2(
            apikey=API_KEY,
            proxies={
                'http': f'http://{ZAP_HOST}:{ZAP_PORT}',
                'https': f'http://{ZAP_HOST}:{ZAP_PORT}'
            }
        )

        # Open target
        zap.urlopen(target_url)

        # Spider Scan ONLY
        spider = zap.spider.scan(target_url)

        while int(zap.spider.status(spider)) < 100:
            time.sleep(1)

        # Passive scan wait
        time.sleep(3)

        # Fetch alerts
        alerts = zap.core.alerts(
            baseurl=target_url
        )

        for alert in alerts:

            findings.append({

                "title": alert.get("alert"),

                "severity": alert.get(
                    "risk",
                    "info"
                ).lower(),

                "description": alert.get(
                    "description"
                ),

                "solution": alert.get(
                    "solution"
                ),

                "reference": alert.get(
                    "reference"
                ),

                "affected_url": alert.get("url"),

                "source": "owasp_zap"
            })

        return findings

    except Exception as e:

        return [{
            "title": "ZAP Scan Failed",
            "severity": "info",
            "error": str(e)
        }]