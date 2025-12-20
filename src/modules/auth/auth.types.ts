export type PublicUser = {
  id: string;
  name: string;
  email: string;
  mobileNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RegisterInput = {
  name: string;
  email: string;
  mobileNumber?: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
