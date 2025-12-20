import prisma from "../../lib/prisma";

export class UserRepository {
  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  updateById(id: string, data: { name?: string; mobileNumber?: string | null }) {
    return prisma.user.update({
      where: { id },
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
  }
}
