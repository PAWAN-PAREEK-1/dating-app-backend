import User from "../../models/user.js"
import Prefrences from "../../models/prefrences.js"


export const createOrUpdatePreferences = async (req, res) => {
    const userId = req.user.id; // Getting the user ID from auth middleware
    const { genderPreferences, minAge, maxAge, interests } = req.body;

    try {
        // Validate user ID
        if (!userId) {
            return res.status(400).json({ message: "User ID is missing" });
        }

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user already has preferences
        let userPreferences = await Prefrences.findOne({ user: userId });

        if (userPreferences) {
            // If preferences exist, update them
            userPreferences.genderPrefrences = genderPreferences || userPreferences.genderPrefrences;
            userPreferences.minAge = minAge || userPreferences.minAge;
            userPreferences.maxAge = maxAge || userPreferences.maxAge;
            userPreferences.interests = interests || userPreferences.interests;

            await userPreferences.save(); // Save the updated preferences

            res.status(200).json({
                message: 'Preferences updated successfully',
                preferences: userPreferences
            });
        } else {
            // If preferences don't exist, create new preferences
            userPreferences = new Prefrences({
                genderPreferences,
                minAge,
                maxAge,
                interests,
                user: user._id
            });

            await userPreferences.save(); // Save the new preferences

            // Assign preferences to the user
            user.prefrences = userPreferences._id;
            await user.save();

            res.status(201).json({
                message: 'Preferences created successfully',
                preferences: userPreferences
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating or updating preferences', error: error.message });
    }
};

