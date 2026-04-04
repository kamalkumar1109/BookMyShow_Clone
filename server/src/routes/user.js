const express = require("express");
const Users = require("../models/Users");
const { BadRequestError, NotFoundError } = require("../core/ApiError");
const bcrypt = require("bcrypt");
const ApiResponse = require("../core/ApiResponse");
const jwt = require("jsonwebtoken");
const { isLoggedIn } = require("../middlewares/user");
const { jwtSecret: JWT_SECRET } = require("../config/env");
const crypto = require('crypto');
const MailgunClient = require("../lib/MailgunClient");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;
  const user = await Users.findOne({ email });
  if (user) {
    throw new BadRequestError("User with this email already registered");
  }
  const hash = await bcrypt.hash(password, 12);
  const newUser = new Users({ email, password: hash, role });
  await newUser.save();
  res.json(
    ApiResponse.build(
      true,
      { email: newUser.email, role: newUser.role },
      "User created successfully",
    ),
  );
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await Users.findOne({ email });
  if (!user) {
    throw new BadRequestError("Username/Password is incorrect");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new BadRequestError("Username/Password is incorrect");
  }
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: 3 * 24 * 60 * 60,
  });
  res.json(ApiResponse.build(true, { token }, "Logged in successfully"));
});

router.get("/secret", isLoggedIn, (req, res) => {
  const { userId } = req;
  res.send("SOME SECRET ONLY ACCESSIBLE AFTER LOGIN");
});

router.get("/profile", isLoggedIn, async (req, res) => {
  const { userId } = req;
  const user = await Users.findById(userId);
  res.json(
    ApiResponse.build(
      true,
      { email: user.email, role: user.role },
      "User Profile",
    ),
  );
});

router.post('/forgot-password', async (req,res)=>{
  const { email } = req.body;
  const user = await Users.findOne({email});
  if(!user){
    throw new BadRequestError('Invalid Email');
  }

  const token = crypto.randomBytes(8).toString('hex');

  user.resetPasswordToken = token;
  user.resetPasswordExpiry = new Date().getTime()+10*60*1000;
  await user.save();

  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const emailText =  `Please click on the link below to reset the password ${url}.`;
  await MailgunClient.sendEmail(user.email, 'Reset Password', emailText);

  res.json(ApiResponse.build(true, 'reset password link sent', 'reset password link sent'));
});

router.post('/reset-password', async(req,res)=>{
  const { password, token } = req.body;
  const user = await Users.findOne({ resetPasswordToken: token});

  if(!user) {
    throw new NotFoundError('User not found');
  }

  if(user.resetPasswordExpiry< new Date().getTime()){
    throw new BadRequestError('Token has expired');
  }

  const newHash = await bcrypt.hash(password, 12);

  user.password = newHash;
  user.resetPasswordToken = null;
  user.resetPasswordExpiry = null;

  await user.save();
  res.json(ApiResponse.build(true, 'Password reset successfully', 'Password reset successfully'));

});

module.exports = router;


