'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Share2, ThumbsDown, ThumbsUp, Trash2, AlertCircle, Sparkles } from 'lucide-react';
import { getAiDecision, type ActionState } from '@/lib/actions';
import { Textarea } from '../ui/textarea';
import { CommunityPostDialog } from './community-post-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useUser } from '@/firebase';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '../ui/badge';

const decisionFormSchema = z.object({
  subject: z.string().min(3, { message: 'Please describe your situation.' }),
  options: z.array(z.string().min(1, { message: 'Option cannot be empty.' })).optional(),
  userContext: z.string().optional(),
  responseLength: z.enum(['short', 'long']).default('long'),
});

type DecisionFormValues = z.infer<typeof decisionFormSchema>;

export default function DecisionMaker() {
  const [actionState, setActionState] = useState<ActionState>({ status: 'idle' });
  const [isCommunityDialogOpen, setIsCommunityDialogOpen] = useState(false);
  const { user } = useUser();

  const form = useForm<DecisionFormValues>({
    resolver: zodResolver(decisionFormSchema),
    defaultValues: {
      subject: '',
      options: [], // Start with no options
      userContext: '',
      responseLength: 'long',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const onSubmit = async (data: DecisionFormValues) => {
    setActionState({ status: 'idle' }); // Clear previous results
    const result = await getAiDecision({ ...data, userId: user?.uid });
    setActionState(result);
  };
  
  const isLoading = form.formState.isSubmitting;
  const decisionData = form.getValues();
  const resultData = actionState.status === 'success' ? actionState.result : null;

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
                    <Textarea placeholder="What's on your mind? e.g., 'Should I move to a new city for a job?'" {...field} className="bg-slate-50"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`options.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            {...field}
                            className="bg-slate-50"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="shrink-0 text-slate-500 hover:bg-slate-100"
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Remove option</span>
                          </Button>
                        </div>
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

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
            <p className="text-xs text-slate-400 -mt-2 pl-1">
              (Optional) Provide specific options, or let the AI generate them for you.
            </p>

            <FormField
              control={form.control}
              name="responseLength"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Response Length</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="short" />
                        </FormControl>
                        <FormLabel className="font-normal">Short</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="long" />
                        </FormControl>
                        <FormLabel className="font-normal">Long</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="submit" className="bg-gradient-to-r from-[#4A6CF7] to-[#6F5CFF] text-white px-6 py-2 rounded-xl shadow h-auto" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting advice...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Advice
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{opacity:0, height: 0}}
              animate={{opacity:1, height: 'auto'}}
              exit={{opacity:0, height: 0}}
              className="flex flex-col items-center justify-center gap-4 text-center text-slate-500 p-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-medium">The AI is analyzing your situation...</p>
              <p className="text-sm">This may take a moment.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {actionState.status === 'error' && actionState.message && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>An Error Occurred</AlertTitle>
                <AlertDescription>{actionState.message}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {actionState.status === 'success' && resultData && (
            <motion.div 
              initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} 
              className="bg-slate-50 rounded-xl p-4 mt-4"
            >
              <div className="font-semibold text-slate-800">AI Recommendation</div>
               {decisionData.options?.length === 0 && (
                <div className="mt-3">
                  <p className="text-sm text-slate-500 mb-2">The AI considered these options:</p>
                   <div className="flex flex-wrap gap-2">
                    {resultData.options.map(option => (
                      <Badge key={option} variant="secondary">{option}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-3 text-primary font-bold text-lg">{resultData.recommendation}</div>
              <div className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{resultData.justification}</div>
              <div className="mt-4 flex gap-2 items-center">
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
        </AnimatePresence>
      </div>

      {actionState.status === 'success' && resultData && (
        <CommunityPostDialog
          open={isCommunityDialogOpen}
          onOpenChange={setIsCommunityDialogOpen}
          decision={{
            subject: decisionData.subject,
            options: resultData.options, // Use the options from the result
          }}
          decisionResult={resultData}
        />
      )}
    </>
  );
}
