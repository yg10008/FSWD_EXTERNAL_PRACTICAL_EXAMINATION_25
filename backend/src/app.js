const express = require("express");
const { connectDB } = require("./config/db");
const cookieParser = require("cookie-parser");

const {events} = require("./routes/eventRouter");
const {userRouter} = require("./routes/userRouter");



const app = express();
app.use(express.json());
app.use(cookieParser());


app.use("/", userRouter);
app.use("/", events);


connectDB()
    .then(() => {
        console.log("CONNECTION_TO_DATABASE_IS_SUCCESSFULLY_ESTABLISHED");
        app.listen(108, () => {
            console.log("SERVER_UP_108");
        });
    })
    .catch((err) => {
        console.error("ERROR_OCCURED_IN_DATABASE_CONNECTION : " + err);
    });
