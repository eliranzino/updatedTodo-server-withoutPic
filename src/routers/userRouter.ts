import { SECRET } from "./secret";
import express from "express";
import jwt from "jsonwebtoken";
import {  checkUserExists, register, login } from '../userQueries';
import { userSchema } from '../schemas/userSchema';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { userName, password } = req.body;
    console.log({ userName, password })
    const { error } = userSchema.validate({ userName, password });
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }
    if (await checkUserExists(userName)) {
        res.status(400).send('User already exists');
        return;
    }
    const userId = await register(userName, password);
    const token = generateToken(userId);

    res.send({ success: true, msg: 'welcome!', token });
});

router.post('/login', async (req, res) => {
    const { userName, password } = req.body;

    const { error } = userSchema.validate({ userName, password });
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    const userNameId = await login(userName, password);
    if(!userNameId){
        return res.status(401).send("username or password don't match");
    }
    const token = generateToken(userNameId);
    res.send({ success: true, msg: 'welcome back!', token });
});

function generateToken(userId: number| null) {
    return jwt.sign({ id: userId }, SECRET);
}

export { router as users };