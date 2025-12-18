import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Image, Camera, Upload, Loader2, Eye, FileText, 
  Smile, Search, Scan, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const DwijuVision: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analyze');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setImageBase64(base64);
      setImagePreview(event.target?.result as string);
      toast.success('Image loaded!');
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (error) {
      toast.error('Could not access camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setImageBase64(dataUrl.split(',')[1]);
      setImagePreview(dataUrl);
      stopCamera();
      toast.success('Image captured!');
    }
  };

  const clearImage = () => {
    setImageBase64(null);
    setImagePreview(null);
    setResult('');
  };

  const processImage = async (type: string) => {
    if (!imageBase64) {
      toast.error('Please upload or capture an image first');
      return;
    }

    setIsProcessing(true);
    setResult('');

    try {
      const { data, error } = await supabase.functions.invoke('dwiju-vision', {
        body: {
          imageBase64,
          type,
          prompt: customPrompt || undefined
        }
      });

      if (error) throw error;

      if (data.success) {
        setResult(data.result);
        toast.success('Analysis complete!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Vision error:', error);
      toast.error('Analysis failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const visionModes = [
    { id: 'analyze', label: 'Analyze', icon: Eye, desc: 'Describe image content' },
    { id: 'ocr', label: 'OCR', icon: FileText, desc: 'Extract text from image' },
    { id: 'detect', label: 'Detect', icon: Search, desc: 'Detect objects' },
    { id: 'emotion', label: 'Emotion', icon: Smile, desc: 'Analyze emotions' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-gradient-to-r from-orange-500/10 to-yellow-500/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
            <Image className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Dwiju Vision</h2>
            <p className="text-sm text-muted-foreground">86+ Vision Features • AI Image Analysis</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Image Input Section */}
          <Card className="p-4">
            <Label className="mb-3 block">Image Input / ઇમેજ ઇનપુટ</Label>
            
            {!imagePreview && !isCameraOn && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8" />
                  <span>Upload Image</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={startCamera}
                >
                  <Camera className="w-8 h-8" />
                  <span>Use Camera</span>
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Camera View */}
            {isCameraOn && (
              <div className="relative rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                  <Button onClick={captureImage} className="bg-green-500 hover:bg-green-600">
                    <Scan className="w-4 h-4 mr-2" />
                    Capture
                  </Button>
                  <Button onClick={stopCamera} variant="destructive">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-64 object-contain rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </Card>

          {/* Vision Modes */}
          <Card className="p-4">
            <Label className="mb-3 block">Vision Mode / વિઝન મોડ</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {visionModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Button
                    key={mode.id}
                    variant={activeTab === mode.id ? "default" : "outline"}
                    className={cn(
                      "h-auto flex-col py-3 gap-1",
                      activeTab === mode.id && "bg-gradient-to-r from-orange-500 to-yellow-500"
                    )}
                    onClick={() => setActiveTab(mode.id)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{mode.label}</span>
                    <span className="text-xs opacity-70">{mode.desc}</span>
                  </Button>
                );
              })}
            </div>
          </Card>

          {/* Custom Prompt */}
          <Card className="p-4">
            <Label className="mb-2 block">Custom Question (Optional)</Label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ask anything about the image..."
              className="min-h-[80px]"
            />
          </Card>

          {/* Analyze Button */}
          <Button
            onClick={() => processImage(activeTab)}
            disabled={isProcessing || !imageBase64}
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:opacity-90"
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</>
            ) : (
              <><Eye className="w-5 h-5 mr-2" />Analyze Image</>
            )}
          </Button>

          {/* Results */}
          {result && (
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">Analysis Result</h3>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{result}</p>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DwijuVision;
