import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column, CategoryBadge } from "@/components/crud/DataTable";
import { FormDialog } from "@/components/crud/FormDialog";
import { PageHeader } from "@/components/crud/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car } from "lucide-react";

interface VehicleModel {
  model_id: string;
  manufacturer: string;
  model_name: string;
  year_range: string | null;
  engine_type: string | null;
  transmission_type: string | null;
  market_region: string | null;
}

const manufacturers = ["Toyota", "Honda", "Mitsubishi", "Daihatsu", "Suzuki", "Nissan", "Hyundai", "Wuling", "Mazda", "Isuzu", "BMW", "Mercedes-Benz", "Volkswagen"];
const transmissionTypes = ["Manual", "Automatic", "CVT", "DCT", "AMT", "Manual/Automatic", "Manual/CVT"];
const marketRegions = ["Indonesia", "Global", "JDM", "USDM", "ASEAN"];

export default function VehiclesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VehicleModel | null>(null);
  const [formData, setFormData] = useState({
    manufacturer: "",
    model_name: "",
    year_range: "",
    engine_type: "",
    transmission_type: "",
    market_region: "Indonesia",
  });

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_models")
        .select("*")
        .order("manufacturer", { ascending: true });
      if (error) throw error;
      return data as VehicleModel[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<VehicleModel, "model_id">) => {
      const { error } = await supabase.from("vehicle_models").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({ title: "Berhasil", description: "Data kendaraan berhasil ditambahkan" });
      resetForm();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VehicleModel> }) => {
      const { error } = await supabase.from("vehicle_models").update(data).eq("model_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({ title: "Berhasil", description: "Data kendaraan berhasil diperbarui" });
      resetForm();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicle_models").delete().eq("model_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({ title: "Berhasil", description: "Data kendaraan berhasil dihapus" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const resetForm = () => {
    setFormData({ manufacturer: "", model_name: "", year_range: "", engine_type: "", transmission_type: "", market_region: "Indonesia" });
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item: VehicleModel) => {
    setEditingItem(item);
    setFormData({
      manufacturer: item.manufacturer,
      model_name: item.model_name,
      year_range: item.year_range || "",
      engine_type: item.engine_type || "",
      transmission_type: item.transmission_type || "",
      market_region: item.market_region || "Indonesia",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.manufacturer.trim() || !formData.model_name.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Manufacturer dan Model Name wajib diisi" });
      return;
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.model_id, data: formData });
    } else {
      createMutation.mutate(formData as any);
    }
  };

  const columns: Column<VehicleModel>[] = [
    { key: "manufacturer", header: "Manufacturer", render: (item) => <CategoryBadge category={item.manufacturer} /> },
    { key: "model_name", header: "Model", render: (item) => <span className="font-medium">{item.model_name}</span> },
    { key: "year_range", header: "Tahun" },
    { key: "engine_type", header: "Mesin", className: "hidden md:table-cell" },
    { key: "transmission_type", header: "Transmisi", className: "hidden lg:table-cell" },
    { key: "market_region", header: "Region", className: "hidden lg:table-cell" },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        title="Vehicle Models"
        description="Kelola data merek dan model kendaraan"
        icon={<Car className="h-5 w-5" />}
      />

      <DataTable
        data={vehicles}
        columns={columns}
        isLoading={isLoading}
        idKey="model_id"
        onAdd={() => setIsFormOpen(true)}
        onEdit={handleEdit}
        onDelete={(item) => deleteMutation.mutate(item.model_id)}
        searchPlaceholder="Cari kendaraan..."
        emptyMessage="Belum ada data kendaraan"
      />

      <FormDialog
        open={isFormOpen}
        onOpenChange={(open) => { if (!open) resetForm(); else setIsFormOpen(true); }}
        title={editingItem ? "Edit Kendaraan" : "Tambah Kendaraan"}
        description="Masukkan data kendaraan"
        useSheet
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Manufacturer *</Label>
              <Select value={formData.manufacturer} onValueChange={(v) => setFormData({ ...formData, manufacturer: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                <SelectContent>
                  {manufacturers.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model Name *</Label>
              <Input value={formData.model_name} onChange={(e) => setFormData({ ...formData, model_name: e.target.value })} placeholder="Avanza, Civic..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Year Range</Label>
              <Input value={formData.year_range} onChange={(e) => setFormData({ ...formData, year_range: e.target.value })} placeholder="2020-2024" />
            </div>
            <div className="space-y-2">
              <Label>Engine Type</Label>
              <Input value={formData.engine_type} onChange={(e) => setFormData({ ...formData, engine_type: e.target.value })} placeholder="Bensin 1.5L VVT-i" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Transmission</Label>
              <Select value={formData.transmission_type} onValueChange={(v) => setFormData({ ...formData, transmission_type: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                <SelectContent>
                  {transmissionTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Market Region</Label>
              <Select value={formData.market_region} onValueChange={(v) => setFormData({ ...formData, market_region: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {marketRegions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingItem ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
}
