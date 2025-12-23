import { UserDocument, UserModel } from "../models/user.model";
import { isUserSubscribed } from "../utils/productLimitations/is-user-subscribed";
import { checkMaxLinks } from "../utils/productLimitations/max-links";
import { ServerResponse } from "../utils/server-response";
import { Response } from "express";


export const updateUserShortLinks = async (userId: string, urlId: string) => {
  const user = await UserModel.findById(userId);

  await UserModel.findByIdAndUpdate(userId, {
    shortLinks: [...user.shortLinks, urlId],
  });
};

export const populateUserSubscription = async (userId: string) => {
  const user = await UserModel.findById(userId);

  return user.populate("subscription");
};

export const creteShortLinkCheck = async (res: Response, userId: string) => {
  const user = await populateUserSubscription(userId);
  const isSubscribed = await isUserSubscribed(user.subscription.subscriptionId);
  const maxLinksReached = await checkMaxLinks(userId);

  console.log(maxLinksReached);
  
  if (!isSubscribed) {
    return ServerResponse.serverError(
      res,
      403,
      "You need to be subscribed to create more short links."
    );
  }

  if (maxLinksReached) {
    return ServerResponse.serverError(
      res,
      403,
      "You have reached the maximum number of short links allowed for your subscription."
    );
  }

  return true
};
