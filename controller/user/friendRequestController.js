import FriendRequest from "../../models/friendsRequests.js";
import User from "../../models/user.js";
import { friendRequest } from "../../routes/User/friendRequestRouter.js";

export const sendRequest = async (req, res) => {
  const requestUserId = req.user.id;
  const reciverUserId = req.params.id;

  try {
    if (!reciverUserId) {
      return res.status(400).json({ messgage: "Reciver id is required" });
    }

    if (reciverUserId === requestUserId) {
      return res
        .status(400)
        .json({ messgage: "Cannot send a request to yourself" });
    }

    const existingRequest = await FriendRequest.findOne({
      requester: requestUserId,
      recipient: reciverUserId,
    });

    if (existingRequest) {
      return res.status(400).json({ messgage: "request already sended" });
    }

    const newRequest = new FriendRequest({
      requester: requestUserId,
      recipient: reciverUserId,
      status: "pending",
    });

    await newRequest.save();

    res
      .status(201)
      .json({ message: "Friend request sent successfully", data: newRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending friend request" });
  }
};

export const getAllFriendRequest = async (req, res) => {
  const userId = req.user.id;

  try {
    // Find all friend requests where the user is the recipient
    const requests = await FriendRequest.find()
      .where("recipient")
      .equals(userId)
      .populate("requester", "username");

    // Check if there are no requests
    if (requests.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No friend requests found",
        data: [],
      });
    }

    // Extract relevant fields from the requests
    const data = requests.map((request) => ({
      _id: request._id,
      requester: {
        _id: request.requester._id,
        username: request.requester.username,
      },
      status: request.status,
      createdAt: request.createdAt,
    }));

    // Send response
    res.status(200).json({
      success: true,
      message: "Fetched all friend requests",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving friend requests",
    });
  }
};

export const changeRequestStatus = async (req, res) => {
    const userId = req.user.id;
    const { status, id: friendRequestId } = req.query;

    try {
      if (!["pending", "requested", "accepted"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }


      const friendRequest = await FriendRequest.findOne({ _id: friendRequestId, recipient: userId });

      if (!friendRequest) {
        return res.status(404).json({ success: false, message: "Friend request not found or not authorized to update" });
      }


      const updatedRequest = await FriendRequest.findOneAndUpdate(
        { _id: friendRequestId, recipient: userId },
        { $set: { status } },
        { new: true }
      );

      if (status === 'accepted') {
        // Add the recipient to the requester's friends list
        await User.findByIdAndUpdate(friendRequest.requester, {
          $addToSet: { friends: userId }
        });

        // Add the requester to the recipient's friends list
        await User.findByIdAndUpdate(friendRequest.recipient, {
          $addToSet: { friends: friendRequest.requester }
        });
      }

      res.status(200).json({
        success: true,
        message: "Friend request status updated successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error updating friend request status",
      });
    }
  };

  export const getUserFriends = async (req, res) => {
    const userId = req.user.id;

    try {
        // Find all friend requests where the user is either the requester or recipient and the status is "accepted"
        const acceptedFriends = await FriendRequest.find({
            $or: [
                { requester: userId, status: 'accepted' },
                { recipient: userId, status: 'accepted' }
            ]
        })
        .populate('requester', 'username')
        .populate('recipient', 'username');

        // Extract friends from the accepted friend requests
        const friendsList = acceptedFriends.map(friendRequest => {
            // If the current user is the requester, the friend is the recipient and vice versa
            const friend = friendRequest.requester._id.equals(userId) ? friendRequest.recipient : friendRequest.requester;
            return {
                _id: friend._id,
                username: friend.username
            };
        });

        // Send the response with the list of friends
        res.status(200).json({
            success: true,
            message: "All friends fetched successfully",
            friends: friendsList
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching friends",
        });
    }
};



  export const blockOrUnblockUser = async (req, res) => {
    const userId = req.user.id;
    const { id: userToBlockId, status } = req.query;


    if (status !== 'true' && status !== 'false') {
        return res.status(400).json({ success: false, message: "Invalid status value. It should be either 'true' or 'false'." });
    }

    try {
        if (status === 'true') {

            if (userId === userToBlockId) {
                return res.status(400).json({ success: false, message: "You cannot block yourself." });
            }

            const userToBlock = await User.findById(userToBlockId);
            if (!userToBlock) {
                return res.status(404).json({ success: false, message: "User to block not found." });
            }


            await User.findByIdAndUpdate(userId, {
                $addToSet: { blockedUsers: userToBlockId }
            });




            res.status(200).json({ success: true, message: "User blocked successfully." });
        } else {



            if (userId === userToBlockId) {
                return res.status(400).json({ success: false, message: "You cannot unblock yourself." });
            }


            const user = await User.findById(userId);
            if (!user.blockedUsers.includes(userToBlockId)) {
                return res.status(400).json({ success: false, message: "This user is not blocked by you." });
            }

            await User.findByIdAndUpdate(userId, {
                $pull: { blockedUsers: userToBlockId }
            });



            res.status(200).json({ success: true, message: "User unblocked successfully." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error processing request." });
    }
};


export const deleteMesageForFriend = async(req,res) => {

  try {
    const userId  = req.user.id;
    const friendId = req.params.id;
    const {deleteTime} = req.body

    if (!deleteTime && deleteTime !== 0) {
      return res.status(400).json({ message: 'Please provide delete time in hours, or set to 0 to remove the time.' });
    }
    const checkFriend = await User.findOne({
      _id:userId,
      friends:friendId,
    })

    if(!checkFriend) {
      return res.status(404).json({ message: 'Friend not found in your friends list.' });
    }


    const getSetDeleteTime = await FriendRequest.findOneAndUpdate(
      {recipient:friendId,requester:userId},
      {chatDeleteTime: deleteTime === 0 ? null : deleteTime},
      {new:true}


      )

      const message = deleteTime === 0
      ? `Delete time for friend ${friendId} has been removed.`
      : `Delete time set to ${deleteTime} hours for friend ${friendId}.`;

    res.status(200).json({
      success: true,
      message: message,
    });

  } catch (error) {

    console.log(error);

    res.status(404).json({
      sucess:false,
      message:`issue in delete time set for ${friendId}`

    })

  }



}


