import ssl
import socket


def test_tls_version(hostname, protocol):

    try:

        context = ssl.SSLContext(protocol)

        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        with socket.create_connection(
            (hostname, 443),
            timeout=5
        ) as sock:

            with context.wrap_socket(
                sock,
                server_hostname=hostname
            ) as ssock:

                return True

    except Exception:

        return False


def analyze_ssl(hostname):

    try:

        # =====================================
        # DEFAULT NEGOTIATED TLS VERSION
        # =====================================

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

                negotiated_version = ssock.version()

        # =====================================
        # PROTOCOL SUPPORT TESTING
        # =====================================

        supported_protocols = {}

        protocol_map = {
            "TLSv1.0": ssl.PROTOCOL_TLSv1,
            "TLSv1.1": ssl.PROTOCOL_TLSv1_1,
            "TLSv1.2": ssl.PROTOCOL_TLSv1_2
        }

        # TLS 1.3 check
        if hasattr(ssl, "PROTOCOL_TLS"):

            protocol_map["TLSv1.3"] = ssl.PROTOCOL_TLS

        for name, protocol in protocol_map.items():

            supported_protocols[name] = test_tls_version(
                hostname,
                protocol
            )

        return {
            "tls_version": negotiated_version,
            "supported_protocols": supported_protocols
        }

    except Exception as e:

        return {
            "tls_version": "Unknown",
            "supported_protocols": {},
            "error": str(e)
        }