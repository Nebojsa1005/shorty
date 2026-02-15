import { compare, hash } from "bcrypt";
import * as dotenv from "dotenv";
import { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import { UrlModel } from "../models/url.model";
import { UserModel } from "../models/user.model";
import {
  analyticsShortLinkCreated,
  analyticsShortLinkReset,
  analyticsShortLinkVisited,
} from "../services/analytics.service";
import { expirationDateCheck } from "../services/url.service";
import { creteShortLinkCheck, updateUserShortLinks } from "../services/user.service";
import { SecurityOptions } from "../types/security-options.enum";
import { ServerResponse } from "../utils/server-response";

dotenv.config();

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.FRONT_END_ORIGIN
    : process.env.CLIENT_ORIGIN;

const urlRoutes = (app: Express) => {
  app.get("/api/url/get-all-urls/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      const allUserUrls = (
        await UserModel.findById(userId).populate({
          path: "shortLinks",
          populate: {
            path: "analytics",
          },
        })
      ).shortLinks;

      if (!allUserUrls) {
        return ServerResponse.serverError(res, 404, "No minified urls found");
      }

      return ServerResponse.serverSuccess(res, 200, "Success", allUserUrls);
    } catch (error) {
      return ServerResponse.serverError(res, 500, error.message, error);
    }
  });

  app.get("/api/url/get-by-id/:id", async (req, res) => {
    const { id } = req.params;

    try {
      const record = await UrlModel.findById(id);

      if (!record) {
        return ServerResponse.serverError(res, 404, "Minified URL not found");
      }

      return ServerResponse.serverSuccess(
        res,
        200,
        "Successfully Fetched",
        record
      );
    } catch (error) {
      return ServerResponse.serverError(res, 500, error.message, error);
    }
  });

  app.get(
    "/api/url/get-by-short-link-id/:shortLinkId",
    async (req: Request, res: Response) => {
      const { shortLinkId } = req.params;
      const { suffix } = req.query;
      let link = `${BASE_URL}`;

      if (suffix) link = `${link}/${suffix}`;

      try {
        let record: any = await UrlModel.findOne({
          shortLinkId,
        }).populate("analytics");

        if (!record) {
          return ServerResponse.serverError(res, 404, "Minified URL not found");
        }

        if (record.security !== SecurityOptions.PASSWORD) {
          await analyticsShortLinkVisited(record.shortLink, req);
        }

        if (!expirationDateCheck) {
          record = {
            _id: record._id,
            destinationUrl: "",
            shortLink: record.shortLink,
            shortLinkId: record.shortLinkId,
            urlName: record.urlName,
            suffix: record.suffix,
            password: record.password,
            security: record.security,
            expirationDate: record.expirationDate,
            analytics: record.analytics,
            user: record.user,
            createdAt: record.createdAt,
            __v: record.__v,
          };
        }

        ServerResponse.serverSuccess(res, 200, "Successfully fetched", record);
      } catch (error) {
        return ServerResponse.serverError(res, 500, error.message, error);
      }
    }
  );

  app.post(
    "/api/url/create",
    async (req: Request, res: Response): Promise<any> => {
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

        const shortLink = `${BASE_URL}${
          suffix ? "/" + suffix : ""
        }/${shortLinkId}`;

        let password = "";

        if (security === SecurityOptions.PASSWORD) {
          password = await hash(formData.password, 10);
        }

        try {

          const check = await creteShortLinkCheck(res, userId);
          if (check !== true) {
            return;
          }

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
            shortLinkId,
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

  app.put("/api/url/edit/:id", async (req, res) => {
    const { urlForm, resetAnalytics } = req.body;
    const id = req.params["id"];

    try {
      let password = ''

      if (urlForm.security === SecurityOptions.PASSWORD) {
        password = await hash(urlForm.password, 10);
      }

      const updatedUrlLink = await UrlModel.findByIdAndUpdate(
        id,
        {
          ...urlForm,
          password
        },
        {
          new: true,
        }
      );

      if (resetAnalytics && updatedUrlLink) {
        await analyticsShortLinkReset(updatedUrlLink.shortLink);
      }

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

  app.post("/api/url/delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
      const deletedUrl = await UrlModel.findOneAndDelete({ _id: id });

      if (deletedUrl) {
        await UserModel.findByIdAndUpdate(deletedUrl.user, {
          $pull: { shortLinks: id },
        });
      }

      return ServerResponse.serverSuccess(
        res,
        200,
        "Successfully Deleted Minified Url"
      );
    } catch (error) {
      return ServerResponse.serverError(res, 404, error.message, error);
    }
  });

  app.get("/api/url/password-check/:password/:id", async (req, res) => {
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

      const verifiedPassword: boolean | null = await compare(
        password,
        shortLink.password
      );

      if (verifiedPassword) {
        await analyticsShortLinkVisited(shortLink.shortLink, req);
        return ServerResponse.serverSuccess(res, 200, "Password Correct");
      } else {
        return ServerResponse.serverError(res, 400, "Password Incorrect");
      }
    } catch (error) {
      return ServerResponse.serverError(res, 404, error.message, error);
    }
  });
};

export default urlRoutes;
