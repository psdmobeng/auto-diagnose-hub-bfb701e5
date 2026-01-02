import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { DataTable, Column, CategoryBadge } from "@/components/crud/DataTable";
import { FormDialog } from "@/components/crud/FormDialog";
import { PageHeader } from "@/components/crud/PageHeader";
import { DetailSheet, DetailField } from "@/components/crud/DetailSheet";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Constants } from "@/integrations/supabase/types";
import { GitBranch, Plus, Sparkles, ArrowRight } from "lucide-react";

type ProblemRelation = Tables<"problem_relations"> & {
  primary_problem?: { problem_name: string; problem_code: string } | null;
  related_problem?: { problem_name: string; problem_code: string } | null;
};
type ProblemRelationInsert = TablesInsert<"problem_relations">;
type ProblemRelationUpdate = TablesUpdate<"problem_relations">;

const relationTypes = Constants.public.Enums.relation_type;

export default function RelationsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProblemRelation | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProblemRelation | null>(null);
  const [formData, setFormData] = useState<Partial<ProblemRelationInsert>>({});

  const { data: relations = [], isLoading } = useQuery({
    queryKey: ["problem-relations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("problem_relations")
        .select(`
          *,
          primary_problem:problems!problem_relations_primary_problem_id_fkey(problem_name, problem_code),
          related_problem:problems!problem_relations_related_problem_id_fkey(problem_name, problem_code)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProblemRelation[];
    },
  });

  const { data: problems = [] } = useQuery({
    queryKey: ["problems-for-relations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("problems")
        .select("problem_id, problem_name, problem_code")
        .order("problem_name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProblemRelationInsert) => {
      const { error } = await supabase.from("problem_relations").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problem-relations"] });
      toast.success("Relasi berhasil ditambahkan");
      setIsDialogOpen(false);
      setFormData({});
    },
    onError: (error) => toast.error(`Gagal: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProblemRelationUpdate }) => {
      const { error } = await supabase.from("problem_relations").update(data).eq("relation_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problem-relations"] });
      toast.success("Relasi berhasil diperbarui");
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({});
    },
    onError: (error) => toast.error(`Gagal: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("problem_relations").delete().eq("relation_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problem-relations"] });
      toast.success("Relasi berhasil dihapus");
    },
    onError: (error) => toast.error(`Gagal: ${error.message}`),
  });

  const columns: Column<ProblemRelation>[] = [
    { key: "primary_problem", header: "Problem Utama", render: (item) => <code className="text-xs bg-muted px-2 py-1 rounded">{item.primary_problem?.problem_code}</code> },
    { key: "relation_type", header: "Tipe Relasi", render: (item) => <div className="flex items-center gap-2"><ArrowRight className="h-4 w-4 text-muted-foreground" /><CategoryBadge category={item.relation_type} /></div> },
    { key: "related_problem", header: "Problem Terkait", render: (item) => <code className="text-xs bg-muted px-2 py-1 rounded">{item.related_problem?.problem_code}</code> },
    { key: "is_ai_generated", header: "", className: "w-8", render: (item) => item.is_ai_generated ? <Sparkles className="h-4 w-4 text-primary" /> : null },
  ];

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const handleEdit = (item: ProblemRelation) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.primary_problem_id || !formData.related_problem_id) {
      toast.error("Kedua problem wajib dipilih");
      return;
    }
    if (formData.primary_problem_id === formData.related_problem_id) {
      toast.error("Problem utama dan terkait tidak boleh sama");
      return;
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.relation_id, data: formData });
    } else {
      createMutation.mutate(formData as ProblemRelationInsert);
    }
  };

  const getDetailFields = (item: ProblemRelation): DetailField[] => [
    { label: "Problem Utama", value: item.primary_problem ? <div><code className="px-2 py-1 bg-muted rounded font-mono">{item.primary_problem.problem_code}</code><p className="text-sm mt-1">{item.primary_problem.problem_name}</p></div> : null },
    { label: "Tipe Relasi", value: <Badge variant="outline" className="text-base">{item.relation_type}</Badge> },
    { label: "Problem Terkait", value: item.related_problem ? <div><code className="px-2 py-1 bg-muted rounded font-mono">{item.related_problem.problem_code}</code><p className="text-sm mt-1">{item.related_problem.problem_name}</p></div> : null },
    { label: "AI Generated", value: item.is_ai_generated ? <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Ya</div> : "Tidak" },
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <PageHeader
        title="Problem Relations"
        description="Kelola hubungan antar masalah kendaraan"
        icon={<GitBranch className="h-5 w-5" />}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Relasi
          </Button>
        }
      />

      <DataTable
        data={relations}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={(item) => deleteMutation.mutate(item.relation_id)}
        onRowClick={setSelectedItem}
        idKey="relation_id"
      />

      <DetailSheet
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        title="Relasi Problem"
        subtitle={selectedItem?.relation_type || ""}
        fields={selectedItem ? getDetailFields(selectedItem) : []}
        badge={selectedItem ? { label: selectedItem.relation_type } : undefined}
        onEdit={selectedItem ? () => { handleEdit(selectedItem); setSelectedItem(null); } : undefined}
      />

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? "Edit Relasi" : "Tambah Relasi"}
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Problem Utama</Label>
            <Select
              value={formData.primary_problem_id || ""}
              onValueChange={(value) => setFormData({ ...formData, primary_problem_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih problem utama" />
              </SelectTrigger>
              <SelectContent>
                {problems.map((p) => (
                  <SelectItem key={p.problem_id} value={p.problem_id}>
                    {p.problem_code} - {p.problem_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Tipe Relasi</Label>
            <Select
              value={formData.relation_type || ""}
              onValueChange={(value: any) => setFormData({ ...formData, relation_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe relasi" />
              </SelectTrigger>
              <SelectContent>
                {relationTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Problem Terkait</Label>
            <Select
              value={formData.related_problem_id || ""}
              onValueChange={(value) => setFormData({ ...formData, related_problem_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih problem terkait" />
              </SelectTrigger>
              <SelectContent>
                {problems.map((p) => (
                  <SelectItem key={p.problem_id} value={p.problem_id}>
                    {p.problem_code} - {p.problem_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_ai_generated ?? false}
              onCheckedChange={(checked) => setFormData({ ...formData, is_ai_generated: checked })}
            />
            <Label>AI Generated</Label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
