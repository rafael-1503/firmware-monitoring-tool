const { exec } = require("child_process");
var mongoose = require("mongoose");
const axios = require("axios");
const path = require("path");
const util = require("util");
const Device = require('../../models/device');
const Management = require('../../models/management');

const verifyToken = require('../session/verifyToken');


const { encryptValue, decryptValue } = require( "../../utils/crypto");

const execPromise = util.promisify(exec);

// async function runPython(scriptName){
//     const isWindows = process.platform === "win32";
//     const pythonPath = isWindows ? path.join("..", "scripts", ".venv", "Scripts", "python.exe") : path.join("..", "scripts", ".venv", "bin", "python3");
//     const scriptPath = path.join("..", "scripts", scriptName);
//     const completePath = `${pythonPath} ${scriptPath}`;
//     console.log(completePath);

//     const {stdout, stderr} = await execPromise(completePath);
//     if(stderr) console.error(stderr);
//     return stdout;
// }   

async function runScript(scriptName){
    const baseUrl = process.env.scriptsBaseUrl || "http://scripts:5000/run/"
    const url = `${baseUrl}${scriptName}`
    
    const res = await fetch(url, {method: "POST"});

    if(!res.ok){
        const text = await res.text();
        throw new Error(`Script Fehler (${res.status}): ${text}`);
    }

    return await res.json();
}

