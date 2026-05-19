import { UrlDocument } from "../models/url.model";

export const populateAnalytics = async (url: UrlDocument) => {
	return url.populate('Analytics')
}

export const expirationDateCheck = (url: UrlDocument): boolean => {
	if (!url.userExpirationDate) return true

	const now = new Date().getTime()
	const userExpirationDate = new Date(url.userExpirationDate).getTime()

	if (userExpirationDate < now) return false

	return true
}