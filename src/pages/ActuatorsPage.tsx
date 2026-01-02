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
import { Cog } from "lucide-react";

interface Actuator {
  actuator_id: string;
  problem_id: string;
  actuator_name: string;
  actuator_type: string | null;
  failure_symptoms: string | null;
  testing_procedure: string | null;
  problems?: { problem_code: string; problem_name: string };
}

const actuatorTypes = ["Electrical", "Mechanical", "Electro-mechanical", "Hydraulic", "Pneumatic"];

export default function ActuatorsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Actuator | null>(null);
  const [selectedItem, setSelectedItem] = useState<Actuator | null>(null);
  const [formData, setFormData] = useState({ problem_id: "", actuator_name: "", actuator_type: "", failure_symptoms: "", testing_procedure: "" });

  const { data: actuators = [], isLoading } = useQuery({
    queryKey: ["actuators"],
    queryFn: async () => {
      const { data, error } = await supabase.from("actuators").select("*, problems(problem_code, problem_name)").order("actuator_name");
      if (error) throw error;
      return data as Actuator[];
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
    mutationFn: async (data: any) => { const { error } = await supabase.from("actuators").insert(data); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["actuators"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const { error } = await supabase.from("actuators").update(data).eq("actuator_id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["actuators"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("actuators").delete().eq("actuator_id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["actuators"] }); toast({ title: "Berhasil dihapus" }); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const resetForm = () => { setFormData({ problem_id: "", actuator_name: "", actuator_type: "", failure_symptoms: "", testing_procedure: "" }); setEditingItem(null); setIsFormOpen(false); };

  const handleEdit = (item: Actuator) => {
    setEditingItem(item);
    setFormData({ problem_id: item.problem_id, actuator_name: item.actuator_name, actuator_type: item.actuator_type || "", failure_symptoms: item.failure_symptoms || "", testing_procedure: item.testing_procedure || "" });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problem_id || !formData.actuator_name.trim()) { toast({ variant: "destructive", title: "Error", description: "Problem dan Actuator Name wajib diisi" }); return; }
    if (editingItem) updateMutation.mutate({ id: editingItem.actuator_id, data: formData });
    else createMutation.mutate(formData);
  };

  const columns: Column<Actuator>[] = [
    { key: "actuator_name", header: "Nama Actuator", render: (item) => <span className="font-medium">{item.actuator_name}</span> },
    { key: "actuator_type", header: "Tipe", render: (item) => <span className="text-sm">{item.actuator_type || "-"}</span> },
    { key: "problems", header: "Problem", render: (item) => <code className="text-xs bg-muted px-2 py-1 rounded">{item.problems?.problem_code}</code> },
    { key: "failure_symptoms", header: "Gejala Kegagalan", className: "hidden lg:table-cell", render: (item) => <span className="text-sm text-muted-foreground line-clamp-1">{item.failure_symptoms || "-"}</span> },
  ];

  const getDetailFields = (item: Actuator): DetailField[] => [
    { label: "Nama Actuator", value: item.actuator_name },
    { label: "Tipe Actuator", value: item.actuator_type ? <CategoryBadge category={item.actuator_type} /> : null },
    { label: "Problem Terkait", value: item.problems ? `${item.problems.problem_code} - ${item.problems.problem_name}` : null },
    { label: "Gejala Kegagalan", value: item.failure_symptoms ? <DetailParagraph>{item.failure_symptoms}</DetailParagraph> : null, fullWidth: true },
    { label: "Prosedur Pengujian", value: item.testing_procedure ? <DetailParagraph>{item.testing_procedure}</DetailParagraph> : null, fullWidth: true },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader title="Actuators" description="Kelola data aktuator kendaraan" icon={<Cog className="h-5 w-5" />} />
      
      <DataTable 
        data={actuators} 
        columns={columns} 
        isLoading={isLoading} 
        idKey="actuator_id" 
        onAdd={() => setIsFormOpen(true)} 
        onEdit={handleEdit} 
        onDelete={(item) => deleteMutation.mutate(item.actuator_id)}
        onRowClick={setSelectedItem}
      />

      <DetailSheet
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        title={selectedItem?.actuator_name || ""}
        subtitle="Detail Actuator"
        fields={selectedItem ? getDetailFields(selectedItem) : []}
        badge={selectedItem?.actuator_type ? { label: selectedItem.actuator_type } : undefined}
      />
      
      <FormDialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsFormOpen(true); }} title={editingItem ? "Edit Actuator" : "Tambah Actuator"} useSheet>
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
              <Label>Nama Actuator *</Label>
              <Input value={formData.actuator_name} onChange={(e) => setFormData({ ...formData, actuator_name: e.target.value })} placeholder="Fuel Injector..." />
            </div>
            <div className="space-y-2">
              <Label>Tipe</Label>
              <Select value={formData.actuator_type} onValueChange={(v) => setFormData({ ...formData, actuator_type: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                <SelectContent>{actuatorTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Failure Symptoms</Label>
            <Textarea value={formData.failure_symptoms} onChange={(e) => setFormData({ ...formData, failure_symptoms: e.target.value })} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Testing Procedure</Label>
            <Textarea value={formData.testing_procedure} onChange={(e) => setFormData({ ...formData, testing_procedure: e.target.value })} rows={3} />
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
