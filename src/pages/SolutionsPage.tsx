import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column, CategoryBadge } from "@/components/crud/DataTable";
import { FormDialog } from "@/components/crud/FormDialog";
import { PageHeader } from "@/components/crud/PageHeader";
import { DetailSheet, DetailField, DetailParagraph } from "@/components/crud/DetailSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Wrench, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Solution {
  solution_id: string;
  problem_id: string;
  solution_step: string;
  step_order: number;
  estimated_time: number | null;
  difficulty_level: string | null;
  special_notes: string | null;
  is_ai_generated: boolean | null;
  problems?: { problem_code: string; problem_name: string };
}

const difficultyLevels = ["Easy", "Medium", "Hard", "Expert"];

export default function SolutionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Solution | null>(null);
  const [selectedItem, setSelectedItem] = useState<Solution | null>(null);
  const [formData, setFormData] = useState({ problem_id: "", solution_step: "", step_order: 1, estimated_time: "", difficulty_level: "Medium", special_notes: "", is_ai_generated: false });

  const { data: solutions = [], isLoading } = useQuery({
    queryKey: ["solutions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("solutions").select("*, problems(problem_code, problem_name)").order("problem_id").order("step_order");
      if (error) throw error;
      return data as Solution[];
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
      const insertData = { ...data, estimated_time: data.estimated_time ? parseInt(data.estimated_time) : null };
      const { error } = await supabase.from("solutions").insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["solutions"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const updateData = { ...data, estimated_time: data.estimated_time ? parseInt(data.estimated_time) : null };
      const { error } = await supabase.from("solutions").update(updateData).eq("solution_id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["solutions"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("solutions").delete().eq("solution_id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["solutions"] }); toast({ title: "Berhasil dihapus" }); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const resetForm = () => { setFormData({ problem_id: "", solution_step: "", step_order: 1, estimated_time: "", difficulty_level: "Medium", special_notes: "", is_ai_generated: false }); setEditingItem(null); setIsFormOpen(false); };

  const handleEdit = (item: Solution) => {
    setEditingItem(item);
    setFormData({ problem_id: item.problem_id, solution_step: item.solution_step, step_order: item.step_order, estimated_time: item.estimated_time?.toString() || "", difficulty_level: item.difficulty_level || "Medium", special_notes: item.special_notes || "", is_ai_generated: item.is_ai_generated || false });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problem_id || !formData.solution_step.trim()) { toast({ variant: "destructive", title: "Error", description: "Problem dan Solution Step wajib diisi" }); return; }
    if (editingItem) updateMutation.mutate({ id: editingItem.solution_id, data: formData });
    else createMutation.mutate(formData);
  };

  const columns: Column<Solution>[] = [
    { key: "problems", header: "Problem", render: (item) => <code className="text-xs bg-muted px-2 py-1 rounded">{item.problems?.problem_code}</code> },
    { key: "step_order", header: "Step", render: (item) => <Badge variant="outline">#{item.step_order}</Badge> },
    { key: "solution_step", header: "Langkah Solusi", render: (item) => <span className="line-clamp-2">{item.solution_step}</span> },
    { key: "difficulty_level", header: "Difficulty", render: (item) => item.difficulty_level ? <CategoryBadge category={item.difficulty_level} /> : "-" },
    { key: "estimated_time", header: "Waktu", className: "hidden md:table-cell", render: (item) => item.estimated_time ? `${item.estimated_time} menit` : "-" },
    { key: "is_ai_generated", header: "", className: "w-8", render: (item) => item.is_ai_generated ? <Sparkles className="h-4 w-4 text-primary" /> : null },
  ];

  const getDetailFields = (item: Solution): DetailField[] => [
    { label: "Problem Terkait", value: item.problems ? `${item.problems.problem_code} - ${item.problems.problem_name}` : null },
    { label: "Urutan Langkah", value: <Badge variant="outline" className="text-lg">Step #{item.step_order}</Badge> },
    { label: "Tingkat Kesulitan", value: item.difficulty_level ? <CategoryBadge category={item.difficulty_level} /> : null },
    { label: "Estimasi Waktu", value: item.estimated_time ? `${item.estimated_time} menit` : null },
    { label: "AI Generated", value: item.is_ai_generated ? <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Ya</div> : "Tidak" },
    { label: "Langkah Solusi", value: <DetailParagraph>{item.solution_step}</DetailParagraph>, fullWidth: true },
    { label: "Catatan Khusus", value: item.special_notes ? <DetailParagraph>{item.special_notes}</DetailParagraph> : null, fullWidth: true },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader title="Solutions" description="Kelola langkah-langkah solusi perbaikan" icon={<Wrench className="h-5 w-5" />} />
      
      <DataTable 
        data={solutions} 
        columns={columns} 
        isLoading={isLoading} 
        idKey="solution_id" 
        onAdd={() => setIsFormOpen(true)} 
        onEdit={handleEdit} 
        onDelete={(item) => deleteMutation.mutate(item.solution_id)}
        onRowClick={setSelectedItem}
      />

      <DetailSheet
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        title={`Step #${selectedItem?.step_order}: ${selectedItem?.solution_step.substring(0, 40)}...`}
        subtitle="Detail Solusi"
        fields={selectedItem ? getDetailFields(selectedItem) : []}
        badge={selectedItem?.difficulty_level ? { label: selectedItem.difficulty_level } : undefined}
      />
      
      <FormDialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsFormOpen(true); }} title={editingItem ? "Edit Solution" : "Tambah Solution"} useSheet>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Problem *</Label>
            <Select value={formData.problem_id} onValueChange={(v) => setFormData({ ...formData, problem_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih problem..." /></SelectTrigger>
              <SelectContent>{problems.map((p: any) => <SelectItem key={p.problem_id} value={p.problem_id}>{p.problem_code} - {p.problem_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Step Order</Label>
              <Input type="number" min={1} value={formData.step_order} onChange={(e) => setFormData({ ...formData, step_order: parseInt(e.target.value) || 1 })} />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={formData.difficulty_level} onValueChange={(v) => setFormData({ ...formData, difficulty_level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{difficultyLevels.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Est. Time (menit)</Label>
              <Input type="number" min={1} value={formData.estimated_time} onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Langkah Solusi *</Label>
            <Textarea value={formData.solution_step} onChange={(e) => setFormData({ ...formData, solution_step: e.target.value })} rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Catatan Khusus</Label>
            <Textarea value={formData.special_notes} onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })} rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={formData.is_ai_generated} onCheckedChange={(c) => setFormData({ ...formData, is_ai_generated: !!c })} />
            <Label className="text-sm font-normal">AI Generated</Label>
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
