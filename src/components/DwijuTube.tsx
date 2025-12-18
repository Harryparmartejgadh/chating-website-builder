import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Loader2, Play, Youtube, Mic, MicOff, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

export const DwijuTube: React.FC = () => {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setVideos([]);

    try {
      const { data, error } = await supabase.functions.invoke('dwiju-tube', {
        body: { query, maxResults: 12 }
      });

      if (error) throw error;

      if (data.success) {
        setVideos(data.videos);
        toast.success(`Found ${data.videos.length} videos`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('YouTube search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'gu-IN';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        toast.success('Voice captured!');
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed');
      };

      recognition.onend = () => setIsListening(false);

      if (!isListening) {
        recognition.start();
        setIsListening(true);
        toast.info('Listening... Speak your search');
      }
    } else {
      toast.error('Voice search not supported');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border/30 bg-gradient-to-r from-red-500/10 to-orange-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <Youtube className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Dwiju Tube</h2>
            <p className="text-sm text-muted-foreground">Search & watch YouTube videos</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search videos in any language..."
              className="pl-10 h-12 text-lg bg-background"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleVoiceSearch}
            className={`h-12 w-12 ${isListening ? 'bg-red-500 text-white animate-pulse' : ''}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="h-12 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Videos Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isSearching ? (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-red-500" />
              <p className="text-muted-foreground">Searching videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20">
              <Youtube className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-xl font-semibold mb-2">Search YouTube Videos</h3>
              <p className="text-muted-foreground">
                Enter your query above to find videos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden cursor-pointer group hover:ring-2 ring-red-500/50 transition-all"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center">
                        <Play className="w-7 h-7 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold line-clamp-2 text-sm group-hover:text-red-500 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{video.channelTitle}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(video.publishedAt)}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedVideo && (
            <div>
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{selectedVideo.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedVideo.channelTitle}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {selectedVideo.description}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DwijuTube;
