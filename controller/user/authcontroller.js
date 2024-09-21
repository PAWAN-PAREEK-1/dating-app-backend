import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../../models/user.js"; // Adjust the path to your User model
import jwt from "jsonwebtoken";
import {
  genrateVerificationToken,
  sendForgotPasswordEmail,
  sendVerficationEmail,
} from "./verificationController.js";

export const registerUser = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, gender, dateOfBirth, name, mobile } =
    req.body;

  try {
    // const findUser = await User.findOne({email})
    // if(findUser){
    //     return res.status(200).json({message: "user already registered"})
    // }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("user api authenticated");
    const user = new User({
      name: name,
      mobile: mobile,
      username: username,
      email: email,
      password: hashedPassword,
      gender: gender,
      dateOfBirth: dateOfBirth,
    });

    await user.save();

    const verificationToken = genrateVerificationToken(user.id, user.email);

    sendVerficationEmail(user, verificationToken);

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "invalid access" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(404).json({ message: "invalid access" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "111h" } // Token expires in 1 hour
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const checkUser = await User.findById(userId);

    if (!checkUser || !currentPassword || !newPassword) {
      return res
        .status(404)
        .json({
          success: false,
          message: "issue to find the user or may be some fields are missing",
        });
    }

    if (currentPassword === newPassword) {
      return res
        .status(200)
        .json({
          success: false,
          message: "password cannot be same with old password",
        });
    }

    const compare = await bcrypt.compare(currentPassword, checkUser.password);

    if (!compare) {
      return res
        .status(404)
        .json({ success: false, message: "password mismatch" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    checkUser.password = hashedPassword;

    await checkUser.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "issue in reseting password" });
  }
};

export const forgotPassword = async (req, res) => {

    const {email }= req.body;

    try {


        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({ success:false , message: "you are nor registered"});
        }



    const verificationToken = genrateVerificationToken(user.id, user.email);

    sendForgotPasswordEmail(user, verificationToken);


    res.status(200).json({ success:true, message: "reset link send successfully" });



    } catch (error) {
        console.log(error);
        res.status(404).json({ success:true, message: "issue to send reset link" });
    }
};

export const createNewPassword = async (req,res)=>{

    const {token , newPassword} = req.body;
    try {

        const secret = process.env.JWT_SECRET;

        const decode = jwt.verify(token,secret)

        const {email}= decode;

        console.log(email)

        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({success:false , message :"User not registerd"})
        }

        const salt = await bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(newPassword,salt)

        user.password = hashedPassword

        await user.save()

        res.status(200).json({success:true, message:"passord changes succefully please login "})



    } catch (error) {
        console.log(error)
        res.status(400).json({success:true, message:"Error in changing password"})
    }
}
