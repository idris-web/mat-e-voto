import { Form, useSearchParams } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/lib/db.server";
import { requireAdmin } from "~/lib/auth.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Plus, Search, Edit, Shield, ShieldAlert, ShieldCheck, UserX } from "lucide-react";
import { getInitials, formatShortDate } from "~/lib/utils";
import React from "react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Manage Users - Premtimet" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const url = new URL(request.url);
  const search = url.searchParams.get("q");

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { statusChanges: true, evidence: true, tips: true },
      },
    },
  });

  return { users };
}

export async function action({ request }: Route.ActionArgs) {
  const currentUser = await requireAdmin(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !role) {
      return { error: "Email, password, and role are required" };
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "A user with this email already exists" };
    }

    // Hash password
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        email,
        name: name || null,
        role: role as any,
        passwordHash,
      },
    });

    return { created: true };
  }

  if (intent === "updateRole") {
    const userId = formData.get("userId") as string;
    const newRole = formData.get("newRole") as string;

    if (!userId || !newRole) {
      return { error: "User ID and role are required" };
    }

    // Prevent self-demotion
    if (userId === currentUser.id) {
      return { error: "You cannot change your own role" };
    }

    await db.user.update({
      where: { id: userId },
      data: { role: newRole as any },
    });

    return { roleUpdated: true };
  }

  if (intent === "deactivate") {
    const userId = formData.get("userId") as string;

    if (userId === currentUser.id) {
      return { error: "You cannot deactivate your own account" };
    }

    await db.user.update({
      where: { id: userId },
      data: { role: "VIEWER" },
    });

    return { deactivated: true };
  }

  return null;
}

export default function AdminUsers({ loaderData, actionData }: Route.ComponentProps) {
  const { users } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [showNewUser, setShowNewUser] = React.useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    setSearchParams(q ? { q } : {});
  };

  const roleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case "EDITOR":
        return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users ({users.length})</h1>
        <Button onClick={() => setShowNewUser(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New User
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            name="q"
            type="search"
            placeholder="Search users..."
            defaultValue={searchParams.get("q") || ""}
            className="pl-10"
          />
        </div>
      </form>

      {/* Error/Success Messages */}
      {actionData?.error && (
        <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm">
          {actionData.error}
        </div>
      )}
      {actionData?.created && (
        <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700 text-sm">
          User created successfully
        </div>
      )}
      {actionData?.roleUpdated && (
        <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700 text-sm">
          User role updated
        </div>
      )}

      {/* New User Dialog */}
      {showNewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowNewUser(false)} />
          <Card className="relative z-50 w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="create" />

                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input name="email" type="email" required placeholder="user@example.com" />
                </div>

                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input name="name" placeholder="Full name" />
                </div>

                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input name="password" type="password" required minLength={8} />
                </div>

                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select name="role" required defaultValue="VIEWER">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER">Viewer (Read-only)</SelectItem>
                      <SelectItem value="EDITOR">Editor (Can edit content)</SelectItem>
                      <SelectItem value="ADMIN">Admin (Full access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewUser(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create User</Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Activity</th>
                  <th className="text-left p-4 font-medium">Joined</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(user.name || user.email)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name || "No name"}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {roleIcon(user.role)}
                        <Badge
                          variant={
                            user.role === "ADMIN"
                              ? "destructive"
                              : user.role === "EDITOR"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      <div className="space-y-1">
                        <p>{user._count.statusChanges} status changes</p>
                        <p>{user._count.evidence} evidence added</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {formatShortDate(user.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <UserRoleDialog user={user} />
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserRoleDialog({ user }: { user: { id: string; name: string | null; email: string; role: string } }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Edit className="h-4 w-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <Card className="relative z-50 w-full max-w-sm">
            <CardHeader>
              <CardTitle>Edit User Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                {user.name || user.email}
              </p>

              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="updateRole" />
                <input type="hidden" name="userId" value={user.id} />

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select name="newRole" defaultValue={user.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER">Viewer (Read-only)</SelectItem>
                      <SelectItem value="EDITOR">Editor (Can edit content)</SelectItem>
                      <SelectItem value="ADMIN">Admin (Full access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" onClick={() => setOpen(false)}>
                    Update Role
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
