import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column } from "@/components/crud/DataTable";
import { FormDialog } from "@/components/crud/FormDialog";
import { PageHeader } from "@/components/crud/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Sparkles } from "lucide-react";

interface TechnicalTheory {
  theory_id: string;
  problem_id: string;
  theory_title: string;
  technical_explanation: string | null;
  system_operation: string | null;
  failure_mechanism: string | null;
  preventive_measures: string | null;
  reference_links: string | null;
  is_ai_generated: boolean | null;
  problems?: { problem_code: string; problem_name: string };
}

export default function TheoryPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TechnicalTheory | null>(null);
  const [formData, setFormData] = useState({ problem_id: "", theory_title: "", technical_explanation: "", system_operation: "", failure_mechanism: "", preventive_measures: "", reference_links: "", is_ai_generated: false });

  const { data: theories = [], isLoading } = useQuery({
    queryKey: ["theories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("technical_theory").select("*, problems(problem_code, problem_name)").order("theory_title");
      if (error) throw error;
      return data as TechnicalTheory[];
    },
  });

  const { data: problems = [] } = useQuery({ queryKey: ["problems-list"], queryFn: async () => { const { data } = await supabase.from("problems").select("problem_id, problem_code, problem_name").order("problem_code"); return data || []; } });

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const { error } = await supabase.from("technical_theory").insert(data); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["theories"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const { error } = await supabase.from("technical_theory").update(data).eq("theory_id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["theories"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("technical_theory").delete().eq("theory_id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["theories"] }); toast({ title: "Berhasil dihapus" }); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const resetForm = () => { setFormData({ problem_id: "", theory_title: "", technical_explanation: "", system_operation: "", failure_mechanism: "", preventive_measures: "", reference_links: "", is_ai_generated: false }); setEditingItem(null); setIsFormOpen(false); };

  const handleEdit = (item: TechnicalTheory) => {
    setEditingItem(item);
    setFormData({ problem_id: item.problem_id, theory_title: item.theory_title, technical_explanation: item.technical_explanation || "", system_operation: item.system_operation || "", failure_mechanism: item.failure_mechanism || "", preventive_measures: item.preventive_measures || "", reference_links: item.reference_links || "", is_ai_generated: item.is_ai_generated || false });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problem_id || !formData.theory_title.trim()) { toast({ variant: "destructive", title: "Error", description: "Problem dan Title wajib diisi" }); return; }
    if (editingItem) updateMutation.mutate({ id: editingItem.theory_id, data: formData });
    else createMutation.mutate(formData);
  };

  const columns: Column<TechnicalTheory>[] = [
    { key: "theory_title", header: "Judul Teori", render: (item) => <span className="font-medium">{item.theory_title}</span> },
    { key: "problems", header: "Problem", render: (item) => <code className="text-xs bg-muted px-2 py-1 rounded">{item.problems?.problem_code}</code> },
    { key: "technical_explanation", header: "Penjelasan", className: "hidden lg:table-cell max-w-xs", render: (item) => <span className="line-clamp-2 text-sm text-muted-foreground">{item.technical_explanation || "-"}</span> },
    { key: "is_ai_generated", header: "", className: "w-8", render: (item) => item.is_ai_generated ? <Sparkles className="h-4 w-4 text-primary" /> : null },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader title="Technical Theory" description="Kelola penjelasan teori teknis" icon={<BookOpen className="h-5 w-5" />} />
      <DataTable data={theories} columns={columns} isLoading={isLoading} idKey="theory_id" onAdd={() => setIsFormOpen(true)} onEdit={handleEdit} onDelete={(item) => deleteMutation.mutate(item.theory_id)} />
      
      <FormDialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsFormOpen(true); }} title={editingItem ? "Edit Theory" : "Tambah Theory"} useSheet>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Problem *</Label><Select value={formData.problem_id} onValueChange={(v) => setFormData({ ...formData, problem_id: v })}><SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger><SelectContent>{problems.map((p: any) => <SelectItem key={p.problem_id} value={p.problem_id}>{p.problem_code} - {p.problem_name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Judul Teori *</Label><Input value={formData.theory_title} onChange={(e) => setFormData({ ...formData, theory_title: e.target.value })} /></div>
          <div className="space-y-2"><Label>Penjelasan Teknis</Label><Textarea value={formData.technical_explanation} onChange={(e) => setFormData({ ...formData, technical_explanation: e.target.value })} rows={4} /></div>
          <div className="space-y-2"><Label>Cara Kerja Sistem</Label><Textarea value={formData.system_operation} onChange={(e) => setFormData({ ...formData, system_operation: e.target.value })} rows={3} /></div>
          <div className="space-y-2"><Label>Mekanisme Kegagalan</Label><Textarea value={formData.failure_mechanism} onChange={(e) => setFormData({ ...formData, failure_mechanism: e.target.value })} rows={3} /></div>
          <div className="space-y-2"><Label>Langkah Pencegahan</Label><Textarea value={formData.preventive_measures} onChange={(e) => setFormData({ ...formData, preventive_measures: e.target.value })} rows={2} /></div>
          <div className="flex items-center gap-2"><Checkbox checked={formData.is_ai_generated} onCheckedChange={(c) => setFormData({ ...formData, is_ai_generated: !!c })} /><Label className="text-sm font-normal">AI Generated</Label></div>
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={resetForm}>Batal</Button><Button type="submit">{editingItem ? "Simpan" : "Tambah"}</Button></div>
        </form>
      </FormDialog>
    </div>
  );
}
