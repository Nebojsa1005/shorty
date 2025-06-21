import { UserDocument, UserModel } from "../models/user.model";

export const updateUserShortLinks = async (userId: string, urlId: string) => {
  const user = await UserModel.findById(userId);

  await UserModel.findByIdAndUpdate(userId, {
    shortLinks: [...user.shortLinks, urlId],
  });
};

export const populateUserSubscription = async (user: UserDocument) => {
  return user.populate("subscription");
};
