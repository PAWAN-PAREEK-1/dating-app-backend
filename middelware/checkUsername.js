import User from "../models/user.js";

export const userNameCheck= async(req,res,next)=>{
        const {username}= req.body;
    try {

        const checkUserName = await User.findOne({username:username})
        if(checkUserName){
            return res.status(404).json({message:"user name already exists"})
        }

        next()

    } catch (error) {

        res.status(404).json({message:error})
    }


}

export const userEmailCheck= async(req,res,next)=>{
    const {email}= req.body;
try {

    const checkUserName = await User.findOne({username:username})
    if(checkUserName){
        return res.status(404).json({message:"Email already exists"})
    }

    next()

} catch (error) {

    res.status(404).json({message:error})
}


}

export const userEmailAndMobileCheck = async (req, res, next) => {
    const { email, mobile } = req.body;

    try {
        // Check if email already exists
        const checkEmail = await User.findOne({ email: email });
        if (checkEmail) {
            return res.status(404).json({ message: "Email already exists" });
        }

        // Check if mobile already exists
        const checkMobile = await User.findOne({ mobile: mobile });
        if (checkMobile) {
            return res.status(404).json({ message: "Mobile number already exists" });
        }

        // If both checks pass, proceed to the next middleware or route handler
        next();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


