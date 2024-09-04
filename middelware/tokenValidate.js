
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET

export const authmiddleware = async (req, res, next) =>{

    const token = req.header('Authorization');

    if (!token) {
        return res.status(404).json({message: "please login again"});

    }

    try {
        const decode = jwt.verify(token, JWT_SECRET)
        req.user = decode;
        next()
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }



}