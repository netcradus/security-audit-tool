
def calculate_cvss(severity):

    mapping = {
        'critical': 9.5,
        'high': 8.0,
        'medium': 5.0,
        'low': 3.0,
        'info': 0.0
    }

    return mapping.get(severity.lower(), 0.0)
