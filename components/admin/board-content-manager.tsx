'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Upload,
  Loader2,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText, // Icon untuk PDF / Teks
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { BoardContent } from '@/lib/types';

interface NewItemForm {
  title: string;
  file: File | null;
}

export function BoardContentManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<BoardContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<NewItemForm>({ title: '', file: null });

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/board-content');
    const data = await res.json();
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async () => {
    if (!form.file) {
      toast({ title: 'Missing file', description: 'Please select a file', variant: 'destructive' });
      return;
    }
    if (!form.title.trim()) {
      toast({ title: 'Missing title', description: 'Please enter a title', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('file', form.file);

      const res = await fetch('/api/board-content', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: 'Content added', description: form.title.trim() });
      setDialogOpen(false);
      setForm({ title: '', file: null });
      fetchItems();
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: BoardContent) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      const token = localStorage.getItem('infoboard_token');

      await fetch(`/api/board-content?id=${item.id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast({ title: 'Deleted', description: item.title });
      fetchItems();
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const toggleActive = async (item: BoardContent) => {
    const token = localStorage.getItem('infoboard_token');

    const res = await fetch('/api/board-content', {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
    });
    if (!res.ok) {
      toast({ title: 'Update failed', variant: 'destructive' });
      return;
    }
    fetchItems();
  };

  const moveItem = async (item: BoardContent, direction: 'up' | 'down') => {
    const res = await fetch('/api/board-content/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, direction }),
    });
    if (res.ok) fetchItems();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Board Content</h2>
          <p className="text-sm text-muted-foreground">
            Upload images, Excel files, or PDFs for the main display slider
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({ title: '', file: null });
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Content
        </Button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-muted-foreground">
            <ImageIcon className="h-10 w-10 opacity-30" />
            <p>No content yet. Click "Add Content" to upload.</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex flex-col gap-0.5">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-7 p-0"
                  onClick={() => moveItem(item, 'up')}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-7 p-0"
                  onClick={() => moveItem(item, 'down')}
                  disabled={index === items.length - 1}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Render Icon berdasarkan tipe file */}
              {item.content_type === 'image' && item.file_url ? (
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded border border-border">
                  <img src={item.file_url} alt={item.title} className="h-full w-full object-cover" />
                </div>
              ) : item.content_type === 'image' ? (
                <ImageIcon className="h-5 w-5 shrink-0 text-primary" />
              ) : item.content_type === 'pdf' ? (
                <FileText className="h-5 w-5 shrink-0 text-destructive" />
              ) : (
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-chart-3" />
              )}

              <div className="flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">{item.file_name}</p>
              </div>

              <Badge variant={item.is_active ? 'default' : 'secondary'}>
                {item.is_active ? 'Active' : 'Hidden'}
              </Badge>

              <Button size="sm" variant="ghost" onClick={() => toggleActive(item)}>
                {item.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(item)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Board Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a custom title for this content"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>File (PNG, JPG, JPEG, PDF, or Excel)</Label>
              <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                <input
                  type="file"
                  /* UPDATE: Tambahkan .pdf ke attribute accept */
                  accept=".png,.jpg,.jpeg,.webp,.xlsx,.xls,.csv,.pdf"
                  onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))}
                  className="hidden"
                  id="board-file-upload"
                />
                <label
                  htmlFor="board-file-upload"
                  className="flex cursor-pointer flex-col items-center gap-2"
                >
                  {form.file ? (
                    <>
                      {form.file.type.includes('pdf') ? (
                        <FileText className="h-8 w-8 text-destructive" />
                      ) : (
                        <FileSpreadsheet className="h-8 w-8 text-primary" />
                      )}
                      <span className="text-sm font-medium">{form.file.name}</span>
                      <span className="text-xs text-muted-foreground">Click to change</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to select a file</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Add Content'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}