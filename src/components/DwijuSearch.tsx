import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, Loader2, ExternalLink, Globe, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  thumbnail?: string;
}

export const DwijuSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState('0');
  const [isListening, setIsListening] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('dwiju-search', {
        body: { query }
      });

      if (error) throw error;

      if (data.success) {
        setResults(data.results);
        setTotalResults(data.totalResults);
        toast.success(`Found ${data.results.length} results`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Dwiju Search</h2>
            <p className="text-sm text-muted-foreground">Search the web with AI power</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search anything in any language..."
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
            className="h-12 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
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

        {results.length > 0 && (
          <p className="text-sm text-muted-foreground mt-3">
            About {parseInt(totalResults).toLocaleString()} results found
          </p>
        )}
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isSearching ? (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-xl font-semibold mb-2">Search the Web</h3>
              <p className="text-muted-foreground">
                Enter your query above to search in any language
              </p>
            </div>
          ) : (
            results.map((result, index) => (
              <Card
                key={index}
                className="p-4 hover:bg-card/80 transition-colors cursor-pointer group"
                onClick={() => window.open(result.link, '_blank')}
              >
                <div className="flex gap-4">
                  {result.thumbnail && (
                    <img
                      src={result.thumbnail}
                      alt=""
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-blue-500 group-hover:underline line-clamp-2">
                        {result.title}
                      </h3>
                      <ExternalLink className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-green-600 truncate mt-1">{result.link}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {result.snippet}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DwijuSearch;
