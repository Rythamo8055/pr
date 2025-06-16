import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Github, Film } from 'lucide-react';

const formSchema = z.object({
  prUrl: z.string().url({ message: 'Please enter a valid GitHub PR URL.' }),
});

type UrlFormValues = z.infer<typeof formSchema>;

interface UrlFormProps {
  onSubmit: (data: UrlFormValues) => void;
  isLoading: boolean;
}

export const UrlForm: React.FC<UrlFormProps> = ({ onSubmit, isLoading }) => {
  const form = useForm<UrlFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prUrl: '',
    },
  });

  const handleSubmit: SubmitHandler<UrlFormValues> = (data) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-lg glassmorphism">
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Film className="h-8 w-8 text-primary" />
          <CardTitle className="font-headline text-3xl">PR Visualizer</CardTitle>
        </div>
        <CardDescription>
          Paste a GitHub Pull Request URL to generate a video summary.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="prUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">GitHub PR URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="https://github.com/owner/repo/pull/123" {...field} 
                        className="pl-10 text-base"
                        aria-label="GitHub Pull Request URL"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Visualize PR'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
