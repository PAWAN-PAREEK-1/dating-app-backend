import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({

    bio:{type: string, require:true},
    profilePicture:{type: string},
    location:{
        city:{type: string, require:true},
        country:{type: string, require:true}
    },
    user:{type:mongoose.Schema.Types.ObjectId, ref:'User',required:true}


});

const Profile = mongoose.model('Profile',profileSchema);

export default Profile;


