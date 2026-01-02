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
import { Layers } from "lucide-react";

interface PartsFactor {
  part_id: string;
  problem_id: string;
  component_name: string;
  component_type: string | null;
  failure_cause: string | null;
  wear_indicator: string | null;
  replacement_interval: string | null;
  problems?: { problem_code: string; problem_name: string };
}

const componentTypes = ["Mechanical Part", "Electrical Component", "Fluid", "External Factor", "Consumable"];

export default function PartsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PartsFactor | null>(null);
  const [selectedItem, setSelectedItem] = useState<PartsFactor | null>(null);
  const [formData, setFormData] = useState({ problem_id: "", component_name: "", component_type: "", failure_cause: "", wear_indicator: "", replacement_interval: "" });

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["parts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("parts_factors").select("*, problems(problem_code, problem_name)").order("component_name");
      if (error) throw error;
      return data as PartsFactor[];
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
    mutationFn: async (data: any) => { const { error } = await supabase.from("parts_factors").insert(data); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["parts"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const { error } = await supabase.from("parts_factors").update(data).eq("part_id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["parts"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("parts_factors").delete().eq("part_id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["parts"] }); toast({ title: "Berhasil dihapus" }); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const resetForm = () => { setFormData({ problem_id: "", component_name: "", component_type: "", failure_cause: "", wear_indicator: "", replacement_interval: "" }); setEditingItem(null); setIsFormOpen(false); };

  const handleEdit = (item: PartsFactor) => {
    setEditingItem(item);
    setFormData({ problem_id: item.problem_id, component_name: item.component_name, component_type: item.component_type || "", failure_cause: item.failure_cause || "", wear_indicator: item.wear_indicator || "", replacement_interval: item.replacement_interval || "" });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problem_id || !formData.component_name.trim()) { toast({ variant: "destructive", title: "Error", description: "Problem dan Component Name wajib diisi" }); return; }
    if (editingItem) updateMutation.mutate({ id: editingItem.part_id, data: formData });
    else createMutation.mutate(formData);
  };

  const columns: Column<PartsFactor>[] = [
    { key: "component_name", header: "Nama Komponen", render: (item) => <span className="font-medium">{item.component_name}</span> },
    { key: "component_type", header: "Tipe", render: (item) => item.component_type ? <CategoryBadge category={item.component_type} /> : "-" },
    { key: "problems", header: "Problem", render: (item) => <code className="text-xs bg-muted px-2 py-1 rounded">{item.problems?.problem_code}</code> },
    { key: "replacement_interval", header: "Interval Ganti", className: "hidden lg:table-cell" },
  ];

  const getDetailFields = (item: PartsFactor): DetailField[] => [
    { label: "Nama Komponen", value: item.component_name },
    { label: "Tipe Komponen", value: item.component_type ? <CategoryBadge category={item.component_type} /> : null },
    { label: "Problem Terkait", value: item.problems ? `${item.problems.problem_code} - ${item.problems.problem_name}` : null },
    { label: "Interval Penggantian", value: item.replacement_interval },
    { label: "Indikator Keausan", value: item.wear_indicator },
    { label: "Penyebab Kegagalan", value: item.failure_cause ? <DetailParagraph>{item.failure_cause}</DetailParagraph> : null, fullWidth: true },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader title="Parts & Factors" description="Kelola data komponen dan faktor eksternal" icon={<Layers className="h-5 w-5" />} />
      
      <DataTable 
        data={parts} 
        columns={columns} 
        isLoading={isLoading} 
        idKey="part_id" 
        onAdd={() => setIsFormOpen(true)} 
        onEdit={handleEdit} 
        onDelete={(item) => deleteMutation.mutate(item.part_id)}
        onRowClick={setSelectedItem}
      />

      <DetailSheet
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        title={selectedItem?.component_name || ""}
        subtitle="Detail Komponen"
        fields={selectedItem ? getDetailFields(selectedItem) : []}
        badge={selectedItem?.component_type ? { label: selectedItem.component_type } : undefined}
      />
      
      <FormDialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsFormOpen(true); }} title={editingItem ? "Edit Part/Factor" : "Tambah Part/Factor"} useSheet>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Problem *</Label>
            <Select value={formData.problem_id} onValueChange={(v) => setFormData({ ...formData, problem_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih problem..." /></SelectTrigger>
              <SelectContent>{problems.map((p: any) => <SelectItem key={p.problem_id} value={p.problem_id}>{p.problem_code} - {p.problem_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Komponen *</Label>
              <Input value={formData.component_name} onChange={(e) => setFormData({ ...formData, component_name: e.target.value })} placeholder="Busi, Oli Mesin..." />
            </div>
            <div className="space-y-2">
              <Label>Tipe</Label>
              <Select value={formData.component_type} onValueChange={(v) => setFormData({ ...formData, component_type: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                <SelectContent>{componentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Penyebab Kegagalan</Label>
            <Textarea value={formData.failure_cause} onChange={(e) => setFormData({ ...formData, failure_cause: e.target.value })} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Indikator Keausan</Label>
            <Input value={formData.wear_indicator} onChange={(e) => setFormData({ ...formData, wear_indicator: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Interval Penggantian</Label>
            <Input value={formData.replacement_interval} onChange={(e) => setFormData({ ...formData, replacement_interval: e.target.value })} placeholder="20.000 km atau 1 tahun" />
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
