import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column } from "@/components/crud/DataTable";
import { FormDialog } from "@/components/crud/FormDialog";
import { PageHeader } from "@/components/crud/PageHeader";
import { DetailSheet, DetailField } from "@/components/crud/DetailSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";

interface CostEstimation {
  cost_id: string;
  problem_id: string;
  part_cost_min: number | null;
  part_cost_max: number | null;
  labor_cost: number | null;
  total_cost_estimate: number | null;
  currency: string | null;
  problems?: { problem_code: string; problem_name: string };
}

const formatCurrency = (value: number | null, currency: string = "IDR") => {
  if (value === null) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
};

export default function CostsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CostEstimation | null>(null);
  const [selectedItem, setSelectedItem] = useState<CostEstimation | null>(null);
  const [formData, setFormData] = useState({ problem_id: "", part_cost_min: "", part_cost_max: "", labor_cost: "", currency: "IDR" });

  const { data: costs = [], isLoading } = useQuery({
    queryKey: ["costs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cost_estimation").select("*, problems(problem_code, problem_name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data as CostEstimation[];
    },
  });

  const { data: problems = [] } = useQuery({ queryKey: ["problems-list"], queryFn: async () => { const { data } = await supabase.from("problems").select("problem_id, problem_code, problem_name").order("problem_code"); return data || []; } });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const partMin = parseFloat(data.part_cost_min) || 0;
      const partMax = parseFloat(data.part_cost_max) || 0;
      const labor = parseFloat(data.labor_cost) || 0;
      const { error } = await supabase.from("cost_estimation").insert({ problem_id: data.problem_id, part_cost_min: partMin, part_cost_max: partMax, labor_cost: labor, total_cost_estimate: partMax + labor, currency: data.currency });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["costs"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const partMin = parseFloat(data.part_cost_min) || 0;
      const partMax = parseFloat(data.part_cost_max) || 0;
      const labor = parseFloat(data.labor_cost) || 0;
      const { error } = await supabase.from("cost_estimation").update({ problem_id: data.problem_id, part_cost_min: partMin, part_cost_max: partMax, labor_cost: labor, total_cost_estimate: partMax + labor, currency: data.currency }).eq("cost_id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["costs"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("cost_estimation").delete().eq("cost_id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["costs"] }); toast({ title: "Berhasil dihapus" }); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const resetForm = () => { setFormData({ problem_id: "", part_cost_min: "", part_cost_max: "", labor_cost: "", currency: "IDR" }); setEditingItem(null); setIsFormOpen(false); };

  const handleEdit = (item: CostEstimation) => {
    setEditingItem(item);
    setFormData({ problem_id: item.problem_id, part_cost_min: item.part_cost_min?.toString() || "", part_cost_max: item.part_cost_max?.toString() || "", labor_cost: item.labor_cost?.toString() || "", currency: item.currency || "IDR" });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problem_id) { toast({ variant: "destructive", title: "Error", description: "Problem wajib dipilih" }); return; }
    if (editingItem) updateMutation.mutate({ id: editingItem.cost_id, data: formData });
    else createMutation.mutate(formData);
  };

  const columns: Column<CostEstimation>[] = [
    { key: "problems", header: "Problem", render: (item) => <div><code className="text-xs bg-muted px-2 py-1 rounded">{item.problems?.problem_code}</code><p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.problems?.problem_name}</p></div> },
    { key: "part_cost_min", header: "Part (Min)", render: (item) => <span className="text-sm">{formatCurrency(item.part_cost_min, item.currency || "IDR")}</span> },
    { key: "part_cost_max", header: "Part (Max)", render: (item) => <span className="text-sm">{formatCurrency(item.part_cost_max, item.currency || "IDR")}</span> },
    { key: "labor_cost", header: "Labor", render: (item) => <span className="text-sm">{formatCurrency(item.labor_cost, item.currency || "IDR")}</span> },
    { key: "total_cost_estimate", header: "Total Est.", render: (item) => <span className="font-semibold text-primary">{formatCurrency(item.total_cost_estimate, item.currency || "IDR")}</span> },
  ];

  const getDetailFields = (item: CostEstimation): DetailField[] => [
    { label: "Problem", value: item.problems ? `${item.problems.problem_code} - ${item.problems.problem_name}` : null },
    { label: "Mata Uang", value: item.currency },
    { label: "Biaya Part (Minimum)", value: <span className="text-lg font-medium">{formatCurrency(item.part_cost_min, item.currency || "IDR")}</span> },
    { label: "Biaya Part (Maximum)", value: <span className="text-lg font-medium">{formatCurrency(item.part_cost_max, item.currency || "IDR")}</span> },
    { label: "Biaya Tenaga Kerja", value: <span className="text-lg font-medium">{formatCurrency(item.labor_cost, item.currency || "IDR")}</span> },
    { label: "Total Estimasi", value: <span className="text-2xl font-bold text-primary">{formatCurrency(item.total_cost_estimate, item.currency || "IDR")}</span>, fullWidth: true },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader title="Cost Estimation" description="Kelola estimasi biaya perbaikan" icon={<DollarSign className="h-5 w-5" />} />
      
      <DataTable 
        data={costs} 
        columns={columns} 
        isLoading={isLoading} 
        idKey="cost_id" 
        onAdd={() => setIsFormOpen(true)} 
        onEdit={handleEdit} 
        onDelete={(item) => deleteMutation.mutate(item.cost_id)}
        onRowClick={setSelectedItem}
      />

      <DetailSheet
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        title="Estimasi Biaya"
        subtitle={selectedItem?.problems?.problem_name || ""}
        fields={selectedItem ? getDetailFields(selectedItem) : []}
        badge={selectedItem ? { label: selectedItem.currency || "IDR" } : undefined}
        onEdit={selectedItem ? () => { handleEdit(selectedItem); setSelectedItem(null); } : undefined}
      />
      
      <FormDialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsFormOpen(true); }} title={editingItem ? "Edit Cost" : "Tambah Cost"} useSheet>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Problem *</Label><Select value={formData.problem_id} onValueChange={(v) => setFormData({ ...formData, problem_id: v })}><SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger><SelectContent>{problems.map((p: any) => <SelectItem key={p.problem_id} value={p.problem_id}>{p.problem_code} - {p.problem_name}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Part Cost Min</Label><Input type="number" value={formData.part_cost_min} onChange={(e) => setFormData({ ...formData, part_cost_min: e.target.value })} placeholder="0" /></div>
            <div className="space-y-2"><Label>Part Cost Max</Label><Input type="number" value={formData.part_cost_max} onChange={(e) => setFormData({ ...formData, part_cost_max: e.target.value })} placeholder="0" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Labor Cost</Label><Input type="number" value={formData.labor_cost} onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })} placeholder="0" /></div>
            <div className="space-y-2"><Label>Currency</Label><Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IDR">IDR</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select></div>
          </div>
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={resetForm}>Batal</Button><Button type="submit">{editingItem ? "Simpan" : "Tambah"}</Button></div>
        </form>
      </FormDialog>
    </div>
  );
}
