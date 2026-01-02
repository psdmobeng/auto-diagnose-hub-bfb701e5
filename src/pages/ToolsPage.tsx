import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { DataTable } from "@/components/crud/DataTable";
import { FormDialog } from "@/components/crud/FormDialog";
import { PageHeader } from "@/components/crud/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Constants } from "@/integrations/supabase/types";
import { Hammer, Plus } from "lucide-react";

type Tool = Tables<"tools">;
type ToolInsert = TablesInsert<"tools">;
type ToolUpdate = TablesUpdate<"tools">;

const toolCategories = Constants.public.Enums.tool_category;

export default function ToolsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tool | null>(null);
  const [formData, setFormData] = useState<Partial<ToolInsert>>({});

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*, solutions(solution_step, problems(problem_name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
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

  const columns = [
    { key: "tool_name", header: "Nama Tool" },
    { key: "tool_category", header: "Kategori" },
    { key: "tool_specification", header: "Spesifikasi" },
    { 
      key: "solutions", 
      header: "Problem", 
      render: (item: any) => item.solutions?.problems?.problem_name || "-" 
    },
    { 
      key: "is_mandatory", 
      header: "Wajib", 
      render: (item: any) => item.is_mandatory ? "Ya" : "Tidak" 
    },
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

  return (
    <div className="space-y-6">
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
        idKey="tool_id"
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
