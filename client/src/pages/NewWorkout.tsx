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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-3xl mx-auto font-sans">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
        <div className="w-full">
          <input
            type="text"
            placeholder="Untitled Workout"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-transparent border-none outline-none font-serif text-4xl md:text-5xl font-semibold placeholder:text-muted-foreground/30 focus:ring-0 p-0 text-foreground"
          />
          <div className="flex items-center gap-2 text-muted-foreground mt-2">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <Button variant="ghost" onClick={() => navigate('/workouts')} className="flex-1 md:flex-none hover:bg-muted text-muted-foreground">Cancel</Button>
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving} className="flex-1 md:flex-none border-border/50">
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving} className="flex-1 md:flex-none shadow-lg shadow-primary/20">
            <Check className="mr-2 h-4 w-4" /> Complete
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20">{error}</div>
      )}

      {/* Live Stats Summary */}
      <div className="flex flex-wrap items-center gap-6 mb-12 py-6 border-y border-border/40">
        <div>
          <div className="text-3xl font-serif font-medium">{exercises.length}</div>
          <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Exercises</div>
        </div>
        <div className="w-px h-10 bg-border/40 hidden md:block"></div>
        <div>
          <div className="text-3xl font-serif font-medium">{totalSets}</div>
          <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Sets Done</div>
        </div>
        <div className="w-px h-10 bg-border/40 hidden md:block"></div>
        <div>
          <div className="text-3xl font-serif font-medium">{totalVolume.toLocaleString()}</div>
          <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Volume (kg)</div>
        </div>
      </div>

      {/* Metadata Section - Clean Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-16">
        <div className="space-y-6">
          <div className="space-y-1.5 border-b border-border/30 pb-2 focus-within:border-primary/50 transition-colors">
            <Label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Split Type</Label>
            <select
              value={split}
              onChange={e => setSplit(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-base p-0 cursor-pointer text-foreground focus:ring-0"
            >
              {SPLIT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-background">{o.label}</option>)}
            </select>
          </div>
          
          <div className="space-y-1.5 border-b border-border/30 pb-2 focus-within:border-primary/50 transition-colors">
            <Label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Training Goal</Label>
            <select
              value={workoutType}
              onChange={e => setWorkoutType(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-base p-0 cursor-pointer text-foreground focus:ring-0"
            >
              {WORKOUT_TYPES.map(o => <option key={o.value} value={o.value} className="bg-background">{o.label}</option>)}
            </select>
          </div>
          
          <div className="space-y-1.5 border-b border-border/30 pb-2 focus-within:border-primary/50 transition-colors">
            <Label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Tags</Label>
            <input 
              placeholder="e.g. Morning, Deload" 
              value={tagsStr} 
              onChange={e => setTagsStr(e.target.value)} 
              className="w-full bg-transparent border-none outline-none text-base p-0 placeholder:text-muted-foreground/30 text-foreground"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5 border-b border-border/30 pb-2 focus-within:border-primary/50 transition-colors">
            <Label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Location</Label>
            <input 
              placeholder="e.g. Commercial Gym" 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              className="w-full bg-transparent border-none outline-none text-base p-0 placeholder:text-muted-foreground/30 text-foreground"
            />
          </div>
          
          <div className="flex items-center justify-between border-b border-border/30 pb-2">
            <Label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Mood</Label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(v => (
                <button 
                  key={v} 
                  onClick={() => setMood(v)} 
                  className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${mood === v ? 'bg-primary text-primary-foreground scale-110 shadow-md shadow-primary/20' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between border-b border-border/30 pb-2">
            <Label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Energy</Label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(v => (
                <button 
                  key={v} 
                  onClick={() => setEnergy(v)} 
                  className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${energy === v ? 'bg-primary text-primary-foreground scale-110 shadow-md shadow-primary/20' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-span-1 md:col-span-2 space-y-1.5 border-b border-border/30 pb-2 focus-within:border-primary/50 transition-colors">
          <Label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Journal Entry (Notes)</Label>
          <textarea
            placeholder="How did the session feel? Any particular highlights..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full min-h-[80px] bg-transparent border-none outline-none text-base p-0 resize-none placeholder:text-muted-foreground/30 text-foreground"
          />
        </div>
      </div>

      {/* Exercises Section (The "Chapters") */}
      <div className="space-y-12 mb-16">
        {exercises.map((ex, exIndex) => (
          <div key={exIndex} className="relative pl-0 md:pl-8 group">
            {/* Minimal line indicator for exercises on desktop */}
            <div className="hidden md:block absolute left-0 top-2 bottom-0 w-px bg-border/30 group-hover:bg-primary/30 transition-colors"></div>
            
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-serif text-2xl md:text-3xl font-medium text-foreground flex items-center gap-3">
                  <span className="text-primary/50 text-xl">{exIndex + 1}.</span> 
                  {ex.exerciseName}
                </h3>
              </div>
              <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted">
                  <History className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => removeExercise(exIndex)} className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sets Grid - Minimalist Redesign */}
            <div className="space-y-3 mb-6">
              {/* Header row */}
              <div className="grid grid-cols-[30px_1fr_60px_60px_60px_60px_60px_40px] md:grid-cols-[40px_1fr_80px_80px_80px_80px_80px_60px] gap-2 md:gap-4 px-2 text-[10px] md:text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                <div className="text-center">Set</div>
                <div>Type</div>
                <div className="text-center">kg</div>
                <div className="text-center">Reps</div>
                <div className="text-center">RPE</div>
                <div className="text-center hidden md:block">Tempo</div>
                <div className="text-center hidden md:block">Rest (s)</div>
                <div></div>
              </div>

              {ex.sets.map((set, setIndex) => (
                <div 
                  key={setIndex} 
                  className={`grid grid-cols-[30px_1fr_60px_60px_60px_60px_60px_40px] md:grid-cols-[40px_1fr_80px_80px_80px_80px_80px_60px] gap-2 md:gap-4 items-center p-2 rounded-xl transition-all duration-300 ${set.completed ? 'bg-primary/5 shadow-sm border border-primary/10' : 'bg-muted/30 border border-transparent hover:border-border/50'}`}
                >
                  <div className={`text-center font-serif text-sm ${set.completed ? 'text-primary' : 'text-muted-foreground'}`}>{set.setNumber}</div>
                  
                  <select 
                    value={set.setType} 
                    onChange={e => updateSet(exIndex, setIndex, 'setType', e.target.value)} 
                    className="bg-transparent border-none outline-none text-xs md:text-sm p-0 cursor-pointer focus:ring-0 w-full"
                  >
                    {SET_TYPES.map(t => <option key={t.value} value={t.value} className="bg-background">{t.label}</option>)}
                  </select>
                  
                  <input 
                    type="number" 
                    value={set.weight || ''} 
                    onChange={e => updateSet(exIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)} 
                    className="bg-transparent border-none outline-none text-center text-sm md:text-base font-medium p-0 focus:ring-0 placeholder:text-muted-foreground/30" 
                    placeholder="-" 
                  />
                  
                  <input 
                    type="number" 
                    value={set.reps || ''} 
                    onChange={e => updateSet(exIndex, setIndex, 'reps', parseInt(e.target.value) || 0)} 
                    className="bg-transparent border-none outline-none text-center text-sm md:text-base font-medium p-0 focus:ring-0 placeholder:text-muted-foreground/30" 
                    placeholder="-" 
                  />
                  
                  <input 
                    type="number" 
                    value={set.rpe || ''} 
                    onChange={e => updateSet(exIndex, setIndex, 'rpe', parseFloat(e.target.value) || undefined)} 
                    className="bg-transparent border-none outline-none text-center text-sm md:text-base font-medium p-0 focus:ring-0 placeholder:text-muted-foreground/30" 
                    placeholder="-" 
                    min="1" max="10" 
                  />
                  
                  <input 
                    type="text" 
                    value={set.tempo || ''} 
                    onChange={e => updateSet(exIndex, setIndex, 'tempo', e.target.value)} 
                    className="bg-transparent border-none outline-none text-center text-xs md:text-sm p-0 focus:ring-0 placeholder:text-muted-foreground/30 hidden md:block" 
                    placeholder="3010" 
                  />
                  
                  <input 
                    type="number" 
                    value={set.restTime || ''} 
                    onChange={e => updateSet(exIndex, setIndex, 'restTime', parseInt(e.target.value) || undefined)} 
                    className="bg-transparent border-none outline-none text-center text-xs md:text-sm p-0 focus:ring-0 placeholder:text-muted-foreground/30 hidden md:block" 
                    placeholder="120" 
                  />
                  
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => removeSet(exIndex, setIndex)} 
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3 md:h-4 md:w-4" />
                    </button>
                    <button 
                      onClick={() => toggleSetComplete(exIndex, setIndex)} 
                      className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all ${set.completed ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105' : 'bg-muted hover:bg-border'}`}
                    >
                      <Check className="h-3 w-3 md:h-4 md:w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4">
              <button 
                onClick={() => addSet(exIndex)} 
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add Set
              </button>
              
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{ex.sets.filter(s => s.completed).length}</span> sets done
              </div>
            </div>

            <div className="mt-6">
              <input
                type="text"
                placeholder="Add exercise notes (e.g., shoulder felt good, dropped seat height)..."
                value={ex.personalNotes}
                onChange={e => updateExerciseField(exIndex, 'personalNotes', e.target.value)}
                className="w-full bg-transparent border-b border-border/30 pb-2 text-sm text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/40 transition-colors italic"
              />
            </div>
            
          </div>
        ))}
      </div>

      {/* Add Exercise Floating UI */}
      {showSearch ? (
        <div className="bg-card rounded-2xl border border-border/50 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-4 flex flex-row items-center justify-between border-b border-border/50 bg-muted/10">
            <div className="flex gap-6">
              <button onClick={() => setActiveTab('search')} className={`text-sm font-medium pb-1 border-b-2 transition-all ${activeTab === 'search' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Search</button>
              <button onClick={() => setActiveTab('recent')} className={`text-sm font-medium pb-1 border-b-2 transition-all ${activeTab === 'recent' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Recent</button>
              <button onClick={() => setActiveTab('favorites')} className={`text-sm font-medium pb-1 border-b-2 transition-all ${activeTab === 'favorites' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Favorites</button>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            {activeTab === 'search' && (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    placeholder="Search exercises..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    className="w-full bg-muted/30 border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors" 
                    autoFocus 
                  />
                </div>
                {searchLoading && <div className="text-sm text-muted-foreground text-center py-8">Searching database...</div>}
                {searchResults.length > 0 && (
                  <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
                    {searchResults.map((ex: any) => (
                      <button key={ex._id} onClick={() => addExercise(ex)} className="w-full text-left p-3 rounded-xl hover:bg-muted/50 transition-all flex justify-between items-center group">
                        <div>
                          <div className="font-medium text-sm group-hover:text-primary transition-colors">{ex.name}</div>
                          <div className="flex gap-2 mt-1.5 opacity-70">
                            {ex.primaryMuscles?.map((m: string) => (
                              <span key={m} className="text-[9px] uppercase font-bold tracking-wider">{m.replace('_', ' ')}</span>
                            ))}
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery && !searchLoading && searchResults.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-8">No matching exercises found.</div>
                )}
              </>
            )}

            {activeTab === 'recent' && (
              <div className="text-sm text-muted-foreground text-center py-12 flex flex-col items-center gap-3">
                <Clock className="h-8 w-8 text-muted-foreground/30" />
                <p>Your recent exercises will appear here.</p>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="text-sm text-muted-foreground text-center py-12 flex flex-col items-center gap-3">
                <Star className="h-8 w-8 text-muted-foreground/30" />
                <p>Exercises you star will appear here for quick access.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setShowSearch(true)} 
          className="w-full py-6 border border-dashed border-border/60 rounded-2xl text-muted-foreground hover:bg-muted/20 hover:text-foreground hover:border-border transition-all flex flex-col items-center justify-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </div>
          <span className="font-medium text-sm">Add Next Exercise</span>
        </button>
      )}
    </div>
  );
}