module.exports = function(app){
/** GET Methods*/
/**
 * @openapi
 * '/firmware-monitoring/devices':
 *   get:
 *     tags:
 *       - Get Methods firmware-monitoring
 *     summary: Get all devices
 *     responses:
 *       200:
 *         description: Fetched Successfully
 *       500:
 *         description: Server Error
 */
app.get('/firmware-monitoring/devices', verifyToken, async function (req, res){
    try{
        let devices = await Device.find().populate('vulnerabilities');
        res.status(200).send(devices);
    }catch(error){
        let errorObj = {body: req.body, errorMessage: "Server error!"};
        res.status(500).send(errorObj);
    }
});

/**
 * @openapi
 * '/firmware-monitoring/device/:ip':
 *   get:
 *     tags:
 *       - Get Methods firmware-monitoring
 *     summary: Get a specific device
 *     parameters:
 *       - name: ip
 *         in: path
 *         description: The IP of the device
 *         required: true
 *     responses:
 *       200:
 *         description: Fetched Successfully
 *       404:
 *         description: Device not found
 *       500:
 *         description: Server Error
 */
app.get('/firmware-monitoring/device/:ip', verifyToken, async function(req, res){
    try{
        let device = await Device.findOne({ip: req.params.ip}).populate('vulnerabilities');
        if(!device){
            res.status(404).send("Device not found");
        }else{
            res.status(200).send(device)
        }
    }catch(error){
        let errorObj = {body: req.body, errorMessage: "Server error!"};
        res.status(500).send(errorObj);
    }
});

/**
 * @openapi
 * '/firmware-monitoring/vulnerabilities':
 *   get:
 *     tags:
 *       - Get Methods firmware-monitoring
 *     summary: Get all vulnerabilities
 *     responses:
 *       200:
 *         description: Fetched Successfully
 *       500:
 *         description: Server Error
 */
app.get('/firmware-monitoring/vulnerabilities', verifyToken, async function(req, res){
    try{
        let vulnerabilities = await Vulnerability.find();
        res.status(200).send(vulnerabilities);
    }catch(error){
        let errorObj = {body: req.body, errorMessage: "Server error!"};
        res.status(500).send(errorObj);
    }
});

/**
 * @ openapi
 * '/firmware-monitoring/vulnerabilities/:cve':
 *   get:
 *     tags:
 *       - Get Methods firmware-monitoring
 *     summary: Get a specific vulnerability
 *     parameters:
 *       - name: cve
 *         in: path
 *         description: The CVE of the vulnerability
 *         required: true
 *     responses:
 *     200:
 *       description: Fetched Successfully
 *     404:
 *       description: Vulnerability not found
 *     500:
 *       description: Server Error
 */
/**
app.get('/firmware-monitoring/vulnerabilities/:cve', async function(req, res){
    try{
        let vulnerabilities = await Vulnerability.find({cve: req.params.cve});
        if(!vulnerabilities){
            res.status(404).send("Vulnerability not found");
        }else{
            res.status(200).send(vulnerabilities);
        }
        
    }catch(error){
        let errorObj = {body: req.body, errorMessage: "Server error!"};
        res.status(500).send(errorObj);
    }
});
*/

/**
 * @openapi
 * '/firmware-monitoring/vulnerabilities/:advisoryId':
 *   get:
 *     tags:
 *       - Get Methods firmware-monitoring
 *     summary: Get a specific vulnerability
 *     parameters:
 *       - name: advisoryId
 *         in: path
 *         description: The ID of the vulnerability
 *         required: true
 *     responses:
 *     200:
 *       description: Fetched Successfully
 *     404:
 *       description: Vulnerability not found
 *     500:
 *       description: Server Error
 */
app.get('/firmware-monitoring/vulnerabilities/:advisoryId', verifyToken, async function(req, res){
    try{
        let vulnerability = await Vulnerability.findOne({advisoryId: req.params.advisoryId});
        if(!vulnerability){
            res.status(404).send("Vulnerability not found");
        }else{
            res.status(200).send(vulnerability);
        }
    }catch(error){
        let errorObj = {body: req.body, errorMessage: "Server error!"};
        res.status(500).send(errorObj);
    }
});

/**
 * @openapi
 * '/firmware-monitoring/management':
 *   get:
 *     tags:
 *       - Get Methods firmware-monitoring
 *     summary: Get the management data
 *     responses:
 *     200:
 *       description: Fetched Successfully
 *     404:
 *       description: Vulnerability not found
 *     500:
 *       description: Server Error
 */
app.get('/firmware-monitoring/management', verifyToken, async function(req, res){
    try{
        let management = await Management.findOne({id: 1});
        if(!management){
            return res.status(404).send("Management not found");
        }else{
            const decrypted = {
                ...management._doc,
                snmpUser: decryptValue(management.snmpUser),
                snmpAuthKey: decryptValue(management.snmpAuthKey),
                snmpPrivKey: decryptValue(management.snmpPrivKey),
                ciscoApiId: decryptValue(management.ciscoApiId),
                ciscoApiSecret: decryptValue(management.ciscoApiSecret),
            };
            res.status(200).send(decrypted);
        }
    }catch(error){
        let errorObj = {body: req.body, errorMessage: "Server error!"};
        //res.status(500).send(errorObj);
    }
})

app.get('/firmware-monitoring/cisco/vuln/:os/:version', verifyToken, async (req, res) => {
    try{
        const {os, version} = req.params;

        const mgmt = await Management.findOne({id: 1});
        if(!mgmt){
            return res.status(404).send("Management-Daten nicht gefunden");
        }
        console.log(mgmt)

        const ciscoApiId = decryptValue(mgmt.ciscoApiId);
        const ciscoApiSecret = decryptValue(mgmt.ciscoApiSecret);
        console.log("Client ID: ", ciscoApiId);
        console.log("Client Secret", ciscoApiSecret);
        const tokenRes = await axios.post("https://id.cisco.com/oauth2/default/v1/token", 
            new URLSearchParams({
                grant_type: "client_credentials",
                client_id: ciscoApiId,
                client_secret: ciscoApiSecret
            }),{
                headers: {"Content-Type": "application/x-www-form-urlencoded"}
            }
        );
    
    const token = tokenRes.data.access_token;
    if(!token){
        return res.status(500).send("Fehler beim Abrufen des Cisco Access Tokens")
    }
    
    const vulnRes = await axios.get(`https://apix.cisco.com/security/advisories/v2/OSType/${os}?version=${version}&productNames=false`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
        }
    });

    if(vulnRes.status == 200){
        res.json(vulnRes.data);
    }


    
    }catch(err){
        console.error(err);
        //res.status(500).send("Cisco API Abfrage fehlgeschlagen");
        res.json([]);
    }
});

