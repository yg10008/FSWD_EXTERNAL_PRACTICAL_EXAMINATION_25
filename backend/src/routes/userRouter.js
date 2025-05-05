const express = require("express");
const {validateSignUpData} = require("../utils/validation");
const {User} = require("../model/userSchema");
const bcrypt = require("bcrypt");

const userRouter = express.Router();

authRouter.post("/signup",async (req,res) => {  

    try{
        validateSignUpData(req);
 
        const {name,email,password,role} = req.body;

        const passwordHash = await bcrypt.hash(password,10);
        console.log(passwordHash);

        const user1 = new User({
            name,
            password:passwordHash,  
            email,
            role
        });

        await user1.save();
        res.send("AN INSTANCE OF User MODEL AKA user1 WERE ADD");
    }
    catch(err){
        res.status(400).send("ERROR_OCCURED_IN_STORING : "+ err.message);
    }
});
 
authRouter.post("/login",async (req,res) => {

    try{
        const {email ,password} = req.body;
        const user = await User.findOne({emailId : email});
        if(!user){
            throw new Error("INVALID_CREDENTIALS");
        }
        
        const issPasswordValid = await user.getPasswordAuthentication(password);
        
        if(issPasswordValid){
            const token = await user.getJWT();
            res.cookie("token",token,{
                expires: new Date(Date.now() +  8*3600000)
            });
            res.send("USER_LOGIN_SUCCESSFULLY_DONE");
        }
        else{
            throw new Error("INVALID_CREDENTIALS");
        }   
    }catch(err){
        res.status(411).send("ERROR_OCCURED_IN_LOGIN : "+ err.message)
    }
});

authRouter.post("/logout",async (req,res) => {
    const user = req.body;
    res.cookie("token",null,{
        expires:new Date(Date.now())
    })

    res.send(" LOGGED OUT SUCCESSFULLY");
});


module.exports={
    userRouter
};