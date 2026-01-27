import { CreateSubscriptionPayload, CreateSubscriptionWebhookPayload, DeleteSubscriptionPayload, PRODUCT_LINKS_ALLOWED, SubscriptionModel } from "../models/subscription.model";
import { UserModel } from "../models/user.model";
import { populateUserSubscription } from "./user.service";

export const createSubscription = async (
  payload: CreateSubscriptionPayload
) => {
  return await SubscriptionModel.create({
    ...payload,
    linksAllowed: payload.productId ? PRODUCT_LINKS_ALLOWED[payload.productId] : 0
  });
};

export const createSubscriptionWebhook = async ({
  userId,
  subscriptionId,
  productId,
}: CreateSubscriptionWebhookPayload) => {
  const populatedUser = await populateUserSubscription(userId);

  if (populatedUser.subscription) {
    await SubscriptionModel.findByIdAndUpdate(populatedUser.subscription._id, {
      subscriptionId,
      productId,
      userId,
    });
  } else {
    const subscription = await SubscriptionModel.create({
      subscriptionId,
      productId,
      userId,
    });

    populatedUser.subscription = subscription._id;
  }

  await populatedUser.save();
};

export const deleteSubscriptionWebhook = async ({
  userId,
}: DeleteSubscriptionPayload) => {
  const user = await populateUserSubscription(userId);
  console.log(user.subscription._id);

  await SubscriptionModel.findByIdAndDelete(user.subscription._id);
  await UserModel.findByIdAndUpdate(userId, {
    subscription: null,
  });
};
