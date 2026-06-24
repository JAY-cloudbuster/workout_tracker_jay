import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Tag, Trash2, Copy, Check, X, Users } from 'lucide-react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { formatDate, formatDuration } from '../lib/utils';

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const res = await api.get(`/workouts/${id}`);
        setWorkout(res.data.data);
      } catch (error) {
        console.error('Failed to fetch workout:', error);
        navigate('/workouts');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    setDeleting(true);
    try {
      await api.delete(`/workouts/${id}`);
      navigate('/workouts');
    } catch (error) {
      console.error('Failed to delete workout:', error);
    }
    setDeleting(false);
  };

  const handleDuplicate = async () => {
    try {
      await api.post(`/workouts/${id}/duplicate`);
      navigate('/workouts');
    } catch (error) {
      console.error('Failed to duplicate workout:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!workout) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/workouts')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {workout.name}
              <span className={`text-xs uppercase font-bold px-2.5 py-1 rounded-full ${
                workout.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                workout.status === 'skipped' ? 'bg-destructive/20 text-destructive' :
                'bg-yellow-500/20 text-yellow-500'
              }`}>
                {workout.status}
              </span>
            </h1>
            
            <div className="flex flex-wrap items-center text-muted-foreground gap-x-4 gap-y-2 mt-2">
              <span className="flex items-center gap-1 text-sm">
                <Calendar className="h-3.5 w-3.5" /> {formatDate(workout.date)}
              </span>
              {workout.duration > 0 && (
                <span className="flex items-center gap-1 text-sm">
                  <Clock className="h-3.5 w-3.5" /> {formatDuration(workout.duration)}
                </span>
              )}
              {workout.location && (
                <span className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3.5 w-3.5" /> {workout.location}
                </span>
              )}
              {workout.trainingPartner && (
                <span className="flex items-center gap-1 text-sm">
                  <Users className="h-3.5 w-3.5" /> {workout.trainingPartner}
                </span>
              )}
              <span className="text-sm font-medium px-2 py-0.5 rounded bg-primary/10 text-primary capitalize">
                {workout.split?.replace('_', ' ')}
              </span>
              {workout.workoutType && (
                <span className="text-sm font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground capitalize">
                  {workout.workoutType?.replace('_', ' ')}
                </span>
              )}
            </div>
            
            {workout.tags && workout.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {workout.tags.map((tag: string) => (
                  <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">
                    <Tag className="h-3 w-3" /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: `${(workout.totalVolume || 0).toLocaleString()} kg` },
          { label: 'Working Sets', value: workout.totalSets || 0 },
          { label: 'Total Reps', value: workout.totalReps || 0 },
          { label: 'Exercises', value: workout.exercises?.length || 0 },
        ].map((stat) => (
          <Card key={stat.label} className="glass-card border-none">
            <CardContent className="pt-4 pb-4 text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mood, Energy, & Notes */}
      {(workout.mood || workout.energy || workout.notes) && (
        <Card className="glass-card border-none">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-wrap gap-8">
              {workout.mood && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground font-medium">Mood</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <div key={v} className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${v <= workout.mood ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{v}</div>
                    ))}
                  </div>
                </div>
              )}
              {workout.energy && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground font-medium">Energy</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <div key={v} className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${v <= workout.energy ? 'bg-orange-500 text-white' : 'bg-secondary'}`}>{v}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {workout.notes && (
              <div>
                <span className="text-sm text-muted-foreground font-medium mb-1 block">Workout Notes</span>
                <p className="text-sm bg-background/50 p-3 rounded-md border border-border/50">{workout.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      <div className="space-y-4 mt-6">
        <h2 className="text-xl font-bold tracking-tight">Exercise Breakdown</h2>
        {workout.exercises?.map((ex: any, exIndex: number) => (
          <Card key={exIndex} className="glass-card border-none shadow-lg overflow-hidden">
            <CardHeader className="pb-3 bg-secondary/10">
              <CardTitle className="text-lg flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/20 text-primary text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0">{exIndex + 1}</span>
                  {ex.exercise?.name || 'Unknown Exercise'}
                  <div className="flex gap-1 ml-2">
                    {ex.exercise?.primaryMuscles?.map((m: string) => (
                      <span key={m} className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary hidden md:inline-block">{m.replace('_', ' ')}</span>
                    ))}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              
              <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                  {/* Set Header */}
                  <div className="grid grid-cols-[3rem_80px_1fr_1fr_1fr_1fr_1fr_3rem] gap-3 text-xs text-muted-foreground font-medium px-1 pb-2 border-b border-border/50">
                    <span className="text-center">Set</span>
                    <span>Type</span>
                    <span>Weight</span>
                    <span>Reps</span>
                    <span>RPE</span>
                    <span>Tempo</span>
                    <span>Rest (s)</span>
                    <span className="text-center">Done</span>
                  </div>

                  {/* Sets */}
                  {ex.sets?.map((set: any, setIndex: number) => (
                    <div key={setIndex} className={`grid grid-cols-[3rem_80px_1fr_1fr_1fr_1fr_1fr_3rem] gap-3 items-center py-2.5 px-1 ${setIndex < ex.sets.length - 1 ? 'border-b border-border/30' : ''} ${set.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      <span className="text-center text-sm font-medium">{set.setNumber}</span>
                      
                      <span className="text-sm capitalize font-medium">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] ${
                          set.setType === 'warmup' ? 'bg-orange-500/10 text-orange-500' :
                          set.setType === 'failure' ? 'bg-destructive/10 text-destructive' :
                          set.setType === 'drop_set' ? 'bg-purple-500/10 text-purple-500' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {set.setType?.replace('_', ' ')}
                        </span>
                      </span>
                      
                      <span className="text-sm font-medium">{set.weight} kg</span>
                      <span className="text-sm font-medium">{set.reps}</span>
                      <span className="text-sm">{set.rpe || '—'}</span>
                      <span className="text-sm tracking-wider">{set.tempo || '—'}</span>
                      <span className="text-sm">{set.restTime || '—'}</span>
                      
                      <span className="text-center">
                        {set.completed ? (
                          <Check className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {ex.personalNotes && (
                <div className="mt-4 pt-3 border-t border-border/30">
                  <span className="text-xs font-medium text-muted-foreground mb-1 block">Personal Notes</span>
                  <div className="text-sm bg-secondary/30 p-2.5 rounded text-foreground italic">{ex.personalNotes}</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
