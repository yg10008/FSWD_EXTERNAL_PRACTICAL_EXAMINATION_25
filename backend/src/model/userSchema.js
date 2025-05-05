const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'fill a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
  },
  { timestamps: true }
);


userSchema.methods.getJWT = async function(){

    const user = this; 
    const token = await jwt.sign({_id:user._id},"DEV@eventMANGEMENT$123");

    return token;
}

userSchema.methods.getPasswordAuthentication = async function(passwordInputByUserInstance){
    const user = this;
    const passwordHash = user.password;
    const check =  await bcrypt.compare(passwordInputByUserInstance,passwordHash);

    return check;
}



const User =  mongoose.model("User",userSchema);

module.exports = {
    User,
}


