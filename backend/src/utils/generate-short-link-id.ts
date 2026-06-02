import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";
import { UrlModel } from "../models/url.model";

const MAX_ATTEMPTS = 10;

export async function generateUniqueShortLinkId(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const id = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: "-",
      style: "lowerCase",
    });

    const existing = await UrlModel.findOne({ shortLinkId: id });
    if (!existing) {
      return id;
    }
  }

  throw new Error(
    `Failed to generate a unique short link ID after ${MAX_ATTEMPTS} attempts`
  );
}
