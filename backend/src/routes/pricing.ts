import axios from "axios";
import * as dotenv from "dotenv";
import { Express } from "express";
import { UserModel } from "../models/user.model";
import { SubscriptionEventTypes } from "../types/subscription-event-types.enum";
import { ServerResponse } from "../utils/server-response";
import { populateUserSubscription } from "../services/user.service";
import { SubscriptionModel } from "../models/subscription.model";
import { createSubscription } from "../services/subscription.service";

dotenv.config();

const lemonApiKey = process.env.LEMON_SQUEZZY_API_KEY;
const lemonUrl = process.env.LEMON_SQUEZZY_URL;

const pricingRoutes = (app: Express) => {
  app.get("/api/products", async (req, res) => {
    try {
      const response = await axios.get(
        `https://api.lemonsqueezy.com/v1/products`,
        {
          headers: {
            Accept: "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
            Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJlZjdiZmFmMDYyOTc3Mzg2ZTg3YjZiYTU3NzIwNmQ2ODEyZDE0NGQ0NDU4ZjE5YzgyOWEzZjZhNThmNTZhMmU2OWYwODI4YjlmNDNlZDEzZCIsImlhdCI6MTc0OTMwNDIwMS45NDA2ODYsIm5iZiI6MTc0OTMwNDIwMS45NDA2ODksImV4cCI6MjA2NDgzNzAwMS44NTAyMzYsInN1YiI6IjUwMTUzMTAiLCJzY29wZXMiOltdfQ.EusydizkINxMW5sEf-_p9eURkLhjmHp7GMPi6Iv73qg6uyTEK4QfWeEL10M0Tw8dWFEsO-ay4E4Lg3Q24vD9lXWfYoo_rlY7jVTBkDZx-yWJWbF7amuajH99BzkvcVDlRPzye2bwys-9MzBec97TnMfGElSKQ0DTN3kZ8j2QD6GQ6RY8g-hzdc4RkGf1_ywCDddL3qQnoB6yJvAvsHmojzhXyQTC7weV2KNiS6tPkpxdSEe2ZL1rWM4TN7H4gE5hu3fqfqSrdCulCvacZHr29AMwQLIAgzKcL-d7vTanXiui-OglR-qPjdUaQn-fkFdp0eHPsZx5I7ZsKpXhQ7MxoA6FOOxk-VIahEY3CaADblZ7Pmhl4JtLoKGOY3paH5aDEgqHHPdWqbJdMQopC0DunsDeJwKMnbWze0hVHjBBEeiNFUyFN4YVsF2P9-JScpvVogkHzqD8YbswXJ_fXMNu12-eC6i3X2n-S5TXsEfZ_JTUWovXp9TVxQoS44265F55`,
          },
        }
      );

      return ServerResponse.serverSuccess(
        res,
        200,
        "Successfully fetched products",
        response
      );
    } catch (error) {
      console.log(error);
    }
  });

  app.post("/api/webhook", async (req, res) => {
    try {
      const event = req.body;
      const productId = event.data?.attributes.product_id;
      const eventName = event.meta?.event_name;
      const userId = event.meta?.custom_data.userId;
      console.log(`${eventName} - productId: ${productId}, type: ${typeof productId}`);
      
      if (
        eventName === SubscriptionEventTypes.subscription_created ||
        eventName === SubscriptionEventTypes.subscription_updated
      ) {
        const user = await UserModel.findById(userId)
        const populatedUser = await populateUserSubscription(user)

        if (populatedUser.subscription.subscriptionId) {
          await SubscriptionModel.findByIdAndUpdate(populatedUser.subscription._id, {
            subscriptionId: event.id,
            productId
          })
        } else {
          const subscription = await createSubscription({ subscriptionId: event.id, productId })
          
          user.subscription = subscription._id
          await user.save()
        }
        
      }
    } catch (err) {
      console.error("[Webhook] Error:", err);
    }
  });
};

export default pricingRoutes;
