import { SubscriptionModel } from "../models/subscription.model";
import { UserModel } from "../models/user.model";
import { SubscriptionEventTypes } from "../types/subscription-event-types.enum";
import { populateUserSubscription } from "./user.service";

interface CreateSubscriptionPayload {
  subscriptionId: string;
  productId: string;
}

interface CreateSubscriptionWebhookPayload {
  eventName: string;
  userId: string;
  subscriptionId: string;
  productId: string;
}

interface DeleteSubscriptionPayload {
  eventName: string;
  userId: string;
}

export const createSubscription = async (
  payload: CreateSubscriptionPayload
) => {
  return await SubscriptionModel.create({
    ...payload,
  });
};

export const createSubscriptionWebhook = async ({
  eventName,
  userId,
  subscriptionId,
  productId,
}: CreateSubscriptionWebhookPayload) => {
  if (
    eventName === SubscriptionEventTypes.subscription_created ||
    eventName === SubscriptionEventTypes.subscription_updated
  ) {
    const populatedUser = await populateUserSubscription(userId);

    if (populatedUser.subscription) {
      await SubscriptionModel.findByIdAndUpdate(populatedUser.subscription._id, {
        subscriptionId,
        productId,
        userId
      });
    } else {
      const subscription = await SubscriptionModel.create({
        subscriptionId,
        productId,
        userId
      })

      populatedUser.subscription = subscription._id
    }


    await populatedUser.save();
  }
};

export const deleteSubscriptionWebhook = async ({
  eventName,
  userId,
}: DeleteSubscriptionPayload) => {
  if (eventName === SubscriptionEventTypes.subscription_cancelled) {	
    await UserModel.findByIdAndUpdate(userId, {
      subscriptionId: "",
      productId: "",
    });
  }
};
