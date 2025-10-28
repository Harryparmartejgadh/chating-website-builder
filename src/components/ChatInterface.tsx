import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Mic, Video, Type, Headphones, Eye, Zap } from "lucide-react";
import { toast } from "sonner";

type ChatMode = "text" | "voice" | "vision" | "text-voice" | "voice-vision" | "all";

export const ChatInterface = () => {
  const [mode, setMode] = useState<ChatMode | null>(null);
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const modes = [
    { 
      id: "text" as ChatMode, 
      icon: Type, 
      label: "Text Chat", 
      desc: "Type your message",
      color: "from-blue-500 to-blue-600"
    },
    { 
      id: "voice" as ChatMode, 
      icon: Mic, 
      label: "Voice Chat", 
      desc: "Speak to Dwiju",
      color: "from-green-500 to-green-600"
    },
    { 
      id: "vision" as ChatMode, 
      icon: Eye, 
      label: "Vision Mode", 
      desc: "Show to Dwiju",
      color: "from-purple-500 to-purple-600"
    },
    { 
      id: "text-voice" as ChatMode, 
      icon: Headphones, 
      label: "Text + Voice", 
      desc: "Type & Listen",
      color: "from-orange-500 to-orange-600"
    },
    { 
      id: "voice-vision" as ChatMode, 
      icon: Video, 
      label: "Voice + Vision", 
      desc: "Speak & Show",
      color: "from-pink-500 to-pink-600"
    },
    { 
      id: "all" as ChatMode, 
      icon: Zap, 
      label: "Complete Mode", 
      desc: "All Features",
      color: "from-gradient-start to-gradient-end"
    },
  ];

  const handleModeSelect = (selectedMode: ChatMode) => {
    setMode(selectedMode);
    toast.success(`${modes.find(m => m.id === selectedMode)?.label} activated`);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    toast.info("Message sent to Dwiju!");
    setMessage("");
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast.info(isRecording ? "Recording stopped" : "Recording started");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-innovation bg-clip-text text-transparent">
            Dwiju Chat Interface
          </h1>
          <p className="text-lg text-muted-foreground">
            Select your preferred interaction mode
          </p>
        </div>

        {!mode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <Card
                  key={m.id}
                  onClick={() => handleModeSelect(m.id)}
                  className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="p-8 relative z-10">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 text-center group-hover:text-primary transition-colors">
                      {m.label}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground text-center">
                      {m.desc}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {modes.find(m => m.id === mode)?.label}
              </h2>
              <Button onClick={() => setMode(null)} variant="outline">
                Change Mode
              </Button>
            </div>

            <div className="space-y-6">
              {/* Chat Area */}
              <div className="min-h-[300px] bg-background/50 rounded-lg p-4 border border-border">
                <p className="text-muted-foreground text-center py-8">
                  Chat messages will appear here...
                </p>
              </div>

              {/* Input Controls */}
              <div className="space-y-4">
                {(mode === "text" || mode === "text-voice" || mode === "all") && (
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                )}

                {(mode === "voice" || mode === "text-voice" || mode === "voice-vision" || mode === "all") && (
                  <Button
                    onClick={toggleRecording}
                    className={`w-full ${isRecording ? "bg-red-500 hover:bg-red-600" : ""}`}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {isRecording ? "Stop Recording" : "Start Voice Input"}
                  </Button>
                )}

                {(mode === "vision" || mode === "voice-vision" || mode === "all") && (
                  <Button className="w-full" variant="outline">
                    <Video className="w-4 h-4 mr-2" />
                    Start Camera / Upload Image
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Hardware Control Panel */}
        <Card className="mt-8 p-6 bg-card/50 backdrop-blur-sm border-innovation/20">
          <h3 className="text-xl font-bold mb-4">Hardware Controls</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20">
              Servo Motors
            </Button>
            <Button variant="outline" className="h-20">
              Sensors
            </Button>
            <Button variant="outline" className="h-20">
              Camera
            </Button>
            <Button variant="outline" className="h-20">
              Movement
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
