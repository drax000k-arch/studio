'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Send, Sparkles, Trash2, Wand2, Share2 } from 'lucide-react';
import { getAiDecision, type ActionState } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const decisionFormSchema = z.object({
  subject: z.string().min(3, { message: 'Subject must be at least 3 characters long.' }),
  options: z.array(z.object({ value: z.string().min(1, { message: 'Option cannot be empty.' }) }))
    .min(2, { message: 'Please provide at least two options.' }),
});

type DecisionFormValues = z.infer<typeof decisionFormSchema>;

export default function DecisionMaker() {
  const [state, setState] = useState<ActionState>({ status: 'idle' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<DecisionFormValues>({
    resolver: zodResolver(decisionFormSchema),
    defaultValues: {
      subject: '',
      options: [{ value: '' }, { value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });
  
  const onSubmit = async (data: DecisionFormValues) => {
    setIsLoading(true);
    setState({ status: 'idle' });
    const result = await getAiDecision(data);
    setState(result);
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (state.status === 'error') {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>What's on your mind?</CardTitle>
                <CardDescription>
                  Tell us about your decision, and we'll help you choose the best path.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Which phone should I buy?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Options</FormLabel>
                  <div className="grid gap-3 mt-2">
                    {fields.map((field, index) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`options.${index}`}
                        render={() => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                placeholder={`Option ${index + 1}`}
                                {...form.register(`options.${index}.value` as const)}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              disabled={fields.length <= 2}
                              className="shrink-0"
                            >
                              <Trash2 className="size-4" />
                              <span className="sr-only">Remove option</span>
                            </Button>
                          </FormItem>
                        )}
                      />
                    ))}
                     {form.formState.errors.options && <FormMessage>{form.formState.errors.options.message}</FormMessage>}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => append({ value: '' })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Get Advice
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>

      <div className="lg:col-span-3">
        <Card className="min-h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-accent" />
              AI Recommendation
            </CardTitle>
            <CardDescription>
              Here's our analysis based on the information you provided.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground p-8">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-medium">The AI is thinking...</p>
                <p className="text-sm">This may take a moment. We're analyzing your options.</p>
              </div>
            )}
            {!isLoading && state.status === 'success' && state.result && (
               <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Recommended Option</p>
                  <p className="text-2xl font-bold text-primary">{state.result.recommendation}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Justification</p>
                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{state.result.justification}</p>
                </div>
              </div>
            )}
            {!isLoading && state.status !== 'success' && (
              <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground p-8">
                <BrainCircuit className="h-12 w-12" />
                <p className="font-medium">Your recommendation will appear here.</p>
                <p className="text-sm">Fill out the form to get started.</p>
              </div>
            )}
          </CardContent>
          {state.status === 'success' && (
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Share2 className="mr-2 size-4" />
                Post to Community
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
