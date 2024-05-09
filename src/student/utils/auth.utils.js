require('dotenv').config();
const pool = require('../../../db');
const queris = require('../quries/authQuries');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let refreshTokens = [];

const HashPassword = async (password)=>{
    try{
        const hash = await bcrypt.hash(password, 10);
        // console.log(hash);
        return hash;
    }
    catch (error){
        console.log(error);
        return null;
    }
}

const GenerateAccessToken = (object)=>{
    try{
        const secret = process.env.ACCESS_TOKEN_SECRET;
        const token = jwt.sign({object}, secret, {expiresIn: '1d'});
        return token;
    }
    catch (error){
        console.log(error);
        return null;
    }
}



module.exports = {
    HashPassword,
    GenerateAccessToken,
}