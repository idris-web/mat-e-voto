import bcrypt from "bcryptjs";
import { redirect } from "react-router";
import { db } from "./db.server";
import { getSession, commitSession, destroySession, sessionStorage } from "./session.server";
import type { User, UserRole } from "@prisma/client";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

const USER_SESSION_KEY = "userId";

export async function getUserId(request: Request): Promise<string | null> {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get(USER_SESSION_KEY);
  return userId ?? null;
}

export async function getUser(request: Request): Promise<AuthUser | null> {
  const userId = await getUserId(request);
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<string> {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/auth/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request): Promise<AuthUser> {
  const userId = await requireUserId(request);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    throw await logout(request);
  }

  return user;
}

export async function requireEditor(request: Request): Promise<AuthUser> {
  const user = await requireUser(request);

  if (user.role === "VIEWER") {
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}

export async function requireAdmin(request: Request): Promise<AuthUser> {
  const user = await requireUser(request);

  if (user.role !== "ADMIN") {
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}

export async function verifyLogin(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user || !user.passwordHash) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  const { passwordHash, ...authUser } = user;
  return authUser;
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request.headers.get("Cookie"));
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 30 : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export async function createUser(
  email: string,
  password: string,
  name?: string,
  role: UserRole = "VIEWER"
): Promise<AuthUser> {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      passwordHash,
      role,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
}
