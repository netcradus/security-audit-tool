import requests

def analyze_cookies(target):
    findings=[]
    try:
        r=requests.get(f'https://{target}',verify=False,timeout=10)
        for cookie in r.cookies:
            if not cookie.secure:
                findings.append({'title':'Cookie Missing Secure Flag','severity':'medium'})
        return findings
    except Exception as e:
        return [{'title':'Cookie Analysis Failed','severity':'info','error':str(e)}]
