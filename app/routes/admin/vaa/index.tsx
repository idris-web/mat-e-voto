import { Link } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/lib/db.server";
import { requireEditor } from "~/lib/auth.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { FileText, Building, Settings, Plus, ArrowRight } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Voting Advice - Admin - Premtimet" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireEditor(request);

  const [statements, parties, positions] = await Promise.all([
    db.statement.findMany({
      include: { topic: true },
    }),
    db.party.findMany({
      orderBy: { name: "asc" },
    }),
    db.partyPosition.findMany(),
  ]);

  const activeStatements = statements.filter((s) => s.isActive);
  const totalPossiblePositions = statements.length * parties.length;
  const positionCoverage =
    totalPossiblePositions > 0
      ? Math.round((positions.length / totalPossiblePositions) * 100)
      : 0;

  // Calculate coverage per party
  const partyCoverage = parties.map((party) => {
    const partyPositions = positions.filter((p) => p.partyId === party.id);
    const coverage =
      statements.length > 0
        ? Math.round((partyPositions.length / statements.length) * 100)
        : 0;
    return {
      ...party,
      positionCount: partyPositions.length,
      coverage,
    };
  });

  return {
    totalStatements: statements.length,
    activeStatements: activeStatements.length,
    totalParties: parties.length,
    totalPositions: positions.length,
    positionCoverage,
    partyCoverage,
  };
}

export default function AdminVAADashboard({ loaderData }: Route.ComponentProps) {
  const {
    totalStatements,
    activeStatements,
    totalParties,
    totalPositions,
    positionCoverage,
    partyCoverage,
  } = loaderData;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Voting Advice Application</h1>
          <p className="text-gray-500 mt-1">
            Manage statements and party positions for the voting advice tool
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStatements}</p>
                <p className="text-sm text-gray-500">Total Statements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeStatements}</p>
                <p className="text-sm text-gray-500">Active Statements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalParties}</p>
                <p className="text-sm text-gray-500">Parties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Settings className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{positionCoverage}%</p>
                <p className="text-sm text-gray-500">Position Coverage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Statements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Create and manage political statements for the questionnaire.
              Aim for 30-40 statements across all topics.
            </p>
            <div className="flex gap-2">
              <Link to="/admin/vaa/statements/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Statement
                </Button>
              </Link>
              <Link to="/admin/vaa/statements">
                <Button variant="outline">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Party Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Set each party's position (Agree/Neutral/Disagree) on every
              statement to enable accurate matching.
            </p>
            <Link to="/admin/vaa/positions">
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Manage Positions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Party Coverage */}
      <Card>
        <CardHeader>
          <CardTitle>Position Coverage by Party</CardTitle>
        </CardHeader>
        <CardContent>
          {partyCoverage.length === 0 ? (
            <p className="text-gray-500">No parties found. Add parties first.</p>
          ) : (
            <div className="space-y-4">
              {partyCoverage.map((party) => (
                <div key={party.id} className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: party.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate">
                        {party.shortName} - {party.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {party.positionCount}/{totalStatements} ({party.coverage}%)
                      </span>
                    </div>
                    <Progress value={party.coverage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
