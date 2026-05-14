CVSS_MAP={'critical':9.8,'high':8.0,'medium':5.5,'low':3.1,'info':0.0}

def calculate_cvss(severity):
    return CVSS_MAP.get(severity.lower(),0.0)
