import os
import requests
from dotenv import load_dotenv

load_dotenv()

backendURL = os.getenv("backendUrl", "http://backend:3030") #"backendURL", 
sitePassword = os.getenv("sitePasswd")

def createSession():
    s = requests.Session()
    s.verify = False
    loginUrl = f"{backendURL}/firmware-monitoring/login"
    payload = {"password": sitePassword}

    response = s.post(loginUrl, json = payload, verify = False)
    if response.status_code == 200:
        #Session erfolgreich erstellt
        return s
    else:
        raise Exception(f"Login fehlgeschlagen: Status Code: {response.status_code}, Text: {response.text}")