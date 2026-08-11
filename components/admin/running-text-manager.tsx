'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Loader2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { RunningText } from '@/lib/types';

export function RunningTextManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<RunningText[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState('');

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/running-text');
    const data = await res.json();
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async () => {
    if (!newText.trim()) return;
    const res = await fetch('/api/running-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText.trim() }),
    });
    if (!res.ok) {
      toast({ title: 'Failed to add', variant: 'destructive' });
      return;
    }
    setNewText('');
    toast({ title: 'Running text added' });
    fetchItems();
  };

  const handleDelete = async (item: RunningText) => {
    const res = await fetch(`/api/running-text?id=${item.id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast({ title: 'Delete failed', variant: 'destructive' });
      return;
    }
    toast({ title: 'Deleted' });
    fetchItems();
  };

  const toggleActive = async (item: RunningText) => {
    const res = await fetch('/api/running-text', {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Running Text</h2>
        <p className="text-sm text-muted-foreground">
          Scrolling text shown at the bottom of the TV display
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter running text message..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={!newText.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No running text yet. Add one above.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
              <span className="w-6 text-center text-xs text-muted-foreground">{index + 1}</span>
              <p className="flex-1 text-sm text-foreground">{item.text}</p>
              <div className="flex items-center gap-2">
                <Badge variant={item.is_active ? 'default' : 'secondary'}>
                  {item.is_active ? 'Active' : 'Hidden'}
                </Badge>
                <Switch checked={item.is_active} onCheckedChange={() => toggleActive(item)} />
                <Button size="sm" variant="ghost" onClick={() => handleDelete(item)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
