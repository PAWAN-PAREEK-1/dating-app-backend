import User from "../../models/user.js";
import Preferences from "../../models/prefrences.js";
import Profile from "../../models/profile.js";

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth || isNaN(new Date(dateOfBirth).getTime())) {
    return null;
  }

  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
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
    const users = await User.find(
      { _id: { $ne: requestingUserId } },
      "username bio dateOfBirth country"
    )
      .populate("profile")
      .skip(skip)
      .limit(limit);

    const calculateAge = (dateOfBirth) => {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    };

    // console.log("this is bio "+user.profile?.bio)

    const usersWithDetails = users.map((user) => ({
      username: user.username,
      bio: user.profile?.bio || "no data",
      age: calculateAge(user.dateOfBirth),
      country: user.profile?.country,
    }));

    const totalUsers = await User.countDocuments({
      _id: { $ne: requestingUserId },
    });

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users: usersWithDetails,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error retrieving users" });
  }
};

export const getUsersByPreferences = async (req, res) => {
  const requestingUserId = req.user.id;
  const removeDuplicates = (array, key) => {
    return [...new Map(array.map((item) => [item[key], item])).values()];
  };

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  try {
    const requestingUserPreferences = await Preferences.findOne({
      user: requestingUserId,
    });
    if (!requestingUserPreferences) {
      return res
        .status(404)
        .json({ message: "Preferences not found for this user" });
    }

    const { genderPrefrences, minAge, maxAge } = requestingUserPreferences;

    const minDOB = calculateAgeFromDOB(maxAge);
    const maxDOB = calculateAgeFromDOB(minAge);

    const preferredUsers = await User.where("gender")
      .equals(genderPrefrences)
      .where("dateOfBirth")
      .gte(minDOB)
      .lte(maxDOB)
      .where("_id")
      .ne(requestingUserId)
      .populate("profile")
      .skip(skip)
      .limit(limit)
      .exec();

    const preferredUserIds = preferredUsers.map((user) => user._id);

    const otherUsers = await User.where("_id")
      .nin(preferredUserIds)
      .where("_id")
      .ne(requestingUserId)
      .populate("profile")
      .skip(skip)
      .limit(limit)
      .exec();

    const results = removeDuplicates(
      [
        ...preferredUsers.map((user) => ({
          username: user.username,
          bio: user.profile?.bio || "No bio provided",
          age: calculateAge(user.dateOfBirth),
          country: user.profile?.country || "No country provided",
          gender: user.gender,
          match: true,
        })),
        ...otherUsers.map((user) => ({
          username: user.username,
          bio: user.profile?.bio || "No bio provided",
          age: calculateAge(user.dateOfBirth),
          country: user.profile?.country || "No country provided",
          gender: user.gender,
          match: false,
        })),
      ],
      "username"
    );

    res.status(200).json({
      page,
      limit,
      totalResults: results.length,
      results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving users" });
  }
};

export const searchUser = async (req, res) => {
  const { query } = req.query;

  try {
    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Query parameter is required." });
    }

    let searchConditions = {};
    if (/^\d+$/.test(query)) {
      const normalizedMobile = query.replace(/\D/g, "");
      searchConditions.mobile = normalizedMobile;
    } else {
      searchConditions.username = query;
    }

    const users = await User.find(searchConditions);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error searching for users." });
  }
};
