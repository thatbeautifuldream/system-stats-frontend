import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { ModeToggle } from "./components/mode-toggle";

interface SystemStats {
  cpuUsage: number;
  memUsage: number;
  diskUsage: number;
  netTraffic: number;
  processes: Process[];
}

interface Process {
  pid: number;
  name: string;
  cpuPercent: number;
  memoryUsage: number;
}

function App() {
  const [stats, setStats] = useState<SystemStats>({
    cpuUsage: 0,
    memUsage: 0,
    diskUsage: 0,
    netTraffic: 0,
    processes: [],
  });

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("stats", (e) => {
      const newStats = JSON.parse(e.data);
      setStats(newStats);
    });

    eventSource.addEventListener("error", (e) => {
      console.error("SSE Error:", e);
    });

    return () => eventSource.close();
  }, []);

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 font-mono">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">System Monitor</h1>
        <ModeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.cpuUsage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.memUsage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.diskUsage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Network Traffic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatBytes(stats.netTraffic)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Processes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">PID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>CPU %</TableHead>
                  <TableHead>Memory (MB)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.processes
                  .sort((a, b) => b.cpuPercent - a.cpuPercent)
                  .map((process) => (
                    <TableRow key={process.pid}>
                      <TableCell>{process.pid}</TableCell>
                      <TableCell>{process.name}</TableCell>
                      <TableCell>{process.cpuPercent.toFixed(1)}%</TableCell>
                      <TableCell>{process.memoryUsage.toFixed(1)} MB</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
