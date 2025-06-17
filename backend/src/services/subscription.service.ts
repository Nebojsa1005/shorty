import { SubscriptionModel } from "../models/subscription.model"

interface CreateSubscriptionPayload {
	subscriptionId: string
	productId: string
}

export const createSubscription = async (payload: CreateSubscriptionPayload) => {
	return await SubscriptionModel.create({
		...payload
	})
}