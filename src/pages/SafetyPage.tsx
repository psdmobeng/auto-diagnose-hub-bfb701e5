import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column, SeverityBadge } from "@/components/crud/DataTable";
import { FormDialog } from "@/components/crud/FormDialog";
import { PageHeader } from "@/components/crud/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";

interface SafetyPrecaution {
  safety_id: string;
  problem_id: string;
  precaution_type: string | null;
  warning_level: string | null;
  safety_description: string;
  ppe_required: string | null;
  hazard_type: string | null;
  emergency_procedure: string | null;
  problems?: { problem_code: string; problem_name: string };
}

const warningLevels = ["Caution", "Warning", "Danger"];
const precautionTypes = ["Mechanic Safety", "Vehicle Safety", "Environmental"];
const hazardTypes = ["Electrical", "Chemical", "Mechanical", "High Temperature", "Fire/Explosion", "Pressure", "Cold/Chemical"];

export default function SafetyPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SafetyPrecaution | null>(null);
  const [formData, setFormData] = useState({ problem_id: "", precaution_type: "", warning_level: "Caution", safety_description: "", ppe_required: "", hazard_type: "", emergency_procedure: "" });

  const { data: safetyItems = [], isLoading } = useQuery({
    queryKey: ["safety"],
    queryFn: async () => {
      const { data, error } = await supabase.from("safety_precautions").select("*, problems(problem_code, problem_name)").order("warning_level");
      if (error) throw error;
      return data as SafetyPrecaution[];
    },
  });

  const { data: problems = [] } = useQuery({ queryKey: ["problems-list"], queryFn: async () => { const { data } = await supabase.from("problems").select("problem_id, problem_code, problem_name").order("problem_code"); return data || []; } });

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const { error } = await supabase.from("safety_precautions").insert({ ...data, warning_level: data.warning_level as any }); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["safety"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const { error } = await supabase.from("safety_precautions").update({ ...data, warning_level: data.warning_level as any }).eq("safety_id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["safety"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("safety_precautions").delete().eq("safety_id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["safety"] }); toast({ title: "Berhasil dihapus" }); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const resetForm = () => { setFormData({ problem_id: "", precaution_type: "", warning_level: "Caution", safety_description: "", ppe_required: "", hazard_type: "", emergency_procedure: "" }); setEditingItem(null); setIsFormOpen(false); };

  const handleEdit = (item: SafetyPrecaution) => {
    setEditingItem(item);
    setFormData({ problem_id: item.problem_id, precaution_type: item.precaution_type || "", warning_level: item.warning_level || "Caution", safety_description: item.safety_description, ppe_required: item.ppe_required || "", hazard_type: item.hazard_type || "", emergency_procedure: item.emergency_procedure || "" });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problem_id || !formData.safety_description.trim()) { toast({ variant: "destructive", title: "Error", description: "Problem dan Description wajib diisi" }); return; }
    if (editingItem) updateMutation.mutate({ id: editingItem.safety_id, data: formData });
    else createMutation.mutate(formData);
  };

  const columns: Column<SafetyPrecaution>[] = [
    { key: "warning_level", header: "Level", render: (item) => <SeverityBadge level={item.warning_level === "Danger" ? "Critical" : item.warning_level === "Warning" ? "High" : "Medium"} /> },
    { key: "problems", header: "Problem", render: (item) => <code className="text-xs bg-muted px-2 py-1 rounded">{item.problems?.problem_code}</code> },
    { key: "safety_description", header: "Deskripsi", render: (item) => <span className="line-clamp-2">{item.safety_description}</span> },
    { key: "hazard_type", header: "Hazard", className: "hidden md:table-cell" },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader title="Safety Precautions" description="Kelola peringatan keselamatan" icon={<Shield className="h-5 w-5" />} />
      <DataTable data={safetyItems} columns={columns} isLoading={isLoading} idKey="safety_id" onAdd={() => setIsFormOpen(true)} onEdit={handleEdit} onDelete={(item) => deleteMutation.mutate(item.safety_id)} />
      
      <FormDialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsFormOpen(true); }} title={editingItem ? "Edit Safety" : "Tambah Safety"} useSheet>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Problem *</Label><Select value={formData.problem_id} onValueChange={(v) => setFormData({ ...formData, problem_id: v })}><SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger><SelectContent>{problems.map((p: any) => <SelectItem key={p.problem_id} value={p.problem_id}>{p.problem_code} - {p.problem_name}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Warning Level</Label><Select value={formData.warning_level} onValueChange={(v) => setFormData({ ...formData, warning_level: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{warningLevels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Precaution Type</Label><Select value={formData.precaution_type} onValueChange={(v) => setFormData({ ...formData, precaution_type: v })}><SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger><SelectContent>{precautionTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label>Deskripsi Keselamatan *</Label><Textarea value={formData.safety_description} onChange={(e) => setFormData({ ...formData, safety_description: e.target.value })} rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Hazard Type</Label><Select value={formData.hazard_type} onValueChange={(v) => setFormData({ ...formData, hazard_type: v })}><SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger><SelectContent>{hazardTypes.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>PPE Required</Label><Input value={formData.ppe_required} onChange={(e) => setFormData({ ...formData, ppe_required: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Emergency Procedure</Label><Textarea value={formData.emergency_procedure} onChange={(e) => setFormData({ ...formData, emergency_procedure: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={resetForm}>Batal</Button><Button type="submit">{editingItem ? "Simpan" : "Tambah"}</Button></div>
        </form>
      </FormDialog>
    </div>
  );
}
