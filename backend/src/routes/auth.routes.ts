import * as dotenv from "dotenv";
import { Express } from "express";
import { UserModel } from "../models/user.model";
import { ServerResponse } from "../utils/server-response";
import { getUserByEmail } from "../services/auth.service";
import { compare, hash } from "bcrypt";
import { createTokenFromEmailAndId } from "../utils/token";
import passport from "passport";
import { SubscriptionModel } from "../models/subscription.model";

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

      ServerResponse.serverSuccess(res, 200, "Successfully Registered", {
        token: createTokenFromEmailAndId(createdUser.email, createdUser._id),
        user: createdUser,
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

    return ServerResponse.serverSuccess(res, 200, "Successfully Signed In", {
      token: createTokenFromEmailAndId(user.email, user._id),
      user,
    });
  });

  app.get(
    "/api/auth/google",
    passport.authenticate("google", {
      scope: ["email", "profile"],
    })
  );

  // app.get(
  //   "/api/auth/google/callback",
  //   passport.authenticate("google", {
  //     failureRedirect: "/api/auth/google/failure",
  //     successRedirect: "http://localhost:4200/auth/login",
  //     session: true
  //   }),
  // );

  app.get("/api/auth/google/callback", (req: any, res, next) => {
    passport.authenticate(
      "google",
      { failureRedirect: "/api/auth/google/failure", session: true },
      (err, user, info) => {
        if (err || !user) {
          return res.redirect("/api/auth/google/failure");
        }

        // Manually establish session
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }

          return res.redirect("http://localhost:4200/auth/login");
        });
      }
    )(req, res, next);
  });

  app.get("/api/auth/google/failure", (_req, res) => {
    return ServerResponse.serverError(res, 401, "Failed to Authenticate");
  });

  app.get("/api/auth/logout", (req: any, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect("http://localhost:4200/");
    });
  });

  app.get("/api/auth/google-login", async (req: any, res: any) => {
    if (!req.isAuthenticated() || !req.user) {
      return ServerResponse.serverError(res, 401, "Not Authenticated");
    }

    const existingUser = await UserModel.findOne({
      email: req.user.email,
    });

    let userToSend = null;

    if (existingUser) {
      userToSend = existingUser;
    } else {
      const newUser = await UserModel.create({
        ...req.user,
      });

      userToSend = newUser;
    }

    return ServerResponse.serverSuccess(
      res,
      200,
      "Login Successful",
      userToSend
    );
  });
};

export default authRoutes;
