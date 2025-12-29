import { auth } from "@/auth";

export async function requireRole(roles = []) {
  const session = await auth();

  if (!session || !roles.includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  return session;
}
