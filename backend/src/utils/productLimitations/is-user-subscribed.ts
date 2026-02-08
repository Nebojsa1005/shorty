import { SubscriptionModel } from "../../models/subscription.model";

export const isUserSubscribed = async (subscriptionId: string): Promise<boolean> => {
  const subscription = await SubscriptionModel.findOne({ subscriptionId });
  return subscription?.status === "active";
};
