import jwt from 'jsonwebtoken';

export const authMiddleware = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // Check if authorization header exists and starts with 'Bearer'
    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            // Extract the token
            token = authHeader.split(' ')[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user data from token to request object
            req.user = {
                id: decoded.id,
                email: decoded.email, // add more properties if needed
            };

            next(); // pass the request to the next middleware or route handler
        } catch (err) {
            console.error('Token verification failed:', err);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(403).json({ message: 'No token provided, authorization denied' });
    }

    if (!token) {
        res.status(401).json({ message: 'User not authorized, no token' });
    }
};
