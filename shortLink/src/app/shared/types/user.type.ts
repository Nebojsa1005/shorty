import { Subscription } from "./subscription.interface";

export type User = {
  _id: string;
  email: string;
  name?: string;
  createdAt: Date;
  subscription: Subscription
};

export type PersonalInfoPayload = {
  name: string;
  email: string;
}

export type PasswordUpdatePayload = {
  currentPassword: string;
  newPassword: string;
}