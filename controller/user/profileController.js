import Profile from "../../models/profile.js"
// import jwt from "jsonwebtoken"
// import bcrypt from "bcryptjs/bcrypt"
import User from "../../models/user.js"


export const createProfile = async (req, res) => {
    const userId = req.user.id;
    const { bio, profilePicture, city, country } = req.body;
    console.log('User ID:', userId);
    try {
        const user = await User.findById(userId);
        console.log('User ID:', userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const profile = new Profile({
            bio,
            profilePicture,
            city,
            country,
            user: user._id
        });

        await profile.save();

        user.profile = profile._id;
        await user.save();

        res.status(201).json({
            message: 'Profile created successfully',
            profile: profile
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in creating profile' });
    }
};

export const getFullProfile = async (req, res) => {
    const userId = req.user.id;
    console.log(userId)

    try {
        const userData = await User.findById({_id:userId}).populate('profile').populate('prefrences').exec();
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(userData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in getting user data' });
    }
};
