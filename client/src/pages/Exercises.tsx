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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto font-sans pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-border/40 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-2">Exercise Library</h1>
          <p className="text-muted-foreground">Browse, search, and organize your favorite movements.</p>
        </div>
      </div>

      <div className="flex gap-8 border-b border-border/30 mb-8">
        <button 
          onClick={() => setActiveTab('all')} 
          className={`font-medium pb-4 border-b-2 text-sm uppercase tracking-wider transition-all duration-300 ${activeTab === 'all' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          All Exercises
        </button>
        <button 
          onClick={() => setActiveTab('favorites')} 
          className={`font-medium pb-4 border-b-2 text-sm uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${activeTab === 'favorites' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Favorites <Star className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
          <Input 
            placeholder="Search by name or muscle group..." 
            className="pl-12 h-14 bg-muted/20 border-border/40 rounded-2xl text-base shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 w-14 rounded-2xl border-border/40 shadow-sm" size="icon">
          <Filter className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredExercises.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <div 
              key={exercise._id} 
              className="group relative overflow-hidden rounded-3xl bg-muted/20 border border-border/30 hover:border-primary/40 hover:bg-muted/40 transition-all duration-300 cursor-pointer p-6 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-serif text-xl font-medium tracking-tight group-hover:text-primary transition-colors leading-tight pr-4">
                  {exercise.name}
                </h3>
                <button 
                  onClick={(e) => toggleFavorite(e, exercise._id)}
                  className="p-2 rounded-full bg-background/50 border border-border/50 hover:bg-background transition-colors shadow-sm -mt-2 -mr-2"
                >
                  <Star className={`h-4 w-4 ${favorites.has(exercise._id) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground group-hover:text-foreground'}`} />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-8 flex-grow">
                {exercise.primaryMuscles?.map((muscle: string) => (
                  <span key={muscle} className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {muscle.replace('_', ' ')}
                  </span>
                ))}
                {exercise.equipment && (
                  <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground border border-border/50">
                    {exercise.equipment?.replace('_', ' ')}
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-xs font-medium text-muted-foreground mt-auto border-t border-border/40 pt-4">
                <Activity className="h-4 w-4 mr-2 opacity-70" />
                {exercise.difficulty ? (exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)) : 'Intermediate'} Level
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-muted-foreground border border-dashed border-border/50 rounded-3xl bg-muted/10">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg">{activeTab === 'favorites' ? "You haven't favorited any exercises yet." : "No exercises found matching your search."}</p>
        </div>
      )}
    </div>
  );
}
