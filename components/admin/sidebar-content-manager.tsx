'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Upload,
  Loader2,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch'; // <-- Tambahkan import Switch
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { SidebarContent, SidebarPosition, PanelSetting } from '@/lib/types';
import { SIDEBAR_POSITIONS } from '@/lib/types';

interface NewItemForm {
  position: SidebarPosition;
  title: string;
  contentType: 'file' | 'text';
  file: File | null;
  textContent: string;
  isScroll: boolean; // <-- Field baru untuk kontrol scroll
}

export function SidebarContentManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<SidebarContent[]>([]);
  const [panelSettings, setPanelSettings] = useState<PanelSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarPosition>('left_top');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);
  
  const [form, setForm] = useState<NewItemForm>({
    position: 'left_top',
    title: '',
    contentType: 'file',
    file: null,
    textContent: '',
    isScroll: true, // Default aktifkan auto scroll
  });

  const fetchItems = useCallback(async () => {
    const [sidebarRes, panelRes] = await Promise.all([
      fetch('/api/sidebar-content'),
      fetch('/api/panel-settings'),
    ]);
    const sidebarData = await sidebarRes.json();
    const panelData = await panelRes.json();
    setItems(sidebarData ?? []);
    setPanelSettings(panelData ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const panelTitle = (pos: SidebarPosition) =>
    panelSettings.find((p) => p.position === pos)?.title ??
    SIDEBAR_POSITIONS.find((s) => s.key === pos)?.label ??
    pos;

  const handleSaveTitle = async () => {
    if (!titleDraft.trim()) {
      toast({ title: 'Title cannot be empty', variant: 'destructive' });
      return;
    }

    setSavingTitle(true);
    const res = await fetch('/api/panel-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: activeTab, title: titleDraft.trim() }),
    });

    if (!res.ok) {
      toast({ title: 'Failed to save title', variant: 'destructive' });
      setSavingTitle(false);
      return;
    }

    toast({ title: 'Title updated' });
    setEditingTitle(false);
    setSavingTitle(false);
    fetchItems();
  };

  const startEditTitle = () => {
    setTitleDraft(panelTitle(activeTab));
    setEditingTitle(true);
  };

  const handleAdd = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Missing title', description: 'Please enter a title', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('position', form.position);
      formData.append('title', form.title.trim());
      formData.append('contentType', form.contentType);

      if (form.contentType === 'text') {
        formData.append('textContent', form.textContent);
        formData.append('isScroll', String(form.isScroll)); // <-- Kirim status scroll ke backend
      } else if (form.file) {
        formData.append('file', form.file);
      } else {
        toast({ title: 'Missing file', description: 'Please select a file', variant: 'destructive' });
        setUploading(false);
        return;
      }

      const res = await fetch('/api/sidebar-content', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({ title: 'Sidebar content added', description: form.title.trim() });
      setDialogOpen(false);
      setForm({ position: activeTab, title: '', contentType: 'file', file: null, textContent: '', isScroll: true });
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

  const handleDelete = async (item: SidebarContent) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await fetch(`/api/sidebar-content?id=${item.id}`, { method: 'DELETE' });
      toast({ title: 'Deleted', description: item.title });
      fetchItems();
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const toggleActive = async (item: SidebarContent) => {
    const res = await fetch('/api/sidebar-content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
    });
    if (!res.ok) {
      toast({ title: 'Update failed', variant: 'destructive' });
      return;
    }
    fetchItems();
  };

  const moveItem = async (item: SidebarContent, direction: 'up' | 'down') => {
    const res = await fetch('/api/sidebar-content/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, direction, position: activeTab }),
    });
    if (res.ok) fetchItems();
  };

  const filteredItems = items
    .filter((i) => i.position === activeTab)
    .sort((a, b) => a.sort_order - b.sort_order);

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
          <h2 className="text-lg font-semibold">Sidebar Content</h2>
          <p className="text-sm text-muted-foreground">
            Manage the four sidebar panels and their custom titles
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({ position: activeTab, title: '', contentType: 'file', file: null, textContent: '', isScroll: true });
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Content
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as SidebarPosition);
          setEditingTitle(false);
        }}
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          {SIDEBAR_POSITIONS.map((pos) => (
            <TabsTrigger key={pos.key} value={pos.key}>
              {pos.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
        {editingTitle ? (
          <>
            <Input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              placeholder="Panel title"
              className="flex-1"
              autoFocus
            />
            <Button size="sm" onClick={handleSaveTitle} disabled={savingTitle}>
              {savingTitle ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="mr-1 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditingTitle(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1">
              <span className="text-xs text-muted-foreground">Panel Title: </span>
              <span className="text-sm font-semibold">{panelTitle(activeTab)}</span>
            </div>
            <Button size="sm" variant="outline" onClick={startEditTitle}>
              Edit Title
            </Button>
          </>
        )}
      </div>

      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-muted-foreground">
            <FileText className="h-10 w-10 opacity-30" />
            <p>No content yet for this panel.</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
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
                  disabled={index === filteredItems.length - 1}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>

              {item.content_type === 'image' && item.file_url ? (
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded border border-border">
                  <img src={item.file_url} alt={item.title} className="h-full w-full object-cover" />
                </div>
              ) : item.content_type === 'image' ? (
                <ImageIcon className="h-5 w-5 shrink-0 text-primary" />
              ) : item.content_type === 'excel' ? (
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-chart-3" />
              ) : (
                <FileText className="h-5 w-5 shrink-0 text-chart-2" />
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.content_type === 'text' && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {/* Menggunakan ?? true/false agar aman dari nilai undefined */}
                      {(item.is_scroll ?? true) ? 'Auto Scroll' : 'Static'}
                    </Badge>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {item.content_type === 'text'
                    ? item.text_content?.slice(0, 60) ?? 'Empty text'
                    : item.file_name}
                </p>
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
            <DialogTitle>Add Content to {panelTitle(activeTab)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sidebar-title">Title</Label>
              <Input
                id="sidebar-title"
                placeholder="Content title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select
                value={form.contentType}
                onValueChange={(v) => setForm((f) => ({ ...f, contentType: v as 'file' | 'text' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">File (Image/Excel)</SelectItem>
                  <SelectItem value="text">Text Content</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.contentType === 'text' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="sidebar-text">Text Content</Label>
                  <Textarea
                    id="sidebar-text"
                    placeholder="Enter the text to display..."
                    rows={5}
                    value={form.textContent}
                    onChange={(e) => setForm((f) => ({ ...f, textContent: e.target.value }))}
                  />
                </div>

                {/* --- COMPONENT TOGGLE AUTO SCROLL --- */}
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="scroll-mode" className="cursor-pointer">Auto Scroll Text</Label>
                    <p className="text-xs text-muted-foreground">
                      Teks akan berjalan otomatis dari bawah ke atas.
                    </p>
                  </div>
                  <Switch
                    id="scroll-mode"
                    checked={form.isScroll}
                    onCheckedChange={(checked) => setForm((f) => ({ ...f, isScroll: checked }))}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>File (PNG, JPG, JPEG, or Excel)</Label>
                <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.xlsx,.xls,.csv"
                    onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))}
                    className="hidden"
                    id="sidebar-file-upload"
                  />
                  <label
                    htmlFor="sidebar-file-upload"
                    className="flex cursor-pointer flex-col items-center gap-2"
                  >
                    {form.file ? (
                      <>
                        <FileSpreadsheet className="h-8 w-8 text-primary" />
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
            )}
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