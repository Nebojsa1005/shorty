import { UserModel } from "../models/user.model";
export const updateUserShortLinks = async (userId, urlId) => {
    const user = await UserModel.findById(userId);
    await UserModel.findByIdAndUpdate(userId, {
        shortLinks: [...user.shortLinks, urlId],
    });
};
