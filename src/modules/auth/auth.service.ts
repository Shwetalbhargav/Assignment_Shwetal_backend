import { prisma } from "../../lib/prisma";
import { AppError } from "../../common/errors/AppError";
import { ErrorCodes } from "../../common/errors/errorCodes";
import { hashPassword, comparePassword } from "../../utils/password";
import { signAccessToken } from "../../utils/jwt";
import type { LoginInput, PublicUser, RegisterInput } from "./auth.types";

const toPublicUser = (u: any): PublicUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  mobileNumber: u.mobileNumber ?? null,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: PublicUser; token: string }> {
    const email = input.email.toLowerCase().trim();

    const exists = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (exists) {
      throw new AppError("Email already in use", 409, ErrorCodes.CONFLICT);
    }

    const passwordHash = await hashPassword(input.password);

    // IMPORTANT for exactOptionalPropertyTypes:
    // - only include mobileNumber if present
    const data: any = {
      name: input.name.trim(),
      email,
      passwordHash,
    };

    if (typeof input.mobileNumber === "string" && input.mobileNumber.trim().length > 0) {
      data.mobileNumber = input.mobileNumber.trim();
    } else {
      // If you want to always store null explicitly:
      data.mobileNumber = null;
    }

    const user = await prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = signAccessToken({ id: user.id, email: user.email, name: user.name });

    return { user: toPublicUser(user), token };
  }

  async login(input: LoginInput): Promise<{ user: PublicUser; token: string }> {
    const email = input.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401, ErrorCodes.UNAUTHORIZED);
    }

    const ok = await comparePassword(input.password, user.passwordHash);
    if (!ok) {
      throw new AppError("Invalid email or password", 401, ErrorCodes.UNAUTHORIZED);
    }

    const token = signAccessToken({ id: user.id, email: user.email, name: user.name });

    return { user: toPublicUser(user), token };
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);

    return toPublicUser(user);
  }
}
