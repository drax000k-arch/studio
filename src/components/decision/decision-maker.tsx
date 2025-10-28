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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Sparkles, Trash2, Wand2, Share2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getAiDecision, type ActionState } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '../ui/textarea';
import { CommunityPostDialog } from './community-post-dialog';
import { useUser } from '@/firebase';
import { motion } from 'framer-motion';

const decisionFormSchema = z.object({
  subject: z.string().min(3, { message: 'Subject must be at least 3 characters long.' }),
  options: z.array(z.string().min(1, { message: 'Option cannot be empty.' }))
    .min(2, { message: 'Please provide at least two options.' }),
  userContext: z.string().optional(),
  responseLength: z.enum(['short', 'long']),
});

type DecisionFormValues = z.infer<typeof decisionFormSchema>;

export default function DecisionMaker() {
  const [state, setState] = useState<ActionState>({ status: 'idle' });
  const [isLoading, setIsLoading] = useState(false);
  const [isCommunityDialogOpen, setIsCommunityDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<DecisionFormValues>({
    resolver: zodResolver(decisionFormSchema),
    defaultValues: {
      subject: '',
      options: ['', ''],
      userContext: '',
      responseLength: 'long',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });
  
  const onSubmit = async (data: DecisionFormValues) => {
    setIsLoading(true);
    setState({ status: 'idle' });
    const result = await getAiDecision({ ...data, userId: user?.uid });
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

  const decisionData = form.getValues();

  return (
    <>
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
        <div className="text-md font-semibold">Ask for Advice</div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Describe your situation..." {...field} className="bg-slate-50"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-2">
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`options.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          placeholder={`Option ${index + 1}`}
                          {...field}
                          className="bg-slate-50"
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
                        <Trash2 className="size-4 text-slate-500" />
                        <span className="sr-only">Remove option</span>
                      </Button>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            {form.formState.errors.options && <FormMessage>{form.formState.errors.options.message}</FormMessage>}
            
            <div className="flex items-center gap-3">
               <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-white"
                onClick={() => append('')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
              <Button type="submit" className="ml-auto bg-gradient-to-r from-[#4A6CF7] to-[#6F5CFF] text-white px-4 py-2 rounded-xl shadow h-auto" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting advice...
                  </>
                ) : (
                  'Get Advice'
                )}
              </Button>
            </div>
          </form>
        </Form>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 text-center text-slate-500 p-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-medium">The AI is thinking...</p>
            <p className="text-sm">This may take a moment. We're analyzing your options.</p>
          </div>
        )}

        {state.status === 'success' && state.result && (
          <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="bg-slate-50 rounded-xl p-4 ">
            <div className="flex items-center justify-between">
              <div className="font-semibold">AI Advice</div>
              <div className="text-xs text-slate-500">Confidence: 82%</div>
            </div>
            <div className="mt-3 text-sm text-slate-600">{state.result.justification}</div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="bg-white shadow-sm flex items-center gap-2"><ThumbsUp size={14}/> Helpful</Button>
              <Button variant="outline" size="sm" className="bg-white shadow-sm flex items-center gap-2"><ThumbsDown size={14}/> Not helpful</Button>
              {user && (
                 <Button variant="ghost" size="sm" className="ml-auto text-sm text-slate-500" onClick={() => setIsCommunityDialogOpen(true)}>
                    <Share2 className="mr-2 size-4" />
                    Share
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {state.status === 'success' && state.result && (
        <CommunityPostDialog
          open={isCommunityDialogOpen}
          onOpenChange={setIsCommunityDialogOpen}
          decision={{
            subject: decisionData.subject,
            options: decisionData.options,
          }}
          decisionResult={state.result}
        />
      )}
    </>
  );
}
