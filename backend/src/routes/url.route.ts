import { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import { nanoid } from "nanoid";
import { UrlModel } from "../models/url.model";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const urlRoutes = (app: Express) => {
  app.get('/api/url/get-by-id/:id', async (req: Request, res: Response) => {
    const { id } = req.params;    
  
    try {
      const record = await UrlModel.findById(id);
      
      if (!record) {
        return res.status(404).json({ error: 'Short URL not found' });
      }
  
      res.send(record);
    } catch (error) {
      console.error('Error fetching short URL:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.post("/api/url/minify", async (req: Request, res: Response): Promise<any> => {
    console.error('req.body', req.body)
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "Missing original URL" });
    }

    const shortId = nanoid(6);
    const shortUrl = `${BASE_URL}/${shortId}`;

    try {
      const url = await UrlModel.create({
        originalUrl,
        shortUrl,
      });

      res.json({ url });
    } catch (error) {
      console.error("Error creating short URL:", error);
      res.status(500).json({ error: "Failed to shorten URL" });
    }
  });
};

export default urlRoutes
