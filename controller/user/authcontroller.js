import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../../models/user.js"; // Adjust the path to your User model
import jwt from 'jsonwebtoken';


export const registerUser = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, gender, dateOfBirth ,name ,mobile} = req.body;

  try {

    // const findUser = await User.findOne({email})
    // if(findUser){
    //     return res.status(200).json({message: "user already registered"})
    // }


    const salt= await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    console.log("user api authenticated")
    const user = new User({
        name:name,
        mobile:mobile,
        username:username,
        email:email,
        password:hashedPassword,
        gender:gender,
        dateOfBirth:dateOfBirth

    })


    await user.save()

    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
    const {email, password} = req.body;
    console.log(email, password);

    try {

        const user= await User.findOne({email});

        if (!user){
            return res.status(404).json({ message:"invalid access"});
        }

        const checkPassword = await bcrypt.compare(password,user.password)
        if(!checkPassword){
            return res.status(404).json({ message:"invalid access"});
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '111h' }  // Token expires in 1 hour
        );

        res.status(200).json({
            message: 'Login successful',
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}


   