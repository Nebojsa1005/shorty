import { UserModel } from "../models/user.model";

export const getUserByEmail = async (email: string) => {
  return await UserModel.findOne({ email });
};
