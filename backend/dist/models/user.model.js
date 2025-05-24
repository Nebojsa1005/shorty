import { Schema, model } from 'mongoose';
const UserSchema = new Schema({
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
    shortLinks: [{ type: Schema.Types.ObjectId, ref: "Url", required: true }]
});
export const UserModel = model('User', UserSchema);
