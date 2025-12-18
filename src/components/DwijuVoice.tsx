import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Mic, Volume2, Play, Pause, Loader2, Languages, 
  Download, VolumeX, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const voices = [
  { value: 'alloy', label: 'Alloy (Neutral)' },
  { value: 'echo', label: 'Echo (Male)' },
  { value: 'fable', label: 'Fable (British)' },
  { value: 'onyx', label: 'Onyx (Deep)' },
  { value: 'nova', label: 'Nova (Female)' },
  { value: 'shimmer', label: 'Shimmer (Soft)' },
];

const languages = [
  { value: 'Gujarati', label: 'ગુજરાતી (Gujarati)' },
  { value: 'Hindi', label: 'हिंदी (Hindi)' },
  { value: 'English', label: 'English' },
  { value: 'Sanskrit', label: 'संस्कृतम् (Sanskrit)' },
  { value: 'Marathi', label: 'मराठी (Marathi)' },
  { value: 'Tamil', label: 'தமிழ் (Tamil)' },
  { value: 'Telugu', label: 'తెలుగు (Telugu)' },
  { value: 'Bengali', label: 'বাংলা (Bengali)' },
];

interface AudioItem {
  id: string;
  text: string;
  audioBase64?: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  voice: string;
}

export const DwijuVoice: React.FC = () => {
  const [ttsText, setTtsText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [audioItems, setAudioItems] = useState<AudioItem[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  
  const [translateText, setTranslateText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Gujarati');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState('');

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);

  const generateTTS = async () => {
    if (!ttsText.trim()) {
      toast.error('Please enter text to convert');
      return;
    }

    setIsGeneratingTTS(true);
    const itemId = crypto.randomUUID();

    const newItem: AudioItem = {
      id: itemId,
      text: ttsText.slice(0, 100),
      status: 'generating',
      voice: selectedVoice,
    };
    setAudioItems(prev => [newItem, ...prev]);

    try {
      const { data, error } = await supabase.functions.invoke('dwiju-voice', {
        body: {
          type: 'tts',
          text: ttsText,
          voice: selectedVoice
        }
      });

      if (error) throw error;

      if (data.success) {
        setAudioItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, status: 'completed', audioBase64: data.audioBase64 }
            : item
        ));
        toast.success('Audio generated! 🔊');
        setTtsText('');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('TTS error:', error);
      setAudioItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: 'error' } : item
      ));
      toast.error('TTS generation failed');
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  const playAudio = (item: AudioItem) => {
    if (!item.audioBase64 || !audioRef.current) return;

    if (currentlyPlaying === item.id) {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    } else {
      audioRef.current.src = `data:audio/mp3;base64,${item.audioBase64}`;
      audioRef.current.play();
      setCurrentlyPlaying(item.id);
    }
  };

  const downloadAudio = (item: AudioItem) => {
    if (!item.audioBase64) return;
    const link = document.createElement('a');
    link.href = `data:audio/mp3;base64,${item.audioBase64}`;
    link.download = `dwiju-voice-${item.id.slice(0, 8)}.mp3`;
    link.click();
  };

  const translateTextFn = async () => {
    if (!translateText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }

    setIsTranslating(true);
    setTranslation('');

    try {
      const { data, error } = await supabase.functions.invoke('dwiju-voice', {
        body: {
          type: 'translate',
          text: translateText,
          language: targetLanguage
        }
      });

      if (error) throw error;

      if (data.success) {
        setTranslation(data.translation);
        toast.success('Translation complete!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'gu-IN';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Speech recognition error');
      };

      recognition.onend = () => setIsListening(false);

      recognition.start();
      setIsListening(true);
      toast.info('Listening... Speak now');
    } else {
      toast.error('Speech recognition not supported');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-gradient-to-r from-teal-500/10 to-green-500/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center">
            <Mic className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Dwiju Voice</h2>
            <p className="text-sm text-muted-foreground">TTS • Translation • Speech Recognition</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Text to Speech */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-teal-500" />
              <h3 className="font-semibold">Text to Speech / ટેક્સ્ટ ટુ સ્પીચ</h3>
            </div>

            <Textarea
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              placeholder="Enter text to convert to speech... કોઈપણ ભાષામાં લખો..."
              className="min-h-[100px]"
            />

            <div className="flex gap-2">
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map(v => (
                    <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={generateTTS}
                disabled={isGeneratingTTS}
                className="flex-1 bg-gradient-to-r from-teal-500 to-green-500"
              >
                {isGeneratingTTS ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Generate Audio</>
                )}
              </Button>
            </div>

            {/* Generated Audio List */}
            {audioItems.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-border/30">
                <h4 className="text-sm font-medium">Generated Audio</h4>
                {audioItems.map(item => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3 rounded-lg border bg-card flex items-center justify-between",
                      item.status === 'generating' && "animate-pulse",
                      item.status === 'error' && "border-red-500/30"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.text}...</p>
                      <Badge variant="secondary" className="text-xs">{item.voice}</Badge>
                    </div>
                    {item.status === 'completed' && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => playAudio(item)}>
                          {currentlyPlaying === item.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => downloadAudio(item)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {item.status === 'generating' && <Loader2 className="w-4 h-4 animate-spin" />}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Translation */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Translation / અનુવાદ</h3>
            </div>

            <Textarea
              value={translateText}
              onChange={(e) => setTranslateText(e.target.value)}
              placeholder="Enter text to translate..."
              className="min-h-[80px]"
            />

            <div className="flex gap-2">
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Target language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(l => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={translateTextFn}
                disabled={isTranslating}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
              >
                {isTranslating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Translating...</>
                ) : (
                  <><Languages className="w-4 h-4 mr-2" />Translate</>
                )}
              </Button>
            </div>

            {translation && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <Label className="text-xs text-muted-foreground">Translation:</Label>
                <p className="whitespace-pre-wrap">{translation}</p>
              </div>
            )}
          </Card>

          {/* Speech Recognition */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold">Speech to Text / સ્પીચ ટુ ટેક્સ્ટ</h3>
            </div>

            <Button
              onClick={startListening}
              disabled={isListening}
              className={cn(
                "w-full h-16",
                isListening ? "bg-red-500 animate-pulse" : "bg-gradient-to-r from-red-500 to-pink-500"
              )}
            >
              <Mic className="w-6 h-6 mr-2" />
              {isListening ? "Listening..." : "Start Listening"}
            </Button>

            {transcript && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <Label className="text-xs text-muted-foreground">Transcript:</Label>
                <p className="whitespace-pre-wrap">{transcript}</p>
              </div>
            )}
          </Card>
        </div>
      </ScrollArea>

      <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} className="hidden" />
    </div>
  );
};

export default DwijuVoice;
