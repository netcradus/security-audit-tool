def deduplicate_findings(findings):
    seen=set();unique=[]
    for f in findings:
        k=(f.get('title'),f.get('severity'))
        if k not in seen:
            seen.add(k)
            unique.append(f)
    return unique
