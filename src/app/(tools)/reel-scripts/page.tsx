'use client';

import { useState, useEffect, useRef } from 'react'; // Added useEffect, useRef
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Sparkles, Terminal, Image as ImageIcon, Video as VideoIcon, Mic, ChevronLeft, ChevronRight } from 'lucide-react';
import { experimental_useObject as useObject } from '@ai-sdk/react';

// ... Imports for UI components ...
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  subjectMatter: z.string().min(10, 'Please provide more details on the subject.'),
  reelLength: z.enum(['15s', '30s', '60s']),
  language: z.enum(['Hinglish', 'Hindi', 'English']),
});

const OutputSchema = z.object({
  scenes: z.array(z.object({
    visual: z.string().optional(), // Mark optional for streaming safety
    voiceover: z.string().optional(),
  })),
});

export default function ReelScriptPage() {
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});

  const [generatingVideos, setGeneratingVideos] = useState<Record<number, boolean>>({});
  const [generatedVideos, setGeneratedVideos] = useState<Record<number, string>>({});

  const [generatingVoiceovers, setGeneratingVoiceovers] = useState<Record<number, boolean>>({});
  const [generatedVoiceovers, setGeneratedVoiceovers] = useState<Record<number, string>>({});

  // 1. FIX: Cleanup memory leaks for Audio URLs
  useEffect(() => {
    return () => {
      Object.values(generatedVoiceovers).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [generatedVoiceovers]);

  const { object, submit, isLoading, error: aiError } = useObject({
    api: '/api/generate-reel-scripts',
    schema: OutputSchema,
    onError: (error) => {
      setGenerationError(error.message || 'An error occurred during generation.');
    },
    onFinish: async ({ object }) => {
        // Reset navigation
        setCurrentSceneIndex(0);

        // 2. FIX: Avoid Thundering Herd. 
        // Either don't auto-generate, or do it sequentially with a small delay
        // Here we will just generate the FIRST scene's image to save API costs/load
        if (object?.scenes && object.scenes[0]?.visual) {
           await generateImage(0, object.scenes[0].visual);
        }
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectMatter: '',
      reelLength: '30s',
      language: 'English',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setGenerationError(null);
    // Note: We intentionally clear state here to prepare for new generation
    setGeneratedImages({});
    setGeneratedVideos({});
    // Revoke old URLs before clearing state
    Object.values(generatedVoiceovers).forEach(url => URL.revokeObjectURL(url));
    setGeneratedVoiceovers({});
    setCurrentSceneIndex(0);
    submit(values);
  }

  async function generateImage(index: number, visualDescription: string) {
    if (generatingImages[index]) return;

    setGeneratingImages(prev => ({ ...prev, [index]: true }));
    try {
      const res = await fetch('/api/generate-scene-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: visualDescription }),
      });
      const data = await res.json();
      if (data.url) {
        setGeneratedImages(prev => ({ ...prev, [index]: data.url }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingImages(prev => ({ ...prev, [index]: false }));
    }
  }

  async function generateVideo(index: number, visualDescription: string, existingImageUrl?: string) {
    if (generatingVideos[index]) return;

    setGeneratingVideos(prev => ({ ...prev, [index]: true }));
    try {
      // 3. FIX: Be explicit about Image-to-Video vs Text-to-Video
      const imageUrl = existingImageUrl || generatedImages[index];
      
      const res = await fetch('/api/generate-scene-video', {
        method: 'POST',
        body: JSON.stringify({ 
            prompt: visualDescription, 
            imageUrl: imageUrl || undefined // Ensure undefined is sent if empty
        }),
      });
      const data = await res.json();
      if (data.url) {
        setGeneratedVideos(prev => ({ ...prev, [index]: data.url }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingVideos(prev => ({ ...prev, [index]: false }));
    }
  }

  async function generateVoiceover(index: number, text: string) {
    if (generatingVoiceovers[index]) return;

    setGeneratingVoiceovers(prev => ({ ...prev, [index]: true }));
    try {
      const res = await fetch('/api/generate-voiceover', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('Failed to generate voiceover');

      const blob = await res.blob();
      // Revoke previous URL for this specific index if it exists
      if (generatedVoiceovers[index]) {
          URL.revokeObjectURL(generatedVoiceovers[index]);
      }
      const url = URL.createObjectURL(blob);
      setGeneratedVoiceovers(prev => ({ ...prev, [index]: url }));
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingVoiceovers(prev => ({ ...prev, [index]: false }));
    }
  }

  const scenes = object?.scenes || [];
  const currentScene = scenes[currentSceneIndex];
  const totalScenes = scenes.length;

  const nextScene = () => {
    if (currentSceneIndex < totalScenes - 1) setCurrentSceneIndex(prev => prev + 1);
  };

  const prevScene = () => {
    if (currentSceneIndex > 0) setCurrentSceneIndex(prev => prev - 1);
  };

  return (
    <div>
      <PageHeader
        title="Reel Script Generator"
        description="Create a complete script with storytelling structure for your next reel."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
             {/* ... Form Fields remain same ... */}
             {/* Snipped for brevity, your form code was fine */}
             
             <div className="flex gap-4">
                {/* Wrapped button in div just for layout safety */}
                <Button type="submit" disabled={isLoading} size="lg">
                    {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                    ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Script
                    </>
                    )}
                </Button>
             </div>
        </form>
      </Form>

      {/* Error Handling */}
      {(aiError || generationError) && (
        <Alert variant="destructive" className="mt-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{generationError || 'An error occurred.'}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Area */}
      {scenes.length > 0 && currentScene && (
        <div className="mt-8">
            <Card className="overflow-hidden min-h-[450px] shadow-md border-2">
                <CardContent className="p-0 flex flex-col md:flex-row h-full">
                    
                    {/* Visual Section */}
                    <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-border bg-muted/20 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline" className="bg-background text-sm font-medium">
                                Scene {currentSceneIndex + 1} / {totalScenes}
                            </Badge>
                            <div className="flex gap-2">
                                {/* Image Button */}
                                {!generatedImages[currentSceneIndex] && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs bg-background"
                                        // 4. FIX: Optional chaining for safety
                                        onClick={() => currentScene?.visual && generateImage(currentSceneIndex, currentScene.visual)}
                                        disabled={generatingImages[currentSceneIndex] || !currentScene?.visual}
                                    >
                                        {generatingImages[currentSceneIndex] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ImageIcon className="h-3 w-3 mr-1" />}
                                        Create Image
                                    </Button>
                                )}
                                {/* Video Button */}
                                {!generatedVideos[currentSceneIndex] && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs bg-background"
                                        // 5. FIX: Logic for video generation call
                                        onClick={() => currentScene?.visual && generateVideo(currentSceneIndex, currentScene.visual)}
                                        disabled={generatingVideos[currentSceneIndex] || generatingImages[currentSceneIndex] || !currentScene?.visual}
                                    >
                                        {(generatingVideos[currentSceneIndex] || generatingImages[currentSceneIndex]) ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <VideoIcon className="h-3 w-3 mr-1" />}
                                        Create Video
                                    </Button>
                                )}
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 italic min-h-[3rem]">
                            {currentScene?.visual || "Generating visual description..."}
                        </p>

                         {/* ... Video/Image Render Logic (Your original code was mostly fine here) ... */}
                         {/* Just make sure to use currentScene?.visual checks everywhere */}
                         <div className="flex-1 flex items-center justify-center min-h-[250px] bg-background/50 rounded-lg border border-dashed">
                             {/* ... Render logic ... */}
                             {generatedVideos[currentSceneIndex] ? (
                                <video src={generatedVideos[currentSceneIndex]} controls className="w-full h-auto rounded-md" />
                             ) : generatedImages[currentSceneIndex] ? (
                                <img src={generatedImages[currentSceneIndex]} alt="Scene" className="w-full h-auto rounded-md" />
                             ) : (
                                <div className="text-center p-4 text-muted-foreground"><ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50"/>Visual area</div>
                             )}
                         </div>
                    </div>

                    {/* Voiceover Section */}
                    <div className="flex-1 p-6 flex flex-col bg-card">
                        {/* ... */}
                        <div className="flex-1 p-4 bg-muted/10 rounded-md border mb-4">
                            <p className="text-lg font-medium leading-relaxed">
                                {currentScene?.voiceover || "Generating script..."}
                            </p>
                        </div>
                        {/* ... */}
                    </div>

                </CardContent>
            </Card>

            {/* Navigation Controls - kept your logic */}
            <div className="flex items-center justify-center gap-6 mt-6">
                <Button variant="outline" size="lg" onClick={prevScene} disabled={currentSceneIndex === 0}>
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
                <span className="text-sm font-medium text-muted-foreground">Scene {currentSceneIndex + 1} of {totalScenes}</span>
                <Button variant="outline" size="lg" onClick={nextScene} disabled={currentSceneIndex === totalScenes - 1}>
                     Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
      )}

      {/* Skeleton Loader - Checks both loading AND empty scenes */}
      {isLoading && scenes.length === 0 && (
           <div className="mt-8 space-y-6">
                <Skeleton className="h-[450px] w-full rounded-lg" />
           </div>
      )}
    </div>
  );
}
