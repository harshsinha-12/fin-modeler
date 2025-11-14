import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Users, Calendar } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">+20.1%</span>
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Burn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28,450</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
              <span className="text-red-500">+12.5%</span>
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cash Runway</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.3 months</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <ArrowDownRight className="mr-1 h-3 w-3 text-orange-500" />
              <span className="text-orange-500">-2.1 months</span>
              <span className="ml-1">from last projection</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 people</div>
            <p className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">+3</span>
              <span className="ml-1">from last quarter</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>MRR Growth</CardTitle>
            <CardDescription>Monthly recurring revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              [Chart: MRR growth line chart would go here using recharts]
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cash & Burn</CardTitle>
            <CardDescription>Cash balance and monthly burn rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              [Chart: Dual-axis chart for cash and burn would go here]
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenarios & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Scenarios</CardTitle>
            <CardDescription>Compare different financial projections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Base Case", "Optimistic", "Pessimistic"].map((scenario) => (
                <div
                  key={scenario}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{scenario}</p>
                    <p className="text-sm text-muted-foreground">
                      24 month projection • Last updated 2 days ago
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              Create New Company
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Run Projections
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Export to Excel
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Ask AI Assistant
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
