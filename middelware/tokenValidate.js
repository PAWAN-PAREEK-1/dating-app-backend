
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET

export const authmiddleware = async (req, res, next) =>{

    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(404).json({message:"you  are not authorized to create user"});

            }


            req.user = {
                id: decoded.id,
                email: decoded.email, // if needed, you can add other user properties
            };

            next();
        });

        if (!token) {
            res.status(401);
            throw new Error("user is not authorized");
        }

    }
    else{
        res.status(403).json({message:"token is required"})
    }


}