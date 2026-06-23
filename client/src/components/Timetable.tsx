import { useState } from 'react';
import { Edit2, Trash2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';

interface TimeSlot {
  id: number;
  day: string;
  period: number;
  subject: string;
  teacher: string;
  time: string;
}

interface TimetableProps { isAdmin: boolean; }

const DAYS    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6];
const TIMES   = ['9:00 - 9:45', '9:45 - 10:30', '10:45 - 11:30', '11:30 - 12:15', '1:00 - 1:45', '1:45 - 2:30'];

export default function Timetable({ isAdmin }: TimetableProps) {
  const { rows: slots, loading, insert, update, remove } =
    useSupabaseTable<TimeSlot>('timetable', { orderBy: 'period', ascending: true });

  const [showDialog, setShowDialog]   = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [subject, setSubject]         = useState('');
  const [teacher, setTeacher]         = useState('');
  const [saving, setSaving]           = useState(false);

  const resetForm = () => {
    setEditingSlot(null); setSelectedDay('Monday'); setSelectedPeriod('1');
    setSubject(''); setTeacher(''); setShowDialog(false);
  };

  const openEdit = (s: TimeSlot) => {
    setEditingSlot(s); setSelectedDay(s.day);
    setSelectedPeriod(String(s.period)); setSubject(s.subject); setTeacher(s.teacher);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!subject.trim() || !teacher.trim()) { toast.error('Please fill in all fields'); return; }
    const period = parseInt(selectedPeriod);
    const time   = TIMES[period - 1];
    setSaving(true);
    try {
      if (editingSlot) {
        await update(editingSlot.id, { day: selectedDay, period, subject, teacher, time });
        toast.success('Slot updated!');
      } else {
        await insert({ day: selectedDay, period, subject, teacher, time } as Omit<TimeSlot, 'id'>);
        toast.success('Slot added!');
      }
      resetForm();
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await remove(id); toast.success('Slot removed'); }
    catch (e: unknown) { toast.error((e as Error).message ?? 'Delete failed'); }
  };

  const slotMap: Record<string, Record<number, TimeSlot>> = {};
  for (const s of slots) {
    if (!slotMap[s.day]) slotMap[s.day] = {};
    slotMap[s.day][s.period] = s;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Class Timetable</h2>
        {isAdmin && (
          <Button onClick={() => { resetForm(); setShowDialog(true); }} className="neon-button gap-2">
            <Plus className="w-4 h-4" />Add Slot
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl"
          style={{ background: 'rgba(24,28,50,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(37,80,140,0.4)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(37,80,140,0.4)' }}>
                <th className="px-4 py-3 text-left text-primary font-semibold">Period / Time</th>
                {DAYS.map(d => (
                  <th key={d} className="px-4 py-3 text-center text-primary font-semibold">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(p => (
                <tr key={p} className="border-b" style={{ borderColor: 'rgba(37,80,140,0.2)' }}>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    <div className="font-semibold text-foreground">P{p}</div>
                    <div className="text-xs">{TIMES[p - 1]}</div>
                  </td>
                  {DAYS.map(d => {
                    const slot = slotMap[d]?.[p];
                    return (
                      <td key={d} className="px-2 py-2 text-center">
                        {slot ? (
                          <div className="rounded-lg p-2 relative group"
                            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                            <div className="font-semibold text-foreground text-xs">{slot.subject}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{slot.teacher}</div>
                            {isAdmin && (
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
                                <button onClick={() => openEdit(slot)}
                                  className="p-0.5 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary">
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button onClick={() => handleDelete(slot.id)}
                                  className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          isAdmin ? (
                            <button onClick={() => { setSelectedDay(d); setSelectedPeriod(String(p)); setShowDialog(true); }}
                              className="w-full h-12 rounded-lg border border-dashed opacity-30 hover:opacity-60 transition-opacity text-xs text-muted-foreground"
                              style={{ borderColor: 'rgba(37,80,140,0.5)' }}>
                              +
                            </button>
                          ) : (
                            <span className="text-muted-foreground/30 text-xs">—</span>
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent style={{ background: 'rgba(24,28,50,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,212,255,0.4)' }}>
            <DialogHeader>
              <DialogTitle className="text-primary">{editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Day</label>
                  <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)}
                    className="w-full px-3 py-2 rounded text-foreground"
                    style={{ background: 'rgba(24,28,50,0.6)', border: '1px solid rgba(37,80,140,0.5)' }}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Period</label>
                  <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded text-foreground"
                    style={{ background: 'rgba(24,28,50,0.6)', border: '1px solid rgba(37,80,140,0.5)' }}>
                    {PERIODS.map(p => <option key={p} value={p}>P{p} ({TIMES[p - 1]})</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
                <Input placeholder="Subject name" value={subject} onChange={e => setSubject(e.target.value)}
                  className="text-foreground" style={{ background: 'rgba(24,28,50,0.6)', borderColor: 'rgba(37,80,140,0.5)' }} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Teacher</label>
                <Input placeholder="Teacher name" value={teacher} onChange={e => setTeacher(e.target.value)}
                  className="text-foreground" style={{ background: 'rgba(24,28,50,0.6)', borderColor: 'rgba(37,80,140,0.5)' }} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetForm} className="flex-1" disabled={saving}>Cancel</Button>
                <Button onClick={handleSave} className="neon-button flex-1 gap-2" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingSlot ? 'Update' : 'Add'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
