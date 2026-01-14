'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Sparkles, Terminal, Image as ImageIcon } from 'lucide-react';
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
  const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});

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

      <div className="mt-8 space-y-6">
        {scenes.map((scene, index) => (
            <Card key={index} className="overflow-hidden">
                <CardContent className="p-0 flex flex-col md:flex-row">
                    {/* Visual Section */}
                    <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-border bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="bg-background">Visual Scene {index + 1}</Badge>
                            {!generatedImages[index] && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => scene.visual && generateImage(index, scene.visual)}
                                    disabled={generatingImages[index] || !scene.visual}
                                >
                                    {generatingImages[index] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ImageIcon className="h-3 w-3 mr-1" />}
                                    Generate Image
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{scene.visual}</p>

                        {generatedImages[index] ? (
                            <img
                                src={generatedImages[index]}
                                alt={`Scene ${index + 1}`}
                                className="w-full h-auto rounded-md border shadow-sm"
                            />
                        ) : generatingImages[index] ? (
                            <Skeleton className="w-full h-48 rounded-md" />
                        ) : null}
                    </div>

                    {/* Voiceover Section */}
                    <div className="flex-1 p-6">
                        <Badge variant="secondary" className="mb-2">Voiceover</Badge>
                        <p className="text-base font-medium leading-relaxed">{scene.voiceover}</p>
                    </div>
                </CardContent>
            </Card>
        ))}
        {isLoading && (
            <Skeleton className="h-48 w-full rounded-lg" />
        )}
      </div>
    </div>
  );
}
