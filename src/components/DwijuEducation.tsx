import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  GraduationCap, BookOpen, Brain, Calendar, Loader2, 
  CheckCircle, XCircle, HelpCircle, Send, Sparkles, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const subjects = [
  { value: 'mathematics', label: 'Mathematics / ગણિત' },
  { value: 'science', label: 'Science / વિજ્ઞાન' },
  { value: 'english', label: 'English' },
  { value: 'gujarati', label: 'Gujarati / ગુજરાતી' },
  { value: 'hindi', label: 'Hindi / हिंदी' },
  { value: 'social-studies', label: 'Social Studies / સામાજિક વિજ્ઞાન' },
  { value: 'computer', label: 'Computer / કમ્પ્યુટર' },
  { value: 'general-knowledge', label: 'General Knowledge / સામાન્ય જ્ઞાન' },
];

const difficulties = [
  { value: 'easy', label: 'Easy / સરળ' },
  { value: 'medium', label: 'Medium / મધ્યમ' },
  { value: 'hard', label: 'Hard / કઠિન' },
];

const languages = [
  { value: 'gujarati', label: 'ગુજરાતી' },
  { value: 'hindi', label: 'हिंदी' },
  { value: 'english', label: 'English' },
  { value: 'mixed', label: 'Mixed / મિશ્ર' },
];

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

interface StudyPlan {
  planTitle: string;
  duration: string;
  dailyHours: number;
  schedule: {
    day: string;
    topic: string;
    activities: string[];
    resources: string[];
    goals: string;
  }[];
  tips: string[];
}

