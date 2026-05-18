import ipaddress
import socket
import re
from urllib.parse import urlparse

def normalize_target(target):

    target = target.strip()

    if not target.startswith(
        ("http://", "https://")
    ):

        target = f"https://{target}"

    parsed = urlparse(target)

    hostname = parsed.hostname or parsed.netloc

    return hostname.lower().strip(".") if hostname else ""


def is_valid_target(target):

    # Block localhost
    blocked = [
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        "::1"
    ]

    if target.lower() in blocked:
        return False

    # Check IPs
    try:

        ip = ipaddress.ip_address(target)

        if (
            ip.is_private or
            ip.is_loopback or
            ip.is_reserved
        ):
            return False

        return True

    except:
        pass

    # Validate domain
    domain_regex = re.compile(
        r'^(?:[a-zA-Z0-9]'
        r'(?:[a-zA-Z0-9-]{0,61}'
        r'[a-zA-Z0-9])?\.)+'
        r'[a-zA-Z]{2,}$'
    )

    if not domain_regex.match(target):
        return False

    try:

        resolved_ip = socket.gethostbyname(target)

        ip = ipaddress.ip_address(resolved_ip)

        if (
            ip.is_private or
            ip.is_loopback or
            ip.is_reserved
        ):
            return False

    except:
        return False

    return True
