export enum SubscriptionEventTypes {
	subscription_created = 'subscription_created',
	subscription_updated = 'subscription_updated',
	subscription_cancelled = 'subscription_cancelled',
	subscription_expired = 'subscription_expired',
	subscription_paused = 'subscription_paused',
	subscription_resumed = 'subscription_resumed',
	subscription_payment_failed = 'subscription_payment_failed',
	subscription_payment_success = 'subscription_payment_success',
	subscription_payment_recovered = 'subscription_payment_recovered',
}