import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, ShieldOff, Search, Users, Palette, FileText, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ArtworkManager from '@/components/admin/ArtworkManager';
import ArticleManager from '@/components/admin/ArticleManager';
import ShippingInsuranceSettings from '@/components/admin/ShippingInsuranceSettings';

const ONE_HOUR_MS = 60 * 60 * 1000;

interface UserWithRole {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  isAdmin: boolean;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading, roleResolved } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [authTimedOut, setAuthTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      setAuthTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      console.warn('[AdminPage] auth check timed out, redirecting to /auth');
      setAuthTimedOut(true);
      navigate('/auth', { state: { returnTo: '/admin' } });
    }, ONE_HOUR_MS);

    return () => clearTimeout(timer);
  }, [loading, navigate]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in - redirect to auth with returnTo
        navigate('/auth', { state: { returnTo: '/admin' } });
      } else if (roleResolved && !isAdmin) {
        // Logged in but not admin - redirect to home
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access the admin panel',
          variant: 'destructive',
        });
        navigate('/');
      }
    }
  }, [user, isAdmin, loading, roleResolved, navigate, toast]);

  useEffect(() => {
    console.log('[AdminPage] auth state', {
      loading,
      authTimedOut,
      hasUser: Boolean(user),
      userEmail: user?.email || null,
      isAdmin,
      roleResolved,
    });
  }, [loading, authTimedOut, user, isAdmin, roleResolved]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoadingUsers(true);

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
      setLoadingUsers(false);
      return;
    }

    // Get all admin roles
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (rolesError) {
      toast({
        title: 'Error',
        description: 'Failed to load roles',
        variant: 'destructive',
      });
      setLoadingUsers(false);
      return;
    }

    const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);

    const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
      id: profile.id,
      email: profile.email,
      display_name: profile.display_name,
      created_at: profile.created_at,
      isAdmin: adminUserIds.has(profile.id),
    }));

    setUsers(usersWithRoles);
    setLoadingUsers(false);
  };

  const grantAdmin = async (userId: string) => {
    setProcessingId(userId);

    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: 'admin' });

    setProcessingId(null);

    if (error) {
      toast({
        title: 'Error',
        description: error.message.includes('duplicate') 
          ? 'User is already an admin' 
          : 'Failed to grant admin access',
        variant: 'destructive',
      });
      return;
    }

    setUsers(users.map(u => u.id === userId ? { ...u, isAdmin: true } : u));
    toast({
      title: 'Success',
      description: 'Admin access granted',
    });
  };

  const revokeAdmin = async (userId: string) => {
    if (userId === user?.id) {
      toast({
        title: 'Cannot Revoke',
        description: 'You cannot revoke your own admin access',
        variant: 'destructive',
      });
      return;
    }

    setProcessingId(userId);

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');

    setProcessingId(null);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke admin access',
        variant: 'destructive',
      });
      return;
    }

    setUsers(users.map(u => u.id === userId ? { ...u, isAdmin: false } : u));
    toast({
      title: 'Success',
      description: 'Admin access revoked',
    });
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = users.filter(u => u.isAdmin).length;

  if ((loading || (Boolean(user) && !roleResolved)) && !authTimedOut) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loading && authTimedOut) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="max-w-md text-center px-4">
          <h1 className="font-serif text-2xl text-primary">Admin Session Check Delayed</h1>
          <p className="text-muted-foreground mt-2">
            Unable to validate your admin session quickly. Please continue to login.
          </p>
          <Button className="mt-6" onClick={() => navigate('/auth', { state: { returnTo: '/admin' } })}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/media')} className="gap-2">
            <ArrowLeft size={18} />
            Back
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/orders')}>
            Manage Orders
          </Button>
        </div>

        <div className="text-center mb-12">
          <span className="text-xs tracking-[0.3em] uppercase text-accent font-sans">Administration</span>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-primary mt-4">
            Admin Panel
          </h1>
          <p className="text-muted-foreground font-sans mt-2">
            Manage users, paintings, articles, and shipping settings
          </p>
          <div className="section-divider mt-6" />
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="users" className="gap-2">
              <Shield size={16} />
              User Management
            </TabsTrigger>
            <TabsTrigger value="paintings" className="gap-2">
              <Palette size={16} />
              Paintings Management
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-2">
              <FileText size={16} />
              Article Management
            </TabsTrigger>
            <TabsTrigger value="shipping" className="gap-2">
              <Truck size={16} />
              Shipping Percentages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <Users className="mx-auto text-muted-foreground mb-2" size={24} />
                <div className="text-2xl font-serif font-medium text-primary">{users.length}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <Shield className="mx-auto text-accent mb-2" size={24} />
                <div className="text-2xl font-serif font-medium text-primary">{adminCount}</div>
                <div className="text-sm text-muted-foreground">Admins</div>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by email or name..."
                className="pl-10"
              />
            </div>

            {/* Users Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {loadingUsers ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? 'No users match your search' : 'No users found'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-primary">
                              {u.display_name || u.email.split('@')[0]}
                            </div>
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {u.isAdmin ? (
                            <Badge variant="default" className="bg-accent text-accent-foreground">
                              <Shield size={12} className="mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary">User</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {u.isAdmin ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  disabled={u.id === user?.id || processingId === u.id}
                                >
                                  <ShieldOff size={14} />
                                  {processingId === u.id ? 'Revoking...' : 'Revoke'}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Revoke Admin Access?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove admin privileges from {u.email}. They will no longer be able to create articles or manage users.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => revokeAdmin(u.id)}>
                                    Revoke Access
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="gap-2"
                                  disabled={processingId === u.id}
                                >
                                  <Shield size={14} />
                                  {processingId === u.id ? 'Granting...' : 'Make Admin'}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Grant Admin Access?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will give {u.email} full admin privileges, including the ability to create/edit articles and manage other admins.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => grantAdmin(u.id)}>
                                    Grant Access
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Help text */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Admins can create, edit, and delete articles, and manage other users' admin access.
            </p>
          </TabsContent>

          <TabsContent value="paintings">
            <ArtworkManager />
          </TabsContent>

          <TabsContent value="articles" forceMount>
            <ArticleManager />
          </TabsContent>

          <TabsContent value="shipping" forceMount>
            <ShippingInsuranceSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
