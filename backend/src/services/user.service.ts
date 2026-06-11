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

export const creteShortLinkCheck = async (res: Response, userId: string): Promise<{ allowed: true; isFreeTrialUser: boolean } | void> => {
  const user = await populateUserSubscription(userId);
  const hasSubscriptionId = user.subscription?.subscriptionId;
  const isSubscribed = hasSubscriptionId ? await isUserSubscribed(user.subscription.subscriptionId) : false;

  if (!isSubscribed) {
    if (user.shortLinks.length >= 1) {
      return ServerResponse.serverError(
        res,
        403,
        "Your free trial link has already been used. Subscribe to create more links."
      );
    }
    return { allowed: true, isFreeTrialUser: true };
  }

  const maxLinksReached = await checkMaxLinks(userId);

  if (maxLinksReached) {
    return ServerResponse.serverError(
      res,
      403,
      "You have reached the maximum number of short links allowed for your subscription."
    );
  }

  return { allowed: true, isFreeTrialUser: false };
};
