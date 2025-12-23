import { ProductsModel } from "../../models/products.model";
import { UserModel } from "../../models/user.model";

export const checkMaxLinks = async (userId: string) => {
  try {
	  const user = await UserModel.findById(userId).populate("shortLinks").populate("subscription");
	  
    const product = await ProductsModel.findOne({ productId: user.subscription.productId });

	console.log(user.shortLinks.length);
	console.log(product.productId);
	
    return user.shortLinks.length > product.maxLinks ? true : false;

  } catch (error) {
    throw new Error("Error checking max links: " + error.message);
  }
};


