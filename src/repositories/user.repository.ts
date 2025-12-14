import { prisma } from "../config/prisma";




export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, mobileNumber: true, createdAt: true, updatedAt: true },
    });
  }

  create(data: { name: string; email: string; mobileNumber?: string; passwordHash: string }) {
    return prisma.user.create({
      data,
      select: { id: true, name: true, email: true, mobileNumber: true, createdAt: true, updatedAt: true },
    });
  }

  updateProfile(id: string, data: { name?: string; mobileNumber?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, mobileNumber: true, createdAt: true, updatedAt: true },
    });
  }
}
