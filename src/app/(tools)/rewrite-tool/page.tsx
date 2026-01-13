'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Sparkles, Terminal } from 'lucide-react';

import { getRewrittenContentAction } from './actions';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { OutputText } from '@/components/output-text';

const styles = [
  { value: 'aggressive', label: 'Aggressive' },
  { value: 'calm', label: 'Calm' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'authoritative', label: 'Authoritative' },
] as const;


const formSchema = z.object({
  content: z.string().min(10, 'Please enter some content to rewrite.'),
  style: z.enum(styles.map(s => s.value) as [string, ...string[]]),
});

export default function RewriteToolPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [rewrittenContent, setRewrittenContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      style: 'storytelling',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setRewrittenContent('');

    const result = await getRewrittenContentAction(values);

    if (result.error) {
      setError(result.error);
    } else {
      setRewrittenContent(result.data || '');
    }
    
    setIsLoading(false);
  }

  return (
    <div>
      <PageHeader
        title="Multi-Style Rewrite Tool"
        description="Rewrite your content in various tones to match your desired impact."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Original Content</FormLabel>
                <FormControl>
                  <Textarea placeholder="Paste your script, caption, or any text here..." {...field} rows={6} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="style"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>Rewrite Style</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {styles.map(style => (
                      <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rewriting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Rewrite Content
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

      <OutputText text={rewrittenContent} isLoading={isLoading} />
    </div>
  );
}
