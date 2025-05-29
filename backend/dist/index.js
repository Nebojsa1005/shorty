// src/index.ts
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv3 from "dotenv";
import express from "express";
import mongoose from "mongoose";

// src/routes/url.route.ts
import * as dotenv from "dotenv";
import { nanoid } from "nanoid";

// src/models/url.model.ts
import { Schema as Schema2, model as model2 } from "mongoose";

// src/models/analytics.model.ts
import { Schema, model } from "mongoose";
var AnalyticsSchema = new Schema({
  viewCount: {
    type: Number,
    required: true,
    default: 0
  },
  lastViewedOn: {
    type: Date
  },
  firstViewedOn: {
    type: Date,
    required: true,
    default: /* @__PURE__ */ new Date()
  },
  shortLink: {
    type: String,
    required: true
  }
});
var AnalyticsModel = model("Analytics", AnalyticsSchema);

// src/models/url.model.ts
var UrlSchema = new Schema2({
  destinationUrl: {
    type: String,
    required: true
  },
  shortLink: {
    type: String,
    required: true
  },
  shortLinkId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  urlName: {
    type: String,
    required: true
  },
  suffix: {
    type: String
  },
  password: { type: String },
  security: { type: Number },
  expirationDate: { type: Date },
  analytics: { type: Schema2.Types.ObjectId, ref: "Analytics", required: true },
  user: { type: Schema2.Types.ObjectId, ref: "User", required: true }
});
UrlSchema.post("findOneAndDelete", async function(doc) {
  if (doc && doc.analytics) {
    await AnalyticsModel.deleteOne({ _id: doc.analytics });
  }
});
var UrlModel = model2("Url", UrlSchema);

// src/utils/server-response.ts
var serverError = (res, status, message, error) => {
  res.status(status).send({
    message: message ? message : "Something Went Wrong",
    status,
    data: error
  });
};
var serverSuccess = (res, status, message, data) => {
  res.status(status).send({
    message: message ? message : "Success!",
    status,
    data
  });
};
var ServerResponse = {
  serverError,
  serverSuccess
};

// src/services/analytics.service.ts
var analyticsShortLinkVisited = async (shortLink) => {
  const existingShortLinkData = await AnalyticsModel.findOne({ shortLink });
  if (existingShortLinkData) {
    await AnalyticsModel.findByIdAndUpdate(existingShortLinkData._id, {
      viewCount: existingShortLinkData.viewCount + 1,
      lastEntered: /* @__PURE__ */ new Date()
    });
  } else {
    await AnalyticsModel.create({
      shortLink,
      lastEntered: /* @__PURE__ */ new Date()
    });
  }
};
var analyticsShortLinkCreated = async (shortLink) => {
  return await AnalyticsModel.create({
    shortLink
  });
};

// src/models/user.model.ts
import { Schema as Schema3, model as model3 } from "mongoose";
var UserSchema = new Schema3({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: false
  },
  password: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  shortLinks: [{ type: Schema3.Types.ObjectId, ref: "Url", required: true }]
});
var UserModel = model3("User", UserSchema);

// src/services/user.service.ts
var updateUserShortLinks = async (userId, urlId) => {
  const user = await UserModel.findById(userId);
  await UserModel.findByIdAndUpdate(userId, {
    shortLinks: [...user.shortLinks, urlId]
  });
};

