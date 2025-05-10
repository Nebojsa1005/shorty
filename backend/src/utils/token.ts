import jwt from "jsonwebtoken";

export const createTokenFromEmailAndId = (email: string,) => {
  return jwt.sign(
    {
      email: email,
    },
    `${process.env.JWT_SECRET_KEY}`,
  );
};