import { UserRepository } from "../repositories/user.repository";

export class UserService {
  constructor(private users = new UserRepository()) {}

  getMe(userId: string) {
    return this.users.findById(userId);
  }

  updateMe(userId: string, data: { name?: string; mobileNumber?: string }) {
    return this.users.updateProfile(userId, data);
  }
}
