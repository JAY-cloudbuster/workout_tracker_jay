import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Link } from 'react-router-dom';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const startDate = new Date(year, month, 1).toISOString();
        const endDate = new Date(year, month + 1, 0).toISOString();
        const res = await api.get(`/workouts/calendar?startDate=${startDate}&endDate=${endDate}`);
        setWorkouts(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch calendar:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, [year, month]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Previous month filler
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ day: d, isCurrentMonth: false, dateStr });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ day: d, isCurrentMonth: true, dateStr });
  }

  // Next month filler
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ day: d, isCurrentMonth: false, dateStr });
  }

  // Map workouts by date
  const workoutsByDate: Record<string, any[]> = {};
  workouts.forEach(w => {
    const d = new Date(w.date).toISOString().split('T')[0];
    if (!workoutsByDate[d]) workoutsByDate[d] = [];
    workoutsByDate[d].push(w);
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const selectedWorkouts = selectedDate ? (workoutsByDate[selectedDate] || []) : [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground mt-1">Visualize your training schedule.</p>
      </div>

      {/* Calendar Header */}
      <Card className="glass-card border-none shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {MONTH_NAMES[month]} {year}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell, i) => {
                const dayWorkouts = workoutsByDate[cell.dateStr] || [];
                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDate;
                const hasWorkouts = dayWorkouts.length > 0;

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(cell.dateStr === selectedDate ? null : cell.dateStr)}
                    className={`relative min-h-[60px] md:min-h-[80px] p-1.5 rounded-lg text-left transition-all
                      ${!cell.isCurrentMonth ? 'text-muted-foreground/30' : ''}
                      ${isToday ? 'ring-2 ring-primary' : ''}
                      ${isSelected ? 'bg-primary/10' : 'hover:bg-muted'}
                      ${hasWorkouts && cell.isCurrentMonth ? 'bg-primary/5' : ''}
                    `}
                  >
                    <span className={`text-sm font-medium ${isToday ? 'text-primary font-bold' : ''}`}>{cell.day}</span>
                    {hasWorkouts && cell.isCurrentMonth && (
                      <div className="mt-0.5 space-y-0.5">
                        {dayWorkouts.slice(0, 2).map((w: any, wi: number) => (
                          <div key={wi} className={`text-[9px] md:text-[10px] px-1 py-0.5 rounded truncate font-medium ${w.status === 'completed' ? 'bg-green-500/20 text-green-500' : w.status === 'skipped' ? 'bg-destructive/20 text-destructive' : 'bg-yellow-500/20 text-yellow-500'}`}>
                            {w.name}
                          </div>
                        ))}
                        {dayWorkouts.length > 2 && (
                          <div className="text-[9px] text-muted-foreground">+{dayWorkouts.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Day Detail */}
      {selectedDate && (
        <Card className="glass-card border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedWorkouts.length > 0 ? (
              <div className="space-y-3">
                {selectedWorkouts.map((w: any) => (
                  <Link
                    key={w._id}
                    to={`/workouts/${w._id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${w.status === 'completed' ? 'bg-green-500' : w.status === 'skipped' ? 'bg-destructive' : 'bg-yellow-500'}`} />
                      <div>
                        <div className="font-medium text-sm">{w.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {w.status}
                          {w.split ? ` · ${w.split.replace('_', ' ')}` : ''}
                          {w.duration ? ` · ${w.duration}min` : ''}
                          {w.totalVolume ? ` · ${w.totalVolume.toLocaleString()}kg` : ''}
                        </div>
                      </div>
                    </div>
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                No workouts on this day. Rest day! 💤
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
