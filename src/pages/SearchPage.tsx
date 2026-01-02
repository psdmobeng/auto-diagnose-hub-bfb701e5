import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, AlertTriangle, Wrench, BookOpen, Shield, DollarSign, Cpu, Cog, TrendingUp, Clock, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { translateToKeywords } from "@/lib/searchKeywords";
import { toast } from "sonner";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [translatedKeywords, setTranslatedKeywords] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch popular searches
  const { data: popularSearches } = useQuery({
    queryKey: ["popular-searches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("search_queries")
        .select("*")
        .order("search_count", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent searches without results (for developer reference)
  const { data: noResultSearches } = useQuery({
    queryKey: ["no-result-searches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("search_queries")
        .select("*")
        .eq("has_results", false)
        .order("search_count", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Track search mutation
  const trackSearchMutation = useMutation({
    mutationFn: async ({ query, keywords, hasResults }: { query: string; keywords: string[]; hasResults: boolean }) => {
      // First try to get existing record
      const { data: existing } = await supabase
        .from("search_queries")
        .select("*")
        .ilike("original_query", query)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("search_queries")
          .update({
            search_count: existing.search_count + 1,
            has_results: hasResults,
            last_searched_at: new Date().toISOString(),
            translated_keywords: keywords,
          })
          .eq("id", existing.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("search_queries")
          .insert({
            original_query: query,
            translated_keywords: keywords,
            has_results: hasResults,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popular-searches"] });
      queryClient.invalidateQueries({ queryKey: ["no-result-searches"] });
    },
  });

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["diagnostic-search", activeSearch, translatedKeywords],
    queryFn: async () => {
      if (!activeSearch) return null;

      // Build search conditions from translated keywords
      const searchConditions = translatedKeywords.map(kw => `%${kw}%`);
      
      // Create OR conditions for each keyword
      const buildOrCondition = (fields: string[]) => {
        const conditions: string[] = [];
        searchConditions.forEach(term => {
          fields.forEach(field => {
            conditions.push(`${field}.ilike.${term}`);
          });
        });
        return conditions.join(",");
      };

      // Search across multiple tables with translated keywords
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
          .or(buildOrCondition(["problem_name", "description", "problem_code"]))
          .limit(10),
        supabase
          .from("symptoms")
          .select(`*, problems(*)`)
          .or(buildOrCondition(["symptom_description", "occurrence_condition"]))
          .limit(10),
        supabase
          .from("dtc_codes")
          .select(`*, problems(*)`)
          .or(buildOrCondition(["dtc_code", "dtc_description"]))
          .limit(10),
        supabase
          .from("sensors")
          .select(`*, problems(*)`)
          .or(buildOrCondition(["sensor_name", "failure_mode"]))
          .limit(10),
        supabase
          .from("actuators")
          .select(`*, problems(*)`)
          .or(buildOrCondition(["actuator_name", "failure_symptoms"]))
          .limit(10),
      ]);

      const results = {
        problems: problemsRes.data || [],
        symptoms: symptomsRes.data || [],
        dtcCodes: dtcRes.data || [],
        sensors: sensorsRes.data || [],
        actuators: actuatorsRes.data || [],
      };

      // Track search with results status
      const hasResults = 
        results.problems.length > 0 ||
        results.symptoms.length > 0 ||
        results.dtcCodes.length > 0 ||
        results.sensors.length > 0 ||
        results.actuators.length > 0;

      trackSearchMutation.mutate({
        query: activeSearch,
        keywords: translatedKeywords,
        hasResults,
      });

      return results;
    },
    enabled: !!activeSearch && translatedKeywords.length > 0,
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Translate natural language to keywords
    const keywords = translateToKeywords(searchQuery);
    setTranslatedKeywords(keywords);
    setActiveSearch(searchQuery);
    
    toast.info(`Mencari dengan kata kunci: ${keywords.slice(0, 5).join(", ")}${keywords.length > 5 ? "..." : ""}`);
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    const keywords = translateToKeywords(query);
    setTranslatedKeywords(keywords);
    setActiveSearch(query);
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
          Cari masalah kendaraan dengan bahasa natural - sistem akan menerjemahkan ke kata kunci teknis
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Contoh: 'mesin bergetar saat idle' atau 'AC tidak dingin' atau 'P0300'..."
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

          {translatedKeywords.length > 0 && activeSearch && (
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground">Kata kunci:</span>
              {translatedKeywords.slice(0, 8).map((kw, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {kw}
                </Badge>
              ))}
              {translatedKeywords.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{translatedKeywords.length - 8} lainnya
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popular Searches & No Result Searches */}
      {!activeSearch && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Popular Searches */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Pencarian Populer
              </CardTitle>
              <CardDescription>Klik untuk mencari langsung</CardDescription>
            </CardHeader>
            <CardContent>
              {popularSearches && popularSearches.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search: any) => (
                    <Button
                      key={search.id}
                      variant={search.has_results ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleQuickSearch(search.original_query)}
                      className="text-xs"
                    >
                      {search.original_query}
                      <Badge variant="outline" className="ml-1 text-[10px]">
                        {search.search_count}x
                      </Badge>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada pencarian</p>
              )}
            </CardContent>
          </Card>

          {/* No Result Searches - For Developer */}
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-4 w-4 text-orange-500" />
                Perlu Ditambahkan ke Database
              </CardTitle>
              <CardDescription>Pencarian yang tidak menemukan hasil</CardDescription>
            </CardHeader>
            <CardContent>
              {noResultSearches && noResultSearches.length > 0 ? (
                <div className="space-y-2">
                  {noResultSearches.map((search: any) => (
                    <div 
                      key={search.id} 
                      className="flex items-center justify-between p-2 rounded bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{search.original_query}</p>
                        <p className="text-xs text-muted-foreground">
                          Dicari {search.search_count}x • {new Date(search.last_searched_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickSearch(search.original_query)}
                      >
                        <Search className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Semua pencarian menemukan hasil</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

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
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-orange-500 mb-4" />
                  <h3 className="text-lg font-medium">Tidak ada hasil ditemukan</h3>
                  <p className="text-muted-foreground mb-4">
                    Pencarian "{activeSearch}" telah dicatat dan akan ditambahkan ke database
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Kata kunci yang dicari: {translatedKeywords.join(", ")}
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      )}

      {!activeSearch && !isLoading && popularSearches?.length === 0 && noResultSearches?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Mulai Pencarian Diagnostik</h3>
            <p className="text-muted-foreground">
              Masukkan gejala dengan bahasa natural seperti "mesin bergetar saat idle", kode DTC seperti "P0300", atau deskripsi masalah lainnya
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
