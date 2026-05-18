import dns.resolver
import whois


def get_dns_records(domain):

    dns_data = {}

    record_types = [
        "A",
        "MX",
        "TXT"
    ]

    for record_type in record_types:

        try:

            answers = dns.resolver.resolve(
                domain,
                record_type
            )

            dns_data[record_type] = [
                str(r)
                for r in answers
            ]

        except Exception:

            dns_data[record_type] = []

    return dns_data


def check_spf(domain):

    try:

        answers = dns.resolver.resolve(
            domain,
            "TXT"
        )

        for record in answers:

            record_text = str(record)

            if "v=spf1" in record_text:

                return {
                    "enabled": True,
                    "record": record_text
                }

        return {
            "enabled": False
        }

    except Exception:

        return {
            "enabled": False
        }


def check_dmarc(domain):

    try:

        dmarc_domain = f"_dmarc.{domain}"

        answers = dns.resolver.resolve(
            dmarc_domain,
            "TXT"
        )

        for record in answers:

            record_text = str(record)

            if "v=DMARC1" in record_text:

                return {
                    "enabled": True,
                    "record": record_text
                }

        return {
            "enabled": False
        }

    except Exception:

        return {
            "enabled": False
        }


def get_whois_info(domain):

    try:

        data = whois.whois(domain)

        return {

            "registrar": data.registrar,

            "creation_date": str(
                data.creation_date
            ),

            "expiration_date": str(
                data.expiration_date
            ),

            "name_servers": data.name_servers
        }

    except Exception as e:

        return {
            "error": str(e)
        }


def analyze_dns_and_whois(domain):

    findings = []

    dns_records = get_dns_records(
        domain
    )

    spf = check_spf(domain)

    dmarc = check_dmarc(domain)

    whois_info = get_whois_info(
        domain
    )

    # =====================================
    # SPF FINDING
    # =====================================

    if not spf.get("enabled"):

        findings.append({
            "title": "SPF Record Missing",
            "severity": "medium",
            "category": "Email Security",
            "affected_url": domain
        })

    # =====================================
    # DMARC FINDING
    # =====================================

    if not dmarc.get("enabled"):

        findings.append({
            "title": "DMARC Record Missing",
            "severity": "medium",
            "category": "Email Security",
            "affected_url": domain
        })

    return {

        "dns_records": dns_records,

        "spf": spf,

        "dmarc": dmarc,

        "whois": whois_info,

        "findings": findings
    }