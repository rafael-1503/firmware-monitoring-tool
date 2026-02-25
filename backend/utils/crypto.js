import CryptoJS from "crypto-js";
import dotenv from "dotenv";
dotenv.config();

const secretKey = process.env.encrKey;

export function encryptValue(value){
    return CryptoJS.AES.encrypt(value, secretKey).toString()
}

export function decryptValue(value){
    try{
        const decr = CryptoJS.AES.decrypt(value, secretKey);
        return decr.toString(CryptoJS.enc.Utf8);
    }catch(error){
        console.error("Decryption error: ", error);
        return null;
    }
}
