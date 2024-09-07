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
  const {status,id:friendRequestId} = req.query;

  try {
    if (!["pending", "requested", "accepted"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const changeStatus = await FriendRequest.findOneAndUpdate(
      { _id: friendRequestId, recipient: userId },
      { $set: { status } }
    );

    if (changeStatus.nModified === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Friend request not found or not authorized to update",
        });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Friend request status updated successfully",
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating friend request status",
      });
  }
};
