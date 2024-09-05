import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    profile:{type:mongoose.Schema.Types.ObjectId, ref:'profile'},
    prefrences:{type:mongoose.Schema.Types.ObjectId, ref:'prefrences'},
});

const User = mongoose.model('User', UserSchema);

export default User;
