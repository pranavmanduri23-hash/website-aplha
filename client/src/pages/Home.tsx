import Header from '@/components/Header';
import AnnouncementBoard from '@/components/AnnouncementBoard';
import Timetable from '@/components/Timetable';
import Leaderboard from '@/components/Leaderboard';
import ClassBot from '@/components/ClassBot';
import ArcadeSection from '@/components/ArcadeSection';
import Gallery from '@/components/Gallery';
import AdminPanel from '@/components/AdminPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Bell, Clock, Trophy, Images, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
              Birla Open Minds · Class Hub 2026
            </h1>
            <p className="text-muted-foreground text-lg">
              Bandlaguda, Hyderabad — Official Class Portal
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList
              className={`grid w-full mb-8 ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'}`}
              style={{
                background: 'rgba(24, 28, 50, 0.4)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(37, 80, 140, 0.4)',
              }}
            >
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="timetable" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Timetable</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Images className="w-4 h-4" />
                <span className="hidden sm:inline">Gallery</span>
              </TabsTrigger>
              <TabsTrigger value="arcade" className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">Arcade</span>
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="dashboard"><AnnouncementBoard isAdmin={isAdmin} /></TabsContent>
            <TabsContent value="timetable"><Timetable isAdmin={isAdmin} /></TabsContent>
            <TabsContent value="leaderboard"><Leaderboard isAdmin={isAdmin} /></TabsContent>
            <TabsContent value="gallery"><Gallery isAdmin={isAdmin} /></TabsContent>
            <TabsContent value="arcade"><ArcadeSection /></TabsContent>
            {isAdmin && (
              <TabsContent value="admin"><AdminPanel /></TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      <ClassBot />
    </div>
  );
}
