import { useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface TimeSlot {
  id: string;
  day: string;
  period: number;
  subject: string;
  teacher: string;
  time: string;
}

interface TimetableProps {
  isAdmin: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6];
const TIMES = [
  '9:00 - 9:45',
  '9:45 - 10:30',
  '10:45 - 11:30',
  '11:30 - 12:15',
  '1:00 - 1:45',
  '1:45 - 2:30'
];

export default function Timetable({ isAdmin }: TimetableProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([
    { id: '1', day: 'Monday', period: 1, subject: 'Mathematics', teacher: 'Mr. Smith', time: TIMES[0] },
    { id: '2', day: 'Monday', period: 2, subject: 'English', teacher: 'Ms. Johnson', time: TIMES[1] },
    { id: '3', day: 'Tuesday', period: 1, subject: 'Science', teacher: 'Dr. Brown', time: TIMES[0] },
    { id: '4', day: 'Wednesday', period: 3, subject: 'History', teacher: 'Mr. Davis', time: TIMES[2] },
    { id: '5', day: 'Thursday', period: 4, subject: 'PE', teacher: 'Coach Wilson', time: TIMES[3] },
    { id: '6', day: 'Friday', period: 5, subject: 'Art', teacher: 'Ms. Miller', time: TIMES[4] }
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');

  const handleSaveSlot = () => {
    if (!subject.trim() || !teacher.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const period = parseInt(selectedPeriod);
    const time = TIMES[period - 1];

    if (editingSlot) {
      setSlots(slots.map(s => 
        s.id === editingSlot.id 
          ? { ...s, day: selectedDay, period, subject, teacher, time }
          : s
      ));
      toast.success('Slot updated!');
    } else {
      const newSlot: TimeSlot = {
        id: Date.now().toString(),
        day: selectedDay,
        period,
        subject,
        teacher,
        time
      };
      setSlots([...slots, newSlot]);
      toast.success('Slot added!');
    }

    resetForm();
  };

  const resetForm = () => {
    setShowDialog(false);
    setEditingSlot(null);
    setSelectedDay('Monday');
    setSelectedPeriod('1');
    setSubject('');
    setTeacher('');
  };

  const handleEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setSelectedDay(slot.day);
    setSelectedPeriod(slot.period.toString());
    setSubject(slot.subject);
    setTeacher(slot.teacher);
    setShowDialog(true);
  };

  const handleDeleteSlot = (id: string) => {
    setSlots(slots.filter(s => s.id !== id));
    toast.success('Slot deleted');
  };

  const getSlotForDayPeriod = (day: string, period: number) => {
    return slots.find(s => s.day === day && s.period === period);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Weekly Timetable</h2>
        {isAdmin && (
          <Button
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
            className="neon-button gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Slot
          </Button>
        )}
      </div>

      {/* Timetable Grid */}
      <div className="overflow-x-auto">
        <div className="rounded-lg" style={{
          background: 'rgba(24, 28, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(37, 80, 140, 0.4)',
          border: '1px solid'
        }}>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(37, 80, 140, 0.4)' }}>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Period</th>
                {DAYS.map(day => (
                  <th key={day} className="px-4 py-3 text-left text-sm font-semibold text-primary">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period} className="border-b" style={{ borderColor: 'rgba(37, 80, 140, 0.2)' }}>
                  <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                    <div>{period}</div>
                    <div className="text-xs">{TIMES[period - 1]}</div>
                  </td>
                  {DAYS.map(day => {
                    const slot = getSlotForDayPeriod(day, period);
                    return (
                      <td key={`${day}-${period}`} className="px-4 py-3">
                        {slot ? (
                          <div className="p-2 rounded" style={{
                            background: 'rgba(0, 212, 255, 0.1)',
                            borderColor: 'rgba(0, 212, 255, 0.3)',
                            border: '1px solid'
                          }}>
                            <div className="font-semibold text-primary text-sm">{slot.subject}</div>
                            <div className="text-xs text-muted-foreground">{slot.teacher}</div>
                            {isAdmin && (
                              <div className="flex gap-1 mt-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-primary"
                                  onClick={() => handleEditSlot(slot)}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDeleteSlot(slot.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground text-center py-4">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      {isAdmin && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent style={{
            background: 'rgba(24, 28, 50, 0.8)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(0, 212, 255, 0.5)',
            border: '1px solid'
          }}>
            <DialogHeader>
              <DialogTitle className="text-primary">
                {editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Day</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full px-3 py-2 rounded text-foreground"
                    style={{
                      background: 'rgba(24, 28, 50, 0.5)',
                      borderColor: 'rgba(37, 80, 140, 0.5)',
                      border: '1px solid'
                    }}
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Period</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded text-foreground"
                    style={{
                      background: 'rgba(24, 28, 50, 0.5)',
                      borderColor: 'rgba(37, 80, 140, 0.5)',
                      border: '1px solid'
                    }}
                  >
                    {PERIODS.map(p => (
                      <option key={p} value={p}>{p} ({TIMES[p - 1]})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
                <Input
                  placeholder="Subject name"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="text-foreground placeholder-muted-foreground"
                  style={{
                    background: 'rgba(24, 28, 50, 0.5)',
                    borderColor: 'rgba(37, 80, 140, 0.5)'
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Teacher</label>
                <Input
                  placeholder="Teacher name"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className="text-foreground placeholder-muted-foreground"
                  style={{
                    background: 'rgba(24, 28, 50, 0.5)',
                    borderColor: 'rgba(37, 80, 140, 0.5)'
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSlot}
                  className="neon-button flex-1"
                >
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
