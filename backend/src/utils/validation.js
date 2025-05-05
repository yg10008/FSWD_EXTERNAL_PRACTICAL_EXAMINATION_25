const validator = require("validator");
const bcrypt = require("bcrypt");


const validateSignUpData = (req) => {
    const { name , email , password} = req.body;

    if(!name){
        throw new Error("ENTER_VALID_USERNAME");
    }
    else if(!validator.isEmail(email)){
        throw new Error("ENTER_VALID_EMAIL_ID");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("ENTER_STRONG_PASSWORD");
    }
}

const validationProfileEditData = (req) =>{
    const validEditFields = [
        "name",
        "email",
        "role",
        "password",
    ];

    const isValidEditFields = Object.keys(req.body).every(field => validEditFields.includes(field));

    return isValidEditFields;   
}


module.exports = {
    validateSignUpData,
    validationProfileEditData,
}

