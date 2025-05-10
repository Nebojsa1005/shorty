export interface UrlLink {
  destinationUrl: string;
  urlName: string;
}

export interface UrlForm {
	value: UrlLink,
	valid: boolean
}