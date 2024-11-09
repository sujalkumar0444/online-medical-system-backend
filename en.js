import CryptoJS from "crypto-js";
import dotenv from 'dotenv';
dotenv.config();

// function encryptJson(jsonObject) {
//     const jsonString = JSON.stringify(jsonObject);
//     const encrypted = CryptoJS.AES.encrypt(jsonString, process.env.FIREBASE_SECRET_KEY);
//     // const res = encrypted.toString(CryptoJS.enc.Utf8)
//     console.log(encrypted.toString());
// }
// encryptJson(jsonObject);

const encryptedContent = process.env.SECRET_TEXT;
const bytes = CryptoJS.AES.decrypt(encryptedContent, process.env.FIREBASE_SECRET_KEY);
const decrypted = bytes.toString(CryptoJS.enc.Utf8);
console.log(decrypted);