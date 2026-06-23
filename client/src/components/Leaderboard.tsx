import { useState } from 'react';
import { Trophy, Medal, Star, Edit2, Check, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';

interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  achievements: number;
  attendance: number;
}

interface LeaderboardProps {
  isAdmin?: boolean;
}

const INITIAL: LeaderboardEntry[] = [
  { id: '1', name: 'Alex Chen',        points: 2850, achievements: 12, attendance: 98 },
  { id: '2', name: 'Sarah Williams',   points: 2720, achievements: 11, attendance: 96 },
  { id: '3', name: 'James Rodriguez',  points: 2590, achievements: 10, attendance: 95 },
  { id: '4', name: 'Emma Davis',       points: 2450, achievements: 9,  attendance: 94 },
  { id: '5', name: 'Michael Brown',    points: 2310, achievements: 8,  attendance: 92 },
  { id: '6', name: 'Olivia Martinez',  points: 2180, achievements: 7,  attendance: 91 },
  { id: '7', name: 'Liam Johnson',     points: 2050, achievements: 6,  attendance: 90 },
  { id: '8', name: 'Sophia Taylor',    points: 1920, achievements: 5,  attendance: 88 },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
  return <span className="text-sm font-bold text-primary">#{rank}</span>;
}

export default function Leaderboard({ isAdmin = false }: LeaderboardProps) {
  const [data, setData] = useLocalStorageState<LeaderboardEntry[]>('classhub_leaderboard', INITIAL);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<LeaderboardEntry>>({});

  const sorted = [...data].sort((a, b) => b.points - a.points);

  const startEdit = (entry: LeaderboardEntry) => {
    setEditId(entry.id);
    setDraft({ ...entry });
  };

  const saveEdit = () => {
    if (!draft.name?.trim()) { toast.error('Name required'); return; }
    setData(prev =>
      prev.map(e => e.id === editId ? { ...e, ...draft } as LeaderboardEntry : e)
    );
    setEditId(null);
    setDraft({});
    toast.success('Entry updated');
  };

  const cancelEdit = () => { setEditId(null); setDraft({}); };

  const deleteEntry = (id: string) => {
    setData(prev => prev.filter(e => e.id !== id));
    toast.success('Entry removed');
  };

  const addEntry = () => {
    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(),
      name: 'New Student',
      points: 0,
      achievements: 0,
      attendance: 0,
    };
    setData(prev => [...prev, newEntry]);
    setEditId(newEntry.id);
    setDraft({ ...newEntry });
    toast('New entry added — fill in the details');
  };

  const avg = Math.round(data.reduce((s, e) => s + e.points, 0) / (data.length || 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Class Leaderboard</h2>
        {isAdmin && (
          <Button onClick={addEntry} className="neon-button gap-2">
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        )}
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-lg"
        style={{
          background: 'rgba(24, 28, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(37, 80, 140, 0.4)',
        }}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'rgba(37, 80, 140, 0.4)' }}>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary w-12">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Name</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-primary">Points</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-primary">Achievements</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-primary">Attendance</th>
              {isAdmin && <th className="px-4 py-3 text-center text-sm font-semibold text-primary">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, idx) => {
              const rank = idx + 1;
              const isEditing = editId === entry.id;
              return (
                <tr
                  key={entry.id}
                  className="border-b transition-colors duration-200"
                  style={{ borderColor: 'rgba(37, 80, 140, 0.2)' }}
                  onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = 'rgba(0,212,255,0.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Rank */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center">
                      <RankBadge rank={rank} />
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-4">
                    {isEditing ? (
                      <Input
                        value={draft.name ?? ''}
                        onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                        className="h-8 text-sm text-foreground"
                        style={{ background: 'rgba(24,28,50,0.6)', borderColor: 'rgba(0,212,255,0.4)' }}
                      />
                    ) : (
                      <span className="font-semibold text-foreground">{entry.name}</span>
                    )}
                  </td>

                  {/* Points */}
                  <td className="px-4 py-4 text-center">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={draft.points ?? 0}
                        onChange={e => setDraft(d => ({ ...d, points: +e.target.value }))}
                        className="h-8 text-sm text-center text-foreground w-24 mx-auto"
                        style={{ background: 'rgba(24,28,50,0.6)', borderColor: 'rgba(0,212,255,0.4)' }}
                      />
                    ) : (
                      <span
                        className="inline-block px-3 py-1 rounded-full text-sm font-bold"
                        style={{ background: 'rgba(0,212,255,0.15)', color: 'oklch(0.65 0.22 200)' }}
                      >
                        {entry.points.toLocaleString()}
                      </span>
                    )}
                  </td>

                  {/* Achievements */}
                  <td className="px-4 py-4 text-center">
                    {isEditing ? (
                      <Input
                        type="number"
                        min={0} max={20}
                        value={draft.achievements ?? 0}
                        onChange={e => setDraft(d => ({ ...d, achievements: +e.target.value }))}
                        className="h-8 text-sm text-center text-foreground w-20 mx-auto"
                        style={{ background: 'rgba(24,28,50,0.6)', borderColor: 'rgba(0,212,255,0.4)' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center gap-0.5 flex-wrap">
                        {Array.from({ length: Math.min(entry.achievements, 12) }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-secondary fill-secondary" />
                        ))}
                        {entry.achievements > 12 && (
                          <span className="text-xs text-muted-foreground ml-1">+{entry.achievements - 12}</span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Attendance */}
                  <td className="px-4 py-4 text-center">
                    {isEditing ? (
                      <Input
                        type="number"
                        min={0} max={100}
                        value={draft.attendance ?? 0}
                        onChange={e => setDraft(d => ({ ...d, attendance: +e.target.value }))}
                        className="h-8 text-sm text-center text-foreground w-20 mx-auto"
                        style={{ background: 'rgba(24,28,50,0.6)', borderColor: 'rgba(0,212,255,0.4)' }}
                      />
                    ) : (
                      <span className="text-sm font-medium text-accent">{entry.attendance}%</span>
                    )}
                  </td>

                  {/* Admin actions */}
                  {isAdmin && (
                    <td className="px-4 py-4 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-primary hover:text-primary"
                            onClick={saveEdit}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={cancelEdit}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={() => startEdit(entry)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteEntry(entry.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[
          { label: 'Top Performer', value: sorted[0]?.name ?? '—', sub: `${sorted[0]?.points ?? 0} points` },
          { label: 'Average Points', value: avg.toLocaleString(), sub: 'Class average' },
          { label: 'Class Size', value: data.length, sub: 'Students ranked' },
        ].map(s => (
          <div
            key={s.label}
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(24, 28, 50, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(37, 80, 140, 0.4)',
            }}
          >
            <div className="text-sm text-muted-foreground mb-1">{s.label}</div>
            <div className="text-2xl font-bold text-primary">{s.value}</div>
            <div className="text-xs text-accent mt-2">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
