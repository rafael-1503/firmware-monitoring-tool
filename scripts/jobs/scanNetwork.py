import sys
import os

scriptDir = os.path.dirname(os.path.abspath(__file__))
projectRoot = os.path.abspath(os.path.join(scriptDir, ".."))

if projectRoot not in sys.path:
    sys.path.append(projectRoot)


import subprocess
import platform
import requests
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
import ipaddress
import re
from datetime import datetime
from utils.authSession import createSession
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)



#Credentials aus DB abfragen
def getCredentials(baseUrl, session):
    url = f"{baseUrl}/management"
    response = session.get(url)
    #print(response.json())

    data = response.json()

    snmpUser = data.get("snmpUser")
    snmpAuthKey = data.get("snmpAuthKey")
    snmpPrivKey = data.get("snmpPrivKey")
    mgmtNet = data.get("mgmtNet")
    return snmpUser, snmpAuthKey, snmpPrivKey, mgmtNet

#Ist IP pingbar?
async def ping(ip: str, timeout=1) -> bool:
    system = platform.system().lower()
    if system == "windows":
        cmd = ["ping", "-n", "1", "-w", str(int(timeout*1000)), ip]
    else:
        cmd = ["ping", "-c", "1", "-w", str(int(timeout)), ip]
    try:
        #res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
        #return res.returncode == 0
        process = await asyncio.create_subprocess_exec(*cmd, stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.DEVNULL)
        await process.wait()
        return process.returncode == 0
    # except subprocess.TimeoutExpired:
    #     return False
    except Exception:
        return False

#SNMP Anfrage stellen
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
#             ObjectType(ObjectIdentity("SNMPv2-MIB", "sysDescr", 0)),
#             ObjectType(ObjectIdentity("SNMPv2-MIB", "sysName", 0))
#         )
#     except Exception as e:
#         print(e)
#         return None
#     if errorIndication or errorStatus:
#         return None
#     result = {}
#     for name, val in varBinds:
#         key = name.prettyPrint().split("::")[-1].split(".")[0]
#         result[key] = val.prettyPrint()
#     return result.get("sysDescr"), result.get("sysName")

#SNMPv2
async def getSnmpResponse(ip: str, communityString: str):
    try:
        transport = await UdpTransportTarget.create((ip, 161))
        errorIndication, errorStatus, errorIndex, varBinds = await get_cmd(
            SnmpEngine(),
            CommunityData(communityString, mpModel = 1),
            transport,
            ContextData(),
            ObjectType(ObjectIdentity("SNMPv2-MIB", "sysDescr", 0)),
            ObjectType(ObjectIdentity("SNMPv2-MIB", "sysName", 0))
        )
    except Exception as e:
        print(e)
        return None
    if errorIndication or errorStatus:
        return None
    result = {}
    for name, val in varBinds:
        key = name.prettyPrint().split("::")[-1].split(".")[0]
        result[key] = val.prettyPrint()
    return result.get("sysDescr"), result.get("sysName")

#Ist SNMP Antowrt von Cisco?
def checkCisco(s: str):
    if not s:
        return False #falls String leer
    s_lower = s.lower()
    cisco = ["cisco", "ios", "ios-xe", "asa", "meraki"]
    for c in cisco:
        if c in s_lower:
            print(s)
            return True
    return False

#Firmware Version aus SNMP Antwort extrahieren
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

    typeMatch = re.search(r"Software\s+\(([^)]+)\)", description, re.IGNORECASE)
    if typeMatch:
        deviceType = typeMatch.group(1)
    else:
        deviceType = "Unknown type"

    # softwareMatch = re.search(r"^([^,]+)", description, re.IGNORECASE)
    # if softwareMatch:
    #     software = softwareMatch.group(1)
    # else:
    #     software = "Unknown software"

    # osMatch = re.search(r"\[([^\]]+)\]", description, re.IGNORECASE)
    # if osMatch:
    #     os = osMatch.group(1)
    # else:
    #     os = "Unknown os"

    #device_typ und software kann nach Bedarf auch zurückgegeben werden
    #return software, device_type, os, version

    return os_type, version, deviceType

