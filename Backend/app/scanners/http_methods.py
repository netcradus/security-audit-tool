import requests

def analyze_http_methods(target):
    findings=[]
    try:
        r=requests.options(f'https://{target}',verify=False,timeout=10)
        methods=r.headers.get('Allow','')
        for m in ['PUT', 'DELETE', 'TRACE']:
            if m in methods:

                findings.append({
                    'title': f'Dangerous HTTP Method Enabled: {m}',
                    'severity': 'medium',
                    'affected_url': f'https://{target}'
                })
    except Exception as e:
        return [{'title':'HTTP Method Analysis Failed','severity':'info','error':str(e)}]
