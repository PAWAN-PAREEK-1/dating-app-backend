import mongoose from "mongoose";

const prefrencesSchema = new mongoose.Schema({
    genderPrefrences:{
        typeof: String,
        required: true,
        enum: ['male', 'female',"transgender"]
    },

    minAge:{
        type:Number,
        default:[18,'age must be at least 18']
    },
    maxAge:{
        type:Number,
    },
    interests:{
            type:String,
            enum: [
                'Music',
                'Movies & TV Shows',
                'Travel',
                'Fitness & Health',
                'Art',
                'Sports',
                'Books & Literature',
                'Cooking & Food',
                'Technology & Gadgets',
                'Photography',
                'Fashion & Style',
                'Video Games',
                'Nature & Outdoors',
                'Fitness & Yoga',
                'Meditation & Mindfulness',
                'Volunteering & Social Causes',
                'Pets & Animals',
                'Cars & Motorcycles',
                'Dancing',
                'Crafts & DIY Projects'
            ]
    },

    user:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    }
});

const Prefrences = mongoose.model('Prefrences',prefrencesSchema)

export default Prefrences;