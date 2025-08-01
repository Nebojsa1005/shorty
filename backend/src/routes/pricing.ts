import * as dotenv from "dotenv";
import { Express } from "express";
import {
  createSubscriptionWebhook,
  deleteSubscriptionWebhook,
} from "../services/subscription.service";
import { Server } from "socket.io";
import { UserModel } from "../models/user.model";
import { SubscriptionModel } from "../models/subscription.model";
import { ServerResponse } from "../utils/server-response";

dotenv.config();

const pricingRoutes = (app: Express, io: Server) => {
  app.post("/api/webhook", async (req, res) => {
    try {
      const event = req.body;
      const productId = event.data?.attributes.product_id;
      const eventName = event.meta?.event_name;
      const userId = event.meta?.custom_data.userId;
      const subscriptionId = event.data.id;
      const isCancelled = event.data?.attributes.cancelled;

      console.log("stize webhook");

      createSubscriptionWebhook({
        eventName,
        userId,
        subscriptionId,
        productId,
      });

      io.to(userId).emit("subscription-updated", { userId });
      console.log("poslato na front");
    } catch (err) {
      console.error("[Webhook] Error:", err);
    }
  });

  app.post("/api/remove-subscription", async (req, res) => {
    const { userId } = req.body;

    const user = await UserModel.findById(userId);
    const populatedUser = await user.populate("subscription");    
    await SubscriptionModel.findByIdAndDelete(populatedUser.subscription._id);

    await UserModel.findOneAndUpdate(userId, {
      subscription: null
    }, { new: true })
    return ServerResponse.serverSuccess(res, 200, 'Successfully Unsubscribed', )
  });
};

export default pricingRoutes;
