let mongoose = require('mongoose');

let managementSchema = new mongoose.Schema({
    id: {type: Number},
    mgmtNet: [{type: String}],
    snmpUser: {type: String},
    snmpAuthKey: {type: String},
    snmpPrivKey: {type: String},
    ciscoApiId: {type: String},
    ciscoApiSecret: {type: String},
    teamsWebhook: {type: String},
    description: {type: String}
}, {timestamps: true});

const managementModel = mongoose.model('Management', managementSchema);

module.exports = managementModel;