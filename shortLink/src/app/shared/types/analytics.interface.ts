export interface Analytics {
  viewCount: number;
  lastViewedOn: Date;
  firstViewedOn: Date;
  shortLink: string;
  entries: {
    date: Date
    viewCount: number
  }[]
}
