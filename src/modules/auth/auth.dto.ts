import { z } from "zod";

export const registerDto = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(120),
  mobileNumber: z.string().min(7).max(20).optional(),
  password: z.string().min(8).max(72),
});

export const loginDto = z.object({
  email: z.string().email().max(120),
  password: z.string().min(8).max(72),
});

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
