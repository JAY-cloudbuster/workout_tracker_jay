import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Search, X, Save, Check, History, Star, Clock } from 'lucide-react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const SPLIT_OPTIONS = [
  { value: 'push_pull_legs', label: 'Push/Pull/Legs' },
  { value: 'upper_lower', label: 'Upper/Lower' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'bro_split', label: 'Bro Split' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'custom', label: 'Custom' },
];

const WORKOUT_TYPES = [
  { value: 'strength', label: 'Strength' },
  { value: 'hypertrophy', label: 'Hypertrophy' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'mixed', label: 'Mixed' },
];

const SET_TYPES = [
  { value: 'warmup', label: 'Warmup' },
  { value: 'working', label: 'Working' },
  { value: 'top_set', label: 'Top Set' },
  { value: 'backoff', label: 'Backoff' },
  { value: 'drop_set', label: 'Drop Set' },
  { value: 'failure', label: 'Failure' },
];

interface SetData {
  setNumber: number;
  setType: string;
  weight: number;
  reps: number;
  rpe?: number;
  restTime?: number;
  tempo?: string;
  completed: boolean;
  failure: boolean;
  assisted: boolean;
}

interface ExerciseEntry {
  exercise: string;
  exerciseName: string;
  order: number;
  sets: SetData[];
  notes: string;
  personalNotes: string;
}

