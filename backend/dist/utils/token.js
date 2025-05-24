import * as jwt from "jsonwebtoken";
export const createTokenFromEmailAndId = (email, id) => {
    return jwt.sign({
        email,
        id,
    }, `${process.env.JWT_SECRET_KEY}`);
};
