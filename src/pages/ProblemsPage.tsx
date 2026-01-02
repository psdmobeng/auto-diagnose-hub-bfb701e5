import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column, SeverityBadge, CategoryBadge } from "@/components/crud/DataTable";
import { FormDialog } from "@/components/crud/FormDialog";
import { PageHeader } from "@/components/crud/PageHeader";
import { DetailSheet, DetailField, DetailParagraph } from "@/components/crud/DetailSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

interface Problem {
  problem_id: string;
  problem_code: string;
  problem_name: string;
  system_category: string;
  severity_level: string;
  description: string | null;
}

const systemCategories = ["Engine", "Transmission", "Brake", "Suspension", "Electrical", "Cooling", "Fuel", "Exhaust", "HVAC", "Body", "Steering", "Drivetrain"];
const severityLevels = ["Low", "Medium", "High", "Critical"];

export default function ProblemsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Problem | null>(null);
  const [selectedItem, setSelectedItem] = useState<Problem | null>(null);
  const [formData, setFormData] = useState({
    problem_code: "",
    problem_name: "",
    system_category: "Engine",
    severity_level: "Medium",
    description: "",
  });

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ["problems"],
    queryFn: async () => {
      const { data, error } = await supabase.from("problems").select("*").order("problem_code");
      if (error) throw error;
      return data as Problem[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("problems").insert({
        problem_code: data.problem_code,
        problem_name: data.problem_name,
        system_category: data.system_category as any,
        severity_level: data.severity_level as any,
        description: data.description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      toast({ title: "Berhasil", description: "Problem berhasil ditambahkan" });
      resetForm();
    },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("problems").update({
        problem_code: data.problem_code,
        problem_name: data.problem_name,
        system_category: data.system_category as any,
        severity_level: data.severity_level as any,
        description: data.description || null,
      }).eq("problem_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      toast({ title: "Berhasil", description: "Problem berhasil diperbarui" });
      resetForm();
    },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("problems").delete().eq("problem_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      toast({ title: "Berhasil", description: "Problem berhasil dihapus" });
    },
    onError: (error) => toast({ variant: "destructive", title: "Error", description: error.message }),
  });

  const resetForm = () => {
    setFormData({ problem_code: "", problem_name: "", system_category: "Engine", severity_level: "Medium", description: "" });
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item: Problem) => {
    setEditingItem(item);
    setFormData({
      problem_code: item.problem_code,
      problem_name: item.problem_name,
      system_category: item.system_category,
      severity_level: item.severity_level,
      description: item.description || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problem_code.trim() || !formData.problem_name.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Problem Code dan Name wajib diisi" });
      return;
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.problem_id, data: formData });
    } else {
      createMutation.mutate(formData as any);
    }
  };

  const columns: Column<Problem>[] = [
    { key: "problem_code", header: "Kode", render: (item) => <code className="px-2 py-1 bg-muted rounded text-sm font-mono">{item.problem_code}</code> },
    { key: "problem_name", header: "Nama Problem", render: (item) => <span className="font-medium">{item.problem_name}</span> },
    { key: "system_category", header: "Kategori", render: (item) => <CategoryBadge category={item.system_category} /> },
    { key: "severity_level", header: "Severity", render: (item) => <SeverityBadge level={item.severity_level} /> },
    { key: "description", header: "Deskripsi", className: "hidden xl:table-cell max-w-xs", render: (item) => <span className="line-clamp-2 text-sm text-muted-foreground">{item.description || "-"}</span> },
  ];

  const getDetailFields = (item: Problem): DetailField[] => [
    { label: "Kode Problem", value: <code className="px-2 py-1 bg-muted rounded font-mono">{item.problem_code}</code> },
    { label: "Nama Problem", value: item.problem_name },
    { label: "Kategori Sistem", value: <CategoryBadge category={item.system_category} /> },
    { label: "Tingkat Keparahan", value: <SeverityBadge level={item.severity_level} /> },
    { label: "Deskripsi", value: item.description ? <DetailParagraph>{item.description}</DetailParagraph> : null, fullWidth: true },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader title="Problems" description="Kelola master data permasalahan kendaraan" icon={<AlertTriangle className="h-5 w-5" />} />
      
      <DataTable 
        data={problems} 
        columns={columns} 
        isLoading={isLoading} 
        idKey="problem_id" 
        onAdd={() => setIsFormOpen(true)} 
        onEdit={handleEdit} 
        onDelete={(item) => deleteMutation.mutate(item.problem_id)} 
        onRowClick={setSelectedItem}
        searchPlaceholder="Cari problem..." 
      />

      <DetailSheet
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        title={selectedItem?.problem_name || ""}
        subtitle={`Kode: ${selectedItem?.problem_code || ""}`}
        fields={selectedItem ? getDetailFields(selectedItem) : []}
        badge={selectedItem ? { 
          label: selectedItem.severity_level,
          className: selectedItem.severity_level === "Critical" ? "bg-destructive text-destructive-foreground" :
                     selectedItem.severity_level === "High" ? "bg-orange-500 text-white" :
                     selectedItem.severity_level === "Medium" ? "bg-yellow-500 text-black" : ""
        } : undefined}
        onEdit={selectedItem ? () => { handleEdit(selectedItem); setSelectedItem(null); } : undefined}
      />
      
      <FormDialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsFormOpen(true); }} title={editingItem ? "Edit Problem" : "Tambah Problem"} useSheet>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Problem Code *</Label>
              <Input value={formData.problem_code} onChange={(e) => setFormData({ ...formData, problem_code: e.target.value.toUpperCase() })} placeholder="ENG-001" />
            </div>
            <div className="space-y-2">
              <Label>System Category *</Label>
              <Select value={formData.system_category} onValueChange={(v) => setFormData({ ...formData, system_category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{systemCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Problem Name *</Label>
            <Input value={formData.problem_name} onChange={(e) => setFormData({ ...formData, problem_name: e.target.value })} placeholder="Engine Misfire" />
          </div>
          <div className="space-y-2">
            <Label>Severity Level</Label>
            <Select value={formData.severity_level} onValueChange={(v) => setFormData({ ...formData, severity_level: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{severityLevels.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Deskripsi detail masalah..." rows={4} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editingItem ? "Simpan" : "Tambah"}</Button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
}
