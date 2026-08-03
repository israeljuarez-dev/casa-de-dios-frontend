export type UserRole = 'PASTOR';

export interface LoginResponseData {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  accessToken: string;
  tokenType: string;
}