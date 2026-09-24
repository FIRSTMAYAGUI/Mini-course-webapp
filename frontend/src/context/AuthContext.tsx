import { createContext } from "react";
import type { LoginPayload, SignupPayload, User } from "./AuthProvider";

// 2. AuthContext Value Interface
export interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
}
// Create Context with typed initial value (null)
export const AuthContext = createContext<AuthContextType | null>(null);