import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/lib/db.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  FileText,
  Users,
  Building,
  Tag,
  Lightbulb,
  Plus,
  ArrowRight,
} from "lucide-react";
import type { AuthUser } from "~/lib/auth.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin Dashboard - Premtimet" }];
}

export async function loader({}: Route.LoaderArgs) {
  const [
    promiseCount,
    politicianCount,
    partyCount,
    topicCount,
    unprocessedTipCount,
    recentPromises,
  ] = await Promise.all([
    db.promise.count(),
    db.politician.count(),
    db.party.count(),
    db.topic.count(),
    db.tip.count({ where: { isProcessed: false } }),
    db.promise.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        politician: true,
      },
    }),
  ]);

  return {
    promiseCount,
    politicianCount,
    partyCount,
    topicCount,
    unprocessedTipCount,
    recentPromises,
  };
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const {
    promiseCount,
    politicianCount,
    partyCount,
    topicCount,
    unprocessedTipCount,
    recentPromises,
  } = loaderData;
  const { user } = useOutletContext<{ user: AuthUser }>();

  const stats = [
    {
      label: "Promises",
      value: promiseCount,
      icon: FileText,
      href: "/admin/promises",
      color: "text-blue-600",
    },
    {
      label: "Politicians",
      value: politicianCount,
      icon: Users,
      href: "/admin/politicians",
      color: "text-green-600",
    },
    {
      label: "Parties",
      value: partyCount,
      icon: Building,
      href: "/admin/parties",
      color: "text-purple-600",
    },
    {
      label: "Topics",
      value: topicCount,
      icon: Tag,
      href: "/admin/topics",
      color: "text-orange-600",
    },
    {
      label: "Unprocessed Tips",
      value: unprocessedTipCount,
      icon: Lightbulb,
      href: "/admin/tips",
      color: unprocessedTipCount > 0 ? "text-red-600" : "text-gray-600",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user.name || user.email}</p>
        </div>
        <Button asChild>
          <Link to="/admin/promises/new">
            <Plus className="h-4 w-4 mr-2" />
            New Promise
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.href} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <stat.icon className={cn("h-8 w-8", stat.color)} />
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/admin/promises/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Promise
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/admin/politicians/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Politician
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/admin/parties/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Party
              </Link>
            </Button>
            {unprocessedTipCount > 0 && (
              <Button asChild variant="default" className="w-full justify-start">
                <Link to="/admin/tips">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Review {unprocessedTipCount} Tips
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Promises</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/promises">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentPromises.length > 0 ? (
              <ul className="space-y-3">
                {recentPromises.map((promise) => (
                  <li key={promise.id}>
                    <Link
                      to={`/admin/promises/${promise.id}/edit`}
                      className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <p className="text-sm font-medium line-clamp-1">
                        {promise.summary}
                      </p>
                      <p className="text-xs text-gray-500">
                        {promise.politician?.name || "Unknown"} &middot;{" "}
                        {new Date(promise.createdAt).toLocaleDateString()}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">No promises yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
