import { Response } from "express";

const serverError = (
  res: Response,
  status: number,
  message?: string,
  error?: unknown
) => {
  res.status(status).send({
    message: message ? message : "Something Went Wrong",
    status: status,
    data: error,
  });
};

const serverSuccess = (
  res: Response,
  status: number,
  message?: string,
  data?: any
) => {
  res.status(status).send({
    message: message ? message : "Success!",
    status: status,
    data: data,
  });
};

export const ServerResponse = {
  serverError,
  serverSuccess,
};
