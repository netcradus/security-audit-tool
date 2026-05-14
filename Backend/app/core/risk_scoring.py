def calculate_asset_risk(summary):
    score=(summary.get('critical',0)*10)+(summary.get('high',0)*7)+(summary.get('medium',0)*5)+(summary.get('low',0)*2)
    if score>=40:return 'Critical'
    if score>=20:return 'High'
    if score>=10:return 'Medium'
    return 'Low'
