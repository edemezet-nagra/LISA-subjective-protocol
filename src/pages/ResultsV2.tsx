// Copyright (c) 2026 Nagravision SARL
import { useEffect, useState, useMemo } from "react";
import { ProtocolV2Result } from "@/types/protocolV2";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

type SortDirection = "asc" | "desc" | null;
type SortKey =
  | "timestamp"
  | "candidateId"
  | "imageId"
  | "globalScore"
  | "duration";

function SortIcon({
  column,
  sortKey,
  direction,
}: {
  column: SortKey;
  sortKey: SortKey | null;
  direction: SortDirection;
}) {
  if (sortKey !== column || direction === null)
    return <ChevronsUpDown className="inline ml-1 w-3 h-3 opacity-40" />;
  if (direction === "asc") return <ChevronUp className="inline ml-1 w-3 h-3" />;
  return <ChevronDown className="inline ml-1 w-3 h-3" />;
}

interface LiveStatus {
  phase: string;
  currentImageIndex: number;
  totalImages: number | string;
  lastUpdate: string;
}

export default function ResultsV2() {
  const [results, setResults] = useState<ProtocolV2Result[]>([]);
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else if (sortDirection === "desc") {
      setSortKey(null);
      setSortDirection(null);
    } else {
      setSortDirection("asc");
    }
  };

  const sortedResults = useMemo(() => {
    if (!sortKey || !sortDirection) return [...results].reverse();
    return [...results].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      switch (sortKey) {
        case "timestamp":
          aVal = new Date(a.timestamp).getTime();
          bVal = new Date(b.timestamp).getTime();
          break;
        case "candidateId":
          aVal = a.candidateId ?? "";
          bVal = b.candidateId ?? "";
          break;
        case "imageId":
          aVal = a.imageId ?? "";
          bVal = b.imageId ?? "";
          break;
        case "globalScore":
          aVal = a.globalScore ?? 0;
          bVal = b.globalScore ?? 0;
          break;
        case "duration":
          aVal = a.duration ?? 0;
          bVal = b.duration ?? 0;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [results, sortKey, sortDirection]);

  useEffect(() => {
    const loadData = () => {
      const storedResults = localStorage.getItem("protocolV2_live_results");
      if (storedResults) {
        try {
          setResults(JSON.parse(storedResults));
        } catch (e) {
          console.error("Failed to parse results", e);
        }
      }

      const storedStatus = localStorage.getItem("protocolV2_live_status");
      if (storedStatus) {
        try {
          setStatus(JSON.parse(storedStatus));
        } catch (e) {
          console.error("Failed to parse status", e);
        }
      }
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LISA Live Results</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of validation sessions
          </p>
        </div>
        {status && (
          <div className="flex gap-4">
            <Badge variant="outline" className="text-lg py-1">
              Index: {status.currentImageIndex}
            </Badge>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Processed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("timestamp")}
                >
                  Time{" "}
                  <SortIcon
                    column="timestamp"
                    sortKey={sortKey}
                    direction={sortDirection}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("candidateId")}
                >
                  Candidate{" "}
                  <SortIcon
                    column="candidateId"
                    sortKey={sortKey}
                    direction={sortDirection}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("imageId")}
                >
                  Image ID{" "}
                  <SortIcon
                    column="imageId"
                    sortKey={sortKey}
                    direction={sortDirection}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("globalScore")}
                >
                  Global Score{" "}
                  <SortIcon
                    column="globalScore"
                    sortKey={sortKey}
                    direction={sortDirection}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("duration")}
                >
                  Duration{" "}
                  <SortIcon
                    column="duration"
                    sortKey={sortKey}
                    direction={sortDirection}
                  />
                </TableHead>
                <TableHead>Mask Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedResults.map((result, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>{result.candidateId || "-"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {result.imageId}
                  </TableCell>

                  <TableCell>
                    {result.globalScore !== undefined &&
                    result.globalScore !== null ? (
                      result.globalScore
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>{(result.duration / 1000).toFixed(1)}s</TableCell>
                  <TableCell>
                    {result.maskData ? (
                      <div className="w-16 h-16 bg-neutral-100 border rounded overflow-hidden">
                        <img
                          src={result.maskData}
                          alt="Mask"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        No Mask
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {results.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No results recorded yet for this session.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
