import matplotlib
matplotlib.use('Agg')

import matplotlib.pyplot as plt

def generate_severity_chart(scan_id, summary):

    labels = []
    values = []

    for key, value in summary.items():

        if value > 0:
            labels.append(key.capitalize())
            values.append(value)

    if not values:
        labels = ['Info']
        values = [1]

    path = f'reports/{scan_id}_chart.png'

    plt.figure(figsize=(5,5))

    plt.pie(values, labels=labels, autopct='%1.1f%%')

    plt.title('Severity Distribution')

    plt.savefig(path)

    plt.close()

    return path