"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerResponse = void 0;
const serverError = (res, status, message, error) => {
    res.status(status).send({
        message: message ? message : "Something Went Wrong",
        status: status,
        data: error,
    });
};
const serverSuccess = (res, status, message, data) => {
    res.status(status).send({
        message: message ? message : "Success!",
        status: status,
        data: data,
    });
};
exports.ServerResponse = {
    serverError,
    serverSuccess,
};
