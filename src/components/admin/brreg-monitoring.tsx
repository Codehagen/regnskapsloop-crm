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
import { Progress } from "@/components/ui/progress";
import {
  Database,
  Link,
  Clock,
  AlertTriangle,
  CheckCircle,
  Building,
} from "lucide-react";

interface BrregData {
  totalBrregBusinesses: number;
  businessesWithBrreg: number;
  latestUpdate?: Date;
  dataQuality: {
    incompleteRecords: number;
    completionRate: number;
  };
  orgFormDistribution: Array<{
    orgForm: string;
    count: number;
  }>;
}

interface BrregMonitoringProps {
  data: BrregData;
}

export function BrregMonitoring({ data }: BrregMonitoringProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('nb-NO').format(num);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Aldri";
    return new Date(date).toLocaleDateString("nb-NO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const linkageRate = data.totalBrregBusinesses > 0 ? 
    Math.round((data.businessesWithBrreg / data.totalBrregBusinesses) * 100) : 0;

  const isDataFresh = data.latestUpdate ? 
    (Date.now() - new Date(data.latestUpdate).getTime()) < (7 * 24 * 60 * 60 * 1000) : false; // 7 days

  return (
    <div className="space-y-6">
      {/* BRREG Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BRREG bedrifter</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalBrregBusinesses)}</div>
            <p className="text-xs text-muted-foreground">
              Totalt i registeret
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tilknyttede bedrifter</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.businessesWithBrreg)}</div>
            <p className="text-xs text-muted-foreground">
              {linkageRate}% tilknytting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siste oppdatering</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {isDataFresh ? (
                <Badge variant="default" className="text-xs">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Fersk
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Gammel
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(data.latestUpdate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datakvalitet</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.dataQuality.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(data.dataQuality.incompleteRecords)} ufullstendige
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Details */}
      <Card>
        <CardHeader>
          <CardTitle>Datakvalitet oversikt</CardTitle>
          <CardDescription>
            Status for BRREG dataenes fullstendighet og kvalitet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fullstendige poster</span>
              <span>{data.dataQuality.completionRate}%</span>
            </div>
            <Progress 
              value={data.dataQuality.completionRate} 
              className="h-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tilknytning rate (CRM til BRREG)</span>
              <span>{linkageRate}%</span>
            </div>
            <Progress 
              value={linkageRate} 
              className="h-2"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Totale BRREG poster:</span>
                <span className="font-medium">{formatNumber(data.totalBrregBusinesses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CRM bedrifter med BRREG:</span>
                <span className="font-medium">{formatNumber(data.businessesWithBrreg)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fullstendige poster:</span>
                <span className="font-medium">
                  {formatNumber(data.totalBrregBusinesses - data.dataQuality.incompleteRecords)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ufullstendige poster:</span>
                <span className="font-medium">{formatNumber(data.dataQuality.incompleteRecords)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Form Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Organisasjonsformer</CardTitle>
          <CardDescription>
            Fordeling av selskapsformer i BRREG-registeret
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisasjonsform</TableHead>
                <TableHead className="text-right">Antall</TableHead>
                <TableHead className="text-right">Andel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.orgFormDistribution.map((orgForm, index) => {
                const percentage = data.totalBrregBusinesses > 0 ? 
                  Math.round((orgForm.count / data.totalBrregBusinesses) * 100 * 10) / 10 : 0;
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">
                        {orgForm.orgForm || "Ukjent"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(orgForm.count)}
                    </TableCell>
                    <TableCell className="text-right">
                      {percentage}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sync Status and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Synkroniseringsstatus</CardTitle>
          <CardDescription>
            Overvåkning av BRREG dataintegrasjon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Siste import</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(data.latestUpdate)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {isDataFresh ? (
                  <Badge variant="default">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Oppdatert
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Trenger oppdatering
                  </Badge>
                )}
              </div>
            </div>

            {!isDataFresh && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-800">
                    BRREG-dataene er utdaterte
                  </p>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Vurder å kjøre en ny import for å få de nyeste bedriftsdataene.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}