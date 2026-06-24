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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-1">Here is your conventional training summary.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" asChild className="flex-1 md:flex-none">
            <Link to="/workouts">History</Link>
          </Button>
          <Button asChild className="flex-1 md:flex-none">
            <Link to="/workouts/new">
              <Dumbbell className="mr-2 h-4 w-4" /> Log Workout
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-none shadow-lg bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.totalWorkouts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              All-time completed
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-lg bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Database className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(data?.totalVolume || 0).toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground mt-1">
              Weight × Reps
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-lg bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
            <Repeat className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.totalSets?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed working sets
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-lg bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Frequency</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.averageWorkoutFrequency || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Workouts per week
            </p>
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
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Average Workout Duration</span>
              <span className="font-bold">{data?.averageWorkoutDuration ? formatDuration(data.averageWorkoutDuration) : '0s'}</span>
            </div>
            <div className="flex justify-between items-center py-2 mt-2">
              <span className="text-muted-foreground">Total Exercises Logged</span>
              <span className="font-bold">{data?.totalExercises?.toLocaleString() || 0}</span>
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
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">Most Trained Muscle</span>
              <span className="font-bold capitalize">{data?.mostTrainedMuscle?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between items-center py-2 mt-2">
              <span className="text-muted-foreground">Most Logged Exercise</span>
              <span className="font-bold">{data?.mostUsedExercise}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
