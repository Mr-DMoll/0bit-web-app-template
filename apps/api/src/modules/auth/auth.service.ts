import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { Role } from "@repo/types";
import env from "../../config/env.config.js";
import { prisma } from "@repo/database";

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  async verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  generateToken(userId: string, role: Role | string): string {
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
    return jwt.sign({ userId, role }, env.JWT_SECRET, options);
  }

  async findUserByIdentifier(email: string) {
    const normalized = email.trim().toLowerCase();
    return prisma.user.findUnique({ where: { email: normalized } });
  }

  async createUser(data: {
    email:     string;
    password:  string;
    role?:     Role;
  }) {
    const hashed = await this.hashPassword(data.password);
    return prisma.user.create({
      data: {
        email:         data.email.trim().toLowerCase(),
        password:      hashed,
        role:          data.role ?? Role.USER,
        accountStatus: "PENDING",
      },
    });
  }
}