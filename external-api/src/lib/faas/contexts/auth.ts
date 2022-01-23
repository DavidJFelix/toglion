export interface AuthContext {
  auth: {
    userId: string
  }
}

// FIXME: handle JS cases when context might not be setup right
export function useAuth<T extends AuthContext>(context: T) {
  return context.auth
}
