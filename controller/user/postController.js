import Post from "../../models/posts.js"
import User from "../../models/user.js"



const getMediaType = (filename) => {
    const extension = filename.split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return 'image';
    } else if (['mp4', 'mov', 'wmv'].includes(extension)) {
      return 'video';
    }
    return 'unknown';
  };


export const createPost = async (req, res, next) => {


    const {description} = req.body
    const userId =req.user.id



    try {


        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No media files uploaded" });
          }

        const media = req.files.map(file => ({
            url: file.path,
            type: getMediaType(file.originalname)
          }));


          const post = new Post({
            user:userId,
            description,
            media: media
          })

          await post.save()

          res.status(200).json({success:true, message:"Post created successfully"})




    } catch (error) {
        console.log(error.message)
        res.status(404).json({success:false, message:"cannot create post"})
    }




};

export const deletePost = async (req, res) => {

    const postid = req.params.id
    const userId = req.user.id

    try {

        if(!postid) {
            res.status(404).json({message:"Post not found"})
        }

        const checkPost = await Post.findById(postid).where(userId).equals(user)

        if(!checkPost){
            res.status(404).json({message:"you cannot delete this post "})
        }

        await Post.deleteOne(postid)



        res.status(200).json({ success: true, message: "Post deleted successfully" });



    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: "Cannot delete post" });
    }
};

export const getPost = async (req, res) => {
    const userId = req.params.id;
    const requestingUserId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {

      const checkBlock = await User.findOne({
        _id: userId,
        blockedUsers: requestingUserId,
      });

      if (checkBlock) {
        return res.status(400).json({
          success: false,
          message: "You are blocked, you cannot view this user's posts",
        });
      }

      const skip = (page - 1) * limit;


      const posts = await Post.find({ user: userId })
        .skip(skip)
        .limit(limit)
        .exec();


      const postsWithCounts = await Promise.all(posts.map(async post => {
        const likeCount = post.likes.length;
        const commentCount = post.comments.length;
        return {
          _id: post._id,
          description: post.description,
          media: post.media,
          createdAt: post.createdAt,
          likeCount,
          commentCount,
        };
      }));

      if (!postsWithCounts || postsWithCounts.length === 0) {
        return res.status(404).json({ success: false, message: "No posts found" });
      }

      const totalPosts = await Post.countDocuments({ user: userId });
      const totalPages = Math.ceil(totalPosts / limit);

      res.status(200).json({
        success: true,
        message: "Posts fetched successfully",
        posts: postsWithCounts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
        },
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: "Cannot get posts" });
    }
  };



export const getMyPosts = async (req, res) => {
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
      const skip = (page - 1) * limit;


      const posts = await Post.find({ user: userId })
        .skip(skip)
        .limit(limit)
        .exec();

      if (!posts || posts.length === 0) {
        return res.status(404).json({ success: false, message: "No posts found" });
      }


      const postsWithCounts = await Promise.all(posts.map(async post => {
        const likeCount = post.likes.length;
        const commentCount = post.comments.length;
        return {
          _id: post._id,
          description: post.description,
          media: post.media,
          createdAt: post.createdAt,
          likeCount,
          commentCount,
        };
      }));

      const totalPosts = await Post.countDocuments({ user: userId });
      const totalPages = Math.ceil(totalPosts / limit);

      res.status(200).json({
        success: true,
        message: "Posts fetched successfully",
        posts: postsWithCounts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
        },
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: "Cannot get posts" });
    }
  };



export const likesPost = async(req, res, next) => {

    const userId = req.user.id;
    const postId = req.params.id;


    try {
        const post = await Post.findById(postId);

        if (!post) {
          return res.status(404).json({ success: false, message: 'Post not found' });
        }


        const isLiked = post.likes.includes(userId);

        if (isLiked) {

          post.likes = post.likes.filter(like => like.toString() !== userId);
          await post.save();
          return res.status(200).json({ success: true, message: 'Post unliked successfully' });
        } else {

          post.likes.push(userId);
          await post.save();
          return res.status(200).json({ success: true, message: 'Post liked successfully' });
        }

      } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server error' });
      }

};

export const addComment = async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    const { text } = req.body;

    try {
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      const newComment = {
        user: userId,
        text: text,
        timestamp: Date.now(),
      };


      post.comments.push(newComment);
      await post.save();

      res.status(200).json({ success: true, message: 'Comment added successfully', comments: post.comments });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };


  export const deleteComment = async (req, res) => {
    const postId = req.params.id;
    const commentId = req.query.commentId;
    const userId = req.user.id;

    try {

      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }


      const comment = post.comments.id(commentId);

      if (!comment) {
        return res.status(404).json({ success: false, message: 'Comment not found' });
      }


      console.log('Comment ID:', comment._id);

      if (comment.user.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'You can only delete your own comments' });
      }


      post.comments = post.comments.filter(c => c._id.toString() !== commentId);
      await post.save();

      res.status(200).json({ success: true, message: 'Comment deleted successfully'});
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };


  export const getComments = async (req, res) => {
    const postId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {

      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }


      const totalComments = post.comments.length;


      const skip = (page - 1) * limit;


      const paginatedComments = post.comments
        .slice(skip, skip + limit)
        .sort((a, b) => b.timestamp - a.timestamp);


      if (!paginatedComments || paginatedComments.length === 0) {
        return res.status(404).json({ success: false, message: 'No comments found for this post' });
      }

      res.status(200).json({
        success: true,
        comments: paginatedComments,
        page,
        limit,
        totalComments,
        totalPages: Math.ceil(totalComments / limit),
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };


  export const getRandomPosts = async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
      const skip = (page - 1) * limit;


      const posts = await Post.aggregate([
        { $match: { user: { $ne: userId } } },
        { $sample: { size: skip + limit } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            description: 1,
            media: 1,
            createdAt: 1,
            likeCount: { $size: "$likes" },
            commentCount: { $size: "$comments" },
          }
        }
      ]);

      const totalPosts = await Post.countDocuments({ user: { $ne: userId } });
      const totalPages = Math.ceil(totalPosts / limit);

      res.status(200).json({
        success: true,
        message: "Posts fetched successfully",
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
        },
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, message: "Cannot get posts" });
    }
  };





