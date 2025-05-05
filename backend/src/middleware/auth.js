const jwt = require("jsonwebtoken");
const {User} = require("../model/userSchema");

const userAuth = async (req,res,next)=>{
    
    try{
        const {token} = req.cookies;

    if(!token){
        throw new Error("CAN'T_GET_THE_TOKEN");
    }
    const decodedMSG = await jwt.verify(token,"DEV@eventMANGEMENT$123");

    const {_id} = decodedMSG;   
    
    const user = await User.findById(_id);

    if(!user){
        throw new Error("USER_NOT_FOUND");
    } 

    req.user = user;
    next();
    }
    catch(err){
        res.status(455).send("ERROR : "+err.message);
    }
};

module.exports= {userAuth};

  

