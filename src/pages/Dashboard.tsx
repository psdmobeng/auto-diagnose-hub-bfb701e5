import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  AlertTriangle,
  Stethoscope,
  Code,
  Cpu,
  Cog,
  Layers,
  Wrench,
  BookOpen,
  Hammer,
  GitBranch,
  Shield,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  trend?: string;
  color?: string;
}

function StatCard({ title, value, description, icon: Icon, trend, color = "primary" }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="text-xs text-success font-medium">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  // Fetch counts from all tables
  const { data: vehicleCount = 0 } = useQuery({
    queryKey: ["vehicleCount"],
    queryFn: async () => {
      const { count } = await supabase.from("vehicle_models").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: problemCount = 0 } = useQuery({
    queryKey: ["problemCount"],
    queryFn: async () => {
      const { count } = await supabase.from("problems").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: symptomCount = 0 } = useQuery({
    queryKey: ["symptomCount"],
    queryFn: async () => {
      const { count } = await supabase.from("symptoms").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: dtcCount = 0 } = useQuery({
    queryKey: ["dtcCount"],
    queryFn: async () => {
      const { count } = await supabase.from("dtc_codes").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: sensorCount = 0 } = useQuery({
    queryKey: ["sensorCount"],
    queryFn: async () => {
      const { count } = await supabase.from("sensors").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: actuatorCount = 0 } = useQuery({
    queryKey: ["actuatorCount"],
    queryFn: async () => {
      const { count } = await supabase.from("actuators").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: partsCount = 0 } = useQuery({
    queryKey: ["partsCount"],
    queryFn: async () => {
      const { count } = await supabase.from("parts_factors").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: solutionCount = 0 } = useQuery({
    queryKey: ["solutionCount"],
    queryFn: async () => {
      const { count } = await supabase.from("solutions").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: theoryCount = 0 } = useQuery({
    queryKey: ["theoryCount"],
    queryFn: async () => {
      const { count } = await supabase.from("technical_theory").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: toolCount = 0 } = useQuery({
    queryKey: ["toolCount"],
    queryFn: async () => {
      const { count } = await supabase.from("tools").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: relationCount = 0 } = useQuery({
    queryKey: ["relationCount"],
    queryFn: async () => {
      const { count } = await supabase.from("problem_relations").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: safetyCount = 0 } = useQuery({
    queryKey: ["safetyCount"],
    queryFn: async () => {
      const { count } = await supabase.from("safety_precautions").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: costCount = 0 } = useQuery({
    queryKey: ["costCount"],
    queryFn: async () => {
      const { count } = await supabase.from("cost_estimation").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  // Fetch recent problems
  const { data: recentProblems = [] } = useQuery({
    queryKey: ["recentProblems"],
    queryFn: async () => {
      const { data } = await supabase
        .from("problems")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const totalRecords = vehicleCount + problemCount + symptomCount + dtcCount + sensorCount + 
    actuatorCount + partsCount + solutionCount + theoryCount + toolCount + relationCount + 
    safetyCount + costCount;

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview sistem database diagnostik kendaraan
        </p>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 text-sm font-medium">Total Records</p>
              <p className="text-4xl font-bold mt-1">{totalRecords.toLocaleString()}</p>
              <p className="text-primary-foreground/60 text-sm mt-2">
                Across 13 master tables
              </p>
            </div>
            <div className="p-4 bg-primary-foreground/10 rounded-full">
              <Activity className="h-10 w-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Vehicle Models"
          value={vehicleCount}
          description="Merek & model kendaraan"
          icon={Car}
          color="primary"
        />
        <StatCard
          title="Problems"
          value={problemCount}
          description="Masalah terdaftar"
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard
          title="Symptoms"
          value={symptomCount}
          description="Gejala kerusakan"
          icon={Stethoscope}
          color="accent"
        />
        <StatCard
          title="DTC Codes"
          value={dtcCount}
          description="Kode diagnostik"
          icon={Code}
          color="success"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Sensors"
          value={sensorCount}
          description="Data sensor"
          icon={Cpu}
          color="accent"
        />
        <StatCard
          title="Actuators"
          value={actuatorCount}
          description="Data aktuator"
          icon={Cog}
          color="primary"
        />
        <StatCard
          title="Parts & Factors"
          value={partsCount}
          description="Komponen terkait"
          icon={Layers}
          color="warning"
        />
        <StatCard
          title="Solutions"
          value={solutionCount}
          description="Langkah perbaikan"
          icon={Wrench}
          color="success"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Technical Theory"
          value={theoryCount}
          description="Penjelasan teknis"
          icon={BookOpen}
          color="primary"
        />
        <StatCard
          title="Tools Required"
          value={toolCount}
          description="Alat yang dibutuhkan"
          icon={Hammer}
          color="accent"
        />
        <StatCard
          title="Problem Relations"
          value={relationCount}
          description="Relasi antar masalah"
          icon={GitBranch}
          color="warning"
        />
        <StatCard
          title="Safety Precautions"
          value={safetyCount}
          description="Peringatan keselamatan"
          icon={Shield}
          color="destructive"
        />
      </div>

      {/* Recent Problems */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Recent Problems
          </CardTitle>
          <CardDescription>Masalah yang baru ditambahkan</CardDescription>
        </CardHeader>
        <CardContent>
          {recentProblems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Belum ada data masalah. Tambahkan data baru melalui menu Problems.
            </p>
          ) : (
            <div className="space-y-4">
              {recentProblems.map((problem: any) => (
                <div
                  key={problem.problem_id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="font-mono">
                      {problem.problem_code}
                    </Badge>
                    <div>
                      <p className="font-medium">{problem.problem_name}</p>
                      <p className="text-sm text-muted-foreground">{problem.system_category}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      problem.severity_level === "Critical"
                        ? "severity-critical"
                        : problem.severity_level === "High"
                        ? "severity-high"
                        : problem.severity_level === "Medium"
                        ? "severity-medium"
                        : "severity-low"
                    }
                    variant="outline"
                  >
                    {problem.severity_level}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
