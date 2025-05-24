import { UserModel } from "../models/user.model";
export const getUserByEmail = async (email) => {
    return await UserModel.findOne({ email });
};
