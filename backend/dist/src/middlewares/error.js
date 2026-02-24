import { ResponseHelper } from '../utils/response.js';
export const errorHandler = (err, req, res, next) => {
    console.error(err);
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';
    const errors = err.errors || null;
    res.status(statusCode).json(ResponseHelper.error(message, errors));
};
export class AppError extends Error {
    status;
    errors;
    constructor(message, status = 400, errors = null) {
        super(message);
        this.status = status;
        this.errors = errors;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
//# sourceMappingURL=error.js.map