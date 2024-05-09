require('dotenv').config();
const pool = require('../../../db');
const queries = require('../quries/authQuries');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authUtils = require('../utils/auth.utils')

let refreshTokens = [];


const SignUp = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({
            "message": "One or more fields are missing!",
            "required_fields": ["username", "password", "role"]
        });
    }

    try {
        const usernameExists = await pool.query(queries.CheckUsernameExists, [username]);
        if (usernameExists.rows.length) {
            return res.status(409).send("Username already exists!");
        }

        const hashedPassword = await authUtils.HashPassword(password);

        const newUser = await pool.query(queries.CreateUser, [username, hashedPassword, role]);

        return res.status(201).json({
            "message": "User Created Successfully!",
            "user": newUser.rows
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
}



const Login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            "message": "One or more fields are missing!",
            "required_fields": ["username", "password"]
        });
    }

    try {
        const user = await pool.query(queries.CheckUsernameExists, [username]);
        if (!user.rows.length) {
            return res.status(401).json({ "message": "Authentication failed: User not found" });
        }

        const hashedPassword = user.rows[0].hashed_password.trim();

        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (isMatch) {
            const obj = user.rows[0];
            const token = await authUtils.GenerateAccessToken(obj);
            const refreshToken = jwt.sign({ obj }, process.env.REFRESH_TOKEN_SECRET);
            refreshTokens.push(refreshToken);
            return res.json({ "message": "Login Successful!", "accessToken": token, "refreshToken": refreshToken });
        } else {
            return res.status(401).json({ "message": "Authentication failed: Incorrect password" });
        }
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ "error": "Internal server error" });
    }
}


const GetToken = (req, res) => {
    const refreshToken = req.body.token;

    if (!refreshToken) {
        return res.sendStatus(401); 
    }

    if (!refreshTokens.includes(refreshToken)) {
        return res.sendStatus(403); 
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); 
        }

        const accessToken = GenerateAccessToken(user);
        return res.json({ token: accessToken });
    });
}



module.exports = {
    SignUp,
    Login,
    GetToken,
}