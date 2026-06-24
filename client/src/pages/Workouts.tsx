import { useState, useEffect } from 'react';
import { Dumbbell, Plus, Search, Calendar, ChevronRight, Clock, Folder, FolderOpen, ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { formatDuration, formatDate } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

export default function Workouts() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'folders'>('history');
  
  // Folder navigation state
  const [currentFolder, setCurrentFolder] = useState<any | null>(null);
  const [folderWorkouts, setFolderWorkouts] = useState<any[]>([]);
  const [loadingFolder, setLoadingFolder] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [workoutsRes, foldersRes] = await Promise.all([
        api.get('/workouts'),
        api.get('/folders')
      ]);
      setWorkouts(workoutsRes.data.data);
      setFolders(foldersRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openFolder = async (folder: any) => {
    setCurrentFolder(folder);
    setLoadingFolder(true);
    try {
      const res = await api.get(`/workouts?folderId=${folder._id}`);
      setFolderWorkouts(res.data.data);
    } catch (error) {
      console.error('Failed to fetch folder workouts:', error);
    } finally {
      setLoadingFolder(false);
    }
  };

  const closeFolder = () => {
    setCurrentFolder(null);
    setFolderWorkouts([]);
  };

  const renderWorkoutCard = (workout: any) => (
    <Card key={workout._id} className="glass-card border-none hover:bg-card/90 transition-colors cursor-pointer group overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${workout.status === 'completed' ? 'bg-green-500' : workout.status === 'skipped' ? 'bg-destructive' : 'bg-yellow-500'}`} />
      <CardContent className="p-0">
        <Link to={`/workouts/${workout._id}`} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 w-full">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {workout.name}
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                workout.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                workout.status === 'skipped' ? 'bg-destructive/20 text-destructive' :
                'bg-yellow-500/20 text-yellow-500'
              }`}>
                {workout.status}
              </span>
            </h3>
            <div className="flex items-center text-sm text-muted-foreground gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(workout.date)}
              </span>
              {workout.duration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(workout.duration * 60)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Dumbbell className="h-3.5 w-3.5" />
                {workout.exercises?.length || 0} exercises
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <div className="text-right hidden md:block">
              <div className="text-sm text-muted-foreground">Volume</div>
              <div className="font-medium">{(workout.totalVolume || 0).toLocaleString()} kg</div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground mt-1">Track and manage your training history.</p>
        </div>
        <Button asChild>
          <Link to="/workouts/new">
            <Plus className="mr-2 h-4 w-4" /> New Workout
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 border-b border-border/50 pb-2">
        <button 
          onClick={() => { setActiveTab('history'); closeFolder(); }} 
          className={`font-medium pb-2 border-b-2 px-1 transition-colors ${activeTab === 'history' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          All History
        </button>
        <button 
          onClick={() => setActiveTab('folders')} 
          className={`font-medium pb-2 border-b-2 px-1 transition-colors ${activeTab === 'folders' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Folders
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search workouts..." 
          className="pl-9 glass border-none shadow-md"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : activeTab === 'history' ? (
        // ALL HISTORY VIEW
        workouts.length > 0 ? (
          <div className="grid gap-4">
            {workouts.map(renderWorkoutCard)}
          </div>
        ) : (
          <Card className="glass-card border-dashed border-2 border-border/50 bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No workouts yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                You haven't logged any workouts. Start your fitness journey by creating your first session.
              </p>
              <Button asChild>
                <Link to="/workouts/new">Start Workout</Link>
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        // FOLDERS VIEW
        currentFolder ? (
          // Inside a folder
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={closeFolder}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <FolderOpen className="h-6 w-6 text-primary" />
                {currentFolder.name}
              </h2>
            </div>
            
            {loadingFolder ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : folderWorkouts.length > 0 ? (
              <div className="grid gap-4">
                {folderWorkouts.map(renderWorkoutCard)}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>This folder is empty.</p>
              </div>
            )}
          </div>
        ) : (
          // Folders List
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.length > 0 ? folders.map((folder) => (
              <Card key={folder._id} className="glass-card border-none hover:bg-card/90 transition-colors cursor-pointer group" onClick={() => openFolder(folder)}>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Folder className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{folder.name}</h3>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Folder className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No folders created yet.</p>
                <p className="text-sm mt-1">Use the API to create folders and organize your training.</p>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
