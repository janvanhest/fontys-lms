export interface IAuthenticatedUser {
  id: string;
  canvasUserId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}
