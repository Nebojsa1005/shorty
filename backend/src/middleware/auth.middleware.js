"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.body.userData = {
            email: decodedToken.email,
            userId: decodedToken.userId,
        };
        next();
    }
    catch (error) {
        res.status(401).json({ message: "You are not authenticated!" });
    }
};
exports.authMiddleware = {
    verifyToken,
};
