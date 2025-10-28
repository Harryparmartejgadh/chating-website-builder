import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Heart, GraduationCap, Sprout, Eye, Users, AlertTriangle, Briefcase, Palette, Church, Globe, Trophy, Bot, Shield } from "lucide-react";

const Index = () => {
  const categories = [
    { 
      icon: Brain, 
      title: "Core AI Communication Hub", 
      features: "80+ Features",
      description: "Multilingual Chat, Voice AI, Translation, Debate Mode, Interview Trainer",
      gradient: "from-primary to-primary-glow",
      shadow: "shadow-glow-primary"
    },
    { 
      icon: GraduationCap, 
      title: "Education Hub", 
      features: "245+ Features",
      description: "Smart Learning, Quiz Generator, Study Planner, Subject Expert AI",
      gradient: "from-accent to-accent-glow",
      shadow: "shadow-glow-accent"
    },
    { 
      icon: Heart, 
      title: "Medical & Health Hub", 
      features: "135+ Features",
      description: "Body Temperature, ECG, Blood Pressure, Sugar Monitor, Health Analytics",
      gradient: "from-secondary to-secondary-glow",
      shadow: "shadow-glow-secondary"
    },
    { 
      icon: Sprout, 
      title: "Agriculture & Rural Hub", 
      features: "134+ Features",
      description: "Crop Diagnosis, Soil Analysis, Weather Prediction, Farm Management",
      gradient: "from-secondary to-secondary-glow",
      shadow: "shadow-glow-secondary"
    },
    { 
      icon: Eye, 
      title: "Vision & Recognition Hub", 
      features: "86+ Features",
      description: "Face Recognition, Object Detection, Emotion Analysis, OCR Scanner",
      gradient: "from-primary to-primary-glow",
      shadow: "shadow-glow-primary"
    },
    { 
      icon: Users, 
      title: "Accessibility & Divyang Support", 
      features: "90+ Features",
      description: "Sign Language, Screen Reader, Voice Control, Braille Support",
      gradient: "from-innovation to-innovation-glow",
      shadow: "shadow-glow-innovation"
    },
    { 
      icon: AlertTriangle, 
      title: "Emergency & Safety Hub", 
      features: "82+ Features",
      description: "SOS Alerts, GPS Tracking, Fall Detection, Emergency Contacts",
      gradient: "from-destructive via-red-500 to-red-400",
      shadow: "shadow-red-500/30"
    },
    { 
      icon: Briefcase, 
      title: "Office & Productivity Hub", 
      features: "263+ Features",
      description: "Document Scanner, Email Assistant, Meeting Scheduler, Task Manager",
      gradient: "from-primary to-primary-glow",
      shadow: "shadow-glow-primary"
    },
    { 
      icon: Palette, 
      title: "Multimedia & Creativity Hub", 
      features: "109+ Features",
      description: "Image Editor, Video Maker, Music Generator, Art Creator",
      gradient: "from-innovation to-innovation-glow",
      shadow: "shadow-glow-innovation"
    },
    { 
      icon: Church, 
      title: "Spiritual & Cultural Hub", 
      features: "96+ Features",
      description: "Religious Texts, Prayer Times, Spiritual Guidance, Festival Calendar",
      gradient: "from-accent to-accent-glow",
      shadow: "shadow-glow-accent"
    },
    { 
      icon: Globe, 
      title: "Global Tools & Data Hub", 
      features: "95+ Features",
      description: "World Data, Currency Converter, Time Zones, News Aggregator",
      gradient: "from-primary to-primary-glow",
      shadow: "shadow-glow-primary"
    },
    { 
      icon: Trophy, 
      title: "Gamification & Dashboard", 
      features: "80+ Features",
      description: "Leaderboard, Rewards System, Progress Tracking, Achievements",
      gradient: "from-accent to-accent-glow",
      shadow: "shadow-glow-accent"
    },
    { 
      icon: Bot, 
      title: "Robotics & IoT Integration", 
      features: "85+ Features",
      description: "Servo Control, Sensor Integration, Hardware Sync, Robot Movement",
      gradient: "from-innovation to-innovation-glow",
      shadow: "shadow-glow-innovation"
    },
    { 
      icon: Shield, 
      title: "System Diagnostics & Security", 
      features: "245+ Features",
      description: "Security Monitoring, Data Encryption, System Health, Privacy Control",
      gradient: "from-primary to-primary-glow",
      shadow: "shadow-glow-primary"
    },
  ];

  const stats = [
    { value: "1950+", label: "Total Features" },
    { value: "14", label: "Major Categories" },
    { value: "100%", label: "AI Powered" },
    { value: "Global", label: "Standard" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]" />
        
        <div className="container mx-auto text-center relative z-10 animate-fade-in">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
            <span className="text-primary text-sm font-semibold">Global Level School Project - Gujarat</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-innovation bg-clip-text text-transparent animate-slide-up">
            Dwiju
          </h1>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground/90">
            All In One AI Robo
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            AI 1950+ Advanced Features
          </p>
          
          <p className="text-lg text-muted-foreground mb-12">
            Medical • Educational • Humanoid • Voice Cloning • Intelligent
          </p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow-primary text-lg px-8"
            >
              Explore Features
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary/30 hover:bg-primary/10 text-lg px-8"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Categories Section */}
      <section className="py-20 px-4 bg-background/50">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Major Feature Categories
          </h2>
          <p className="text-center text-muted-foreground mb-16 text-lg">
            Explore 14 comprehensive AI-powered modules
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-500 hover:scale-105 cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <div className="p-6 relative z-10">
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 ${category.shadow} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    
                    <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${category.gradient} text-white text-sm font-semibold mb-3`}>
                      {category.features}
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* School Info Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background/50 to-primary/5">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 md:p-12 bg-card/50 backdrop-blur-sm border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Project Information
            </h2>
            
            <div className="space-y-6 text-center">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-primary">School Name</h3>
                <p className="text-lg text-muted-foreground">
                  [Your School Name Here]
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2 text-secondary">Project Guide</h3>
                <p className="text-lg text-muted-foreground">
                  [Teacher Name]
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2 text-accent">Student Developer</h3>
                <p className="text-lg text-muted-foreground">
                  [Student Name]
                </p>
              </div>
              
              <div className="pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground italic">
                  Powered by Innovation • Designed for Education • Built for Future
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-background/80 border-t border-border/50">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2025 Dwiju AI Robo - All Rights Reserved
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            A Global Level School Project from Gujarat, India
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
