import * as dotenv from "dotenv";

dotenv.config();

const environment = {
  lemonSquezzyApiKey: process.env.LEMON_SQUEZZY_API_KEY,
  lemonSquezzyApiBaseUrl: process.env.LEMON_SQUEZZY_URL,
}
export const isUserSubscribed = async (subscriptionId: string): Promise<boolean> => {
  try {
	const subscription = await fetch(`${environment.lemonSquezzyApiBaseUrl}/subscriptions/${subscriptionId}`, {
		headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          Authorization: `Bearer ${environment.lemonSquezzyApiKey}`,
        },
	})

	const subscriptionData = await subscription.json();	
	
	if (subscriptionData.data.attributes.status === 'active') {
		return true;
	} else {
		return false;
	}

  } catch (error) {
	throw new Error("Error checking subscription: " + error.message);
  }
}