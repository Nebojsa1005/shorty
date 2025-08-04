import { UrlDocument } from "../models/url.model";

export const populateAnalytics = async (url: UrlDocument) => {
	return url.populate('Analytics')
}

export const expirationDateCheck = (url: UrlDocument): boolean => {
	if (!url.expirationDate) return true

	const now = new Date().getTime()
	const expirationDate = new Date(url.expirationDate).getTime()

	if (expirationDate < now) return false
}