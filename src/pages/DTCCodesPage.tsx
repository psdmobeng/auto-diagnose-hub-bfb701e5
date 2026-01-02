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
import { Code } from "lucide-react";

interface DTCCode {
  dtc_id: string;
  problem_id: string;
  dtc_code: string;
  dtc_type: string;
  dtc_description: string | null;
  obd_standard: string | null;
  problems?: { problem_code: string; problem_name: string };
}

const dtcTypes = ["Powertrain", "Chassis", "Body", "Network"];
const obdStandards = ["OBD-II", "EOBD", "JOBD"];

export default function DTCCodesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DTCCode | null>(null);
  const [selectedItem, setSelectedItem] = useState<DTCCode | null>(null);
  const [formData, setFormData] = useState({ problem_id: "", dtc_code: "", dtc_type: "Powertrain", dtc_description: "", obd_standard: "OBD-II" });

  const { data: dtcCodes = [], isLoading } = useQuery({
    queryKey: ["dtc-codes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dtc_codes").select("*, problems(problem_code, problem_name)").order("dtc_code");
      if (error) throw error;
      return data as DTCCode[];
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
    mutationFn: async (data: any) => { const { error } = await supabase.from("dtc_codes").insert(data); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["dtc-codes"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const { error } = await supabase.from("dtc_codes").update(data).eq("dtc_id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["dtc-codes"] }); toast({ title: "Berhasil" }); resetForm(); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("dtc_codes").delete().eq("dtc_id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["dtc-codes"] }); toast({ title: "Berhasil dihapus" }); },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const resetForm = () => { setFormData({ problem_id: "", dtc_code: "", dtc_type: "Powertrain", dtc_description: "", obd_standard: "OBD-II" }); setEditingItem(null); setIsFormOpen(false); };

  const handleEdit = (item: DTCCode) => {
    setEditingItem(item);
    setFormData({ problem_id: item.problem_id, dtc_code: item.dtc_code, dtc_type: item.dtc_type, dtc_description: item.dtc_description || "", obd_standard: item.obd_standard || "OBD-II" });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problem_id || !formData.dtc_code.trim()) { toast({ variant: "destructive", title: "Error", description: "Problem dan DTC Code wajib diisi" }); return; }
    if (editingItem) updateMutation.mutate({ id: editingItem.dtc_id, data: formData });
    else createMutation.mutate(formData);
  };

  const columns: Column<DTCCode>[] = [
    { key: "dtc_code", header: "DTC Code", render: (item) => <code className="px-2 py-1 bg-primary/10 text-primary rounded font-mono font-bold">{item.dtc_code}</code> },
    { key: "dtc_type", header: "Tipe", render: (item) => <CategoryBadge category={item.dtc_type} /> },
    { key: "problems", header: "Problem", render: (item) => <span className="text-sm">{item.problems?.problem_code}</span> },
    { key: "dtc_description", header: "Deskripsi", render: (item) => <span className="line-clamp-2 text-sm">{item.dtc_description || "-"}</span> },
    { key: "obd_standard", header: "Standard", className: "hidden md:table-cell" },
  ];

  const getDetailFields = (item: DTCCode): DetailField[] => [
    { label: "Kode DTC", value: <code className="px-3 py-1.5 bg-primary/10 text-primary rounded font-mono font-bold text-lg">{item.dtc_code}</code> },
    { label: "Tipe DTC", value: <CategoryBadge category={item.dtc_type} /> },
    { label: "Problem Terkait", value: item.problems ? `${item.problems.problem_code} - ${item.problems.problem_name}` : null },
    { label: "Standar OBD", value: item.obd_standard },
    { label: "Deskripsi Lengkap", value: item.dtc_description ? <DetailParagraph>{item.dtc_description}</DetailParagraph> : null, fullWidth: true },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader title="DTC Codes" description="Kelola database kode diagnostik" icon={<Code className="h-5 w-5" />} />
      
      <DataTable 
        data={dtcCodes} 
        columns={columns} 
        isLoading={isLoading} 
        idKey="dtc_id" 
        onAdd={() => setIsFormOpen(true)} 
        onEdit={handleEdit} 
        onDelete={(item) => deleteMutation.mutate(item.dtc_id)} 
        onRowClick={setSelectedItem}
        searchPlaceholder="Cari DTC code..." 
      />

      <DetailSheet
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        title={selectedItem?.dtc_code || ""}
        subtitle="Detail Kode DTC"
        fields={selectedItem ? getDetailFields(selectedItem) : []}
        badge={selectedItem ? { label: selectedItem.dtc_type } : undefined}
        onEdit={selectedItem ? () => { handleEdit(selectedItem); setSelectedItem(null); } : undefined}
      />
      
      <FormDialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsFormOpen(true); }} title={editingItem ? "Edit DTC Code" : "Tambah DTC Code"} useSheet>
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
              <Label>DTC Code *</Label>
              <Input value={formData.dtc_code} onChange={(e) => setFormData({ ...formData, dtc_code: e.target.value.toUpperCase() })} placeholder="P0300" />
            </div>
            <div className="space-y-2">
              <Label>DTC Type</Label>
              <Select value={formData.dtc_type} onValueChange={(v) => setFormData({ ...formData, dtc_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{dtcTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>OBD Standard</Label>
            <Select value={formData.obd_standard} onValueChange={(v) => setFormData({ ...formData, obd_standard: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{obdStandards.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Textarea value={formData.dtc_description} onChange={(e) => setFormData({ ...formData, dtc_description: e.target.value })} rows={3} />
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
