import { sign } from "jsonwebtoken";

export const createTokenFromEmailAndId = (email: string, id: string) => {
  return sign(
    {
      email,
      id,
    },
    `${process.env.JWT_SECRET_KEY}`
  );
};
