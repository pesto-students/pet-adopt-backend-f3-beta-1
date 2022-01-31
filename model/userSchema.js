const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  profileimage: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  register_date: {
    type: Date,
    default: Date.now,
  },
  cpassword: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  likes: [
    {
      petId: {
        type: String,
        required: true,
      },
    },
  ],
  myrequests: [
    {
      petId: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.cpassword = await bcrypt.hash(this.cpassword, 12);
  }
  next();
});

userSchema.methods.generateAuthToken = async function(){
  try{
      let token = jwt.sign({_id:this._id},process.env.SECRET_KEY);
      this.tokens = this.tokens.concat({token:token});
      await this.save();
      console.log("Token generated")
      return token;
  }
  catch(err){
      console.log(err);
  }
}

// genrerating auth token
userSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;

  } catch (error) {
    console.log(error);
  }
};

const User = mongoose.model("USER", userSchema);

module.exports = User;
