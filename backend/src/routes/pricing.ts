import * as dotenv from "dotenv";
import { Express } from "express";
import {
  createSubscriptionWebhook,
  deleteSubscriptionWebhook,
} from "../services/subscription.service";
import { Server } from "socket.io";

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

      console.log('stize webhook');
      
      createSubscriptionWebhook({
        eventName,
        userId,
        subscriptionId,
        productId,
      });

      io.to(userId).emit('subscription-updated', { userId })
      console.log('poslato na front')
    } catch (err) {
      console.error("[Webhook] Error:", err);
    }
  });
};

export default pricingRoutes;
