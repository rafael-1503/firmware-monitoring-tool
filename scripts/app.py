from flask import Flask, jsonify
import subprocess
import sys
import os

app = Flask(__name__)

scriptsBasePath = "/app/jobs"

def runScript(scriptName: str):
    scriptPath = os.path.join(scriptsBasePath, scriptName)
    result = subprocess.run(
        [scriptPath],
        capture_output=True,
        text=True
    )

    return{
        "stdout": result.stdout,
        "stderr": result.stderr,
        "returncode": result.returncode
    }, (200 if result.returncode == 0 else 500)

@app.post("/run/scanNetwork")
def runScanNetwork():
    return runScript("scanNetwork")

@app.post("/run/checkFirmware")
def runCheckFirmware():
    return runScript("checkFirmware")

@app.post("/run/checkCiscoVulnerabilities")
def runCheckCiscoVulnerabilities():
    return runScript("checkCiscoVulnerabilities")

@app.get("/health")
def health():
    return {"status": "ok"}, 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)