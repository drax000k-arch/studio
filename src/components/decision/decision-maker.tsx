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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Share2, ThumbsDown, ThumbsUp, Trash2, AlertCircle } from 'lucide-react';
import { getAiDecision, type ActionState } from '@/lib/actions';
import { Textarea } from '../ui/textarea';
import { CommunityPostDialog } from './community-post-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useUser } from '@/firebase';

const decisionFormSchema = z.object({
  subject: z.string().min(3, { message: 'Please describe your situation.' }),
  options: z.array(z.string().min(1, { message: 'Option cannot be empty.' }))
    .min(2, { message: 'Please provide at least two options.' }),
  userContext: z.string().optional(),
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
      options: ['', ''],
      userContext: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });
  
  const onSubmit = async (data: DecisionFormValues) => {
    setActionState({ status: 'idle' }); // Clear previous results
    const result = await getAiDecision({ ...data, userId: user?.uid, responseLength: 'long' });
    setActionState(result);
  };
  
  const isLoading = form.formState.isSubmitting;
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
                    <Textarea placeholder="What's on your mind? e.g., 'Which job offer should I take?'" {...field} className="bg-slate-50"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                            disabled={fields.length <= 2}
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
             {form.formState.errors.options && <p className="text-sm font-medium text-destructive">{form.formState.errors.options.message}</p>}

            <div className="flex items-center justify-between gap-3">
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
              <Button type="submit" className="bg-gradient-to-r from-[#4A6CF7] to-[#6F5CFF] text-white px-6 py-2 rounded-xl shadow h-auto" disabled={isLoading}>
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
          {actionState.status === 'success' && actionState.result && (
            <motion.div 
              initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} 
              className="bg-slate-50 rounded-xl p-4 mt-4"
            >
              <div className="font-semibold text-slate-800">AI Recommendation</div>
              <div className="mt-2 text-primary font-bold text-lg">{actionState.result.recommendation}</div>
              <div className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{actionState.result.justification}</div>
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

      {actionState.status === 'success' && actionState.result && (
        <CommunityPostDialog
          open={isCommunityDialogOpen}
          onOpenChange={setIsCommunityDialogOpen}
          decision={{
            subject: decisionData.subject,
            options: decisionData.options,
          }}
          decisionResult={actionState.result}
        />
      )}
    </>
  );
}
