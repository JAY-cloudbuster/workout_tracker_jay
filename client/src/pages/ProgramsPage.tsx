import { useState, useEffect } from 'react';
import { Plus, ClipboardList, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { formatDate } from '../lib/utils';

const SPLIT_OPTIONS = [
  { value: 'push_pull_legs', label: 'Push/Pull/Legs' },
  { value: 'upper_lower', label: 'Upper/Lower' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'bro_split', label: 'Bro Split' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'custom', label: 'Custom' },
];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [split, setSplit] = useState('push_pull_legs');
  const [weeks, setWeeks] = useState(4);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/programs');
      setPrograms(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await api.post('/programs', {
        name,
        description,
        splitType: split,
        durationWeeks: weeks,
        mesocycles: [{
          name: 'Mesocycle 1',
          weeks,
          goal: 'hypertrophy',
          workoutTemplates: [],
        }],
      });
      setShowCreate(false);
      setName('');
      setDescription('');
      fetchPrograms();
    } catch (error) {
      console.error('Failed to create program:', error);
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this program?')) return;
    try {
      await api.delete(`/programs/${id}`);
      setPrograms(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground mt-1">Create and manage your training programs.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Program
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="glass-card border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Create New Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Program Name</Label>
                <Input placeholder="e.g. PPL Hypertrophy Block" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Split Type</Label>
                <select value={split} onChange={e => setSplit(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {SPLIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duration (weeks)</Label>
              <Input type="number" value={weeks} onChange={e => setWeeks(parseInt(e.target.value) || 4)} min={1} max={52} className="w-32" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea placeholder="Describe your program goals..." value={description} onChange={e => setDescription(e.target.value)} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={creating || !name.trim()}>
                {creating ? 'Creating...' : 'Create Program'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Programs List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : programs.length > 0 ? (
        <div className="grid gap-4">
          {programs.map((program) => (
            <Card key={program._id} className="glass-card border-none hover:bg-card/90 transition-colors group overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      {program.name}
                      {program.isActive && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">Active</span>}
                    </h3>
                    {program.description && (
                      <p className="text-sm text-muted-foreground">{program.description}</p>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground gap-4 mt-2">
                      <span className="capitalize">{program.splitType?.replace('_', ' ')}</span>
                      <span>{program.durationWeeks || 0} weeks</span>
                      {program.createdAt && <span>Created {formatDate(program.createdAt)}</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(program._id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card border-dashed border-2 border-border/50 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No programs yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">Create a structured training program to organize your workouts into mesocycles.</p>
            <Button onClick={() => setShowCreate(true)}>Create Your First Program</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
