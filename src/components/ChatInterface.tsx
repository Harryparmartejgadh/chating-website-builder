import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, Search, Youtube, Music, Bot, Video, 
  Mic, Brain, Image, Settings, Home, GraduationCap
} from "lucide-react";
import { DwijuLive } from "./DwijuLive";
import { DwijuSearch } from "./DwijuSearch";
import { DwijuTube } from "./DwijuTube";
import { DwijuMusic } from "./DwijuMusic";
import { DwijuEducation } from "./DwijuEducation";

const tabs = [
  { id: "live", label: "Dwiju Live", icon: Video, color: "from-green-500 to-emerald-500" },
  { id: "education", label: "Dwiju Education", icon: GraduationCap, color: "from-emerald-500 to-teal-500" },
  { id: "search", label: "Dwiju Search", icon: Search, color: "from-blue-500 to-cyan-500" },
  { id: "tube", label: "Dwiju Tube", icon: Youtube, color: "from-red-500 to-red-600" },
  { id: "music", label: "Dwiju Music", icon: Music, color: "from-purple-500 to-pink-500" },
  { id: "vision", label: "Dwiju Vision", icon: Image, color: "from-orange-500 to-yellow-500" },
  { id: "voice", label: "Dwiju Voice", icon: Mic, color: "from-teal-500 to-green-500" },
  { id: "brain", label: "Dwiju Brain", icon: Brain, color: "from-indigo-500 to-purple-500" },
];

export const ChatInterface = () => {
  const [activeTab, setActiveTab] = useState("live");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-innovation bg-clip-text text-transparent">
                  Dwiju AI Interface
                </h1>
                <p className="text-xs text-muted-foreground">1950+ AI Features</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-500 border-green-500/30">
                ● Connected
              </Badge>
              <a href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Home className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100vh-120px)]">
          {/* Tab List */}
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-card/50 backdrop-blur-sm p-1 h-auto mb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Contents */}
          <div className="h-[calc(100%-60px)] bg-card/30 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden">
            <TabsContent value="live" className="h-full m-0">
              <DwijuLive />
            </TabsContent>

            <TabsContent value="education" className="h-full m-0">
              <DwijuEducation />
            </TabsContent>

            <TabsContent value="search" className="h-full m-0">
              <DwijuSearch />
            </TabsContent>

            <TabsContent value="tube" className="h-full m-0">
              <DwijuTube />
            </TabsContent>

            <TabsContent value="music" className="h-full m-0">
              <DwijuMusic />
            </TabsContent>

            <TabsContent value="vision" className="h-full m-0">
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-4">
                  <Image className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Dwiju Vision</h2>
                <p className="text-muted-foreground mb-4">
                  Image recognition, object detection, and visual AI
                </p>
                <Badge>Coming Soon</Badge>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="h-full m-0">
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center mb-4">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Dwiju Voice</h2>
                <p className="text-muted-foreground mb-4">
                  Voice cloning, text-to-speech, and audio processing
                </p>
                <Badge>Coming Soon</Badge>
              </div>
            </TabsContent>

            <TabsContent value="brain" className="h-full m-0">
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Dwiju Brain</h2>
                <p className="text-muted-foreground mb-4">
                  Advanced reasoning, problem-solving, and learning
                </p>
                <Badge>Coming Soon</Badge>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
