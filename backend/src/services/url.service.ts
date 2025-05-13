import { UrlDocument } from "../models/url.model";

export const populateAnalytics = async (url: UrlDocument) => {
	return url.populate('Analytics')
}