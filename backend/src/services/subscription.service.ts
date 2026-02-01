import { CreateSubscriptionPayload, CreateSubscriptionWebhookPayload, DeleteSubscriptionPayload, PRODUCT_LINKS_ALLOWED, SubscriptionModel } from "../models/subscription.model";
import { UserModel } from "../models/user.model";
import { populateUserSubscription } from "./user.service";

export const createUpdateSubscriptionHandler = async ({
  userId,
  subscriptionId,
  productId,
}: CreateSubscriptionWebhookPayload) => {
  const populatedUser = await populateUserSubscription(userId);
  const linksAllowed = PRODUCT_LINKS_ALLOWED[productId] || 0;

  if (populatedUser.subscription) {
    await SubscriptionModel.findByIdAndUpdate(populatedUser.subscription._id, {
      subscriptionId,
      productId,
      linksAllowed,
      userId,
    });
  } else {
    const subscription = await SubscriptionModel.create({
      subscriptionId,
      productId,
      linksAllowed,
      userId,
    });

    populatedUser.subscription = subscription._id;
  }

  await populatedUser.save();
};

export const deleteSubscriptionHandler = async ({
  userId,
}: DeleteSubscriptionPayload) => {
  const user = await populateUserSubscription(userId);
  console.log(user.subscription._id);

  await SubscriptionModel.findByIdAndDelete(user.subscription._id);
  await UserModel.findByIdAndUpdate(userId, {
    subscription: null,
  });
};
