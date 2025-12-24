import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/lib/db.server";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Plus, Search, Edit, Users } from "lucide-react";
import { getInitials } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Manage Politicians - Premtimet" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("q");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 20;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { party: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [politicians, totalCount] = await Promise.all([
    db.politician.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        party: true,
        _count: { select: { promises: true } },
      },
    }),
    db.politician.count({ where }),
  ]);

  return { politicians, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) };
}

export default function AdminPoliticians({ loaderData }: Route.ComponentProps) {
  const { politicians, totalCount, currentPage, totalPages } = loaderData;
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
        <h1 className="text-2xl font-bold">Politicians ({totalCount})</h1>
        <Button asChild>
          <Link to="/admin/politicians/new">
            <Plus className="h-4 w-4 mr-2" />
            New Politician
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
            placeholder="Search politicians..."
            defaultValue={searchParams.get("q") || ""}
            className="pl-10"
          />
        </div>
      </form>

      {/* Politicians Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Politician</th>
                  <th className="text-left p-4 font-medium">Party</th>
                  <th className="text-left p-4 font-medium">Position</th>
                  <th className="text-left p-4 font-medium">Promises</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {politicians.map((politician) => (
                  <tr key={politician.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={politician.photoUrl || undefined} />
                          <AvatarFallback>{getInitials(politician.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{politician.name}</p>
                          {politician.slug && (
                            <p className="text-sm text-gray-500">{politician.slug}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {politician.party ? (
                        <Badge variant="secondary">{politician.party.shortName}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      {politician.currentPosition || "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{politician._count.promises}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={politician.isActive ? "default" : "secondary"}>
                        {politician.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="icon">
                          <Link to={`/admin/politicians/${politician.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {politicians.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No politicians found
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
