const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')

const authenticate = require('../middleware/Authenticate')
const router = express.Router();

require("../db/conn.js");
const User = require("../model/userSchema");


router.get("/dashboard", authenticate , (req, res) => {
  res.send(req.rootUser);
});

router.get("/contact", (req, res) => {
  res.send("<h1>Hello contact!!!</h1>");
});


router.post("/signup", async (req, res) => {
  const { name, email, phone, work, password, cpassword } = req.body;
  if (!name || !email || !phone || !work || !password || !cpassword) {
    res.status(422).json({ error: "Plz fill the required field" });
  }
  try {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res.status(422).json({ error: "User already exist" });
    } else if (password != cpassword) {
      return res.status(422).json({ error: "password not matching" });
    } else {
      const user = new User({ name, email, phone, work, password, cpassword });

      await user.save();
      res.status(201).json({ message: "User registered successfully!!!" });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/signin", async (req, res) => {
  console.log('signin called');
  const { email, password } = req.body;
  let token;
  if (!email || !password) {
    res.status(422).json({ error: "Plz fill the required field" });
  }
  try {
    const userlogin = await User.findOne({ email: email });
    if (userlogin) {
      console.log('step1');
      const isMatch = await bcrypt.compare(password, userlogin.password);
      console.log('step2');
      const token = await userlogin.generateAuthToken();
      console.log('step3');
      res.cookie("token", token, {
        expires: new Date(Date.now() + 900000),
        httpOnly: true,
      });
      console.log('step4');
      if (isMatch) {
        const token = await userlogin.generateAuthToken();
        console.log('step5');
        res.cookie("jwtoken",token,{
          expires:new Date(Date.now() +25892000000),
          httpOnly:true,
        });
        return res.status(200).json({ message: "User logged in successfully" });
      } else {
        return res.status(400).json({ message: "Invalid Credentials" });
      }
    } else {
      return res.status(400).json({ error: "Invalid Credentials" });
    }
  } catch (error) {
    res.send(error);
  }
});

//Logout Page
router.get("/logout", (req, res) => {
  console.log('Logout');
  res.clearCookie('jwtoken',{path: '/'})
  res.status(200).send('User Logout Done.');
});

module.exports = router;
