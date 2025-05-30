import { NextFunction, Request, Response } from "express";

const jwt = require("jsonwebtoken");

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
	try {
	  const token = req.headers.authorization;
	  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
	  req.body.userData = {
		email: decodedToken.email,
		userId: decodedToken.userId,
	  };
	  next();
	} catch (error) {
	  res.status(401).json({ message: "You are not authenticated!" });
	}
  };

  export const authMiddleware = {
	verifyToken,
  };
  