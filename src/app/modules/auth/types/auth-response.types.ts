import { Gender } from "@core/types/gender.types";

export type UserRole = 'PASTOR';

export interface LoginResponseData {
  usernameOrEmail: string;
  jwt: string;
}

export interface UserProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  username: string;
  email: string;
  role: string;
}