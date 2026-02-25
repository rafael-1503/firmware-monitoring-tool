const { urlencoded } = require('body-parser');
let mongoose = require('mongoose');

let deviceSchema = new mongoose.Schema({
    hostname: {type:String, required: true},
    ip: {type: String, required: true, unique: true},
    vendor: {type: String, default:"Cisco"},
    model:{type: String},
    firmware:{
        os: {type: String},
        version:{type: String},
        lastChecked:{type: Date}
    },
    lastSeen: {type: Date},
    notes:{type: String},
    vulnerabilities:[{
        advisoryId: {type: String},
        title: {type: String},
        severity: {type: String},
        cvssScore: {type: String},
        url: {type: String},
        cves: {type: [String]},
        firstFixed: {type: [String]},
        version: {type: String},
        firstPublished: {type: Date},
        lastUpdated: {type: Date}
    }]
}, {timestamps: true});

const deviceModel = mongoose.model('Device', deviceSchema);

module.exports = deviceModel;