export const DwijuEducation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('quiz');
  
  // Quiz state
  const [quizSubject, setQuizSubject] = useState('mathematics');
  const [quizTopic, setQuizTopic] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [quizLanguage, setQuizLanguage] = useState('gujarati');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Expert state
  const [expertSubject, setExpertSubject] = useState('mathematics');
  const [expertQuestion, setExpertQuestion] = useState('');
  const [expertLanguage, setExpertLanguage] = useState('gujarati');
  const [isAskingExpert, setIsAskingExpert] = useState(false);
  const [expertAnswer, setExpertAnswer] = useState('');

  // Planner state
  const [studyGoal, setStudyGoal] = useState('');
  const [plannerLanguage, setPlannerLanguage] = useState('gujarati');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);

  const generateQuiz = async () => {
    if (!quizTopic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGeneratingQuiz(true);
    setQuiz(null);
    setUserAnswers([]);
    setShowResults(false);

    try {
      const { data, error } = await supabase.functions.invoke('dwiju-education', {
        body: {
          type: 'quiz',
          subject: quizSubject,
          topic: quizTopic,
          difficulty: quizDifficulty,
          language: quizLanguage
        }
      });

      if (error) throw error;

      if (data.success && data.data) {
        setQuiz(data.data);
        setUserAnswers(new Array(data.data.questions.length).fill(-1));
        toast.success('Quiz generated! 🎯');
      } else {
        throw new Error(data.error || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast.error('Failed to generate quiz');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const submitQuiz = () => {
    setShowResults(true);
    const score = userAnswers.reduce((acc, answer, idx) => {
      return acc + (answer === quiz?.questions[idx].correct ? 1 : 0);
    }, 0);
    toast.success(`Score: ${score}/${quiz?.questions.length} 🎉`);
  };

  const askExpert = async () => {
    if (!expertQuestion.trim()) {
      toast.error('Please enter your question');
      return;
    }

    setIsAskingExpert(true);
    setExpertAnswer('');

    try {
      const { data, error } = await supabase.functions.invoke('dwiju-education', {
        body: {
          type: 'expert',
          subject: expertSubject,
          question: expertQuestion,
          language: expertLanguage
        }
      });

      if (error) throw error;

      if (data.success) {
        setExpertAnswer(data.data);
        toast.success('Answer received! 📚');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Expert query error:', error);
      toast.error('Failed to get answer');
    } finally {
      setIsAskingExpert(false);
    }
  };

  const generateStudyPlan = async () => {
    if (!studyGoal.trim()) {
      toast.error('Please enter your study goal');
      return;
    }

    setIsGeneratingPlan(true);
    setStudyPlan(null);

    try {
      const { data, error } = await supabase.functions.invoke('dwiju-education', {
        body: {
          type: 'planner',
          studyGoal,
          language: plannerLanguage
        }
      });

      if (error) throw error;

      if (data.success && data.data) {
        setStudyPlan(data.data);
        toast.success('Study plan created! 📅');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Planner error:', error);
      toast.error('Failed to create study plan');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Dwiju Education</h2>
            <p className="text-sm text-muted-foreground">245+ Learning Features • Quiz • Expert • Planner</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Quiz Generator
              </TabsTrigger>
              <TabsTrigger value="expert" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Subject Expert
              </TabsTrigger>
              <TabsTrigger value="planner" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Study Planner
              </TabsTrigger>
            </TabsList>

            {/* Quiz Generator */}
            <TabsContent value="quiz" className="space-y-4">
              <Card className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject / વિષય</Label>
                    <Select value={quizSubject} onValueChange={setQuizSubject}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty / કઠિનતા</Label>
                    <Select value={quizDifficulty} onValueChange={setQuizDifficulty}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {difficulties.map(d => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Topic / વિષય</Label>
                  <Input
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder="E.g., Fractions, Photosynthesis, Grammar..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Language / ભાષા</Label>
                  <Select value={quizLanguage} onValueChange={setQuizLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {languages.map(l => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateQuiz} 
                  disabled={isGeneratingQuiz}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500"
                >
                  {isGeneratingQuiz ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Quiz...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />Generate Quiz</>
                  )}
                </Button>
              </Card>

              {/* Quiz Display */}
              {quiz && (
                <Card className="p-4 space-y-6">
                  <h3 className="text-xl font-bold text-center">{quiz.title}</h3>
                  
                  {quiz.questions.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-3 p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium">
                        <span className="text-primary mr-2">Q{qIdx + 1}.</span>
                        {q.question}
                      </p>
                      
                      <RadioGroup
                        value={userAnswers[qIdx]?.toString()}
                        onValueChange={(v) => {
                          const newAnswers = [...userAnswers];
                          newAnswers[qIdx] = parseInt(v);
                          setUserAnswers(newAnswers);
                        }}
                        disabled={showResults}
                      >
                        {q.options.map((opt, optIdx) => (
                          <div 
                            key={optIdx}
                            className={cn(
                              "flex items-center space-x-2 p-2 rounded-lg transition-colors",
                              showResults && optIdx === q.correct && "bg-green-500/20",
                              showResults && userAnswers[qIdx] === optIdx && optIdx !== q.correct && "bg-red-500/20"
                            )}
                          >
                            <RadioGroupItem value={optIdx.toString()} id={`q${qIdx}-o${optIdx}`} />
                            <Label htmlFor={`q${qIdx}-o${optIdx}`} className="flex-1 cursor-pointer">
                              {opt}
                            </Label>
                            {showResults && optIdx === q.correct && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {showResults && userAnswers[qIdx] === optIdx && optIdx !== q.correct && (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        ))}
                      </RadioGroup>

                      {showResults && (
                        <p className="text-sm text-muted-foreground bg-card p-2 rounded">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}

                  {!showResults && (
                    <Button onClick={submitQuiz} className="w-full">
                      <Target className="w-4 h-4 mr-2" />
                      Submit Quiz
                    </Button>
                  )}

                  {showResults && (
                    <div className="text-center">
                      <Badge className="text-lg px-4 py-2">
                        Score: {userAnswers.reduce((acc, a, i) => acc + (a === quiz.questions[i].correct ? 1 : 0), 0)}/{quiz.questions.length}
                      </Badge>
                      <Button variant="outline" className="ml-4" onClick={() => {
                        setQuiz(null);
                        setShowResults(false);
                      }}>
                        New Quiz
                      </Button>
                    </div>
                  )}
                </Card>
              )}
            </TabsContent>

            {/* Subject Expert */}
            <TabsContent value="expert" className="space-y-4">
              <Card className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject Expert / વિષય નિષ્ણાત</Label>
                    <Select value={expertSubject} onValueChange={setExpertSubject}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Answer Language / જવાબ ભાષા</Label>
                    <Select value={expertLanguage} onValueChange={setExpertLanguage}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {languages.map(l => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Your Question / તમારો પ્રશ્ન</Label>
                  <Textarea
                    value={expertQuestion}
                    onChange={(e) => setExpertQuestion(e.target.value)}
                    placeholder="Ask any question about the subject..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button 
                  onClick={askExpert}
                  disabled={isAskingExpert}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
                >
                  {isAskingExpert ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Getting Answer...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" />Ask Expert</>
                  )}
                </Button>
              </Card>

              {expertAnswer && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold">Expert Answer</h3>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{expertAnswer}</p>
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Study Planner */}
            <TabsContent value="planner" className="space-y-4">
              <Card className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label>Study Goal / અભ્યાસ લક્ષ્ય</Label>
                  <Textarea
                    value={studyGoal}
                    onChange={(e) => setStudyGoal(e.target.value)}
                    placeholder="E.g., Prepare for Class 10 Math exam in 2 weeks..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Language / ભાષા</Label>
                  <Select value={plannerLanguage} onValueChange={setPlannerLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {languages.map(l => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateStudyPlan}
                  disabled={isGeneratingPlan}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500"
                >
                  {isGeneratingPlan ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Plan...</>
                  ) : (
                    <><Calendar className="w-4 h-4 mr-2" />Generate Study Plan</>
                  )}
                </Button>
              </Card>

              {studyPlan && (
                <Card className="p-4 space-y-4">
                  <div className="text-center border-b border-border pb-4">
                    <h3 className="text-xl font-bold">{studyPlan.planTitle}</h3>
                    <div className="flex justify-center gap-4 mt-2">
                      <Badge variant="outline">Duration: {studyPlan.duration}</Badge>
                      <Badge variant="outline">{studyPlan.dailyHours} hours/day</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {studyPlan.schedule.map((day, idx) => (
                      <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-primary">{day.day}</Badge>
                          <span className="font-medium">{day.topic}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{day.goals}</p>
                        <div className="flex flex-wrap gap-1">
                          {day.activities.map((act, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{act}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {studyPlan.tips.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <h4 className="font-semibold mb-2">💡 Tips</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {studyPlan.tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};

export default DwijuEducation;
