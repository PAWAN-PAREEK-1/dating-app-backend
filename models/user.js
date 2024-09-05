import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true ,unique: true},
    name: { type: String, required: true },
    mobile: { type: Number, required: true,unique: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    profile:{type:mongoose.Schema.Types.ObjectId, ref:'Profile', default:null},
    prefrences:{type:mongoose.Schema.Types.ObjectId, ref:'Prefrences'},
});

const User = mongoose.model('User', UserSchema);

export default User;
