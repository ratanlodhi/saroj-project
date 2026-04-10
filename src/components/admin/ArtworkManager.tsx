import { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Search, Image as ImageIcon, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useArtworks, type Artwork } from '@/hooks/useArtworks';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { ArtworkImageUpload } from '@/components/article-editor/ArtworkImageUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ArtworkFormData {
  title: string;
  medium: string;
  size: string;
  year: string;
  description: string;
  image_url: string;
  featured: boolean;
  price: number;
  artist_id?: string;
  sold: boolean;
  category_id: string;
  status: string;
  quantity: number;
  commission_percentage: number;
  packaging_type: string;
  shipping_weight: number;
  number_of_panels: number;
  ready_to_hang: boolean;
  decorative_frame: boolean;
}

const initialFormData: ArtworkFormData = {
  title: '',
  medium: '',
  size: '',
  year: new Date().getFullYear().toString(),
  description: '',
  image_url: '',
  featured: false,
  price: 0,
  artist_id: undefined,
  sold: false,
  category_id: '',
  status: 'For Sale',
  quantity: 1,
  commission_percentage: 60,
  packaging_type: '',
  shipping_weight: 0,
  number_of_panels: 1,
  ready_to_hang: false,
  decorative_frame: false,
};

export default function ArtworkManager() {
  const { artworks, loading, createArtwork, updateArtwork, deleteArtwork } = useArtworks();
  const { user } = useAuth();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'pricing' | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [formData, setFormData] = useState<ArtworkFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredArtworks = artworks.filter(artwork =>
    artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artwork.medium.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (artwork.artist || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedArtworks = useMemo(() => {
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;

    return [...filteredArtworks].sort((a, b) => {
      const getStatusValue = (artwork: Artwork) => {
        if (artwork.sold) return 'sold';
        if (artwork.status) return artwork.status.toLowerCase();
        return 'available';
      };

      if (sortBy === 'name') {
        return a.title.localeCompare(b.title) * directionMultiplier;
      }

      if (sortBy === 'pricing') {
        return (a.price - b.price) * directionMultiplier;
      }

      return getStatusValue(a).localeCompare(getStatusValue(b)) * directionMultiplier;
    });
  }, [filteredArtworks, sortBy, sortDirection]);

  const handleSort = (column: 'name' | 'pricing' | 'status') => {
    if (sortBy === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(column);
    setSortDirection(column === 'pricing' ? 'desc' : 'asc');
  };

  const sortMarker = (column: 'name' | 'pricing' | 'status') => {
    if (sortBy !== column) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleOpenDialog = (artwork?: Artwork) => {
    if (artwork) {
      setEditingArtwork(artwork);
      setFormData({
        title: artwork.title,
        medium: artwork.medium,
        size: artwork.size,
        year: artwork.year,
        description: artwork.description,
        image_url: artwork.image_url,
        featured: artwork.featured || false,
        price: artwork.price,
        artist_id: artwork.artist_id || user?.id,
        sold: artwork.sold || false,
        category_id: artwork.category_id || '',
        status: artwork.status || 'For Sale',
        quantity: artwork.quantity || 1,
        commission_percentage: artwork.commission_percentage || 60,
        packaging_type: artwork.packaging_type || '',
        shipping_weight: artwork.shipping_weight || 0,
        number_of_panels: artwork.number_of_panels || 1,
        ready_to_hang: artwork.ready_to_hang || false,
        decorative_frame: artwork.decorative_frame || false,
      });
    } else {
      setEditingArtwork(null);
      setFormData({
        ...initialFormData,
        artist_id: user?.id,
        category_id: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingArtwork(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result = null;

      if (editingArtwork) {
        result = await updateArtwork(editingArtwork.id, formData);
      } else {
        result = await createArtwork(formData);
      }

      // Keep dialog open if save failed so user can correct invalid input.
      if (result) {
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving artwork:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteArtwork(id);
  };

  const handleInputChange = (field: keyof ArtworkFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-medium text-primary">Paintings Management</h2>
          <p className="text-muted-foreground font-sans mt-1">
            Manage your artwork collection
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus size={18} />
          Add New Painting
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-serif font-medium text-primary">{artworks.length}</div>
          <div className="text-sm text-muted-foreground">Total Paintings</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-serif font-medium text-primary">
            {artworks.filter(a => a.featured).length}
          </div>
          <div className="text-sm text-muted-foreground">Featured</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-serif font-medium text-primary">
            {artworks.filter(a => a.sold).length}
          </div>
          <div className="text-sm text-muted-foreground">Sold</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-serif font-medium text-primary">
            {artworks.filter(a => !a.sold).length}
          </div>
          <div className="text-sm text-muted-foreground">Available</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search paintings by title, medium, or artist..."
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sortedArtworks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? 'No paintings match your search' : 'No paintings found'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item No</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => handleSort('name')}
                    className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                    aria-label={`Sort by item name ${sortBy === 'name' && sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                  >
                    Item Name <span className="text-xs text-muted-foreground">{sortMarker('name')}</span>
                  </button>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => handleSort('pricing')}
                    className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                    aria-label={`Sort by pricing ${sortBy === 'pricing' && sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                  >
                    Pricing <span className="text-xs text-muted-foreground">{sortMarker('pricing')}</span>
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => handleSort('status')}
                    className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                    aria-label={`Sort by status ${sortBy === 'status' && sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                  >
                    Status <span className="text-xs text-muted-foreground">{sortMarker('status')}</span>
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedArtworks.map((artwork, index) => (
                <TableRow key={artwork.id}>
                  <TableCell className="font-mono text-sm">{index + 1}</TableCell>
                  <TableCell>
                    <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center">
                      {artwork.image ? (
                        <img
                          src={artwork.image}
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={20} className="text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-primary">{artwork.title}</div>
                      <div className="text-sm text-muted-foreground">{artwork.artist}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm text-muted-foreground">
                      {artwork.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {categories.find(c => c.id === artwork.category_id)?.name || artwork.medium || '—'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatPrice(artwork.price)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {artwork.featured && <Badge variant="default">Featured</Badge>}
                      {artwork.sold ? (
                        <Badge variant="destructive">Sold</Badge>
                      ) : (
                        <Badge variant="outline">Available</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(artwork)}
                        className="gap-1"
                      >
                        <Edit size={14} />
                        Update
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                            <Trash2 size={14} />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Painting?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{artwork.title}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(artwork.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArtwork ? 'Update Painting' : 'Add New Painting'}
            </DialogTitle>
            <DialogDescription>
              {editingArtwork ? 'Modify the painting details below.' : 'Fill in the details for the new painting.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details & Pricing</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category_id || ''}
                      onValueChange={(val) => handleInputChange('category_id', val)}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 && (
                          <SelectItem value="_none" disabled>
                            No categories available
                          </SelectItem>
                        )}
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medium">Medium</Label>
                    <Input
                      id="medium"
                      value={formData.medium}
                      onChange={(e) => handleInputChange('medium', e.target.value)}
                      placeholder="e.g., Acrylic on Canvas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Size *</Label>
                    <Input
                      id="size"
                      value={formData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      placeholder="e.g., 30 × 30 cm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="text"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    placeholder="e.g., 2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Upload Image *</Label>
                  <ArtworkImageUpload 
                    onImageUpload={(url) => handleInputChange('image_url', url)}
                  />
                  {formData.image_url && (
                    <div className="text-sm text-green-600 font-medium">
                      ✓ Image: {formData.image_url}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => {
                        const rawPrice = e.target.value;
                        const parsedPrice = Number(rawPrice);
                        handleInputChange('price', Number.isFinite(parsedPrice) ? parsedPrice : 0);
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayPrice">Display Price</Label>
                    <div className="p-2 bg-muted rounded text-sm font-medium">
                      {formatPrice(formData.price)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  />
                  <Label htmlFor="featured">Featured painting</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="sold"
                    checked={formData.sold}
                    onCheckedChange={(checked) => handleInputChange('sold', checked)}
                  />
                  <Label htmlFor="sold">Mark as sold</Label>
                </div>

                {/* Price & Details Section */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-primary mb-4">Price & Details</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Input
                        id="status"
                        type="text"
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        placeholder="e.g., For Sale, Not For Sale"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleInputChange('quantity', val > 0 ? val : 1);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="commission">Commission Percentage</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="commission"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.commission_percentage}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleInputChange('commission_percentage', val >= 0 ? val : 0);
                        }}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                      <span className="text-sm font-medium">
                        ${((formData.price * formData.commission_percentage) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Weight & Packaging */}
                  <div className="border-t mt-6 pt-6">
                    <h4 className="text-sm font-semibold text-primary mb-4">Weight & Packaging</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="packagingType">Packaging Type</Label>
                        <Input
                          id="packagingType"
                          type="text"
                          value={formData.packaging_type}
                          onChange={(e) => handleInputChange('packaging_type', e.target.value)}
                          placeholder="e.g., Tube, Box, Envelope"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingWeight">Shipping Weight (lb)</Label>
                        <Input
                          id="shippingWeight"
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.shipping_weight}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            handleInputChange('shipping_weight', val >= 0 ? val : 0);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="border-t mt-6 pt-6">
                    <h4 className="text-sm font-semibold text-primary mb-4">Additional Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="numberOfPanels">Number of Panels</Label>
                        <Input
                          id="numberOfPanels"
                          type="number"
                          min="1"
                          value={formData.number_of_panels}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            handleInputChange('number_of_panels', val > 0 ? val : 1);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="readyToHang"
                          checked={formData.ready_to_hang}
                          onCheckedChange={(checked) => handleInputChange('ready_to_hang', checked)}
                        />
                        <Label htmlFor="readyToHang">Ready to Hang</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="decorativeFrame"
                          checked={formData.decorative_frame}
                          onCheckedChange={(checked) => handleInputChange('decorative_frame', checked)}
                        />
                        <Label htmlFor="decorativeFrame">Decorative Frame</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingArtwork ? 'Update Painting' : 'Add Painting'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
