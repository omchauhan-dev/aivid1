'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Sparkles, Terminal } from 'lucide-react';

import { getCaptionsAndHashtagsAction } from './actions';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { OutputList } from '@/components/output-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  themeOrMessage: z.string().min(10, 'Please provide more details on the theme or message.'),
});

type AiOutput = {
  captions: string[];
  hashtags: string[];
} | null;

export default function CaptionsHashtagsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<AiOutput>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      themeOrMessage: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setOutput(null);

    const result = await getCaptionsAndHashtagsAction(values);

    if (result.error) {
      setError(result.error);
    } else {
      setOutput(result.data);
    }
    
    setIsLoading(false);
  }

  return (
    <div>
      <PageHeader
        title="Caption and Hashtag AI"
        description="Generate emotion-based captions and trending hashtags for your content."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="themeOrMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme or Message</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the theme, message, or content of your reel..." {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(isLoading || output) && (
        <Card className="mt-6">
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Captions</h3>
              <OutputList items={output?.captions || []} isLoading={isLoading} count={3} />
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4">Hashtags</h3>
              <OutputList items={output?.hashtags || []} isLoading={isLoading} count={5} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
