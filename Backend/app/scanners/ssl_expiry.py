import ssl
import socket
from cryptography import x509
from cryptography.hazmat.backends import default_backend


def analyze_ssl_expiry(hostname):

    try:

        context = ssl.create_default_context()

        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        with socket.create_connection(
            (hostname, 443),
            timeout=10
        ) as sock:

            with context.wrap_socket(
                sock,
                server_hostname=hostname
            ) as ssock:

                cert_bin = ssock.getpeercert(
                    binary_form=True
                )

                cert = x509.load_der_x509_certificate(
                    cert_bin,
                    default_backend()
                )

                expiry = cert.not_valid_after

                return {
                    "certificate_expiry": str(expiry)
                }

    except Exception as e:

        return {
            "certificate_expiry": "Unknown",
            "error": str(e)
        }