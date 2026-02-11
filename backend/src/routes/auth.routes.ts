import * as dotenv from "dotenv";
import { Express } from "express";
import { UserModel } from "../models/user.model";
import { ServerResponse } from "../utils/server-response";
import { getUserByEmail } from "../services/auth.service";
import { compare, hash } from "bcrypt";
import { createTokenFromEmailAndId } from "../utils/token";
import passport from "passport";
import { SubscriptionModel } from "../models/subscription.model";
import { populateUserSubscription } from "../services/user.service";

dotenv.config();

const authRoutes = (app: Express) => {
  app.post("/api/auth/sign-up", async (req, res) => {
    try {
      const { userData } = req.body;

      // If email already exists
      const isEmailInUse = await getUserByEmail(userData.email);

      if (isEmailInUse) {
        return ServerResponse.serverError(res, 400, "Email Is Already in Use");
      }

      // Hash candidate password
      const hashedPassword = await hash(userData.password, 10);

      // Crating subscription model
      const subscriptionModel = await new SubscriptionModel().save();

      // Creating instance of Candidate
      const newUser = new UserModel({
        ...userData,
        password: hashedPassword,
        subscription: subscriptionModel._id,
      });

      const createdUser = await newUser.save();
      const populatedUser = await populateUserSubscription(newUser._id);

      ServerResponse.serverSuccess(res, 200, "Successfully Registered", {
        token: createTokenFromEmailAndId(createdUser.email, createdUser._id),
        user: populatedUser,
      });
    } catch (error) {
      return ServerResponse.serverError(
        res,
        500,
        "Something Went Wrong",
        error
      );
    }
  });

  app.post("/api/auth/sign-in", async (req, res) => {
    const { userData } = req.body;

    const user = await getUserByEmail(userData.email);

    if (!user) {
      return ServerResponse.serverError(
        res,
        400,
        "There is No User with Entered Email"
      );
    }

    const verifiedPassword = await compare(
      userData.password,
      user.password as string
    );

    if (!verifiedPassword)
      return ServerResponse.serverError(res, 401, "Invalid Password");

    const populatedUser = await populateUserSubscription(user._id);

    return ServerResponse.serverSuccess(res, 200, "Successfully Signed In", {
      token: createTokenFromEmailAndId(user.email, user._id),
      user: populatedUser,
    });
  });

  app.put("/api/auth/update-personal-info/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { name, email } = req.body;

      await UserModel.findByIdAndUpdate(
        userId,
        { name, email },
        { new: true }
      );

      const populatedUser = await populateUserSubscription(userId);

      return ServerResponse.serverSuccess(
        res,
        200,
        "Personal Info Updated",
        populatedUser
      );
    } catch (err) {
      return ServerResponse.serverError(res, 500, "Something Went Wrong", err);
    }
  });

  app.put("/api/auth/update-password/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { currentPassword, newPassword } = req.body;
      const user = await UserModel.findById(userId);

      const verifiedPassword = await compare(
        currentPassword,
        user.password as string
      );
      if (!verifiedPassword)
        return ServerResponse.serverError(
          res,
          401,
          "Current Password Incorrect"
        );

      const hashedPassword = await hash(newPassword, 10);

      await UserModel.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );

      const populatedUser = await populateUserSubscription(userId);

      return ServerResponse.serverSuccess(
        res,
        200,
        "Password Updated Successfully",
        populatedUser
      );
    } catch (err) {
      return ServerResponse.serverError(res, 500, "Something Went Wrong", err);
    }
  });

  app.get("/api/auth/refresh-user/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;

      const populatedUser = await populateUserSubscription(userId);

      return ServerResponse.serverSuccess(res, 200, "", populatedUser);
    } catch (err) {
      return ServerResponse.serverError(res, 500, "Something Went Wrong", err);
    }
  });

  app.post("/api/auth/google-login", async (req, res) => {
  const { userEmail } = req.body;
    let user = await getUserByEmail(userEmail);

    if (!user) {
     // Crating subscription model
      const subscriptionModel = await new SubscriptionModel().save();

      // Creating instance of Candidate
      const newUser = new UserModel({
        email: userEmail,
        subscription: subscriptionModel._id,
      });

      user = await newUser.save();
      
    }
    const populatedUser = await populateUserSubscription(user._id);

    return ServerResponse.serverSuccess(res, 200, "Successfully Signed In", {
      token: createTokenFromEmailAndId(user.email, user._id),
      user: populatedUser,
    });
  });
};

export default authRoutes;
