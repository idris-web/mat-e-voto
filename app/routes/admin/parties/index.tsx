import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/lib/db.server";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Plus, Search, Edit, Users, FileText } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Manage Parties - Premtimet" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("q");

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { shortName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const parties = await db.party.findMany({
    where,
    orderBy: { shortName: "asc" },
    include: {
      _count: {
        select: { politicians: true, promises: true },
      },
    },
  });

  return { parties };
}

export default function AdminParties({ loaderData }: Route.ComponentProps) {
  const { parties } = loaderData;
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
        <h1 className="text-2xl font-bold">Parties ({parties.length})</h1>
        <Button asChild>
          <Link to="/admin/parties/new">
            <Plus className="h-4 w-4 mr-2" />
            New Party
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
            placeholder="Search parties..."
            defaultValue={searchParams.get("q") || ""}
            className="pl-10"
          />
        </div>
      </form>

      {/* Parties Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Party</th>
                  <th className="text-left p-4 font-medium">Short Name</th>
                  <th className="text-left p-4 font-medium">Color</th>
                  <th className="text-left p-4 font-medium">Politicians</th>
                  <th className="text-left p-4 font-medium">Promises</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {parties.map((party) => (
                  <tr key={party.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {party.logoUrl ? (
                          <img
                            src={party.logoUrl}
                            alt={party.shortName}
                            className="h-8 w-8 rounded object-contain"
                          />
                        ) : (
                          <div
                            className="h-8 w-8 rounded flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: party.color }}
                          >
                            {party.shortName.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{party.name}</p>
                          <p className="text-sm text-gray-500">{party.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{party.shortName}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 w-6 rounded border"
                          style={{ backgroundColor: party.color }}
                        />
                        <span className="text-sm text-gray-500">{party.color}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{party._count.politicians}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>{party._count.promises}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="icon">
                          <Link to={`/admin/parties/${party.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {parties.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No parties found
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
