import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Brain, Calculator, Code, Lightbulb, Loader2, 
  Sparkles, PenTool, Zap, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const programmingLanguages = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'html', label: 'HTML/CSS' },
  { value: 'sql', label: 'SQL' },
];

export const DwijuBrain: React.FC = () => {
  const [activeTab, setActiveTab] = useState('math');
  const [problem, setProblem] = useState('');
  const [topic, setTopic] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState('');

  const processBrain = async (type: string) => {
    if (!problem.trim() && !topic.trim()) {
      toast.error('Please enter a problem or topic');
      return;
    }

    setIsProcessing(true);
    setResult('');

    try {
      const { data, error } = await supabase.functions.invoke('dwiju-brain', {
        body: {
          type,
          problem: problem || topic,
          topic,
          language: codeLanguage
        }
      });

      if (error) throw error;

      if (data.success) {
        setResult(data.result);
        toast.success('Solution ready! 🧠');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Brain error:', error);
      toast.error('Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const brainModes = [
    { id: 'math', label: 'Math Solver', icon: Calculator, desc: 'Solve math problems' },
    { id: 'logic', label: 'Logic Puzzle', icon: Lightbulb, desc: 'Solve puzzles' },
    { id: 'code', label: 'Code Helper', icon: Code, desc: 'Write & debug code' },
    { id: 'explain', label: 'Explainer', icon: BookOpen, desc: 'Explain concepts' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Dwiju Brain</h2>
            <p className="text-sm text-muted-foreground">Advanced AI Reasoning • Problem Solving</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Brain Modes */}
          <Card className="p-4">
            <Label className="mb-3 block">Brain Mode / બ્રેઇન મોડ</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {brainModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Button
                    key={mode.id}
                    variant={activeTab === mode.id ? "default" : "outline"}
                    className={cn(
                      "h-auto flex-col py-3 gap-1",
                      activeTab === mode.id && "bg-gradient-to-r from-indigo-500 to-purple-500"
                    )}
                    onClick={() => {
                      setActiveTab(mode.id);
                      setResult('');
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{mode.label}</span>
                    <span className="text-xs opacity-70">{mode.desc}</span>
                  </Button>
                );
              })}
            </div>
          </Card>

          {/* Input Section */}
          <Card className="p-4 space-y-4">
            {activeTab === 'math' && (
              <>
                <Label>Math Problem / ગણિત સમસ્યા</Label>
                <Textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Enter any math problem...&#10;E.g., Solve: 2x + 5 = 15&#10;OR: Find the area of a circle with radius 7cm"
                  className="min-h-[120px] font-mono"
                />
              </>
            )}

            {activeTab === 'logic' && (
              <>
                <Label>Logic Puzzle / લોજિક પઝલ</Label>
                <Textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Enter your logic puzzle or reasoning problem...&#10;E.g., If all roses are flowers and some flowers fade quickly, can we conclude that some roses fade quickly?"
                  className="min-h-[120px]"
                />
              </>
            )}

            {activeTab === 'code' && (
              <>
                <div className="flex justify-between items-center">
                  <Label>Code Request / કોડ રિક્વેસ્ટ</Label>
                  <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {programmingLanguages.map(l => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Describe what code you need...&#10;E.g., Write a function to check if a number is prime&#10;OR: Debug this code: ..."
                  className="min-h-[120px] font-mono"
                />
              </>
            )}

            {activeTab === 'explain' && (
              <>
                <Label>Topic to Explain / સમજાવવાનો વિષય</Label>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a topic or concept to explain...&#10;E.g., Explain photosynthesis&#10;OR: What is gravity?"
                  className="min-h-[120px]"
                />
              </>
            )}

            <Button
              onClick={() => processBrain(activeTab)}
              disabled={isProcessing}
              className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</>
              ) : (
                <><Zap className="w-5 h-5 mr-2" />
                  {activeTab === 'math' && 'Solve Problem'}
                  {activeTab === 'logic' && 'Solve Puzzle'}
                  {activeTab === 'code' && 'Generate Code'}
                  {activeTab === 'explain' && 'Explain Topic'}
                </>
              )}
            </Button>
          </Card>

          {/* Results */}
          {result && (
            <Card className="p-4 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">Solution / સોલ્યુશન</h3>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap bg-card p-4 rounded-lg overflow-x-auto text-sm">
                  {result}
                </pre>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DwijuBrain;
