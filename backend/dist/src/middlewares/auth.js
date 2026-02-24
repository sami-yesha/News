import jwt from 'jsonwebtoken';
import { AppError } from './error.js';
import { ResponseHelper } from '../utils/response.js';
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('No token provided', 401));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = {
            id: decoded.sub,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        return next(new AppError('Unauthorized', 401));
    }
};
export const optionalAuthenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = {
            id: decoded.sub,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        // For optional auth, we just continue without user
        next();
    }
};
export const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json(ResponseHelper.error('Forbidden', ['You do not have permission to access this resource']));
        }
        next();
    };
};
//# sourceMappingURL=auth.js.map