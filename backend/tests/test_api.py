import requests

url = "http://127.0.0.1:8000/api/v1/analyze"

data = {
    "user_profile": '{"name":"Goutham","salary":1200000,"age":28,"risk_appetite":"moderate","financial_year":"2024-2025"}'
}

csv_content = """date,description,debit_amount
2024-04-10,LIC Premium XYZ,50000
2024-05-15,HDFC ELSS Tax Saver SIP,60000
2024-06-20,Star Health Insurance Renewal,20000
2024-07-01,Amazon Shopping,5000
2024-08-01,LIC Premium Next Phase,40000
"""

files = {
    "file": ("test_bank_statement.csv", csv_content, "text/csv")
}

try:
    response = requests.post(url, data=data, files=files)
    print("Status Code:", response.status_code)
    import json
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(e)
