import { z } from "zod";

export const UpdateProfileDto = z.object({
  name: z.string().min(2).max(100).optional(),
  mobileNumber: z.string().min(7).max(20).optional(),
}).refine((v) => Object.keys(v).length > 0, "At least one field required");
