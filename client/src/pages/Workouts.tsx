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
    <Link 
      to={`/workouts/${workout._id}`} 
      key={workout._id}
      className="group block relative overflow-hidden rounded-2xl bg-muted/20 border border-border/30 hover:border-primary/40 hover:bg-muted/40 transition-all duration-300"
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full ${workout.status === 'completed' ? 'bg-primary/70' : workout.status === 'skipped' ? 'bg-destructive/70' : 'bg-yellow-500/70'}`} />
      
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pl-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-2xl font-medium tracking-tight group-hover:text-primary transition-colors">
              {workout.name}
            </h3>
            <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${
              workout.status === 'completed' ? 'bg-primary/10 text-primary' :
              workout.status === 'skipped' ? 'bg-destructive/10 text-destructive' :
              'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'
            }`}>
              {workout.status}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center text-sm font-medium text-muted-foreground gap-x-6 gap-y-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 opacity-70" />
              {formatDate(workout.date)}
            </span>
            {workout.duration > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 opacity-70" />
                {formatDuration(workout.duration * 60)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4 opacity-70" />
              {workout.exercises?.length || 0} exercises
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border/30 pt-4 md:pt-0">
          <div className="text-left md:text-right">
            <div className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-0.5">Volume</div>
            <div className="font-sans text-xl font-medium">{(workout.totalVolume || 0).toLocaleString()} <span className="text-sm text-muted-foreground">kg</span></div>
          </div>
          <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border/50 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto font-sans pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-border/40 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-2">History</h1>
          <p className="text-muted-foreground">Track and manage your training logs.</p>
        </div>
        <Button asChild className="w-full md:w-auto shadow-lg shadow-primary/20 rounded-xl h-12 px-8">
          <Link to="/workouts/new">
            <Plus className="mr-2 h-5 w-5" /> New Session
          </Link>
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-8 border-b border-border/30 mb-8">
        <button 
          onClick={() => { setActiveTab('history'); closeFolder(); }} 
          className={`font-medium pb-4 border-b-2 text-sm uppercase tracking-wider transition-all duration-300 ${activeTab === 'history' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          All History
        </button>
        <button 
          onClick={() => setActiveTab('folders')} 
          className={`font-medium pb-4 border-b-2 text-sm uppercase tracking-wider transition-all duration-300 ${activeTab === 'folders' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Folders
        </button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
        <Input 
          placeholder="Search by name, tags..." 
          className="pl-12 h-14 bg-muted/20 border-border/40 rounded-2xl text-base shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : activeTab === 'history' ? (
        // ALL HISTORY VIEW
        workouts.length > 0 ? (
          <div className="space-y-4">
            {workouts.map(renderWorkoutCard)}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/60 bg-muted/10 p-16 flex flex-col items-center justify-center text-center">
            <div className="bg-primary/10 p-5 rounded-full mb-6">
              <Dumbbell className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-serif text-3xl font-medium mb-3">No workouts yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md text-lg">
              You haven't logged any workouts. Start your fitness journey by creating your first session.
            </p>
            <Button asChild className="rounded-xl h-12 px-8">
              <Link to="/workouts/new">Start Workout</Link>
            </Button>
          </div>
        )
      ) : (
        // FOLDERS VIEW
        currentFolder ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" size="icon" onClick={closeFolder} className="rounded-full h-10 w-10 border-border/50">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-3xl font-serif font-medium flex items-center gap-3">
                <FolderOpen className="h-7 w-7 text-primary/70" />
                {currentFolder.name}
              </h2>
            </div>
            
            {loadingFolder ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : folderWorkouts.length > 0 ? (
              <div className="space-y-4">
                {folderWorkouts.map(renderWorkoutCard)}
              </div>
            ) : (
              <div className="text-center py-24 text-muted-foreground">
                <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">This folder is empty.</p>
              </div>
            )}
          </div>
        ) : (
          // Folders List
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {folders.length > 0 ? folders.map((folder) => (
              <div 
                key={folder._id} 
                className="group rounded-3xl bg-muted/20 border border-border/30 hover:border-primary/40 hover:bg-muted/40 transition-all duration-300 cursor-pointer p-8 flex flex-col items-center justify-center text-center gap-4 aspect-square" 
                onClick={() => openFolder(folder)}
              >
                <div className="bg-background shadow-sm border border-border/50 p-5 rounded-full group-hover:scale-110 group-hover:border-primary transition-all duration-500">
                  <Folder className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-serif text-xl font-medium group-hover:text-primary transition-colors">{folder.name}</h3>
              </div>
            )) : (
              <div className="col-span-full text-center py-24 text-muted-foreground border border-dashed border-border/50 rounded-3xl">
                <Folder className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium text-foreground mb-1">No folders created yet.</p>
                <p>Use the API to create folders and organize your training.</p>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
