const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')

const authenticate = require('../middleware/Authenticate')
const router = express.Router();

require("../db/conn.js");
const User = require("../model/userSchema");
const Pet = require("../model/petSchema");

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const { uploadFile, getFileStream } = require('../images/s3')

const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)


router.get("/dashboard", authenticate , (req, res) => {
  // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  // res.setHeader('Access-Control-Allow-Credentials',true);
  res.send(req.rootUser);
});

router.get("/contact", (req, res) => {
  res.send("<h1>Hello contact!!!</h1>");
});

router.get("/", (req, res) => {
  res.send("<h1>Hi from backend</h1>");
});


router.post("/signup", async (req, res) => {
  const { name, email, phone, work, password, cpassword } = req.body;
  console.log(req.body);
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
      const isMatch = await bcrypt.compare(password, userlogin.password);
      const token = await userlogin.generateAuthToken();
      if (isMatch) {
        const token = await userlogin.generateAuthToken();
        res.cookie("jwtoken",token,{
          expires:new Date(Date.now() +25892000000),
          httpOnly: true,
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
  const {userId} = req.body;  
  res.clearCookie('jwtoken',{path: '/'})
  res.status(200).send('User Logout Done.');
});

router.get('/images/:key', (req, res) => {
  const key = req.params.key
  const readStream = getFileStream(key)

  readStream.pipe(res)
});

router.post('/images', upload.single('image'), async (req, res) => {
  const file = req.file
  const result = await uploadFile(file)
  await unlinkFile(file.path)
  res.send(result)
});



router.post("/createpet", async (req, res) => {
  const {userId, about,adoptionFee,age,gender,petimage,petcategory,petname,selectedPet,size,adoptedBy} = req.body;
  if (!about || !adoptionFee || !age || !gender || !petcategory || !petname || !selectedPet || !size || !adoptedBy) {
    res.sendStatus(422).json({ error: "Plz fill the required field" });
  }
  try {
    const pet = new Pet({userId,about,adoptionFee,age,gender,petcategory,petname,selectedPet,size,adoptedBy });
    console.log(petimage)
    await petimage.map(image=>{pet.petimages = pet.petimages.concat({ image: image })});
    await pet.save();
    res.sendStatus(201)
    res.json({ message: "Pet added successfully!!!" });  
  } catch (error) {
    console.log(error);
  }
});

router.get("/fetchpet", authenticate ,async (req, res) => {
  console.log(req.userID,"Pet details called");
  const petDetails = await Pet.find({userId: req.userID})
  console.log(petDetails);
  if(petDetails){
    res.status(200).send(petDetails);
  }
  else{
    res.send(400);
  }
});

router.get("/fetchallpet", authenticate ,async (req, res) => {
  const petDetails = await Pet.find()
  if(petDetails){
    res.status(200).send(petDetails);
  }
  else{
    res.send(400);
  }
});

router.post("/sendrequest", authenticate ,async (req, res) => {
  const { _id,userId } = req.body;
  const petDetails = await Pet.findOne({_id : _id})
  if(petDetails){
    petDetails.requests = petDetails.requests.concat({ userId: userId, requestStatus: false });
    await petDetails.save();
    res.sendStatus(200).send(petDetails);
  }
  else{
    res.sendStatus(400);
  }
});

router.get("/petindetail", authenticate ,async (req, res) => {
  console.log(req.id,"petindetail called");
  const petDetails = await Pet.findOne({_id: req.id})
  console.log(petDetails);
  if(petDetails){
    res.sendStatus(200).send(petDetails);
  }
  else{
    res.send(400);
  }
});

module.exports = router;
