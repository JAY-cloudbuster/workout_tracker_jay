import { useState, useEffect } from 'react';
import { User, Save, Loader2, Lock } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../store/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const GOAL_OPTIONS = [
  { value: 'lose_fat', label: 'Lose Fat' },
  { value: 'gain_muscle', label: 'Gain Muscle' },
  { value: 'strength', label: 'Strength' },
  { value: 'power', label: 'Power' },
  { value: 'general_fitness', label: 'General Fitness' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'novice', label: 'Novice' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'elite', label: 'Elite' },
];

const STYLE_OPTIONS = [
  { value: 'bodybuilding', label: 'Bodybuilding' },
  { value: 'powerlifting', label: 'Powerlifting' },
  { value: 'powerbuilding', label: 'Powerbuilding' },
  { value: 'hypertrophy', label: 'Hypertrophy' },
  { value: 'strength', label: 'Strength' },
  { value: 'general_fitness', label: 'General Fitness' },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setProfile(res.data.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.patch('/auth/profile', {
        name: profile.name,
        username: profile.username,
        age: profile.age || undefined,
        gender: profile.gender || undefined,
        height: profile.height || undefined,
        weight: profile.weight || undefined,
        units: profile.units || 'metric',
        experienceLevel: profile.experienceLevel || undefined,
        primaryGoal: profile.primaryGoal || undefined,
        trainingStyle: profile.trainingStyle || undefined,
      });
      updateUser(res.data.data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      setPwError('Passwords do not match');
      return;
    }
    setPwSaving(true);
    setPwError('');
    setPwSuccess('');
    try {
      await api.patch('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setPwSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordChange(false);
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (err: any) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    }
    setPwSaving(false);
  };

  const updateField = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and training preferences.</p>
      </div>

      {success && <div className="p-3 bg-green-500/10 text-green-500 text-sm rounded-md border border-green-500/20">{success}</div>}
      {pwSuccess && <div className="p-3 bg-green-500/10 text-green-500 text-sm rounded-md border border-green-500/20">{pwSuccess}</div>}
      {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">{error}</div>}

      {/* Profile Info */}
      <Card className="glass-card border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={profile?.name || ''} onChange={e => updateField('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={profile?.username || ''} onChange={e => updateField('username', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email || ''} disabled className="opacity-60" />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="number" value={profile?.age || ''} onChange={e => updateField('age', parseInt(e.target.value) || undefined)} min={13} max={120} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <select value={profile?.gender || ''} onChange={e => updateField('gender', e.target.value || undefined)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Units</Label>
              <select value={profile?.units || 'metric'} onChange={e => updateField('units', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="metric">Metric (kg/cm)</option>
                <option value="imperial">Imperial (lb/in)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input type="number" value={profile?.height || ''} onChange={e => updateField('height', parseFloat(e.target.value) || undefined)} />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input type="number" value={profile?.weight || ''} onChange={e => updateField('weight', parseFloat(e.target.value) || undefined)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Preferences */}
      <Card className="glass-card border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Training Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <select value={profile?.experienceLevel || ''} onChange={e => updateField('experienceLevel', e.target.value || undefined)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select...</option>
                {EXPERIENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Primary Goal</Label>
              <select value={profile?.primaryGoal || ''} onChange={e => updateField('primaryGoal', e.target.value || undefined)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select...</option>
                {GOAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Training Style</Label>
              <select value={profile?.trainingStyle || ''} onChange={e => updateField('trainingStyle', e.target.value || undefined)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select...</option>
                {STYLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
      </Button>

      {/* Change Password */}
      <Card className="glass-card border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          {!showPasswordChange ? (
            <Button variant="outline" onClick={() => setShowPasswordChange(true)}>Change Password</Button>
          ) : (
            <div className="space-y-4">
              {pwError && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">{pwError}</div>}
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePasswordChange} disabled={pwSaving}>
                  {pwSaving ? 'Changing...' : 'Update Password'}
                </Button>
                <Button variant="outline" onClick={() => setShowPasswordChange(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
