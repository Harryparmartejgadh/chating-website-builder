import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Music, Play, Pause, Download, Loader2, Sparkles, 
  Mic2, Guitar, Piano, Drum, Radio, Heart, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SUNO_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suno-music`;

const genres = [
  { value: 'pop', label: 'Pop', icon: Heart },
  { value: 'rock', label: 'Rock', icon: Guitar },
  { value: 'electronic', label: 'Electronic', icon: Zap },
  { value: 'classical', label: 'Classical', icon: Piano },
  { value: 'jazz', label: 'Jazz', icon: Drum },
  { value: 'hip-hop', label: 'Hip-Hop', icon: Mic2 },
  { value: 'folk', label: 'Folk/Gujarati', icon: Radio },
  { value: 'bollywood', label: 'Bollywood', icon: Music },
  { value: 'ambient', label: 'Ambient', icon: Radio },
  { value: 'cinematic', label: 'Cinematic', icon: Music },
];

interface GeneratedSong {
  id: string;
  title: string;
  genre: string;
  audioUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  prompt: string;
}

export const DwijuMusic: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [genre, setGenre] = useState('pop');
  const [duration, setDuration] = useState([30]);
  const [instrumental, setInstrumental] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [songs, setSongs] = useState<GeneratedSong[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateMusic = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe the song you want');
      return;
    }

    setIsGenerating(true);
    const songId = crypto.randomUUID();
    
    // Add pending song
    const newSong: GeneratedSong = {
      id: songId,
      title: prompt.slice(0, 50),
      genre,
      status: 'generating',
      prompt,
    };
    setSongs(prev => [newSong, ...prev]);

    try {
      const fullPrompt = lyrics 
        ? `${prompt}\n\nLyrics:\n${lyrics}` 
        : prompt;

      const response = await fetch(SUNO_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          style: genre,
          duration: duration[0],
          instrumental,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Music generation failed');
      }

      // Update song with result
      setSongs(prev => prev.map(s => 
        s.id === songId 
          ? { 
              ...s, 
              status: 'completed' as const,
              audioUrl: data.data?.audio_url || data.data?.url,
            }
          : s
      ));

      toast.success('🎵 Song generated successfully!');
      setPrompt('');
      setLyrics('');

    } catch (error) {
      console.error('Music generation error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Generation failed';
      
      setSongs(prev => prev.map(s => 
        s.id === songId ? { ...s, status: 'error' as const } : s
      ));
      
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const playSong = (song: GeneratedSong) => {
    if (!song.audioUrl || !audioRef.current) return;

    if (currentlyPlaying === song.id) {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    } else {
      audioRef.current.src = song.audioUrl;
      audioRef.current.play();
      setCurrentlyPlaying(song.id);
    }
  };

  const downloadSong = (song: GeneratedSong) => {
    if (!song.audioUrl) return;
    const a = document.createElement('a');
    a.href = song.audioUrl;
    a.download = `dwiju-${song.title.slice(0, 20)}.mp3`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-2 mb-2">
          <Music className="w-5 h-5 text-purple-500" />
          <h2 className="font-bold text-lg">Dwiju Music Studio</h2>
          <Badge variant="outline" className="text-purple-400 border-purple-500/30">
            Suno AI
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Create AI-generated songs with lyrics, any genre, any language
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Song Description */}
          <div className="space-y-2">
            <Label>Song Description</Label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A happy Gujarati folk song about monsoon..."
              className="bg-card"
            />
          </div>

          {/* Lyrics (Optional) */}
          <div className="space-y-2">
            <Label>Lyrics (Optional)</Label>
            <Textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Write your own lyrics in any language...&#10;&#10;વરસાદ આવ્યો રે...&#10;मेरी धड़कन..."
              className="bg-card min-h-[100px]"
            />
          </div>

          {/* Genre Selection */}
          <div className="space-y-2">
            <Label>Genre</Label>
            <div className="grid grid-cols-5 gap-2">
              {genres.map((g) => {
                const Icon = g.icon;
                return (
                  <Button
                    key={g.value}
                    variant={genre === g.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGenre(g.value)}
                    className={cn(
                      "flex flex-col h-auto py-2 gap-1",
                      genre === g.value && "bg-purple-500 hover:bg-purple-600"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{g.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Duration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Duration</Label>
              <span className="text-sm text-muted-foreground">{duration[0]} seconds</span>
            </div>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={15}
              max={120}
              step={15}
              className="py-2"
            />
          </div>

          {/* Instrumental Toggle */}
          <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50">
            <div>
              <Label>Instrumental Only</Label>
              <p className="text-xs text-muted-foreground">No vocals, music only</p>
            </div>
            <Switch
              checked={instrumental}
              onCheckedChange={setInstrumental}
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateMusic}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Song...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Song
              </>
            )}
          </Button>

          {/* Generated Songs */}
          {songs.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/30">
              <h3 className="font-semibold text-sm">Generated Songs</h3>
              {songs.map((song) => (
                <div
                  key={song.id}
                  className={cn(
                    "p-3 rounded-lg border bg-card",
                    song.status === 'generating' && "border-purple-500/50 animate-pulse",
                    song.status === 'completed' && "border-green-500/30",
                    song.status === 'error' && "border-red-500/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{song.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {song.genre}
                        </Badge>
                        {song.status === 'generating' && (
                          <span className="text-xs text-purple-400 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Generating...
                          </span>
                        )}
                        {song.status === 'completed' && (
                          <span className="text-xs text-green-400">✓ Ready</span>
                        )}
                        {song.status === 'error' && (
                          <span className="text-xs text-red-400">✗ Failed</span>
                        )}
                      </div>
                    </div>
                    
                    {song.status === 'completed' && song.audioUrl && (
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => playSong(song)}
                          className="h-8 w-8"
                        >
                          {currentlyPlaying === song.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => downloadSong(song)}
                          className="h-8 w-8"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setCurrentlyPlaying(null)}
        className="hidden"
      />
    </div>
  );
};

export default DwijuMusic;