import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({

    bio:{type: String, require:true},
    profilePicture:{type: String},
        city:{type: String, require:true},
        country:{type: String, require:true}
    ,
    user:{type:mongoose.Schema.Types.ObjectId, ref:'User',required:true}


});

const Profile = mongoose.model('Profile',profileSchema);

export default Profile;


