import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column, CategoryBadge } from "@/components/crud/DataTable";
import { FormDialog } from "@/components/crud/FormDialog";
import { PageHeader } from "@/components/crud/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stethoscope } from "lucide-react";

interface Symptom {
  symptom_id: string;
  problem_id: string;
  symptom_description: string;
  symptom_type: string;
  occurrence_condition: string | null;
  frequency: string | null;
  problems?: { problem_code: string; problem_name: string };
}

const symptomTypes = ["Visual", "Audio", "Performance", "Warning Light", "Vibration", "Smell", "Touch", "Other"];
const frequencyTypes = ["Always", "Intermittent", "Occasional"];

export default function SymptomsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Symptom | null>(null);
  const [formData, setFormData] = useState({ problem_id: "", symptom_description: "", symptom_type: "Other", occurrence_condition: "", frequency: "Intermittent" });

  const { data: symptoms = [], isLoading } = useQuery({
    queryKey: ["symptoms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("symptoms").select("*, problems(problem_code, problem_name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Symptom[];
    },
  });

  const { data: problems = [] } = useQuery({
    queryKey: ["problems-list"],
    queryFn: async () => {
      const { data } = await supabase.from("problems").select("problem_id, problem_code, problem_name").order("problem_code");
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("symptoms").insert(data);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["symptoms"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("symptoms").update(data).eq("symptom_id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["symptoms"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("symptoms").delete().eq("symptom_id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["symptoms"] }); toast({ title: "Berhasil dihapus" }); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const resetForm = () => { setFormData({ problem_id: "", symptom_description: "", symptom_type: "Other", occurrence_condition: "", frequency: "Intermittent" }); setEditingItem(null); setIsFormOpen(false); };

  const handleEdit = (item: Symptom) => {
    setEditingItem(item);
    setFormData({ problem_id: item.problem_id, symptom_description: item.symptom_description, symptom_type: item.symptom_type, occurrence_condition: item.occurrence_condition || "", frequency: item.frequency || "Intermittent" });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problem_id || !formData.symptom_description.trim()) { toast({ variant: "destructive", title: "Error", description: "Problem dan Deskripsi wajib diisi" }); return; }
    if (editingItem) updateMutation.mutate({ id: editingItem.symptom_id, data: formData });
    else createMutation.mutate(formData);
  };

  const columns: Column<Symptom>[] = [
    { key: "problems", header: "Problem", render: (item) => <code className="text-xs bg-muted px-2 py-1 rounded">{item.problems?.problem_code}</code> },
    { key: "symptom_description", header: "Deskripsi Gejala", render: (item) => <span className="font-medium line-clamp-2">{item.symptom_description}</span> },
    { key: "symptom_type", header: "Tipe", render: (item) => <CategoryBadge category={item.symptom_type} /> },
    { key: "occurrence_condition", header: "Kondisi", className: "hidden lg:table-cell", render: (item) => <span className="text-sm text-muted-foreground">{item.occurrence_condition || "-"}</span> },
    { key: "frequency", header: "Frekuensi", className: "hidden md:table-cell" },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader title="Symptoms" description="Kelola data gejala kerusakan" icon={<Stethoscope className="h-5 w-5" />} />
      <DataTable data={symptoms} columns={columns} isLoading={isLoading} idKey="symptom_id" onAdd={() => setIsFormOpen(true)} onEdit={handleEdit} onDelete={(item) => deleteMutation.mutate(item.symptom_id)} />
      
      <FormDialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsFormOpen(true); }} title={editingItem ? "Edit Symptom" : "Tambah Symptom"} useSheet>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Problem *</Label>
            <Select value={formData.problem_id} onValueChange={(v) => setFormData({ ...formData, problem_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih problem..." /></SelectTrigger>
              <SelectContent>{problems.map((p: any) => <SelectItem key={p.problem_id} value={p.problem_id}>{p.problem_code} - {p.problem_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Deskripsi Gejala *</Label>
            <Textarea value={formData.symptom_description} onChange={(e) => setFormData({ ...formData, symptom_description: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipe Gejala</Label>
              <Select value={formData.symptom_type} onValueChange={(v) => setFormData({ ...formData, symptom_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{symptomTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frekuensi</Label>
              <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{frequencyTypes.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Kondisi Kemunculan</Label>
            <Input value={formData.occurrence_condition} onChange={(e) => setFormData({ ...formData, occurrence_condition: e.target.value })} placeholder="Saat idle, akselerasi, dll" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
            <Button type="submit">{editingItem ? "Simpan" : "Tambah"}</Button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
}
