import Profile from "../../models/profile.js"

import User from "../../models/user.js"
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: 'da7glh2k5',
    api_key:'195472444966869',
    api_secret: 'XV0WH3RCZTzTKIdaMPZcRe5ySj8',
    secure: true,
  });


  export const createOrUpdateProfile = async (req, res) => {
    const userId = req.user.id;
    const { bio, city, country } = req.body;
    const profilePictures = req.files;


    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let profilePicturesUrls = [];
      if (profilePictures && profilePictures.length > 0) {

        profilePicturesUrls = profilePictures.map(picture => picture.path);
      }


      let profile = await Profile.findOne({ user: userId });

      if (profile) {

        profile.bio = bio || profile.bio;
        profile.profilePictures = profilePicturesUrls.length > 0 ? profilePicturesUrls : profile.profilePictures;
        profile.city = city || profile.city;
        profile.country = country || profile.country;

        await profile.save();

        res.status(200).json({
          message: 'Profile updated successfully',
          profile: profile
        });
      } else {

        profile = new Profile({
          bio,
          profilePictures: profilePicturesUrls,
          city,
          country,
          user: user._id
        });

        await profile.save();

        user.profile = profile._id;
        await user.save();

        res.status(201).json({
          success: true,
          message: 'Profile created successfully',
          profile: profile
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error in creating or updating profile' });
    }
  };





export const getFullProfile = async (req, res) => {
    const userId = req.user.id;

    try {

        const userData = await User.findById(userId)
            .select('-password')
            .populate('profile')
            .populate('prefrences')
            .exec();

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, userData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error in getting user data' });
    }
};

