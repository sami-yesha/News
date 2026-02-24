import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { AppError } from '../middlewares/error.js';
import { signupSchema, loginSchema } from '../utils/validation.js';
export class AuthService {
    static async signup(data) {
        const validated = signupSchema.parse(data);
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email },
        });
        if (existingUser) {
            throw new AppError('Email already exists', 409, ['Duplicate emails are not allowed']);
        }
        const hashedPassword = await argon2.hash(validated.password);
        const user = await prisma.user.create({
            data: {
                ...validated,
                password: hashedPassword,
            },
        });
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    static async login(data) {
        const validated = loginSchema.parse(data);
        const user = await prisma.user.findUnique({
            where: { email: validated.email },
        });
        if (!user || !(await argon2.verify(user.password, validated.password))) {
            throw new AppError('Invalid email or password', 401);
        }
        const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
        return { token, user: { id: user.id, name: user.name, role: user.role } };
    }
}
//# sourceMappingURL=auth.service.js.map