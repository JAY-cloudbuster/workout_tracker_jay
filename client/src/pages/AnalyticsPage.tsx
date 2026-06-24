import { useState, useEffect } from 'react';
import { Activity, BarChart3, Dumbbell, Repeat, Database, Timer, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import api from '../lib/api';
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

export default function AnalyticsPage() {
  const [data, setData] = useState<ConventionalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your lifetime progress and training patterns.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.totalWorkouts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{data?.averageWorkoutFrequency || 0} workouts / week avg</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Database className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(data?.totalVolume || 0).toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime weight lifted</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
            <Repeat className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.totalSets?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Working sets completed</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
            <Dumbbell className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.totalExercises?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique exercises logged</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-purple-500" />
              Duration Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center py-4 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Average Workout Time</span>
              <span className="font-bold text-lg">{data?.averageWorkoutDuration ? formatDuration(data.averageWorkoutDuration) : '0s'}</span>
            </div>
            <div className="pt-4 text-sm text-muted-foreground">
              Calculated from the start and finish time of all completed workouts in your history.
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-500" />
              Training Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Most Trained Muscle Group</span>
              <span className="font-bold capitalize">{data?.mostTrainedMuscle?.replace('_', ' ') || 'None'}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-muted-foreground font-medium">Most Logged Exercise</span>
              <span className="font-bold capitalize">{data?.mostUsedExercise || 'None'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
