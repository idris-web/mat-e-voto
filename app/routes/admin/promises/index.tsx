import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/lib/db.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { PromiseStatusBadge } from "~/components/promises/promise-status-badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { formatShortDate } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Manage Promises - Premtimet" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("q");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 20;

  const where = search
    ? {
        OR: [
          { summary: { contains: search, mode: "insensitive" as const } },
          { politician: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [promises, totalCount] = await Promise.all([
    db.promise.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        politician: true,
        topic: true,
      },
    }),
    db.promise.count({ where }),
  ]);

  return { promises, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) };
}

export default function AdminPromises({ loaderData }: Route.ComponentProps) {
  const { promises, totalCount, currentPage, totalPages } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    setSearchParams(q ? { q } : {});
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Promises ({totalCount})</h1>
        <Button asChild>
          <Link to="/admin/promises/new">
            <Plus className="h-4 w-4 mr-2" />
            New Promise
          </Link>
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            name="q"
            type="search"
            placeholder="Search promises..."
            defaultValue={searchParams.get("q") || ""}
            className="pl-10"
          />
        </div>
      </form>

      {/* Promises Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Promise</th>
                  <th className="text-left p-4 font-medium">Politician</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Topic</th>
                  <th className="text-left p-4 font-medium">Created</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {promises.map((promise) => (
                  <tr key={promise.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="p-4">
                      <p className="font-medium line-clamp-2 max-w-sm">{promise.summary}</p>
                    </td>
                    <td className="p-4">
                      {promise.politician?.name || "-"}
                    </td>
                    <td className="p-4">
                      <PromiseStatusBadge status={promise.status} size="sm" />
                    </td>
                    <td className="p-4">
                      {promise.topic && (
                        <Badge variant="secondary">
                          {promise.topic.icon} {promise.topic.name}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {formatShortDate(promise.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="icon">
                          <Link to={`/admin/promises/${promise.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {promises.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No promises found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("page", String(currentPage - 1));
              setSearchParams(params);
            }}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("page", String(currentPage + 1));
              setSearchParams(params);
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
