const mongoose = require("mongoose");

const  siteSettingsSchema = new mongoose.Schema(
    {
        key: {type: String, unique: true, required: true},
        hash: {type: String, required: true},
    },
    {collection: "site_settings"}
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);