pingable = []
#check single ip
async def checkIP(ip: str, snmpUser: str, snmpAuthkey: str, snmpPrivKey: str):
    #if pingable
    if(await ping(ip)):
        print("IP "+ip+" ist pingbar!")
        pingable.append(ip)
        #snmpv2
        sysDescr, sysName = await getSnmpResponse(ip, snmpUser)
        #snmpv3
        #sysDescr, sysName = await getSnmpResponse(ip, snmpUser, snmpAuthkey, snmpPrivKey)
        if(checkCisco(sysDescr)):
            os, version, deviceType = getFirmwareFromSnmpResponse(sysDescr)
            return True, os, version, deviceType, sysName
    else:
        print("IP "+ip+" ist nicht pingbar!")

#Device anlegen
def createDevice(ip: str, osType: str, firmwareVersion: str, deviceType: str, hostname: str, baseUrl, session):
    data = {
            "ip": ip,
            "hostname": hostname,
            "firmware": {
                "os": osType,
                "version": firmwareVersion,
                "lastChecked": datetime.now().isoformat()
            },
            "vendor": "Cisco",
            "model": deviceType,
            "lastSeen": datetime.now().isoformat()
        }
    url = f"{baseUrl}/device"
    response = session.post(url, json = data)
    return response

#Firmware eines Device updaten
def updateDeviceFirmware(ip: str, osType: str, firmwareVersion: str, baseUrl, session):
    url = f"{baseUrl}/device/{ip}"
    data = {
        "firmware": {
            "os": osType, 
            "version": firmwareVersion, ""
            "lastChecked": datetime.now().isoformat()
            }
    }
    response = requests.put(url, json=data)
    session.delete(f"{url}/vulnerabilities") #falls neue firmwareversion eingetragen wird --> vulnerabilities in eintrag von gerät löschen
    return response

#LastChecked aktualisieren
def updateLastSeen(ip: str, baseUrl, session):
    url = f"{baseUrl}/device/lastSeen/{ip}"
    response = session.put(url, verify = False)
    return response

#Alle IPs prüfen
async def scanNetwork(ips, snmpUser, snmpAuthkey, snmpPrivKey, baseUrl, session, max_parallel=10,):
    sem = asyncio.Semaphore(max_parallel)

    async def limited_check(ip):
        async with sem:
            return await checkIP(ip, snmpUser, snmpAuthkey, snmpPrivKey)
        
    tasks = []
    for ip in ips:
        tasks.append(limited_check(ip))
    results = await asyncio.gather(*tasks, return_exceptions = True)

    for ip, result in zip(ips, results):
        if isinstance(result, Exception) or not result:
            continue
        isCisco, osType, firmwareVersion, deviceType, hostname = result

        if isCisco:
            print(f"{ip} ist Cisco")
            response = createDevice(ip, osType, firmwareVersion, deviceType, hostname, baseUrl, session)
            if response.status_code == 409:
                updateDeviceFirmware(ip, osType, firmwareVersion, baseUrl, session)
                updateLastSeen(ip, baseUrl, session)


async def main():
    baseUrl = "http://backend:3030/firmware-monitoring"
    session = createSession()

    #get credentials from db
    snmpUser, snmpAuthKey, snmpPrivKey, mgmtNet = getCredentials(baseUrl, session)
    print(mgmtNet)
    for net in mgmtNet:
        if not net or net.strip() == "":
            continue
        #add ips of management net to array
        network = ipaddress.ip_network(net, strict=False)
        ips = []
        for ip in network.hosts():
            ips.append(str(ip))

        await scanNetwork(ips, snmpUser, snmpAuthKey, snmpPrivKey, baseUrl, session)

        #print(pingable)

if __name__ == "__main__":
    asyncio.run(main())