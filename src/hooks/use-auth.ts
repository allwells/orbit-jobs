import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuth() {
  const { data: session, isPending, error } = authClient.useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const login = async (credentials: { username: string; password: string }) => {
    setLoading(true);
    try {
      const { data, error } = await authClient.signIn.username({
        username: credentials.username,
        password: credentials.password,
      });

      if (error) {
        throw error;
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
            router.refresh();
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    user: session?.user,
    session,
    isAuthenticated: !!session?.user,
    isLoading: isPending || loading,
    error,
    login,
    logout,
  };
}