/** POST Methods */
/**
 * @openapi
 * '/firmware-monitoring/device':
 *   post:
 *     tags:
 *       - Post Methods firmware-monitoring
 *     summary: Add a device
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hostname
 *               - ip
 *             properties:
 *               hostname:
 *                 type: String
 *                 default: "switch01"
 *               ip:
 *                 type: String
 *                 default: "127.0.0.1"
 *               vendor:
 *                 type: String
 *                 default: "cisco"
 *               model:
 *                 type: String
 *                 default: "Catalyst 9500"
 *               firmware:
 *                 type: Object
 *                 default: {"os": "iosxe", "version": "17.15.3", "lastChecked":"2025-10-09"}
 *               lastSeen:
 *                 type: Date
 *                 default: "2025-10-09"
 *               notes:
 *                 type: String
 *                 default: "Core Switch"
 *             responses:
 *               201:
 *                 description: Added Successfully
 *               422:
 *                 description: Device incorrect
 *               500:
 *                 description: Server Error
 */
app.post('/firmware-monitoring/device', verifyToken, async function(req, res){
    try{
        let deviceData = req.body

        if(deviceData.lastSeen){
            deviceData.lastSeen = new Date(deviceData.lastSeen);
        }

        const exists = await Device.findOne({ip: deviceData.ip})
        if(exists){
            return res.status(409).send("Device already exists")
        }
        
        let device = new Device(deviceData);

        await device.save();

        res.status(201).send("successfully added!");

    }catch(error){
        console.error("Serverfehler:", error);
        if(error.name === "ValidationError"){
            res.status(422).send("Data are not correct!");
        }else{
            let errorObj = {body: req.body, errorMessage: "Server error!"};
            res.status(500).send(errorObj);
        }
    }
});

/**
 * @openapi
 * '/firmware-monitoring/management':
 *   post:
 *     tags:
 *       - Post Methods firmware-monitoring
 *     summary: Add management data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mgmtNet:
 *                 type: String
 *                 default: "192.168.10.0"
 *               snmpUser:
 *                 type: String
 *                 default: "monitor"
 *               snmpAuthKey:
 *                 type: String
 *               snmpPrivKey:
 *                 type: String
 *             responses:
 *               201:
 *                 description: Added Successfully
 *               404:
 *                 description: Management data already exists!
 *               422:
 *                 description: Data are not correct
 *               500:
 *                 description: Server Error
 */
app.post('/firmware-monitoring/management', verifyToken, async function(req, res){
    try{
        let managementData = req.body;
        managementData.id = 1;

        if (managementData.mgmtNet && !Array.isArray(managementData.mgmtNet)) {
            return res.status(400).send("mgmtNet must be an array!");
        }

        
        const exists = await Management.findOne({id: 1});
        if(exists){
            return res.status(409).send("Management data already exists!");
        }

        const encrypted = {
            ...managementData,
            snmpUser: encryptValue(managementData.snmpUser),
            snmpAuthKey: encryptValue(managementData.snmpAuthKey),
            snmpPrivKey: encryptValue(managementData.snmpPrivKey),
            ciscoApiId: encryptValue(managementData.ciscoApiId),
            ciscoApiSecret: encryptValue(managementData.ciscoApiSecret),
        }
        let management = new Management(encrypted);

        await management.save();

        res.status(201).send("Successfully added!");
    }catch(error){
        console.error("Serverfehler:", error);
        if(error.name === "ValidationError"){
            res.status(422).send("Data are not correct!");
        }else{
            let errorObj = {body: req.body, errorMessage: "Server error!"};
            res.status(500).send(errorObj);
        }
    }
});

/**
 * @openapi
 * '/firmware-monitoring/scripts/scanNetwork':
 *   post:
 *     tags:
 *       - Post Methods firmware-monitoring
 *     summary: Run scanNetwork script
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Added Successfully
 *       500:
 *         description: Server Error
 */