// src/routes/url.route.ts
import { compare, hash } from "bcrypt";
dotenv.config();
var BASE_URL = process.env.FRONT_END_ORIGIN;
var urlRoutes = (app2) => {
  app2.get("/api/url/get-all-urls/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const allUserUrls = (await UserModel.findById(userId).populate("shortLinks")).shortLinks;
      if (!allUserUrls) {
        return ServerResponse.serverError(res, 404, "No minified urls found");
      }
      return ServerResponse.serverSuccess(res, 200, "Success", allUserUrls);
    } catch (error) {
      return ServerResponse.serverError(res, 500, error.message, error);
    }
  });
  app2.get("/api/url/get-by-id/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const record = await UrlModel.findById(id);
      if (!record) {
        return ServerResponse.serverError(res, 404, "Minified URL not found");
      }
      return ServerResponse.serverSuccess(res, 200, "Successfully Fetched", record);
    } catch (error) {
      return ServerResponse.serverError(res, 500, error.message, error);
    }
  });
  app2.get(
    "/api/url/get-by-short-link-id/:shortLinkId",
    async (req, res) => {
      const { shortLinkId } = req.params;
      const { suffix } = req.query;
      let link = `${BASE_URL}`;
      if (suffix) link = `${link}/${suffix}`;
      const shortLink = `${link}/${shortLinkId}`;
      try {
        const record = await UrlModel.findOne({
          shortLink
        }).populate("analytics");
        if (!record) {
          return ServerResponse.serverError(res, 404, "Minified URL not found");
        }
        await analyticsShortLinkVisited(shortLink);
        ServerResponse.serverSuccess(res, 200, "Successfully fetched", record);
      } catch (error) {
        return ServerResponse.serverError(res, 500, error.message, error);
      }
    }
  );
  app2.post(
    "/api/url/create",
    async (req, res) => {
      try {
        const { formData, userId } = req.body;
        if (!formData.destinationUrl) {
          return ServerResponse.serverError(
            res,
            404,
            "Destination URL not found"
          );
        }
        const suffix = formData.suffix;
        const security = formData.security;
        const expirationDate = formData.expirationDate;
        const shortLinkId = nanoid(10);
        const shortLink = `${BASE_URL}${suffix ? "/" + suffix : ""}/${shortLinkId}`;
        let password = "";
        if (security === 1 /* PASSWORD */) {
          password = await hash(formData.password, 10);
        }
        try {
          const analytics = await analyticsShortLinkCreated(shortLink);
          const url = await UrlModel.create({
            destinationUrl: formData.destinationUrl,
            shortLink,
            urlName: formData.urlName,
            suffix,
            password,
            expirationDate,
            security,
            analytics: analytics._id,
            user: userId,
            shortLinkId
          });
          await updateUserShortLinks(userId, url._id);
          return ServerResponse.serverSuccess(
            res,
            200,
            "Successfully minified URL",
            url
          );
        } catch (error) {
          return ServerResponse.serverError(res, 500, error.message, error);
        }
      } catch (error) {
        return ServerResponse.serverError(res, 500, error.message, error);
      }
    }
  );
  app2.put("/api/url/edit/:id", async (req, res) => {
    const { urlForm } = req.body;
    const id = req.params["id"];
    try {
      const updatedUrlLink = await UrlModel.findByIdAndUpdate(
        id,
        {
          ...urlForm
        },
        {
          new: true
        }
      );
      return ServerResponse.serverSuccess(
        res,
        200,
        "Successfully Updated Minified Link",
        updatedUrlLink
      );
    } catch (error) {
      return ServerResponse.serverError(res, 404, error.message, error);
    }
  });
  app2.post("/api/url/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const deletedUrl = await UrlModel.findOneAndDelete({ _id: id });
      return ServerResponse.serverSuccess(
        res,
        200,
        "Successfully Deleted Minified Url"
      );
    } catch (error) {
      return ServerResponse.serverError(res, 404, error.message, error);
    }
  });
  app2.get("/api/url/password-check/:password/:id", async (req, res) => {
    const { password, id } = req.params;
    try {
      const shortLink = await UrlModel.findOne({ _id: id });
      if (!shortLink) {
        return ServerResponse.serverError(
          res,
          404,
          "No Link With This Url Found"
        );
      }
      console.log(shortLink);
      const verifiedPassword = await compare(
        password,
        shortLink.password
      );
      if (verifiedPassword) {
        return ServerResponse.serverSuccess(res, 200, "Password Correct");
      } else {
        return ServerResponse.serverError(res, 400, "Password Incorrect");
      }
    } catch (error) {
      return ServerResponse.serverError(res, 404, error.message, error);
    }
  });
};
var url_route_default = urlRoutes;

// src/routes/auth.routes.ts
import * as dotenv2 from "dotenv";

// src/services/auth.service.ts
var getUserByEmail = async (email) => {
  return await UserModel.findOne({ email });
};

// src/routes/auth.routes.ts
import { compare as compare2, hash as hash2 } from "bcrypt";

// src/utils/token.ts
import * as jwt from "jsonwebtoken";
var createTokenFromEmailAndId = (email, id) => {
  return jwt.sign(
    {
      email,
      id
    },
    `${process.env.JWT_SECRET_KEY}`
  );
};

