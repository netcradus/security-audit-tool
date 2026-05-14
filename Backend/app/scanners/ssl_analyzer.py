import ssl
import socket


def analyze_ssl(hostname):

    try:

        context = ssl.create_default_context()

        # Disable certificate validation
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

                return {
                    "tls_version": ssock.version()
                }

    except Exception as e:

        return {
            "tls_version": "Unknown",
            "error": str(e)
        }