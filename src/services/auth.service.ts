import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt";
import { UserRepository } from "../repositories/user.repository";

export class AuthService {
  constructor(private users = new UserRepository()) {}

  async register(input: { name: string; email: string; mobileNumber?: string; password: string }) {
  const existing = await this.users.findByEmail(input.email);
  if (existing) throw Object.assign(new Error("Email already in use"), { status: 409 });

  const passwordHash = await bcrypt.hash(input.password, 10);
  
  const payload: { name: string; email: string; passwordHash: string; mobileNumber?: string } = {
  name: input.name,
  email: input.email,
  passwordHash,
};

if (input.mobileNumber) {
  payload.mobileNumber = input.mobileNumber;
}

  // ✅ Do NOT spread `input` (it contains password)
  const user = await this.users.create({
  name: input.name,
  email: input.email,
  passwordHash,
  ...(input.mobileNumber ? { mobileNumber: input.mobileNumber } : {}),
});



 
}

  async login(input: { email: string; password: string }) {
    const existing = await this.users.findByEmail(input.email);
    if (!existing) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

    const ok = await bcrypt.compare(input.password, existing.passwordHash);
    if (!ok) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

    const user = await this.users.findById(existing.id);

    const accessToken = jwt.sign({}, jwtConfig.accessSecret, { subject: existing.id, expiresIn: jwtConfig.accessExpiresIn });
    const refreshToken = jwt.sign({}, jwtConfig.refreshSecret, { subject: existing.id, expiresIn: jwtConfig.refreshExpiresIn });

    return { user, accessToken, refreshToken };
  }
}