app.post('/firmware-monitoring/scripts/scanNetwork', verifyToken, async function(req, res){
    try{
        const output = await runScript("scanNetwork");
        res.status(200).send(output);
    }catch(err){
        console.error("Fehler", err);
        res.status(500).send(err.message)
    }
});

/**
 * @openapi
 * '/firmware-monitoring/scripts/checkCiscoVulnerabilities':
 *   post:
 *     tags:
 *       - Post Methods firmware-monitoring
 *     summary: Run checkCiscoVulnerabilities script
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Added Successfully
 *       500:
 *         description: Server Error
 */
app.post('/firmware-monitoring/scripts/checkCiscoVulnerabilities', verifyToken, async function(req, res){
    try{
        const output = await runScript("checkCiscoVulnerabilities");
        res.status(200).send(output);
    }catch(err){
        console.error("Fehler", err);
        res.status(500).send(err.message)
    }
});

/**
 * @openapi
 * '/firmware-monitoring/scripts/checkFirmware':
 *   post:
 *     tags:
 *       - Post Methods firmware-monitoring
 *     summary: Run checkFirmware script
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Added Successfully
 *       500:
 *         description: Server Error
 */
app.post('/firmware-monitoring/scripts/checkFirmware', verifyToken, async function(req, res){
    try{
        const output = await runScript("checkFirmware");
        res.status(200).send(output);
    }catch(err){
        console.error("Fehler", err);
        res.status(500).send(err.message)
    }
});

/** PUT Methods */
/**
 * @openapi
 * '/firmware-monitoring/device/:ip':
 *   put:
 *     tags:
 *       - Put Methods firmware-monitoring
 *     summary: Update a device by its ip address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: ip
 *         in: path
 *         description: The IP of the device to update
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           properties:
 *             hostname:
 *               type: String
 *               default: "switch01"
 *             firmware:
 *               type: Object
 *               default: {"os": "iosxe", "version": "17.15.3", "lastChecked":"2025-10-09"}
 *             notes:
 *               type: String
 *               default: "Core Switch"
 *           responses:
 *             201:
 *               description: Updated Successfully
 *             404:
 *               description: Device not found
 *             422:
 *               description: Data are not correct
 *             500:
 *               description: Server Error
 */
app.put('/firmware-monitoring/device/:ip', verifyToken, async function(req, res){ //verifyToken entfernt
    try{
        const updates = {};
        const allowedFields = ["hostname", "vendor", "model", "firmware", "lastSeen", "notes"];

        allowedFields.forEach(field => {
            if(req.body[field] !== undefined){
                updates[field] = req.body[field];
            }
        });

        const updatedDevice = await Device.findOneAndUpdate(
            {ip: req.params.ip},    //Filter
            {$set: updates},        //Updates
            {new: true}             //neues Device Obj zurückgeben
        );

        if(!updatedDevice){
            return res.status(404).send("Device not found");
        }

        res.status(200).send(updatedDevice);

    }catch(error){
        console.error("Serverfehler:", error);
        if(error.name === "ValidationError"){
            res.status(422).send("Data are not correct!");
        }else{
            let errorObj = {body: req.body, errorMessage: "Server error!"};
            res.status(500).send(errorObj);
        }
    }
});

/**
 * @openapi
 * '/firmware-monitoring/device/:ip/vulnerabilities':
 *   put:
 *     tags:
 *       - Put Methods firmware-monitoring
 *     summary: Add a vulbnerability to a device by its ip address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: ip
 *         in: path
 *         description: The IP of the device to update
 *         required: true
 *         schema:
 *           type: String
 *           example: 192.168.10.1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           properties:
 *             advisoryId:
 *               type: String
 *               default: "cisco-sa-snmp-x4LPhte"
 *             cve:
 *               type: Object
 *               default: {"os": "iosxe", "version": "17.15.3", "lastChecked":"2025-10-09"}
 *             notes:
 *               type: String
 *               default: "Core Switch"
 *     responses:
 *       200:
 *         description: Added Successfully
 *       404:
 *         description: Device not found
 *       409:
 *         description: Vulnerability already exists for this device
 *       422:
 *         description: Data are not correct
 *       500:
 *         description: Server Error
 */
