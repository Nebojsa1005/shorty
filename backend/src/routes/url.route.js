"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const nanoid_1 = require("nanoid");
const url_model_1 = require("../models/url.model");
const server_response_1 = require("../utils/server-response");
const analytics_service_1 = require("../services/analytics.service");
const user_model_1 = require("../models/user.model");
const user_service_1 = require("../services/user.service");
const security_options_enum_1 = require("../types/security-options.enum");
const bcrypt_1 = require("bcrypt");
dotenv_1.default.config();
const BASE_URL = process.env.FRONT_END_ORIGIN;
const urlRoutes = (app) => {
    app.get("/api/url/get-all-urls/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            const allUserUrls = (yield user_model_1.UserModel.findById(userId).populate("shortLinks")).shortLinks;
            if (!allUserUrls) {
                return server_response_1.ServerResponse.serverError(res, 404, "No minified urls found");
            }
            return server_response_1.ServerResponse.serverSuccess(res, 200, "Success", allUserUrls);
        }
        catch (error) {
            return server_response_1.ServerResponse.serverError(res, 500, error.message, error);
        }
    }));
    app.get('/api/url/get-by-id/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const record = yield url_model_1.UrlModel.findById(id);
            if (!record) {
                return server_response_1.ServerResponse.serverError(res, 404, "Minified URL not found");
            }
            return server_response_1.ServerResponse.serverSuccess(res, 200, "Successfully Fetched", record);
        }
        catch (error) {
            return server_response_1.ServerResponse.serverError(res, 500, error.message, error);
        }
    }));
    app.get("/api/url/get-by-short-link-id/:shortLinkId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { shortLinkId } = req.params;
        const { suffix } = req.query;
        let link = `${BASE_URL}`;
        if (suffix)
            link = `${link}/${suffix}`;
        const shortLink = `${link}/${shortLinkId}`;
        try {
            const record = yield url_model_1.UrlModel.findOne({
                shortLink,
            }).populate("analytics");
            if (!record) {
                return server_response_1.ServerResponse.serverError(res, 404, "Minified URL not found");
            }
            yield (0, analytics_service_1.analyticsShortLinkVisited)(shortLink);
            server_response_1.ServerResponse.serverSuccess(res, 200, "Successfully fetched", record);
        }
        catch (error) {
            return server_response_1.ServerResponse.serverError(res, 500, error.message, error);
        }
    }));
    app.post("/api/url/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { formData, userId } = req.body;
            if (!formData.destinationUrl) {
                return server_response_1.ServerResponse.serverError(res, 404, "Destination URL not found");
            }
            const suffix = formData.suffix;
            const security = formData.security;
            const expirationDate = formData.expirationDate;
            const shortLinkId = (0, nanoid_1.nanoid)(10);
            const shortLink = `${BASE_URL}${suffix ? "/" + suffix : ""}/${shortLinkId}`;
            let password = "";
            if (security === security_options_enum_1.SecurityOptions.PASSWORD) {
                password = yield (0, bcrypt_1.hash)(formData.password, 10);
            }
            try {
                const analytics = yield (0, analytics_service_1.analyticsShortLinkCreated)(shortLink);
                const url = yield url_model_1.UrlModel.create({
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
                yield (0, user_service_1.updateUserShortLinks)(userId, url._id);
                return server_response_1.ServerResponse.serverSuccess(res, 200, "Successfully minified URL", url);
            }
            catch (error) {
                return server_response_1.ServerResponse.serverError(res, 500, error.message, error);
            }
        }
        catch (error) {
            return server_response_1.ServerResponse.serverError(res, 500, error.message, error);
        }
    }));
    app.put("/api/url/edit/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { urlForm } = req.body;
        const id = req.params["id"];
        try {
            const updatedUrlLink = yield url_model_1.UrlModel.findByIdAndUpdate(id, Object.assign({}, urlForm), {
                new: true,
            });
            return server_response_1.ServerResponse.serverSuccess(res, 200, "Successfully Updated Minified Link", updatedUrlLink);
        }
        catch (error) {
            return server_response_1.ServerResponse.serverError(res, 404, error.message, error);
        }
    }));
    app.post("/api/url/delete/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const deletedUrl = yield url_model_1.UrlModel.findOneAndDelete({ _id: id });
            return server_response_1.ServerResponse.serverSuccess(res, 200, "Successfully Deleted Minified Url");
        }
        catch (error) {
            return server_response_1.ServerResponse.serverError(res, 404, error.message, error);
        }
    }));
    app.get("/api/url/password-check/:password/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { password, id } = req.params;
        try {
            const shortLink = yield url_model_1.UrlModel.findOne({ _id: id });
            if (!shortLink) {
                return server_response_1.ServerResponse.serverError(res, 404, "No Link With This Url Found");
            }
            console.log(shortLink);
            const verifiedPassword = yield (0, bcrypt_1.compare)(password, shortLink.password);
            if (verifiedPassword) {
                return server_response_1.ServerResponse.serverSuccess(res, 200, "Password Correct");
            }
            else {
                return server_response_1.ServerResponse.serverError(res, 400, "Password Incorrect");
            }
        }
        catch (error) {
            return server_response_1.ServerResponse.serverError(res, 404, error.message, error);
        }
    }));
};
exports.default = urlRoutes;