// src/routes/auth.routes.ts
import passport from "passport";
dotenv2.config();
var authRoutes = (app2) => {
  app2.post("/api/auth/sign-up", async (req, res) => {
    try {
      const { userData } = req.body;
      const isEmailInUse = await getUserByEmail(userData.email);
      if (isEmailInUse) {
        return ServerResponse.serverError(res, 400, "Email Is Already in Use");
      }
      const hashedPassword = await hash2(userData.password, 10);
      const newUser = new UserModel({
        ...userData,
        password: hashedPassword
      });
      const createdUser = await newUser.save();
      ServerResponse.serverSuccess(res, 200, "Successfully Registered", {
        token: createTokenFromEmailAndId(createdUser.email, createdUser._id),
        data: createdUser
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
  app2.post("/api/auth/sign-in", async (req, res) => {
    const { userData } = req.body;
    const user = await getUserByEmail(userData.email);
    if (!user) {
      return ServerResponse.serverError(
        res,
        400,
        "There is No User with Entered Email"
      );
    }
    const verifiedPassword = await compare2(
      userData.password,
      user.password
    );
    if (!verifiedPassword)
      return ServerResponse.serverError(res, 401, "Invalid Password");
    return ServerResponse.serverSuccess(res, 200, "Successfully Signed In", {
      token: createTokenFromEmailAndId(user.email, user._id),
      user
    });
  });
  app2.get(
    "/api/auth/google",
    passport.authenticate("google", {
      scope: ["email", "profile"]
    })
  );
  app2.get("/api/auth/google/callback", (req, res, next) => {
    passport.authenticate(
      "google",
      { failureRedirect: "/api/auth/google/failure", session: true },
      (err, user, info) => {
        if (err || !user) {
          return res.redirect("/api/auth/google/failure");
        }
        req.logIn(user, (err2) => {
          if (err2) {
            return next(err2);
          }
          console.log("\u2705 Logged in user:", req.user);
          console.log("\u2705 Session after login:", req.session);
          return res.redirect("http://localhost:4200/auth/login");
        });
      }
    )(req, res, next);
  });
  app2.get("/api/auth/google/failure", (_req, res) => {
    return ServerResponse.serverError(res, 401, "Failed to Authenticate");
  });
  app2.get("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect("http://localhost:4200/");
    });
  });
  app2.get("/api/auth/google-login", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return ServerResponse.serverError(res, 401, "Not Authenticated");
    }
    const existingUser = await UserModel.findOne({
      email: req.user.email
    });
    let userToSend = null;
    if (existingUser) {
      userToSend = existingUser;
    } else {
      const newUser = await UserModel.create({
        ...req.user
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
var auth_routes_default = authRoutes;

// src/utils/mongoDb-connect.ts
import { MongoClient, ServerApiVersion } from "mongodb";
var uri = "mongodb+srv://lazarevicnebojsa1005:KJGgrrxQDzWL8fLI@cluster0.cou0exr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
var client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});
async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

// src/index.ts
import path from "path";
import MongoStore from "connect-mongo";
import passport2 from "passport";
import session from "express-session";
var app = express();
var env = process.env.NODE_ENV || "development";
var envPath = path.resolve(
  process.cwd(),
  `.env${env === "development" ? "" : "." + env}`
);
dotenv3.config({ path: envPath });
mongoose.connect(`${process.env.MONGO_DB_URL}`);
mongoose.connection.once("open", () => {
  console.log(
    "\x1B[32m[MongoDB]\x1B[0m\x1B[33m Successfully connected to database \x1B[0m"
  );
});
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
var allowedOrigins = [
  "http://localhost:4200",
  // local dev
  "https://minylinks.netlify.app"
  // your frontend prod domain
];
app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB_URL,
      collectionName: "sessions"
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 1e3 * 60 * 60 * 24
    }
  })
);
app.use(passport2.initialize());
app.use(passport2.session());
app.get("/", (req, res) => {
  res.send("cao");
});
app.listen(process.env.PORT || "3000", () => {
  console.log(
    `\x1B[32m[SERVER]\x1B[0m\x1B[33m Server Started On Port \x1B[0m\x1B[32m ${process.env.PORT} \x1B[0m`
  );
});
url_route_default(app);
auth_routes_default(app);
