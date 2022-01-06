const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken;
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
    const rootUser = await User.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });
    if (rootUser) {
      req.token = token;
      req.rootUser = rootUser;
      req.userID = rootUser._id;
      next();
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(401).send("Unauthorized: token not provided");
    console.log(error);
  }
};

module.exports = authenticate;
