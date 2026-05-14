import nmap

def run_nmap_scan(target):

    scanner = nmap.PortScanner()

    try:

        scanner.scan(
            target,
            arguments='-sV -F'
        )

        results = []

        for host in scanner.all_hosts():

            for proto in scanner[host].all_protocols():

                ports = scanner[host][proto].keys()

                for port in ports:

                    service = scanner[host][proto][port]

                    results.append({
                        "port": port,
                        "state": service.get("state"),
                        "service": service.get("name"),
                        "version": service.get("product")
                    })

        return results

    except Exception as e:

        return [{
            "error": str(e)
        }]