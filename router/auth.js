const express = require('express');
const router = express.Router();

require('../db/conn.js');
const User = require('../model/userSchema');

router.get('/',(req,res)=>{
    res.send('<h1>Hello from Router</h1>')
});

router.get('/aboutus', (req,res) => {
    res.send('<h1>Hello from about!!!</h1>')
});

router.get('/contact', (req,res) => {
    res.send('<h1>Hello contact!!!</h1>')
});

// router.post('/signup', (req,res)=>{
//     const {name, email, phone, work, password, cpassword} = req.body;
//     if(!name || !email || !phone || !work || !password || !cpassword){
//         res.status(422).json({error:"Plz fill the required field"});
//     }
//     User.findOne({email: email})
//         .then((useExist)=>{
//             if(useExist){
//                 return res.status(422).json({error:"Email already exists"});
//             }
//             const user = new User({name, email, phone, work, password, cpassword});

//             user.save()
//                 .then(() => {
//                     res.status(201).json({message:"User registered successfully!!!"});
//                 })
//                 .catch((err)=>res.status(500).json({error:"Failed to register"}));
//         })
//         .catch((err)=>{console.log(err)});
//     // console.log(name);
//     // console.log(email);
//     // res.json({message:req.body});
//     // res.send(message:req.body);
// });
 
router.post('/signup', async (req,res)=>{
    const {name, email, phone, work, password, cpassword} = req.body;
    if(!name || !email || !phone || !work || !password || !cpassword){
        res.status(422).json({error:"Plz fill the required field"});
    }
    try {
        const userExist = await User.findOne({email:email});
        if(userExist){
            return res.status(422).json({error:"User already exist"});
        }
        else if(password!=cpassword){
            return res.status(422).json({error:"password not matching"});
        }
        else{
            const user = new User({name, email, phone, work, password, cpassword});

            await user.save();
            res.status(201).json({message:"User registered successfully!!!"});    
        }
        
    } catch (error) {
        console.log(error);
    }
});

router.post('/signin', async (req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        res.status(422).json({error:"Plz fill the required field"});
    }
    try {
        const userlogin = await User.findOne({email:email});
        if(userlogin){
            const isMatch = password===userlogin.password;
            if(isMatch){
                return res.status(200).json({message:"User logged in successfully"});
            }
            else {
                return res.status(400).json({message:"Invalid Credentials"});
            }
        }
        else{
            return res.status(400).json({error:"Invalid Credentials"})
        }

    } catch (error) {
        res.send(error);
    }
});

module.exports = router;