import express from 'express';
const app = express();
import User from '../models/user';

app.post("/register", (req: any, res: any) => {
const {username, password, email, createdAt, updatedAt} = req.body;
const user = new User({
    username,
    password,
    email,
    createdAt,
    updatedAt
});
user.save();
});

app.post("/login", (req: any, res: any) => {
const {username, password} = req.body;
// Logic for user authentication
});

export default app;