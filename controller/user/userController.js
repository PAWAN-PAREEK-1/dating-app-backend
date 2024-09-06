import User from '../../models/user.js';
import Preferences from '../../models/prefrences.js';
import Profile from '../../models/profile.js';

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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const skip = (page - 1) * limit;

    try {
        // Fetch the user's preferences
        const userPreferences = await Preferences.findOne({ user: requestingUserId });

        if (!userPreferences || Object.keys(userPreferences).length === 0) {
            // No preferences, return all users except the requesting user
            const allUsers = await User.find({ _id: { $ne: requestingUserId } })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'profile',
                    select: 'bio country'
                });

            const totalUsers = await User.countDocuments({ _id: { $ne: requestingUserId } });

            const usersWithDetails = allUsers.map(user => ({
                username: user.username,
                bio: user.profile?.bio || 'No bio provided',
                age: calculateAge(user.dateOfBirth),
                country: user.profile?.country || 'No country provided'
            }));

            return res.status(200).json({
                message: 'No preferences found. Returning all users.',
                users: usersWithDetails,
                pagination: {
                    totalUsers,
                    totalPages: Math.ceil(totalUsers / limit),
                    currentPage: page,
                    pageSize: limit
                }
            });
        }

        const { genderPrefrences, minAge, maxAge } = userPreferences;

        const currentYear = new Date().getFullYear();
        const minBirthDate = new Date(currentYear - maxAge, 0, 1);
        const maxBirthDate = new Date(currentYear - minAge, 11, 31);

        // Phase 1: Fetch users who match both gender and age preferences
        let preferredUsers = await User.find({
            _id: { $ne: requestingUserId },
            gender: { $in: genderPrefrences },
            dateOfBirth: { $gte: minBirthDate, $lte: maxBirthDate }
        })
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'profile',
            select: 'bio country'
        });

        // Phase 2: Fetch users who match either gender or age preferences but not both
        let nonPreferredUsers = await User.find({
            _id: { $ne: requestingUserId },
            $or: [
                {
                    gender: { $in: genderPrefrences },
                    dateOfBirth: { $lt: minBirthDate } // Gender matches but age does not
                },
                {
                    dateOfBirth: { $gte: minBirthDate, $lte: maxBirthDate },
                    gender: { $nin: genderPrefrences } // Age matches but gender does not
                }
            ]
        })
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'profile',
            select: 'bio country'
        });

        // Phase 3: Fetch all remaining users who do not match any preferences
        let allUsers = await User.find({
            _id: { $ne: requestingUserId },
            $and: [
                { gender: { $nin: genderPrefrences } },
                { dateOfBirth: { $lt: minBirthDate } } // Neither gender nor age match
            ]
        })
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'profile',
            select: 'bio country'
        });

        // Combine results ensuring preferred users are first, followed by non-preferred users, and then all other users
        let combinedUsers = [...preferredUsers, ...nonPreferredUsers, ...allUsers];

        // Remove duplicate users based on user ID
        const userIds = new Set();
        combinedUsers = combinedUsers.filter(user => {
            if (userIds.has(user._id.toString())) return false;
            userIds.add(user._id.toString());
            return true;
        });

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


        // Format the user data with age and profile details
        const usersWithDetails = combinedUsers.map(user => ({
            username: user.username,
            bio: user.profile?.bio || 'No bio provided',
            age: calculateAge(user.dateOfBirth),
            country: user.profile?.country || 'No country provided'
        }));

        // Pagination details
        const totalUsers = combinedUsers.length;

        res.status(200).json({
            message: 'Users retrieved successfully.',
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
        res.status(500).json({ message: 'Error retrieving users by preferences' });
    }
};








