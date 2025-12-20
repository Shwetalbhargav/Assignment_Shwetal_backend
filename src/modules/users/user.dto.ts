import { z } from "zod";

export const updateMeDto = z.object({
  name: z.string().min(2).max(100).optional(),
  // allow null to clear it; optional means "don’t change"
  mobileNumber: z.string().min(7).max(20).nullable().optional(),
});

export type UpdateMeDto = z.infer<typeof updateMeDto>;
