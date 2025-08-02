"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Building,
  TrendingUp,
  Activity,
  Mail,
  CheckCircle,
  DollarSign,
  Target,
  Calendar,
  Briefcase,
} from "lucide-react";

interface SystemAnalyticsData {
  // Basic metrics
  totalUsers: number;
  totalWorkspaces: number;
  totalBusinesses: number;
  totalLeads: number;
  totalCustomers: number;
  totalActivities: number;
  totalOffers: number;
  totalEmails: number;
  totalTasks: number;
  totalJobApplications: number;
  
  // Growth metrics
  recentUsers: number;
  activeWorkspaces: number;
  conversionRate: number;
  
  // Financial metrics
  totalPotentialValue: number;
  totalAcceptedOffersValue: number;
  acceptedOffersCount: number;
  
  // Distribution stats
  industryStats: Array<{ industry: string; count: number }>;
  municipalityStats: Array<{ municipality: string; count: number }>;
  
  // Growth trends
  businessGrowth: Array<{ createdAt: Date; _count: number }>;
}

interface SystemAnalyticsProps {
  data: SystemAnalyticsData;
}

export function SystemAnalytics({ data }: SystemAnalyticsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('nb-NO').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totalt antall brukere</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">
              +{data.recentUsers} siste 30 dager
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arbeidsområder</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalWorkspaces)}</div>
            <p className="text-xs text-muted-foreground">
              {data.activeWorkspaces} aktive siste 30 dager
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totalt antall bedrifter</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalBusinesses)}</div>
            <p className="text-xs text-muted-foreground">
              {data.totalLeads} leads, {data.totalCustomers} kunder
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Konverteringsrate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Lead til kunde konvertering
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktiviteter</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalActivities)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-poster</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalEmails)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oppgaver</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalTasks)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobbsøknader</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalJobApplications)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potensiell verdi (leads)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalPotentialValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aksepterte tilbud</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalAcceptedOffersValue)}</div>
            <p className="text-xs text-muted-foreground">
              {data.acceptedOffersCount} tilbud
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale tilbud</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalOffers)}</div>
            <p className="text-xs text-muted-foreground">
              {data.acceptedOffersCount > 0 ? 
                Math.round((data.acceptedOffersCount / data.totalOffers) * 100) : 0}% akseptert
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Industry Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Industri fordeling</CardTitle>
            <CardDescription>
              Top 10 næringskoder blant bedrifter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Næringskode</TableHead>
                  <TableHead className="text-right">Antall</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.industryStats.slice(0, 10).map((stat, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {stat.industry}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(stat.count)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Municipality Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geografisk fordeling</CardTitle>
            <CardDescription>
              Top 10 kommuner blant bedrifter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>By/Kommune</TableHead>
                  <TableHead className="text-right">Antall</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.municipalityStats.slice(0, 10).map((stat, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {stat.municipality}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(stat.count)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}