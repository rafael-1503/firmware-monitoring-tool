const argon2 = require("argon2");
const { default: mongoose } = require("mongoose");
const pepper = process.env.pepper ||"";

async function hashPassword(password) {
    return argon2.hash(password + pepper, {
        type: argon2.argon2id,
        timeCost: 3,
        memoryCost: 19456,
        parallelism: 1
    });
}

async function verifyPassword(password, hash){
    return argon2.verify(hash, password + pepper);
}

module.exports = {hashPassword, verifyPassword};