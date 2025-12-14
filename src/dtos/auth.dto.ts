import { z } from "zod";

export const RegisterDto = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  mobileNumber: z.string().min(7).max(20).optional(),
  password: z.string().min(8).max(72),
});

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});
