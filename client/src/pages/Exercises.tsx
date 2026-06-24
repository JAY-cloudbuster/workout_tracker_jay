import { useState, useEffect } from 'react';
import { Search, Filter, Activity, Star } from 'lucide-react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../store/AuthContext';

export default function Exercises() {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const [exercisesRes, userRes] = await Promise.all([
          api.get('/exercises?limit=100'),
          api.get('/auth/me')
        ]);
        
        setExercises(exercisesRes.data.data);
        
        // Populate initial favorites
        const userFavs = userRes.data.data.favoriteExercises || [];
        setFavorites(new Set(userFavs.map((f: any) => typeof f === 'string' ? f : f._id)));
        
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const toggleFavorite = async (e: React.MouseEvent, exerciseId: string) => {
    e.stopPropagation();
    
    // Optimistic UI update
    const newFavorites = new Set(favorites);
    if (newFavorites.has(exerciseId)) {
      newFavorites.delete(exerciseId);
    } else {
      newFavorites.add(exerciseId);
    }
    setFavorites(newFavorites);

    try {
      await api.post(`/exercises/${exerciseId}/favorite`);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert if failed
      const reverted = new Set(favorites);
      setFavorites(reverted);
    }
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) || 
                          ex.primaryMuscles?.some((m: string) => m.toLowerCase().includes(search.toLowerCase()));
    
    if (activeTab === 'favorites') {
      return matchesSearch && favorites.has(ex._id);
    }
    return matchesSearch;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exercise Library</h1>
          <p className="text-muted-foreground mt-1">Browse, search, and organize your favorite exercises.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border/50 pb-2">
        <button 
          onClick={() => setActiveTab('all')} 
          className={`font-medium pb-2 border-b-2 px-1 transition-colors ${activeTab === 'all' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          All Exercises
        </button>
        <button 
          onClick={() => setActiveTab('favorites')} 
          className={`font-medium pb-2 border-b-2 px-1 transition-colors flex items-center gap-2 ${activeTab === 'favorites' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Favorites <Star className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or muscle group..." 
            className="pl-9 glass border-none shadow-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="glass border-none shadow-md" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredExercises.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <Card key={exercise._id} className="glass-card border-none hover:bg-card/90 transition-all hover:scale-[1.02] cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{exercise.name}</h3>
                  <button 
                    onClick={(e) => toggleFavorite(e, exercise._id)}
                    className="p-1 rounded-full hover:bg-secondary transition-colors"
                  >
                    <Star className={`h-5 w-5 ${favorites.has(exercise._id) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {exercise.primaryMuscles?.map((muscle: string) => (
                    <span key={muscle} className="text-[10px] uppercase font-bold px-2 py-1 rounded-md bg-primary/20 text-primary">
                      {muscle.replace('_', ' ')}
                    </span>
                  ))}
                  {exercise.equipment && (
                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                      {exercise.equipment?.replace('_', ' ')}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center text-xs text-muted-foreground mt-auto">
                  <Activity className="h-3.5 w-3.5 mr-1" />
                  {exercise.difficulty ? (exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)) : 'Intermediate'} Level
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>{activeTab === 'favorites' ? "You haven't favorited any exercises yet." : "No exercises found matching your search."}</p>
        </div>
      )}
    </div>
  );
}
