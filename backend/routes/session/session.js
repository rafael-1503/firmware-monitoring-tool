const jwt = require('jsonwebtoken');
const SiteSettings = require("../../models/siteSettings");
const {hashPassword, verifyPassword} = require("../../utils/password");

function generateSiteToken(res){
    const token = jwt.sign({}, process.env.tokenSecret, {expiresIn: "1h"});
    res.cookie("token", token, {httpOnly: true, sameSite: "lax", secure: false});
    return token;
}

module.exports = function (app){

    app.post("/firmware-monitoring/login", async(req, res) => {
        try{
            const {password} = req.body || {};
            if(!password) return res.status(400).send("Password required");

            const setting = await SiteSettings.findOne({key: "sitePassword"});
            if(!setting) return res.status(503).send("Site password not configured");

            const ok = await verifyPassword(password, setting.hash);
            if(!ok) return res.status(401).send("Wrong password");

            const token = generateSiteToken(res);
            res.status(200).json({token, expiresIn: 3600});
        }catch(err){
            console.error(err);
            res.status(500).send("Server error");
        }
    });

    app.post('/firmware-monitoring/logout', function(req, res){
        res.clearCookie('token');
        res.status(200).send("logout successful")
    });
}