"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: false,
    },
    password: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    shortLinks: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Url", required: true }]
});
exports.UserModel = (0, mongoose_1.model)('User', UserSchema);
