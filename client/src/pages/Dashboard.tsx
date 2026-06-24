import { useEffect, useState } from 'react';
import { Activity, Dumbbell, Calendar, Flame, Timer, Repeat, Database, Target, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import api from '../lib/api';
import { useAuth } from '../store/AuthContext';
import { Link } from 'react-router-dom';
import { formatDuration } from '../lib/utils';

interface ConventionalStats {
  totalWorkouts: number;
  totalExercises: number;
  totalSets: number;
  totalVolume: number;
  averageWorkoutDuration: number;
  averageWorkoutFrequency: number;
  mostTrainedMuscle: string;
  mostUsedExercise: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<ConventionalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/analytics/dashboard');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto font-sans pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 border-b border-border/40 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-2">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">Your training command center.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" asChild className="flex-1 md:flex-none border-border/50 rounded-xl">
            <Link to="/workouts">History</Link>
          </Button>
          <Button asChild className="flex-1 md:flex-none shadow-lg shadow-primary/20 rounded-xl">
            <Link to="/workouts/new">
              <Dumbbell className="mr-2 h-4 w-4" /> Log Workout
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Stats - Magazine Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 mb-16">
        
        <div className="space-y-2 border-l border-border/40 pl-4 hover:border-primary/50 transition-colors">
          <div className="text-sm font-semibold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Workouts
          </div>
          <div className="text-4xl md:text-5xl font-serif font-medium text-foreground">
            {data?.totalWorkouts || 0}
          </div>
        </div>

        <div className="space-y-2 border-l border-border/40 pl-4 hover:border-primary/50 transition-colors">
          <div className="text-sm font-semibold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <Database className="h-4 w-4" /> Volume
          </div>
          <div className="text-4xl md:text-5xl font-serif font-medium text-foreground">
            {(data?.totalVolume || 0).toLocaleString()}<span className="text-xl md:text-2xl text-muted-foreground font-sans ml-1">kg</span>
          </div>
        </div>

        <div className="space-y-2 border-l border-border/40 pl-4 hover:border-primary/50 transition-colors">
          <div className="text-sm font-semibold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <Repeat className="h-4 w-4" /> Sets
          </div>
          <div className="text-4xl md:text-5xl font-serif font-medium text-foreground">
            {data?.totalSets?.toLocaleString() || 0}
          </div>
        </div>

        <div className="space-y-2 border-l border-border/40 pl-4 hover:border-primary/50 transition-colors">
          <div className="text-sm font-semibold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <Activity className="h-4 w-4" /> Freq
          </div>
          <div className="text-4xl md:text-5xl font-serif font-medium text-foreground">
            {data?.averageWorkoutFrequency || 0}<span className="text-xl md:text-2xl text-muted-foreground font-sans ml-1">/wk</span>
          </div>
        </div>

      </div>

      {/* Secondary Stats */}
      <div className="grid md:grid-cols-2 gap-8">
        
        <div className="bg-muted/20 rounded-3xl p-8 border border-border/30 hover:border-border/60 transition-colors">
          <h3 className="font-serif text-2xl font-medium mb-6 flex items-center gap-3">
            <Timer className="h-6 w-6 text-primary" /> Training Duration
          </h3>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-1">Average Session</p>
              <p className="text-3xl font-medium">{data?.averageWorkoutDuration ? formatDuration(data.averageWorkoutDuration) : '0m'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-1">Total Exercises Logged</p>
              <p className="text-3xl font-medium">{data?.totalExercises?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-muted/20 rounded-3xl p-8 border border-border/30 hover:border-border/60 transition-colors">
          <h3 className="font-serif text-2xl font-medium mb-6 flex items-center gap-3">
            <Target className="h-6 w-6 text-primary" /> Patterns
          </h3>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-1">Primary Muscle Group</p>
              <p className="text-3xl font-medium capitalize">{data?.mostTrainedMuscle?.replace('_', ' ') || 'None'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-1">Most Frequent Exercise</p>
              <p className="text-3xl font-medium truncate">{data?.mostUsedExercise || 'None'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
