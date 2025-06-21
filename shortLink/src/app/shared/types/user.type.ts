import { Subscription } from "./subscription.interface";

export type User = {
  _id: string;
  email: string;
  name?: string;
  createdAt: Date;
  subscription: Subscription
};
