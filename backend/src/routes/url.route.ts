import { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import { nanoid } from "nanoid";
import { UrlModel } from "../models/url.model";
import { ServerResponse } from "../utils/server-response";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const urlRoutes = (app: Express) => {
  app.get("/api/url/get-by-id/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const record = await UrlModel.findById(id);

      if (!record) {
        return ServerResponse.serverError(res, 404, "Minified URL not found");
      }

      res.send(record);
    } catch (error) {
      return ServerResponse.serverError(res, 500, error.message, error);
    }
  });

  app.post(
    "/api/url/minify",
    async (req: Request, res: Response): Promise<any> => {
      try {
        const { destinationUrl } = req.body;

        if (!destinationUrl) {
          return ServerResponse.serverError(
            res,
            404,
            "Destination URL not found"
          );
        }
  
        const shortId = nanoid(10);
        const shortUrl = `${BASE_URL}/${shortId}`;
        console.log({shortId})
  
        try {
          const url = await UrlModel.create({
            destinationUrl,
            shortUrl,
          });
  
          return ServerResponse.serverSuccess(res, 200, 'Successfully minified URL', url)
        } catch (error) {
          return ServerResponse.serverError(res, 500, error.message, error);
        }
      } catch (error) {
        console.log(error);
        
        return ServerResponse.serverError(res, 500, error.message, error);
      }
      
    }
  );
};

export default urlRoutes;
