import jwt from "jsonwebtoken";

export const createTokenFromEmailAndId = (email: string, id: string) => {
  return jwt.sign(
    {
      email,
      id,
    },
    `${process.env.JWT_SECRET_KEY}`
  );
};
