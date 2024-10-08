import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true ,unique: true},
    name: { type: String, required: true },
    mobile: { type: Number,unique: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    profile:{type:mongoose.Schema.Types.ObjectId, ref:'Profile', default:null},
    prefrences:{type:mongoose.Schema.Types.ObjectId, ref:'Prefrences'},
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isEmailVerified: { type: Boolean, default: false },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});

const User = mongoose.model('User', UserSchema);

export default User;
