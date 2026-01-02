import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, Users, Search, AlertTriangle, TrendingUp, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AppRole = "admin" | "senior_technician" | "technician";

interface UserWithRole {
  user_id: string;
  role: AppRole;
  created_at: string;
  profile: {
    full_name: string | null;
  } | null;
}

interface SearchQuery {
  id: string;
  original_query: string;
  translated_keywords: string[] | null;
  search_count: number | null;
  has_results: boolean | null;
  last_searched_at: string | null;
}

export default function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is admin
  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      return data?.role === "admin";
    },
    enabled: !!user?.id,
  });

  // Fetch all users with roles
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role,
          created_at,
          profile:profiles!user_roles_user_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as UserWithRole[];
    },
    enabled: isAdmin === true,
  });

  // Fetch search analytics
  const { data: searchQueries = [] } = useQuery({
    queryKey: ["searchAnalytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("search_queries")
        .select("*")
        .order("search_count", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as SearchQuery[];
    },
    enabled: isAdmin === true,
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("Role berhasil diupdate");
    },
    onError: (error) => {
      toast.error("Gagal update role: " + error.message);
    },
  });

  // Delete search query mutation
  const deleteSearchMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("search_queries")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchAnalytics"] });
      toast.success("Query dihapus");
    },
  });

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "senior_technician":
        return "default";
      case "technician":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-bold text-destructive mb-2">Akses Ditolak</h2>
            <p className="text-muted-foreground">
              Anda tidak memiliki izin untuk mengakses halaman ini.
              Hanya admin yang dapat mengakses Admin Panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const popularSearches = searchQueries.filter(q => q.has_results);
  const noResultSearches = searchQueries.filter(q => !q.has_results);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground">Kelola user dan analisis sistem</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{searchQueries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Data Gaps</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{noResultSearches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {searchQueries.length > 0 
                ? Math.round((popularSearches.length / searchQueries.length) * 100) 
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="searches" className="gap-2">
            <Search className="h-4 w-4" />
            Search Analytics
          </TabsTrigger>
          <TabsTrigger value="gaps" className="gap-2">
            <Database className="h-4 w-4" />
            Data Gaps
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Kelola user dan role mereka</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Bergabung</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userItem) => (
                      <TableRow key={userItem.user_id}>
                        <TableCell className="font-mono text-xs">
                          {userItem.user_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {userItem.profile?.full_name || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(userItem.role)}>
                            {userItem.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(userItem.created_at).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={userItem.role}
                            onValueChange={(value) => {
                              if (userItem.user_id === user?.id && value !== "admin") {
                                toast.error("Tidak bisa mengubah role diri sendiri");
                                return;
                              }
                              updateRoleMutation.mutate({
                                userId: userItem.user_id,
                                newRole: value as AppRole,
                              });
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="senior_technician">Senior Technician</SelectItem>
                              <SelectItem value="technician">Technician</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Analytics Tab */}
        <TabsContent value="searches">
          <Card>
            <CardHeader>
              <CardTitle>Pencarian Populer</CardTitle>
              <CardDescription>Query yang sering dicari dan berhasil menemukan hasil</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Last Search</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {popularSearches.map((query) => (
                    <TableRow key={query.id}>
                      <TableCell className="font-medium">{query.original_query}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {query.translated_keywords?.slice(0, 3).map((kw, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{query.search_count}x</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {query.last_searched_at 
                          ? new Date(query.last_searched_at).toLocaleDateString("id-ID")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {popularSearches.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Belum ada data pencarian
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Gaps Tab */}
        <TabsContent value="gaps">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Data Gaps - Perlu Ditambahkan
              </CardTitle>
              <CardDescription>
                Query yang dicari user tapi tidak ada di database. Tambahkan data ini secara manual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {noResultSearches.map((query) => (
                    <TableRow key={query.id}>
                      <TableCell className="font-medium">{query.original_query}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {query.translated_keywords?.slice(0, 3).map((kw, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{query.search_count}x</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSearchMutation.mutate(query.id)}
                        >
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {noResultSearches.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Tidak ada data gap. Semua pencarian menemukan hasil!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
