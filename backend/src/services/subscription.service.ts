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
    const user = await UserModel.findById(userId);
    const populatedUser = await populateUserSubscription(user);

    await SubscriptionModel.findByIdAndUpdate(populatedUser.subscription._id, {
      subscriptionId,
      productId,
      userId
    });

    await user.save();
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
