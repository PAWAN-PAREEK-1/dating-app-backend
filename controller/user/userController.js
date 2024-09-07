import User from '../../models/user.js';
import Preferences from '../../models/prefrences.js';
import Profile from '../../models/profile.js';


const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth || isNaN(new Date(dateOfBirth).getTime())) {
        return null; // Return null if the date is invalid
    }

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

const calculateAgeFromDOB = (age) => {
    const today = new Date();
    return new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
};

export const getAllUsers = async (req, res, next) => {
    const requestingUserId = req.user.id;


    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    try {
        const users = await User.find({ _id: { $ne: requestingUserId } }, 'username bio dateOfBirth country')
            .populate('profile')
            .skip(skip)
            .limit(limit);


        const calculateAge = (dateOfBirth) => {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDifference = today.getMonth() - birthDate.getMonth();
            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        };


        // console.log("this is bio "+user.profile?.bio)

        const usersWithDetails = users.map(user => ({
            username: user.username,
            bio: user.profile?.bio || "no data",
            age: calculateAge(user.dateOfBirth),
            country: user.profile?.country


        }));


        const totalUsers = await User.countDocuments({ _id: { $ne: requestingUserId } });

        res.status(200).json({
            success:true,
            message: 'Users retrieved successfully',
            users: usersWithDetails,
            pagination: {
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: page,
                pageSize: limit
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message: 'Error retrieving users' });
    }
};




export const getUsersByPreferences = async (req, res) => {
    const requestingUserId = req.user.id;

    try {
        // 1. Fetch the requesting user's preferences
        const requestingUserPreferences = await Preferences.findOne({ user: requestingUserId });
        if (!requestingUserPreferences) {
            return res.status(404).json({ message: "Preferences not found for this user" });
        }

        const { genderPrefrences, minAge, maxAge } = requestingUserPreferences;

        // 2. Calculate date range based on age preferences
        const maxDateOfBirth = calculateAgeFromDOB(minAge); // Younger limit
        const minDateOfBirth = calculateAgeFromDOB(maxAge); // Older limit

        // 3. Use where clause to find users matching both gender and age range
        const matchingUsers = await User.find()
            .where('gender').equals(genderPrefrences)
            .where('dateOfBirth').gte(minDateOfBirth).lte(maxDateOfBirth)
            .populate('profile')
            .exec();

        if (matchingUsers.length === 0) {
            return res.status(404).json({ message: "No users match the preferences" });
        }

        // 4. Format the results
        const results = matchingUsers.map(user => ({
            username: user.username,
            bio: user.profile?.bio || 'No bio provided',
            age: calculateAge(user.dateOfBirth),
            country: user.profile?.country || 'No country provided',
            gender: user.gender
        }));

        res.status(200).json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving matching users' });
    }
};








