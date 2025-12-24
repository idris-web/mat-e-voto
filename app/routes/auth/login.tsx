import { Form, redirect, useActionData, useNavigation, useOutletContext } from "react-router";
import type { Route } from "./+types/login";
import { verifyLogin, createUserSession, getUser } from "~/lib/auth.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import type { Translations } from "~/locales";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Login - Premtimet" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (user) {
    return redirect("/admin");
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string || "/admin";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return { error: "Invalid email or password" };
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: true,
    redirectTo,
  });
}

export default function Login({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const { t } = useOutletContext<{ t: Translations }>();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{t.auth.loginTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            {actionData?.error && (
              <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm">
                {actionData.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t.auth.loggingIn : t.auth.login}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
