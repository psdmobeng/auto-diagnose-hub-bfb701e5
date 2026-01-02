import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, AlertTriangle, Wrench, BookOpen, Shield, DollarSign, Cpu, Cog } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["diagnostic-search", activeSearch],
    queryFn: async () => {
      if (!activeSearch) return null;

      const searchTerm = `%${activeSearch}%`;

      // Search across multiple tables
      const [problemsRes, symptomsRes, dtcRes, sensorsRes, actuatorsRes] = await Promise.all([
        supabase
          .from("problems")
          .select(`
            *,
            symptoms(*),
            solutions(*, tools(*)),
            dtc_codes(*),
            sensors(*),
            actuators(*),
            parts_factors(*),
            technical_theory(*),
            safety_precautions(*),
            cost_estimation(*)
          `)
          .or(`problem_name.ilike.${searchTerm},description.ilike.${searchTerm},problem_code.ilike.${searchTerm}`)
          .limit(10),
        supabase
          .from("symptoms")
          .select(`*, problems(*)`)
          .or(`symptom_description.ilike.${searchTerm},occurrence_condition.ilike.${searchTerm}`)
          .limit(10),
        supabase
          .from("dtc_codes")
          .select(`*, problems(*)`)
          .or(`dtc_code.ilike.${searchTerm},dtc_description.ilike.${searchTerm}`)
          .limit(10),
        supabase
          .from("sensors")
          .select(`*, problems(*)`)
          .or(`sensor_name.ilike.${searchTerm},failure_mode.ilike.${searchTerm}`)
          .limit(10),
        supabase
          .from("actuators")
          .select(`*, problems(*)`)
          .or(`actuator_name.ilike.${searchTerm},failure_symptoms.ilike.${searchTerm}`)
          .limit(10),
      ]);

      return {
        problems: problemsRes.data || [],
        symptoms: symptomsRes.data || [],
        dtcCodes: dtcRes.data || [],
        sensors: sensorsRes.data || [],
        actuators: actuatorsRes.data || [],
      };
    },
    enabled: !!activeSearch,
  });

  const handleSearch = () => {
    setActiveSearch(searchQuery);
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case "Critical": return "destructive";
      case "High": return "destructive";
      case "Medium": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Diagnostic Search</h1>
        <p className="text-muted-foreground mt-1">
          Cari masalah kendaraan berdasarkan gejala, kode DTC, atau deskripsi masalah
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Masukkan gejala, kode DTC, atau deskripsi masalah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Cari
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchResults && (
        <div className="space-y-6">
          {/* Problems Results */}
          {searchResults.problems.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Masalah Ditemukan ({searchResults.problems.length})
              </h2>
              {searchResults.problems.map((problem: any) => (
                <Card key={problem.problem_id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {problem.problem_code}
                          <Badge variant={getSeverityColor(problem.severity_level)}>
                            {problem.severity_level}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          {problem.problem_name}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{problem.system_category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {problem.description && (
                      <p className="text-sm text-muted-foreground">{problem.description}</p>
                    )}

                    {/* Symptoms */}
                    {problem.symptoms?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Gejala:</h4>
                        <div className="flex flex-wrap gap-2">
                          {problem.symptoms.map((s: any) => (
                            <Badge key={s.symptom_id} variant="secondary">
                              {s.symptom_description}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DTC Codes */}
                    {problem.dtc_codes?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Kode DTC:</h4>
                        <div className="flex flex-wrap gap-2">
                          {problem.dtc_codes.map((d: any) => (
                            <Badge key={d.dtc_id} variant="outline" className="font-mono">
                              {d.dtc_code}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Solutions */}
                    {problem.solutions?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Langkah Solusi:
                        </h4>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          {problem.solutions
                            .sort((a: any, b: any) => a.step_order - b.step_order)
                            .map((s: any) => (
                              <li key={s.solution_id}>{s.solution_step}</li>
                            ))}
                        </ol>
                      </div>
                    )}

                    {/* Technical Theory */}
                    {problem.technical_theory?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Teori Teknis:
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {problem.technical_theory[0].technical_explanation}
                        </p>
                      </div>
                    )}

                    {/* Safety */}
                    {problem.safety_precautions?.length > 0 && (
                      <div className="bg-destructive/10 p-3 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2 text-destructive">
                          <Shield className="h-4 w-4" />
                          Peringatan Keselamatan:
                        </h4>
                        <p className="text-sm">{problem.safety_precautions[0].safety_description}</p>
                      </div>
                    )}

                    {/* Cost */}
                    {problem.cost_estimation?.length > 0 && (
                      <div className="bg-muted p-3 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Estimasi Biaya:
                        </h4>
                        <p className="text-sm">
                          Total: Rp {problem.cost_estimation[0].total_cost_estimate?.toLocaleString("id-ID")}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Sensors Results */}
          {searchResults.sensors.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                Sensor Terkait ({searchResults.sensors.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {searchResults.sensors.map((sensor: any) => (
                  <Card key={sensor.sensor_id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{sensor.sensor_name}</CardTitle>
                      <CardDescription>
                        Lokasi: {sensor.sensor_location || "-"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm"><strong>Failure Mode:</strong> {sensor.failure_mode || "-"}</p>
                      <p className="text-sm mt-1"><strong>Testing:</strong> {sensor.testing_method || "-"}</p>
                      {sensor.problems && (
                        <Badge className="mt-2" variant="outline">
                          {sensor.problems.problem_name}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Actuators Results */}
          {searchResults.actuators.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Cog className="h-5 w-5 text-primary" />
                Aktuator Terkait ({searchResults.actuators.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {searchResults.actuators.map((actuator: any) => (
                  <Card key={actuator.actuator_id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{actuator.actuator_name}</CardTitle>
                      <CardDescription>
                        Tipe: {actuator.actuator_type || "-"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm"><strong>Failure Symptoms:</strong> {actuator.failure_symptoms || "-"}</p>
                      <p className="text-sm mt-1"><strong>Testing:</strong> {actuator.testing_procedure || "-"}</p>
                      {actuator.problems && (
                        <Badge className="mt-2" variant="outline">
                          {actuator.problems.problem_name}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* DTC Results */}
          {searchResults.dtcCodes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Kode DTC Ditemukan ({searchResults.dtcCodes.length})</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.dtcCodes.map((dtc: any) => (
                  <Card key={dtc.dtc_id}>
                    <CardHeader>
                      <CardTitle className="font-mono">{dtc.dtc_code}</CardTitle>
                      <CardDescription>{dtc.dtc_type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{dtc.dtc_description}</p>
                      {dtc.problems && (
                        <Badge className="mt-2" variant="outline">
                          {dtc.problems.problem_name}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchResults.problems.length === 0 &&
            searchResults.symptoms.length === 0 &&
            searchResults.dtcCodes.length === 0 &&
            searchResults.sensors.length === 0 &&
            searchResults.actuators.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Tidak ada hasil ditemukan</h3>
                  <p className="text-muted-foreground">
                    Coba kata kunci lain atau periksa ejaan Anda
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      )}

      {!activeSearch && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Mulai Pencarian Diagnostik</h3>
            <p className="text-muted-foreground">
              Masukkan gejala seperti "mesin bergetar", kode DTC seperti "P0300", atau deskripsi masalah
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
