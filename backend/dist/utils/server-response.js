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
export const ServerResponse = {
    serverError,
    serverSuccess,
};
