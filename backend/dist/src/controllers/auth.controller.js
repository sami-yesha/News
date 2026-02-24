import { AuthService } from '../services/auth.service.js';
import { ResponseHelper } from '../utils/response.js';
export class AuthController {
    static async signup(req, res, next) {
        try {
            const user = await AuthService.signup(req.body);
            res.status(201).json(ResponseHelper.success('User registered successfully', user));
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const data = await AuthService.login(req.body);
            res.status(200).json(ResponseHelper.success('Login successful', data));
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=auth.controller.js.map