export default function NewWorkout() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [split, setSplit] = useState('push_pull_legs');
  const [workoutType, setWorkoutType] = useState('hypertrophy');
  const [location, setLocation] = useState('');
  const [trainingPartner, setTrainingPartner] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Exercise search & selection
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentExercises, setRecentExercises] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'recent' | 'favorites'>('search');

  // Load user data and recent workouts on mount
  useEffect(() => {
    // Note: To implement 'recent' and 'favorites', we would need specific endpoints.
    // For this rewrite, we'll keep the tabs but leave them as placeholders if no data.
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get(`/exercises/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
        setSearchResults(res.data.data);
      } catch { setSearchResults([]); }
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const addExercise = (exercise: any) => {
    setExercises(prev => [...prev, {
      exercise: exercise._id,
      exerciseName: exercise.name,
      order: prev.length + 1,
      sets: [{ setNumber: 1, setType: 'working', weight: 0, reps: 0, completed: false, failure: false, assisted: false }],
      notes: '',
      personalNotes: '',
    }]);
    setShowSearch(false);
    setSearchQuery('');
  };

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index).map((ex, i) => ({ ...ex, order: i + 1 })));
  };

  const addSet = (exIndex: number) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIndex) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [...ex.sets, {
          setNumber: ex.sets.length + 1,
          setType: 'working',
          weight: lastSet?.weight || 0,
          reps: lastSet?.reps || 0,
          tempo: lastSet?.tempo || '',
          restTime: lastSet?.restTime,
          completed: false,
          failure: false,
          assisted: false,
        }],
      };
    }));
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIndex) return ex;
      return {
        ...ex,
        sets: ex.sets.filter((_, si) => si !== setIndex).map((s, si) => ({ ...s, setNumber: si + 1 })),
      };
    }));
  };

  const updateSet = (exIndex: number, setIndex: number, field: string, value: any) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIndex) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s, si) => si === setIndex ? { ...s, [field]: value } : s),
      };
    }));
  };

  const updateExerciseField = (exIndex: number, field: string, value: any) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIndex) return ex;
      return { ...ex, [field]: value };
    }));
  };

  const toggleSetComplete = (exIndex: number, setIndex: number) => {
    updateSet(exIndex, setIndex, 'completed', !exercises[exIndex].sets[setIndex].completed);
  };

  const totalVolume = exercises.reduce((total, ex) =>
    total + ex.sets.reduce((vol, s) => vol + (s.completed ? s.weight * s.reps : 0), 0), 0);

  const totalSets = exercises.reduce((total, ex) =>
    total + ex.sets.filter(s => s.completed).length, 0);

  const totalReps = exercises.reduce((total, ex) =>
    total + ex.sets.reduce((reps, s) => reps + (s.completed ? s.reps : 0), 0), 0);

  const handleSave = async (complete: boolean) => {
    if (!name.trim()) { setError('Please enter a workout name'); return; }
    if (exercises.length === 0) { setError('Please add at least one exercise'); return; }

    setSaving(true);
    setError('');
    
    const tagsArray = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const payload = {
        name,
        split,
        workoutType,
        location,
        trainingPartner,
        tags: tagsArray,
        date: new Date().toISOString(),
        notes,
        mood,
        energy,
        status: complete ? 'completed' : 'draft',
        isCompleted: complete,
        startTime: new Date().toISOString(),
        finishTime: complete ? new Date().toISOString() : undefined,
        exercises: exercises.map(ex => ({
          exercise: ex.exercise,
          order: ex.order,
          sets: ex.sets,
          notes: ex.notes,
          personalNotes: ex.personalNotes,
        })),
      };
      await api.post('/workouts', payload);
      navigate('/workouts');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save workout');
    }
    setSaving(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Workout</h1>
          <p className="text-muted-foreground mt-1">Log your comprehensive training session.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={() => navigate('/workouts')} className="flex-1 md:flex-none">Cancel</Button>
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving} className="flex-1 md:flex-none">
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving} className="flex-1 md:flex-none">
            <Check className="mr-2 h-4 w-4" /> Complete
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">{error}</div>
      )}

      {/* Workout Info */}
      <Card className="glass-card border-none shadow-lg">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>Workout Name *</Label>
              <Input placeholder="e.g. Push Day A" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input placeholder="e.g. Morning, Deload" value={tagsStr} onChange={e => setTagsStr(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Split *</Label>
              <select
                value={split}
                onChange={e => setSplit(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {SPLIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                value={workoutType}
                onChange={e => setWorkoutType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {WORKOUT_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="e.g. Commercial Gym" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Training Partner</Label>
              <Input placeholder="Partner name" value={trainingPartner} onChange={e => setTrainingPartner(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Mood (1-5)</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => setMood(v)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${mood === v ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Energy (1-5)</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => setEnergy(v)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${energy === v ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Workout Notes</Label>
            <textarea
              placeholder="Gym was crowded, felt strong today..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Live Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-none">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold">{exercises.length}</div>
            <div className="text-xs text-muted-foreground">Exercises</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-none">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold">{totalSets}</div>
            <div className="text-xs text-muted-foreground">Completed Sets</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-none">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold">{totalReps}</div>
            <div className="text-xs text-muted-foreground">Total Reps</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-none">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold">{totalVolume.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Volume (kg)</div>
          </CardContent>
        </Card>
      </div>

      {/* Exercises List */}
      {exercises.map((ex, exIndex) => (
        <Card key={exIndex} className="glass-card border-none shadow-lg overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-primary/20 text-primary text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">{exIndex + 1}</span>
                {ex.exerciseName}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="text-muted-foreground" title="Exercise History">
                  <History className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => removeExercise(exIndex)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Set Management Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[600px]">
                {/* Header */}
                <div className="grid grid-cols-[3rem_100px_80px_80px_70px_70px_80px_auto] gap-2 text-xs text-muted-foreground font-medium px-1 mb-2">
                  <span className="text-center">Set</span>
                  <span>Type</span>
                  <span>Weight</span>
                  <span>Reps</span>
                  <span>RPE</span>
                  <span>Tempo</span>
                  <span>Rest (s)</span>
                  <span className="text-right">Done</span>
                </div>

                {/* Sets */}
                <div className="space-y-2">
                  {ex.sets.map((set, setIndex) => (
                    <div key={setIndex} className={`grid grid-cols-[3rem_100px_80px_80px_70px_70px_80px_auto] gap-2 items-center p-2 rounded-lg transition-colors ${set.completed ? 'bg-green-500/10' : 'bg-secondary/50'}`}>
                      <span className="text-center text-sm font-medium text-muted-foreground">{set.setNumber}</span>
                      
                      <select value={set.setType} onChange={e => updateSet(exIndex, setIndex, 'setType', e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                        {SET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      
                      <div className="relative">
                        <Input type="number" value={set.weight || ''} onChange={e => updateSet(exIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)} className="h-8 text-sm pr-6" placeholder="0" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">kg</span>
                      </div>
                      
                      <Input type="number" value={set.reps || ''} onChange={e => updateSet(exIndex, setIndex, 'reps', parseInt(e.target.value) || 0)} className="h-8 text-sm" placeholder="0" />
                      
                      <Input type="number" value={set.rpe || ''} onChange={e => updateSet(exIndex, setIndex, 'rpe', parseFloat(e.target.value) || undefined)} className="h-8 text-sm" placeholder="-" min="1" max="10" />
                      
                      <Input type="text" value={set.tempo || ''} onChange={e => updateSet(exIndex, setIndex, 'tempo', e.target.value)} className="h-8 text-sm placeholder:text-muted-foreground/50" placeholder="3010" />
                      
                      <div className="relative">
                        <Input type="number" value={set.restTime || ''} onChange={e => updateSet(exIndex, setIndex, 'restTime', parseInt(e.target.value) || undefined)} className="h-8 text-sm pr-4" placeholder="120" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">s</span>
                      </div>
                      
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => toggleSetComplete(exIndex, setIndex)} className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${set.completed ? 'bg-green-500 text-white' : 'bg-secondary hover:bg-secondary/80'}`}>
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={() => removeSet(exIndex, setIndex)} className="w-8 h-8 rounded-md flex items-center justify-center bg-secondary hover:bg-destructive/20 hover:text-destructive transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => addSet(exIndex)} className="w-full border-dashed">
              <Plus className="mr-2 h-3 w-3" /> Add Set
            </Button>

            {/* Exercise Notes */}
            <div className="pt-2">
              <textarea
                placeholder="Personal notes for this exercise (e.g. used wrist wraps, shoulder felt stable)..."
                value={ex.personalNotes}
                onChange={e => updateExerciseField(exIndex, 'personalNotes', e.target.value)}
                className="flex min-h-[40px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Exercise Summary Block */}
            <div className="bg-primary/5 rounded-md p-3 flex justify-between items-center text-sm border border-primary/10">
              <div className="font-medium text-primary">Exercise Summary</div>
              <div className="flex gap-4 text-muted-foreground">
                <span>Sets: <strong className="text-foreground">{ex.sets.filter(s => s.completed).length}</strong></span>
                <span>Volume: <strong className="text-foreground">{ex.sets.reduce((vol, s) => vol + (s.completed ? s.weight * s.reps : 0), 0).toLocaleString()} kg</strong></span>
              </div>
            </div>

          </CardContent>
        </Card>
      ))}

      {/* Add Exercise Module */}
      {showSearch ? (
        <Card className="glass-card border-none shadow-lg">
          <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/50">
            <div className="flex gap-4">
              <button onClick={() => setActiveTab('search')} className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'search' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Search</button>
              <button onClick={() => setActiveTab('recent')} className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'recent' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Recent</button>
              <button onClick={() => setActiveTab('favorites')} className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'favorites' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Favorites</button>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            
            {activeTab === 'search' && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search exercises..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" autoFocus />
                </div>
                {searchLoading && <div className="text-sm text-muted-foreground text-center py-4">Searching...</div>}
                {searchResults.length > 0 && (
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {searchResults.map((ex: any) => (
                      <button key={ex._id} onClick={() => addExercise(ex)} className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">{ex.name}</div>
                          <div className="flex gap-2 mt-1">
                            {ex.primaryMuscles?.map((m: string) => (
                              <span key={m} className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">{m.replace('_', ' ')}</span>
                            ))}
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{ex.equipment?.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery && !searchLoading && searchResults.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">No exercises found</div>
                )}
              </>
            )}

            {activeTab === 'recent' && (
              <div className="text-sm text-muted-foreground text-center py-8 flex flex-col items-center gap-2">
                <Clock className="h-8 w-8 text-muted-foreground/50" />
                <p>Recent exercises will appear here.</p>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="text-sm text-muted-foreground text-center py-8 flex flex-col items-center gap-2">
                <Star className="h-8 w-8 text-muted-foreground/50" />
                <p>Favorite an exercise to see it here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowSearch(true)} className="w-full border-dashed h-14 text-muted-foreground hover:text-foreground">
          <Plus className="mr-2 h-5 w-5" /> Add Exercise
        </Button>
      )}
    </div>
  );
}
