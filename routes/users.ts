var express = require('express');
var app = express();

var User = require("../models/user");

app.post("/register", (req: { body: { username: any; password: any; email: any; createdAt: any; updatedAt: any; } }, res: any) => {
    const {username, password, email, createdAt, updatedAt} = req.body;

    var user = new User({
        username: username,
        password: password,
        email: email,
        createdAt: createdAt,
        updatedAt: updatedAt
    });
    user.save();
});

app.post("/login", (req: { body: { username: any; password: any; } }, res: any) => {
});

module.exports = app;