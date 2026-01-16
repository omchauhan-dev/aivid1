'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Sparkles, Terminal, Image as ImageIcon, Video as VideoIcon, Mic, Play, Pause } from 'lucide-react';
import { experimental_useObject as useObject } from '@ai-sdk/react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const formSchema = z.object({
  subjectMatter: z.string().min(10, 'Please provide more details on the subject.'),
  reelLength: z.enum(['15s', '30s', '60s']),
  language: z.enum(['Hinglish', 'Hindi', 'English']),
});

const OutputSchema = z.object({
  scenes: z.array(z.object({
    visual: z.string(),
    voiceover: z.string(),
  })),
});

export default function ReelScriptPage() {
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Image states
  const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});

  // Video states
  const [generatingVideos, setGeneratingVideos] = useState<Record<number, boolean>>({});
  const [generatedVideos, setGeneratedVideos] = useState<Record<number, string>>({});

  // Voiceover states
  const [generatingVoiceovers, setGeneratingVoiceovers] = useState<Record<number, boolean>>({});
  const [generatedVoiceovers, setGeneratedVoiceovers] = useState<Record<number, string>>({});

  const { object, submit, isLoading, error: aiError } = useObject({
    api: '/api/generate-reel-scripts',
    schema: OutputSchema,
    onError: (error) => {
      setGenerationError(error.message || 'An error occurred during generation.');
    },
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
    setGeneratedImages({});
    setGeneratedVideos({});
    setGeneratedVoiceovers({});
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
      } else {
        console.error('Failed to generate image');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingImages(prev => ({ ...prev, [index]: false }));
    }
  }

  async function generateVideo(index: number, visualDescription: string) {
    if (generatingVideos[index]) return;

    setGeneratingVideos(prev => ({ ...prev, [index]: true }));
    try {
      const res = await fetch('/api/generate-scene-video', {
        method: 'POST',
        body: JSON.stringify({ prompt: visualDescription }),
      });
      const data = await res.json();
      if (data.url) {
        setGeneratedVideos(prev => ({ ...prev, [index]: data.url }));
      } else {
        console.error('Failed to generate video');
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
      const url = URL.createObjectURL(blob);
      setGeneratedVoiceovers(prev => ({ ...prev, [index]: url }));
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingVoiceovers(prev => ({ ...prev, [index]: false }));
    }
  }

  const scenes = object?.scenes || [];

  return (
    <div>
      <PageHeader
        title="Reel Script Generator"
        description="Create a complete script with storytelling structure for your next reel."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="subjectMatter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject Matter</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the topic or idea for your reel..." {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="reelLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reel Length</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reel length" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15s">15 seconds</SelectItem>
                      <SelectItem value="30s">30 seconds</SelectItem>
                      <SelectItem value="60s">60 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hinglish">Hinglish</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
        </form>
      </Form>

      {(aiError || generationError) && (
        <Alert variant="destructive" className="mt-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{generationError || 'An error occurred while generating script.'}</AlertDescription>
        </Alert>
      )}

      {scenes.length > 0 && (
        <div className="mt-8 px-12">
            <Carousel className="w-full">
                <CarouselContent>
                    {scenes.map((scene, index) => (
                        <CarouselItem key={index} className="md:basis-1/1 lg:basis-1/1">
                             <div className="p-1">
                                <Card className="overflow-hidden">
                                    <CardContent className="p-0 flex flex-col md:flex-row min-h-[400px]">
                                        {/* Visual Section */}
                                        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-border bg-muted/20">
                                            <div className="flex flex-col gap-2 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="bg-background">Visual Scene {index + 1}</Badge>
                                                    <div className="flex gap-2">
                                                    {!generatedImages[index] && !generatedVideos[index] && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-xs"
                                                            onClick={() => scene.visual && generateImage(index, scene.visual)}
                                                            disabled={generatingImages[index] || !scene.visual}
                                                        >
                                                            {generatingImages[index] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ImageIcon className="h-3 w-3 mr-1" />}
                                                            Image
                                                        </Button>
                                                    )}
                                                    {!generatedVideos[index] && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-xs"
                                                            onClick={() => scene.visual && generateVideo(index, scene.visual)}
                                                            disabled={generatingVideos[index] || !scene.visual}
                                                        >
                                                            {generatingVideos[index] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <VideoIcon className="h-3 w-3 mr-1" />}
                                                            Video
                                                        </Button>
                                                    )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{scene.visual}</p>
                                            </div>

                                            <div className="flex-1 flex items-center justify-center min-h-[200px]">
                                                {generatedVideos[index] ? (
                                                    <video
                                                        src={generatedVideos[index]}
                                                        controls
                                                        className="w-full h-auto rounded-md border shadow-sm max-h-[300px]"
                                                    />
                                                ) : generatingVideos[index] ? (
                                                    <div className="w-full h-48 rounded-md bg-muted flex items-center justify-center flex-col gap-2">
                                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">Generating Video...</span>
                                                    </div>
                                                ) : generatedImages[index] ? (
                                                    <img
                                                        src={generatedImages[index]}
                                                        alt={`Scene ${index + 1}`}
                                                        className="w-full h-auto rounded-md border shadow-sm max-h-[300px] object-cover"
                                                    />
                                                ) : generatingImages[index] ? (
                                                    <Skeleton className="w-full h-48 rounded-md" />
                                                ) : (
                                                    <div className="w-full h-48 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground text-sm">
                                                        Generate visuals for this scene
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Voiceover Section */}
                                        <div className="flex-1 p-6 flex flex-col">
                                            <div className="flex items-center justify-between mb-4">
                                                <Badge variant="secondary">Voiceover</Badge>
                                                {!generatedVoiceovers[index] && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() => scene.voiceover && generateVoiceover(index, scene.voiceover)}
                                                        disabled={generatingVoiceovers[index] || !scene.voiceover}
                                                    >
                                                        {generatingVoiceovers[index] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Mic className="h-3 w-3 mr-1" />}
                                                        Generate Voiceover
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-base font-medium leading-relaxed flex-1">{scene.voiceover}</p>

                                            {generatedVoiceovers[index] && (
                                                <div className="mt-4 p-3 bg-muted rounded-md flex items-center gap-3">
                                                    <audio controls src={generatedVoiceovers[index]} className="w-full h-8" />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                             </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
      )}

      {isLoading && scenes.length === 0 && (
           <div className="mt-8 space-y-6">
                <Skeleton className="h-64 w-full rounded-lg" />
           </div>
      )}
    </div>
  );
}
