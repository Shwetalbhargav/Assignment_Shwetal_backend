export type PublicUser = {
  id: string;
  name: string;
  email: string;
  mobileNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateMeInput = {
  name?: string;
  mobileNumber?: string | null;
};
