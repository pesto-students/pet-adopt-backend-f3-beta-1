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

// router.get("/contact", (req, res) => {
//   res.send("<h1>Hello contact!!!</h1>");
// });

// router.get("/", (req, res) => {
//   res.send("<h1>Hi from backend</h1>");
// });


router.post("/signup", async (req, res) => {
  const { name, email, phone, location, password, cpassword } = req.body;
  console.log(req.body);
  if (!name || !email || !phone || !location || !password || !cpassword) {
    res.status(422).json({ error: "Plz fill the required field" });
  }
  try {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res.status(422).json({ error: "User already exist" });
    } else if (password != cpassword) {
      return res.status(422).json({ error: "password not matching" });
    } else {
      const user = new User({ name, email, phone, location, password, cpassword });
      await user.save();
      res.status(201).json({ message: "User registered successfully!!!" });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/signin", async (req, res) => {
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
        return res.status(200).send(userlogin);
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
  try {
    const readStream = getFileStream(key)
    readStream.pipe(res)    
  } catch (error) {
    console.log(error);
  }
});

router.post('/images', upload.single('image'), async (req, res) => {
  const file = req.file
  const {petId} = req.body;
  console.log(petId, "image upload");
  const pet = await Pet.findOne({_id: petId});
  console.log(pet);
  if(pet){
    const result = await uploadFile(file)
    console.log(result);
    pet.petimages = pet.petimages.concat({ image: result.Key });
    await pet.save();  
    console.log(pet);
    console.log("image saved");
    res.send(result)
  }
  await unlinkFile(file.path)
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
    const data = await pet.save();
    res.json({ message: "Pet added successfully!!!",data: data });  
    res.sendStatus(201)
  } catch (error) {
    console.log(error);
  }
});

router.get("/fetchpet", authenticate ,async (req, res) => {
  console.log(req.userID,"Pet details called");
  const petDetails = await Pet.find({userId: req.userID})
  if(petDetails){
    res.status(200).send(petDetails);
  }
  else{
    res.send(400);
  }
});

router.get("/fetchallpet", async (req, res) => {
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
  const user = await User.findOne({_id: userId})
  if(petDetails && user){
    petDetails.requests = petDetails.requests.concat({ userId: userId, requestStatus: false });
    await petDetails.save();
    user.myrequests = user.myrequests.concat({petId: _id});
    await user.save();
    res.sendStatus(200);
  }
  else{
    res.sendStatus(400);
  }
});

router.post("/sendrespond", authenticate ,async (req, res) => {
  const { _id,userId } = req.body;
  const petDetails = await Pet.findOne({_id : _id})
  if(petDetails){
    const index = petDetails.requests.findIndex(item => item.userId === userId );
    petDetails.requests[index] = { userId: userId, requestStatus: true }
    await petDetails.save();
    res.send(petDetails);
    res.sendStatus(200);
  }
  else{
    res.sendStatus(400);
  }
});

router.get("/petindetail/:petid", authenticate ,async (req, res) => {
  const petid = req.params.petid
  const petDetails = await Pet.findOne({_id: petid})
  if(petDetails){
    res.send(petDetails).sendStatus(200);
  }
  else{
    res.sendStatus(400);
  }
});

router.post("/petindetails", authenticate ,async (req, res) => {
  const {petId,userId} = req.body;
  console.log(petId,userId,"petdetails called");
  const petDetails = await Pet.findOne({_id: petId})
  if(petDetails){
    // res.send(petDetails);
    const userIndex = petDetails.requests.findIndex(item => item.userId === userId)
    console.log(petDetails.requests[userIndex].requestStatus);
    if(petDetails.requests[userIndex].requestStatus){
      const user = await User.findOne({_id:petDetails.userId})
      console.log(user);
      if(user){
        res.send({petDetails,user,status:true});
      }
    }
    res.send({petDetails,status:false});
    res.sendStatus(200);
  }
  else{
    res.sendStatus(400);
  }
});

router.get("/category/:category", authenticate ,async (req, res) => {
  const category = req.params.category;
  const petDetails = await Pet.find({ petcategory: category })
  if(petDetails){
    res.status(200).send(petDetails);
  }
  else{
    res.send(400);
  }
});

router.post("/like", authenticate ,async (req, res) => {
  const { _id,userId } = req.body;
  const user = await User.findOne({_id : userId})
  const petDetails = await Pet.findOne({_id : _id})
  if(user && petDetails){
    user.likes = user.likes.concat({ petId: _id});
    await user.save();    
    petDetails.likes = petDetails.likes.concat({ userId: userId});
    await petDetails.save();
    res.send(petDetails);
    res.sendStatus(200);
  }
  else{
    res.sendStatus(400);
  }
});

router.post("/unlike", authenticate ,async (req, res) => {
  const { _id,userId } = req.body;
  const user = await User.findOne({_id : userId})
  const petDetails = await Pet.findOne({_id : _id})
  if(user && petDetails){
    // user.likes = user.likes.concat({ petId: _id});
    user.likes = user.likes.filter((item) => item.petid !== _id);
    await user.save();    
    petDetails.likes = petDetails.likes.filter((item) => item.userId !== userId);
    await petDetails.save();
    res.send(petDetails);
    res.sendStatus(200);
  }
  else{
    res.sendStatus(400);
  }
});

router.get("/username/:userId", authenticate ,async (req, res) => {
  const id = req.params.userId
  const user = await User.find({_id: id})
  if(user){
    res.send(user).sendStatus(200);
  }
});


module.exports = router;
