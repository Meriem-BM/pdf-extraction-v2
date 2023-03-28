require('dotenv').config()
var express = require('express');

const userRouter = require("./routes/users")

var app = express();
app.use(express.json({limit: '5mb'}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', userRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000.");
});

module.exports = app;
