import sys
import os

scriptDir = os.path.dirname(os.path.abspath(__file__))
projectRoot = os.path.abspath(os.path.join(scriptDir, ".."))

if projectRoot not in sys.path:
    sys.path.append(projectRoot)

import requests
from pprint import pprint
from utils.authSession import createSession
import urllib3
from collections import defaultdict
import json

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

alertData = defaultdict(list)

#Credentials aus DB abfragen
def getCredentials(baseUrl, session):
    url = f"{baseUrl}/management"
    response = session.get(url)
    # print(f"Response: {response.text}")

    data = response.json()

    ciscoApiId = data.get("ciscoApiId", "")
    ciscoApiSecret = data.get("ciscoApiSecret", "")
    teamsWebhook = data.get("teamsWebhook", "")
    return ciscoApiId, ciscoApiSecret, teamsWebhook

#Generate Token
def getAccessToken(ciscoApiId: str, ciscoApiSecret: str):
    token_url = "https://id.cisco.com/oauth2/default/v1/token"
    grant_type ="client_credentials"
    
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    data = {
        "grant_type": grant_type, 
        "client_id": ciscoApiId,
        "client_secret": ciscoApiSecret
        }

    response = requests.request('POST', token_url, headers=headers, data=data)
    token = response.json().get("access_token")
    return token

def getAllDevices(baseUrl, session):
    url = f"{baseUrl}/devices/"
    response = session.get(url)

    if response.status_code == 200:
        return response.json()
    else:
        print("Keine Devices gefunden")
        return []

#OpenVuln API
def getAdvisoriesForDevice(token: str, osType: str, version: str):
    url = "https://apix.cisco.com/security/advisories/v2/OSType/"+osType+"?version="+version+"&productNames=false&summaryDetails=false"
    headers = {
        "Accept": "application/json",
        "Authorization": "Bearer " + token
    }
    response = requests.request('GET', url, headers=headers)

    if response.status_code != 200:
        return[]
    
    data = response.json()
    if "advisories" not in data:
        print("No advisories found")
        return []
    
    advisories = data.get("advisories", [])
    
    return advisories

def addVulnToDevice(ip: str, vulnerabilityData: str, baseUrl, session):
    url = f"{baseUrl}/device/{ip}/vulnerabilities"
    response = session.put(url, json = vulnerabilityData)
    return response

def sendAlert(webhook, data):
    if webhook:
        alertLines = []
        
        for ip, cves in alertData.items():
            alertLines.append(f"{ip}: {cves}")
        alertString = "\n\n".join(alertLines)
        data = {
            "text": f"Achtung! Neue Vulnerabilities gefunden: \n\n \n\n {alertString}"
        }
        response = requests.post(webhook, data = json.dumps(data), headers={"Content-Type": "application/json"})
        #print(response.status_code)
        #print(response.text)

def main():
    baseUrl = "http://backend:3030/firmware-monitoring"
    session = createSession()

    #get credentials & access token
    ciscoApiId, ciscoApiSecret, teamsWebhook = getCredentials(baseUrl, session)
    access_token = getAccessToken(ciscoApiId, ciscoApiSecret)

    #get all devices
    devices = getAllDevices(baseUrl, session)

    #iterate over all devices
    for device in devices:
        ios = device["firmware"]["os"].lower()
        version = device["firmware"]["version"]
        
        #get advisories for device
        advisories = getAdvisoriesForDevice(access_token, ios, version)

        if(advisories):
            for advisory in advisories:
                vulnData = {
                    "advisoryId": advisory.get("advisoryId"),
                    "cves": advisory.get("cves"),
                    "title": advisory.get("advisoryTitle"),
                    "severity": advisory.get("sir"),
                    "url": advisory.get("publicationUrl"),
                    "cvssScore": advisory.get("cvssBaseScore"),
                    "firstFixed": advisory.get("firstFixed"),
                    "version": advisory.get("version"),
                    "firstPublished": advisory.get("firstPublished"),
                    "lastUpdated": advisory.get("lastUpdated")
                }
                #createVulnerability(vulnData)
                response = addVulnToDevice(device["ip"], vulnData, baseUrl, session)
                # if statuscode = 200: in Map -> device_ip: cve
                # am ende dann einen gesammelten alert mit inhalt von map schicken
                alertSeverity = ["critical", "high"]
                if response.status_code == 200 and vulnData["severity"].lower() in alertSeverity:
                    alertData[device["ip"]].extend(vulnData["cves"])


    #Alerts versenden
    if alertData:
        sendAlert(teamsWebhook, alertData)
    
    # ios = "iosxe"
    # version = "17.15.3"

    # advisories = getAdvisoriesForDevice(access_token, ios, version)
    # for advisory in advisories:
    #     print(advisory["publicationUrl"])
    #     print(advisory["cves"])
      

if __name__ == "__main__":
    main()