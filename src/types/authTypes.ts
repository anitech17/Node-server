export type TokenPayload = {
  id: string;
  role: 'admin' | 'student' | 'educator';
};

// export interface AuthenticatedRequest extends Express.Request {
//   user?: TokenPayload;
// }