app.put('/firmware-monitoring/device/:ip/vulnerabilities', verifyToken, async function(req, res){
    try{
        
        const ip = req.params.ip;
        const allowedFields = ["advisoryId", "severity", "cvssScore", "url", "cves", "firstFixed", "version", "firstPublished", "lastUpdated", "title"];
        const vulnData = {};

        //Nur erlaubte Felder übernehmen
        allowedFields.forEach(field => {
            if(req.body[field] !== undefined){
                vulnData[field] = req.body[field];
            }
        });

        //Exisitiert device?
        const device = await Device.findOne({ip: ip});
        if(!device){
            return res.status(404).send("Device not found");
        }

        //Exisitiert vulnerability schon?
        const exists = device.vulnerabilities.some(v => v.advisoryId === vulnData.advisoryId);
        if(exists){
           return res.status(409).send("Vulnerability already exists");
        }

        //Vulnerability hinzufügen
        device.vulnerabilities.push(vulnData);
        await device.save();

        res.status(200).send("Vulnerability added");
    }catch(error){
        console.error("Serverfehler:", error);
        if(error.name === "ValidationError"){
            res.status(422).send("Data are not correct!");
        }else{
            let errorObj = {body: req.body, errorMessage: "Server error!"};
            res.status(500).send(errorObj);
        }
    }
});


/**
 * @openapi
 * '/firmware-monitoring/device/lastSeen/:ip':
 *   put:
 *     tags:
 *       - Put Methods firmware-monitoring
 *     summary: Update the lastSeen field on a device
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: ip
 *         in: path
 *         description: The IP of the device to update
 *         required: true
 *     responses:
 *       201:
 *         description: Updated Successfully
 *       404:
 *         description: Device not found
 *       500:
 *         description: Server Error
 */
app.put('/firmware-monitoring/device/lastSeen/:ip', verifyToken, async function(req, res){
    try{
        const updates = {
            lastSeen: new Date().toISOString()
        }
        const device = await Device.findOneAndUpdate(
            {ip: req.params.ip},
            {$set: updates},
            {new: true}
        )
        if(!device){
            return res.status(404).send("Device not found");
        }
        res.status(201).send("Updated Successfully");
    }catch(error){
        let errorObj = {body: req.body, errorMessage: "Server error!"};
        res.status(500).send(errorObj);
    }
});

/**
 * @openapi
 * '/firmware-monitoring/management':
 *   put:
 *     tags:
 *       - Put Methods firmware-monitoring
 *     summary: Update Management data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           properties:
 *             mgmtNet:
 *               type: String
 *               default: "192.168.10.0"
 *             snmpUser:
 *               type: String
 *               default: "monitor"
 *             snmpAuthKey:
 *               type: String
 *             snmpPrivkey:
 *               type: String
 *           responses:
 *             201:
 *               description: Updated Successfully
 *             404:
 *               description: Management not found
 *             422:
 *               description: Data are not correct
 *             500:
 *               description: Server Error
 */
