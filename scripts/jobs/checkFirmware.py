import sys
import os

scriptDir = os.path.dirname(os.path.abspath(__file__))
projectRoot = os.path.abspath(os.path.join(scriptDir, ".."))

if projectRoot not in sys.path:
    sys.path.append(projectRoot)


import asyncio
from pysnmp.hlapi.asyncio import (
    SnmpEngine,
    UdpTransportTarget,
    UsmUserData,
    CommunityData,
    ContextData,
    ObjectType,
    ObjectIdentity,
    usmHMACSHAAuthProtocol,
    usmAesCfb128Protocol,
    get_cmd
)
import re
import requests
from datetime import datetime
from utils.authSession import createSession
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)



#Credentials aus DB abfragen
def getCredentials(baseUrl, session):
    url = f"{baseUrl}/management"
    response = session.get(url, verify = False)
    snmpUser = response.json()["snmpUser"]
    snmpAuthKey = response.json()["snmpAuthKey"]
    snmpPrivKey = response.json()["snmpPrivKey"]
    return snmpUser, snmpAuthKey, snmpPrivKey

#SNMPv3
# async def getSnmpResponse(ip: str, user:str, auth_key:str, priv_key:str, timeout=2, port=161):
#     try:
#         transport = await UdpTransportTarget.create((ip, 161))
#         errorIndication, errorStatus, errorIndex, varBinds = await get_cmd(
#             SnmpEngine(),
#             UsmUserData(
#                 user,
#                 authKey= auth_key,
#                 privKey= priv_key,
#                 authProtocol = usmHMACSHAAuthProtocol,
#                 privProtocol = usmAesCfb128Protocol
#             ),
#             transport,
#             ContextData(),
#             ObjectType(ObjectIdentity("SNMPv2-MIB", "sysDescr", 0))
#         )
#     except Exception as e:
#         print(e)
#         return None

#     if errorIndication or errorStatus:
#         return None

#     for name, val in varBinds:
#         return str(val)

#     return None

#SNMPv2
async def getSnmpResponse(ip: str, communityString:str, timeout=2, port=161):
    try:
        transport = await UdpTransportTarget.create((ip, 161))
        errorIndication, errorStatus, errorIndex, varBinds = await get_cmd(
            SnmpEngine(),
            CommunityData(communityString, mpModel = 1),
            transport,
            ContextData(),
            ObjectType(ObjectIdentity("SNMPv2-MIB", "sysDescr", 0))
        )
    except Exception as e:
        print(e)
        return None

    if errorIndication or errorStatus:
        return None

    for name, val in varBinds:
        return str(val)

    return None


def getFirmwareFromSnmpResponse(description: str):

    description = description.strip()

    version_match = re.search(r"Version\s+([\w.\(\)-]+)", description, re.IGNORECASE)
    if version_match:
        version = version_match.group(1)
    else:
        version = "Unknown version"

    dl = description.lower()

    osMatch = re.search(r"\[([^\]]+)\]", description, re.IGNORECASE)

    #NX-OS
    if "nx-os" in dl or "nxos" in dl:
        os_type = "nxos"

    #FTD
    elif "firepower" in dl or "ftd" in dl:
        os_type = "ftd"

    #IOSXE
    elif re.search(r"b_iosxe\b", description, re.IGNORECASE):
        os_type = "iosxe"
    elif re.search(r"\bios[- ]?xe\b", description, re.IGNORECASE):
        os_type = "iosxe"
    elif re.search(r"\bcat3k_caa\b", dl):
        os_type = "iosxe"

    #IOS
    elif re.search(r"\bc29\d{2,3}\w*-universal(k9|k9s)-m\b", dl):
        os_type = "ios"
    elif re.search(r"\b(lanbasek9|ipbasek9|ipservicesk9)\b", dl):
        os_type = "ios"

    elif osMatch:
        os_type = osMatch.group(1)

    else: os_type = "unknown"

    # type_match = re.search(r"Software\s+\(([^)]+)\)", description, re.IGNORECASE)
    # if type_match:
    #     device_type = type_match.group(1)
    # else:
    #     device_type = "Unknown type"

    # software_match = re.search(r"^([^,]+)", description, re.IGNORECASE)
    # if software_match:
    #     software = software_match.group(1)
    # else:
    #     software = "Unknown software"

    # os_match = re.search(r"\[([^\]]+)\]", description, re.IGNORECASE)
    # if os_match:
    #     os = os_match.group(1)
    # else:
    #     os = "Unknown software"



    #device_typ und software kann nach Bedarf auch zurückgegeben werden
    #return software, device_type, os, version

    return os_type, version

def getAllDevices(baseUrl, session):
    url = f"{baseUrl}/devices/"
    response = session.get(url, verify = False)

    if response.status_code == 200:
        return response.json()
    
def updateDeviceFirmware(ip: str, osType: str, firmwareVersion: str, baseUrl, session):
    url = f"{baseUrl}/device/{ip}"

    data = {
        "firmware": {"os": osType, "version": firmwareVersion, "lastChecked": datetime.now().isoformat()}
    }

    response = session.put(url, json = data, verify = False)
    if(response.status_code == 200):
        session.delete(f"{url}/vulnerabilities", verify = False) #falls neue firmwareversion eingetragen wird --> vulnerabilities in eintrag von gerät löschen
    
    return response

def updateLastSeen(ip: str, baseUrl, session):
    url = f"{baseUrl}/device/lastSeen/{ip}"
    response = session.put(url, verify = False)
    return response

async def main():
    baseUrl = "http://backend:3030/firmware-monitoring"
    session = createSession()

    #get all devices
    devices = getAllDevices(baseUrl, session)

    #get credentials from db
    snmpUser, snmpAuthKey, snmpPrivKey = getCredentials(baseUrl, session)

    #print(snmpUser, snmpAuthKey, snmpPrivKey)

    #iterate over all devices
    for device in devices:
        db_firmware = device["firmware"]["version"]
        #SNMPv3
        # snmp_response = await getSnmpResponse(
        #     ip = device["ip"],
        #     user = snmpUser,
        #     auth_key = snmpAuthKey,
        #     priv_key = snmpPrivKey
        # )

        #SNMPv2
        snmp_response = await getSnmpResponse(
            ip = device["ip"],
            #User hier als communityString
            communityString = snmpUser
        )

        if snmp_response is None:
            print("Keine SNMP Antowrt von" + device["ip"])
            continue

        os, version = getFirmwareFromSnmpResponse(snmp_response)
        if version != "Unknown version":
            updateLastSeen(device["ip"], baseUrl, session)
            if db_firmware != version:
                updateDeviceFirmware(device["ip"], os, version, baseUrl, session)

    #zum testen        
    #for device in devices:
        # updateDeviceFirmware("192.168.10.1", "iosxe", "17.15.4")
        # r = updateLastSeen("192.168.10.1")
        # print(r.text, r.status_code)

if __name__ == "__main__":
    asyncio.run(main())