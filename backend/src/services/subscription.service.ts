import { CreateSubscriptionWebhookPayload, DeleteSubscriptionPayload, PRODUCT_LINKS_ALLOWED, SubscriptionModel } from "../models/subscription.model";
import { UserModel } from "../models/user.model";
import { populateUserSubscription } from "./user.service";

export const createUpdateSubscriptionHandler = async ({
  userId,
  subscriptionId,
  productId,
  status,
}: CreateSubscriptionWebhookPayload) => {
  const populatedUser = await populateUserSubscription(userId);
  const linksAllowed = PRODUCT_LINKS_ALLOWED[productId] || 0;

  if (populatedUser.subscription) {
    await SubscriptionModel.findByIdAndUpdate(populatedUser.subscription._id, {
      subscriptionId,
      productId,
      linksAllowed,
      userId,
      status,
    });
  } else {
    const subscription = await SubscriptionModel.create({
      subscriptionId,
      productId,
      linksAllowed,
      userId,
      status,
    });

    populatedUser.subscription = subscription._id;
  }

  await populatedUser.save();
};

export const cancelSubscriptionHandler = async ({
  userId,
}: DeleteSubscriptionPayload) => {
  const user = await populateUserSubscription(userId);

  if (!user.subscription) {
    console.warn(`[cancelSubscriptionHandler] No subscription found for user: ${userId}`);
    return;
  }

  await SubscriptionModel.findByIdAndUpdate(user.subscription._id, {
    status: "cancelled",
    linksAllowed: 0,
  });
};

export const deleteSubscriptionHandler = async ({
  userId,
}: DeleteSubscriptionPayload) => {
  const user = await populateUserSubscription(userId);

  if (!user.subscription) {
    console.warn(`[deleteSubscriptionHandler] No subscription found for user: ${userId}`);
    return;
  }

  await SubscriptionModel.findByIdAndDelete(user.subscription._id);
  await UserModel.findByIdAndUpdate(userId, {
    subscription: null,
  });
};
