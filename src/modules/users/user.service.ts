import { AppError } from "../../common/errors/AppError";
import { ErrorCodes } from "../../common/errors/errorCodes";
import { UserRepository } from "./user.repository";
import type { PublicUser, UpdateMeInput } from "./user.types";

export class UserService {
  private repo = new UserRepository();

  async me(userId: string): Promise<PublicUser> {
    const user = await this.repo.findById(userId);
    if (!user) throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
    return user;
  }

  async updateMe(userId: string, input: UpdateMeInput): Promise<PublicUser> {
    const data: { name?: string; mobileNumber?: string | null } = {};

    if (typeof input.name === "string") data.name = input.name.trim();

    // exactOptionalPropertyTypes-safe:
    // only set mobileNumber if the key exists in input
    if ("mobileNumber" in input) {
      data.mobileNumber = input.mobileNumber ?? null;
    }

    const updated = await this.repo.updateById(userId, data);
    return updated;
  }
}
