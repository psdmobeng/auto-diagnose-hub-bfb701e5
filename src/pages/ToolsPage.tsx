import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { DataTable, Column, CategoryBadge } from "@/components/crud/DataTable";
import { FormDialog } from "@/components/crud/FormDialog";
import { PageHeader } from "@/components/crud/PageHeader";
import { DetailSheet, DetailField, DetailParagraph } from "@/components/crud/DetailSheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Constants } from "@/integrations/supabase/types";
import { Hammer, Plus, CheckCircle, XCircle } from "lucide-react";

type Tool = Tables<"tools"> & {
  solutions?: { solution_step: string; problems?: { problem_name: string } | null } | null;
};
type ToolInsert = TablesInsert<"tools">;
type ToolUpdate = TablesUpdate<"tools">;

const toolCategories = Constants.public.Enums.tool_category;

export default function ToolsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tool | null>(null);
  const [selectedItem, setSelectedItem] = useState<Tool | null>(null);
  const [formData, setFormData] = useState<Partial<ToolInsert>>({});

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*, solutions(solution_step, problems(problem_name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tool[];
    },
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ["solutions-for-tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("solution_id, solution_step, step_order, problems(problem_name)")
        .order("step_order");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ToolInsert) => {
      const { error } = await supabase.from("tools").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      toast.success("Tool berhasil ditambahkan");
      setIsDialogOpen(false);
      setFormData({});
    },
    onError: (error) => toast.error(`Gagal: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ToolUpdate }) => {
      const { error } = await supabase.from("tools").update(data).eq("tool_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      toast.success("Tool berhasil diperbarui");
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({});
    },
    onError: (error) => toast.error(`Gagal: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tools").delete().eq("tool_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      toast.success("Tool berhasil dihapus");
    },
    onError: (error) => toast.error(`Gagal: ${error.message}`),
  });

  const columns: Column<Tool>[] = [
    { key: "tool_name", header: "Nama Tool", render: (item) => <span className="font-medium">{item.tool_name}</span> },
    { key: "tool_category", header: "Kategori", render: (item) => item.tool_category ? <CategoryBadge category={item.tool_category} /> : "-" },
    { key: "tool_specification", header: "Spesifikasi", className: "hidden md:table-cell", render: (item) => <span className="text-sm text-muted-foreground line-clamp-1">{item.tool_specification || "-"}</span> },
    { key: "solutions", header: "Problem", render: (item) => <span className="text-sm">{item.solutions?.problems?.problem_name || "-"}</span> },
    { key: "is_mandatory", header: "Wajib", render: (item) => item.is_mandatory ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" /> },
  ];

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Tool) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.tool_name || !formData.solution_id) {
      toast.error("Nama tool dan solution wajib diisi");
      return;
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.tool_id, data: formData });
    } else {
      createMutation.mutate(formData as ToolInsert);
    }
  };

  const getDetailFields = (item: Tool): DetailField[] => [
    { label: "Nama Tool", value: item.tool_name },
    { label: "Kategori", value: item.tool_category ? <CategoryBadge category={item.tool_category} /> : null },
    { label: "Problem Terkait", value: item.solutions?.problems?.problem_name },
    { label: "Wajib Digunakan", value: item.is_mandatory ? <Badge className="bg-green-500">Ya - Wajib</Badge> : <Badge variant="outline">Tidak - Opsional</Badge> },
    { label: "Spesifikasi", value: item.tool_specification ? <DetailParagraph>{item.tool_specification}</DetailParagraph> : null, fullWidth: true },
    { label: "Tool Alternatif", value: item.alternative_tool, fullWidth: true },
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <PageHeader
        title="Tools Required"
        description="Kelola data alat yang dibutuhkan untuk setiap solusi"
        icon={<Hammer className="h-5 w-5" />}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Tool
          </Button>
        }
      />

      <DataTable
        data={tools}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={(item) => deleteMutation.mutate(item.tool_id)}
        onRowClick={setSelectedItem}
        idKey="tool_id"
      />

      <DetailSheet
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        title={selectedItem?.tool_name || ""}
        subtitle="Detail Tool"
        fields={selectedItem ? getDetailFields(selectedItem) : []}
        badge={selectedItem?.tool_category ? { label: selectedItem.tool_category } : undefined}
        onEdit={selectedItem ? () => { handleEdit(selectedItem); setSelectedItem(null); } : undefined}
      />

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? "Edit Tool" : "Tambah Tool"}
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Solution</Label>
            <Select
              value={formData.solution_id || ""}
              onValueChange={(value) => setFormData({ ...formData, solution_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih solution" />
              </SelectTrigger>
              <SelectContent>
                {solutions.map((s) => (
                  <SelectItem key={s.solution_id} value={s.solution_id}>
                    {s.problems?.problem_name} - Step {s.step_order}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Nama Tool</Label>
            <Input
              value={formData.tool_name || ""}
              onChange={(e) => setFormData({ ...formData, tool_name: e.target.value })}
              placeholder="Contoh: Multimeter Digital"
            />
          </div>
          <div className="grid gap-2">
            <Label>Kategori</Label>
            <Select
              value={formData.tool_category || ""}
              onValueChange={(value: any) => setFormData({ ...formData, tool_category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {toolCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Spesifikasi</Label>
            <Textarea
              value={formData.tool_specification || ""}
              onChange={(e) => setFormData({ ...formData, tool_specification: e.target.value })}
              placeholder="Spesifikasi teknis tool"
            />
          </div>
          <div className="grid gap-2">
            <Label>Alternatif Tool</Label>
            <Input
              value={formData.alternative_tool || ""}
              onChange={(e) => setFormData({ ...formData, alternative_tool: e.target.value })}
              placeholder="Tool alternatif jika tidak tersedia"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_mandatory ?? true}
              onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory: checked })}
            />
            <Label>Tool Wajib</Label>
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
