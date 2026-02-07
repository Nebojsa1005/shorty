import { ProductsModel } from "../../models/products.model";
import { UserModel } from "../../models/user.model";

export const checkMaxLinks = async (userId: string) => {
  try {
	  const user = await UserModel.findById(userId).populate("shortLinks").populate("subscription");

    if (!user.subscription) {
      return true;
    }

    return user.shortLinks.length > user.subscription.linksAllowed;

  } catch (error) {
    throw new Error("Error checking max links: " + error.message);
  }
};