app.put('/firmware-monitoring/management', verifyToken, async function(req, res){
    try{

        const updates = {};
        const allowedFields = ["mgmtNet", "snmpUser", "snmpAuthKey", "snmpPrivKey", "ciscoApiId", "ciscoApiSecret", "teamsWebhook"];

        allowedFields.forEach(field => {
            if(req.body[field] !== undefined){
                updates[field] = req.body[field];
            }
        });

        const encrypted = {...updates};
            
        if(updates.snmpUser) encrypted.snmpUser = encryptValue(updates.snmpUser);
        if(updates.snmpAuthKey) encrypted.snmpAuthKey = encryptValue(updates.snmpAuthKey);
        if(updates.snmpPrivKey) encrypted.snmpPrivKey = encryptValue(updates.snmpPrivKey);
        if(updates.ciscoApiId) encrypted.ciscoApiId = encryptValue(updates.ciscoApiId);
        if(updates.ciscoApiSecret) encrypted.ciscoApiSecret = encryptValue(updates.ciscoApiSecret);
        

        const updatedManagement = await Management.findOneAndUpdate(
            {id: 1},                    //Filter
            {$set: encrypted},          //Updates
            {new: true}                 //neues Management Obj zurückgeben
        );

        if(!updatedManagement){
            return res.status(404).send("Management not found");
        }

        res.status(200).send("Successfully updated!");
    }catch(error){
        console.error("Serverfehler:", error);
        if(error.name === "ValidationError"){
            res.status(422).send("Data are not correct!");
        }else{
            let errorObj = {body: req.body, errorMessage: "Server error!"};
            res.status(500).send(errorObj);
        }
    }
});

/** DELETE Methods */
/**
 * @openapi
 * '/firmware-monitoring/device/:ip':
 *   delete:
 *     tags:
 *       - Delete Methods firmware-monitoring
 *     summary: Delete a device by ip
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: ip
 *         in: path
 *         description: The IP of the device
 *         required: true
 *     responses:
 *     201:
 *       description: Deleted Successfully
 *     404:
 *       description: Device not found
 *     500:
 *       description: Server Error
 */
app.delete('/firmware-monitoring/device/:ip', verifyToken, async function(req, res){ //verifyToken, entfernt
    try{
        let result = await Device.deleteOne({ip: req.params.ip});

        if(result.deletedCount === 0){
            res.status(404).send("Device not found");
        }else{
            res.status(201).send("Successfully deleted!");
        }
    }catch(error){
        console.error("Serverfehler:", error);
        let errorObj = {body: req.body, errorMessage: "Server error!"};
        res.status(500).send(errorObj);
    }
});

/**
 * @openapi
 * '/firmware-monitoring/vulnerability/:cve':
 *   delete:
 *     tags:
 *       - Delete Methods firmware-monitoring
 *     summary: Delete a vulnerability by CVE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cve
 *         in: path
 *         description: The CVE of the vulnerability
 *         required: true
 *     responses:
 *       201:
 *         description: Deleted Successfully
 *       404:
 *         description: Vulnerability not found
 *       500:
 *         description: Server Error
 */
app.delete('/firmware-monitoring/vulnerability/:cve', verifyToken, verifyToken, async function(req, res){
    try{
        let result = await Vulnerability.deleteOne({cve: req.params.cve});

        if(result.deleteCount === 0){
            res.status(404).send("Vulnerability not found");
        }else{
            res.status(201).send("Successfully deleted!");
        }
    }catch(error){
        console.error("Serverfehler:", error);
        let errorObj = {body: req.body, errorMessage: "Server error!"};
        res.status(500).send(errorObj);
    }
});

/**
 * @openapi
 * '/firmware-monitoring/device/:ip/vulnerabilities':
 *   delete:
 *     tags:
 *       - Delete Methods firmware-monitoring
 *     summary: Delete the vulnerabilities of a device
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: ip
 *         in: path
 *         description: The IP of the device
 *         required: true
 *     responses:
 *       200:
 *         description: Deleted Successfully
 *       404:
 *         description: Device not found
 *       500:
 *         description: Server Error
 */
app.delete('/firmware-monitoring/device/:ip/vulnerabilities', verifyToken, async function(req, res){
    try{
        const {ip} = req.params;
        const device = await Device.findOneAndUpdate(
            {ip: ip},
            {$set: {vulnerabilities: []}},
            {new: true}
        );

        if(!device){
            return res.status(404).send("Device not found");
        }

        res.status(200).send("Vulnerabilities cleared")
    }
    catch(error){
        console.error("Serverfehler:", error);
        let errorObj = {body: req.body, errorMessage: "Server error!"};
        res.status(500).send(errorObj);
    }
});
};