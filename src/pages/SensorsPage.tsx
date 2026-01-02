import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column } from "@/components/crud/DataTable";
import { FormDialog } from "@/components/crud/FormDialog";
import { PageHeader } from "@/components/crud/PageHeader";
import { DetailSheet, DetailField, DetailParagraph } from "@/components/crud/DetailSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu } from "lucide-react";

interface Sensor {
  sensor_id: string;
  problem_id: string;
  sensor_name: string;
  sensor_location: string | null;
  failure_mode: string | null;
  testing_method: string | null;
  problems?: { problem_code: string; problem_name: string };
}

export default function SensorsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Sensor | null>(null);
  const [selectedItem, setSelectedItem] = useState<Sensor | null>(null);
  const [formData, setFormData] = useState({ problem_id: "", sensor_name: "", sensor_location: "", failure_mode: "", testing_method: "" });

  const { data: sensors = [], isLoading } = useQuery({
    queryKey: ["sensors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sensors").select("*, problems(problem_code, problem_name)").order("sensor_name");
      if (error) throw error;
      return data as Sensor[];
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
    mutationFn: async (data: any) => { const { error } = await supabase.from("sensors").insert(data); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sensors"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const { error } = await supabase.from("sensors").update(data).eq("sensor_id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sensors"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("sensors").delete().eq("sensor_id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sensors"] }); toast({ title: "Berhasil dihapus" }); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const resetForm = () => { setFormData({ problem_id: "", sensor_name: "", sensor_location: "", failure_mode: "", testing_method: "" }); setEditingItem(null); setIsFormOpen(false); };

  const handleEdit = (item: Sensor) => {
    setEditingItem(item);
    setFormData({ problem_id: item.problem_id, sensor_name: item.sensor_name, sensor_location: item.sensor_location || "", failure_mode: item.failure_mode || "", testing_method: item.testing_method || "" });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problem_id || !formData.sensor_name.trim()) { toast({ variant: "destructive", title: "Error", description: "Problem dan Sensor Name wajib diisi" }); return; }
    if (editingItem) updateMutation.mutate({ id: editingItem.sensor_id, data: formData });
    else createMutation.mutate(formData);
  };

  const columns: Column<Sensor>[] = [
    { key: "sensor_name", header: "Nama Sensor", render: (item) => <span className="font-medium">{item.sensor_name}</span> },
    { key: "problems", header: "Problem", render: (item) => <code className="text-xs bg-muted px-2 py-1 rounded">{item.problems?.problem_code}</code> },
    { key: "sensor_location", header: "Lokasi", className: "hidden md:table-cell" },
    { key: "failure_mode", header: "Failure Mode", className: "hidden lg:table-cell", render: (item) => <span className="text-sm text-muted-foreground line-clamp-1">{item.failure_mode || "-"}</span> },
  ];

  const getDetailFields = (item: Sensor): DetailField[] => [
    { label: "Nama Sensor", value: item.sensor_name },
    { label: "Problem Terkait", value: item.problems ? `${item.problems.problem_code} - ${item.problems.problem_name}` : null },
    { label: "Lokasi Sensor", value: item.sensor_location },
    { label: "Failure Mode", value: item.failure_mode ? <DetailParagraph>{item.failure_mode}</DetailParagraph> : null, fullWidth: true },
    { label: "Metode Pengujian", value: item.testing_method ? <DetailParagraph>{item.testing_method}</DetailParagraph> : null, fullWidth: true },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader title="Sensors" description="Kelola data sensor kendaraan" icon={<Cpu className="h-5 w-5" />} />
      
      <DataTable 
        data={sensors} 
        columns={columns} 
        isLoading={isLoading} 
        idKey="sensor_id" 
        onAdd={() => setIsFormOpen(true)} 
        onEdit={handleEdit} 
        onDelete={(item) => deleteMutation.mutate(item.sensor_id)}
        onRowClick={setSelectedItem}
      />

      <DetailSheet
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        title={selectedItem?.sensor_name || ""}
        subtitle="Detail Sensor"
        fields={selectedItem ? getDetailFields(selectedItem) : []}
      />
      
      <FormDialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsFormOpen(true); }} title={editingItem ? "Edit Sensor" : "Tambah Sensor"} useSheet>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Problem *</Label>
            <Select value={formData.problem_id} onValueChange={(v) => setFormData({ ...formData, problem_id: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih problem..." /></SelectTrigger>
              <SelectContent>{problems.map((p: any) => <SelectItem key={p.problem_id} value={p.problem_id}>{p.problem_code} - {p.problem_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nama Sensor *</Label>
            <Input value={formData.sensor_name} onChange={(e) => setFormData({ ...formData, sensor_name: e.target.value })} placeholder="MAF Sensor, O2 Sensor..." />
          </div>
          <div className="space-y-2">
            <Label>Lokasi Sensor</Label>
            <Input value={formData.sensor_location} onChange={(e) => setFormData({ ...formData, sensor_location: e.target.value })} placeholder="Di intake manifold..." />
          </div>
          <div className="space-y-2">
            <Label>Failure Mode</Label>
            <Textarea value={formData.failure_mode} onChange={(e) => setFormData({ ...formData, failure_mode: e.target.value })} rows={2} placeholder="Open circuit, short circuit..." />
          </div>
          <div className="space-y-2">
            <Label>Testing Method</Label>
            <Textarea value={formData.testing_method} onChange={(e) => setFormData({ ...formData, testing_method: e.target.value })} rows={3} placeholder="Langkah-langkah pengujian..." />
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
