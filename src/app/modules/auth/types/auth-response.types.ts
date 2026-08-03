export type UserRole = 'PASTOR';

export interface LoginResponseData {
  usernameOrEmail: string;
  jwt: string;
}