import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, MicOff, Video, VideoOff, Send, Loader2, Bot, User,
  Volume2, VolumeX, Camera, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageBase64?: string;
}

export const DwijuLive: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'gu-IN'; // Gujarati as default
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Add welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'નમસ્તે! હું દ્વિજુ છું - તમારો AI મિત્ર. 🙏\n\nHello! I am Dwiju - your AI friend. How can I help you today?\n\nYou can:\n• Type your message\n• Click the mic to speak\n• Turn on camera to show me something',
      timestamp: new Date()
    }]);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsVideoOn(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Could not access camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsVideoOn(false);
    setCapturedImage(null);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      setCapturedImage(base64);
      toast.success('Image captured! Send your message.');
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('Listening... Speak now');
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Hindi/Gujarati voice
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !capturedImage) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input || 'What do you see in this image?',
      timestamp: new Date(),
      imageBase64: capturedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    try {
      const { data, error } = await supabase.functions.invoke('dwiju-live', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          imageBase64: capturedImage
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCapturedImage(null);

      // Auto-speak response
      speak(data.response);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-primary/5">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                Dwiju Live
                <Badge variant="outline" className="text-green-500 border-green-500/30">
                  ● Online
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">Real-time AI Conversation</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isSpeaking ? (
              <Button size="icon" variant="ghost" onClick={stopSpeaking}>
                <VolumeX className="w-5 h-5 text-red-500" />
              </Button>
            ) : (
              <Button size="icon" variant="ghost" disabled>
                <Volume2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Video Section */}
      {isVideoOn && (
        <div className="p-4 border-b border-border/30 bg-card/50">
          <div className="relative rounded-lg overflow-hidden max-w-md mx-auto">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg"
            />
            {capturedImage && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge className="bg-green-500">Image Captured ✓</Badge>
              </div>
            )}
            <Button
              size="sm"
              className="absolute bottom-2 right-2"
              onClick={captureImage}
            >
              <Camera className="w-4 h-4 mr-1" />
              Capture
            </Button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl p-4",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border/50 rounded-tl-sm"
                )}
              >
                {message.imageBase64 && (
                  <img
                    src={`data:image/jpeg;base64,${message.imageBase64}`}
                    alt="Captured"
                    className="rounded-lg mb-2 max-w-full"
                  />
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-60 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dwiju is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border/30 bg-card/50">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 mb-3">
            <Button
              variant={isVideoOn ? "default" : "outline"}
              size="sm"
              onClick={isVideoOn ? stopCamera : startCamera}
              className={isVideoOn ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {isVideoOn ? <VideoOff className="w-4 h-4 mr-1" /> : <Video className="w-4 h-4 mr-1" />}
              {isVideoOn ? "Stop Camera" : "Start Camera"}
            </Button>
            
            <Button
              variant={isListening ? "default" : "outline"}
              size="sm"
              onClick={toggleListening}
              className={isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""}
            >
              {isListening ? <MicOff className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
              {isListening ? "Stop" : "Voice"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type your message or speak..."
              className="flex-1 bg-background"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || (!input.trim() && !capturedImage)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DwijuLive;
