import * as dotenv from "dotenv";
import crypto from "crypto";
import { Express } from "express";
import {
  createUpdateSubscriptionHandler,
  cancelSubscriptionHandler,
  deleteSubscriptionHandler,
} from "../services/subscription.service";
import { Server } from "socket.io";
import { UserModel } from "../models/user.model";
import { SubscriptionModel } from "../models/subscription.model";
import { ServerResponse } from "../utils/server-response";
import { SubscriptionEventTypes } from "../types/subscription-event-types.enum";

dotenv.config();

const lemonSqueezyApiUrl = process.env.LEMON_SQUEZZY_URL;
const lemonSqueezyApiKey = process.env.LEMON_SQUEZZY_API_KEY;

const lemonSqueezyHeaders = {
  Accept: "application/vnd.api+json",
  "Content-Type": "application/vnd.api+json",
  Authorization: `Bearer ${lemonSqueezyApiKey}`,
};

const pricingRoutes = (app: Express, io: Server) => {
  // Proxy route: Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const response = await fetch(`${lemonSqueezyApiUrl}/products`, {
        headers: lemonSqueezyHeaders,
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      return ServerResponse.serverError(
        res,
        500,
        "Error fetching products: " + error.message
      );
    }
  });

  // Proxy route: Get product by ID
  app.get("/api/products/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const response = await fetch(`${lemonSqueezyApiUrl}/products/${productId}`, {
        headers: lemonSqueezyHeaders,
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      return ServerResponse.serverError(
        res,
        500,
        "Error fetching product: " + error.message
      );
    }
  });

  // Proxy route: Cancel subscription
  app.delete("/api/subscriptions/:subscriptionId", async (req, res) => {
    try {
      const { subscriptionId } = req.params;
      const { userId } = req.body;
      const response = await fetch(
        `${lemonSqueezyApiUrl}/subscriptions/${subscriptionId}`,
        {
          method: "DELETE",
          headers: lemonSqueezyHeaders,
        }
      );
      const data = await response.json();
      await deleteSubscriptionHandler({userId})
      return res.status(response.status).json(data);
    } catch (error) {
      return ServerResponse.serverError(
        res,
        500,
        "Error cancelling subscription: " + error.message
      );
    }
  });

  // Proxy route: Get billing history (subscription invoices)
  app.get("/api/subscription-invoices", async (req, res) => {
    try {
      const subscriptionId = req.query.subscription_id;
      const response = await fetch(
        `${lemonSqueezyApiUrl}/subscription-invoices?filter[subscription_id]=${subscriptionId}`,
        {
          headers: lemonSqueezyHeaders,
        }
      );
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      return ServerResponse.serverError(
        res,
        500,
        "Error fetching billing history: " + error.message
      );
    }
  });
  app.post("/api/webhook", async (req, res) => {
    try {
      // Verify webhook signature
      const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
      const signature = req.headers["x-signature"] as string;
      const rawBody = (req as any).rawBody as Buffer;

      if (!secret || !signature || !rawBody) {
        return res.status(401).send({ error: "Missing signature or webhook secret" });
      }

      const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

      if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature))) {
        return res.status(401).send({ error: "Invalid webhook signature" });
      }

      const event = req.body;
      const productId = event.data?.attributes.product_id;
      const eventName = event.meta?.event_name;
      const userId = event.meta?.custom_data.userId;
      const subscriptionId = event.data.id;
      const status = event.data?.attributes?.status;

      console.log(`[Webhook] Received event: ${eventName} for user: ${userId}`);

      // Handle subscription creation and updates
      if (
        eventName === SubscriptionEventTypes.subscription_created ||
        eventName === SubscriptionEventTypes.subscription_updated
      ) {
         await createUpdateSubscriptionHandler({
          userId,
          subscriptionId,
          productId,
          status,
        });
        io.to(userId).emit("subscription-updated", {
          userId,
          eventType: eventName,
          subscriptionId,
          productId
        });
        console.log(`[Webhook] Emitted subscription-updated for user: ${userId}`);
      }

      // Handle subscription cancellation
      if (eventName === SubscriptionEventTypes.subscription_cancelled) {
        await cancelSubscriptionHandler({
          userId,
        });
        io.to(userId).emit("subscription-updated", {
          userId,
          eventType: eventName
        });
        console.log(`[Webhook] Emitted subscription-cancelled for user: ${userId}`);
      }

      // Handle payment success
      if (eventName === SubscriptionEventTypes.subscription_payment_success) {
        io.to(userId).emit("payment-success", {
          userId,
          subscriptionId,
          productId,
          message: "Payment successful! Your subscription is now active."
        });
        console.log(`[Webhook] Emitted payment-success for user: ${userId}`);
      }

      // Handle payment failure
      if (eventName === SubscriptionEventTypes.subscription_payment_failed) {
        io.to(userId).emit("payment-failed", {
          userId,
          subscriptionId,
          message: "Payment processing failed. Please check your payment method and try again."
        });
        console.log(`[Webhook] Emitted payment-failed for user: ${userId}`);
      }

      res.status(200).send({ received: true });
    } catch (err) {
      console.error("[Webhook] Error:", err);
      res.status(500).send({ error: "Webhook processing failed" });
    }
  });

  app.post("/api/remove-subscription", async (req, res) => {
    const { userId } = req.body;
    try {
      const user = await UserModel.findById(userId);
      const populatedUser = await user.populate("subscription");
      await SubscriptionModel.findByIdAndDelete(
        populatedUser.subscription?._id
      );

      await UserModel.findByIdAndUpdate(
        userId,
        {
          subscription: null,
        },
        { new: true }
      );
      return ServerResponse.serverSuccess(
        res,
        200,
        "Successfully Unsubscribed"
      );
    } catch (error) {
      return ServerResponse.serverError(
        res,
        500,
        "Error removing subscription: " + error.message
      );
    }
  });
};

export default pricingRoutes;
