'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';

const decisionSchema = z.object({
  subject: z.string().min(3, 'Question must be at least 3 characters.'),
  recommendation: z.string().min(3, 'AI Advice must be at least 3 characters.'),
  status: z.enum(['Pending', 'Completed', 'Failed']),
});

type DecisionFormData = z.infer<typeof decisionSchema>;

type AddDecisionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddDecisionDialog({ open, onOpenChange }: AddDecisionDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<DecisionFormData>({
    resolver: zodResolver(decisionSchema),
    defaultValues: {
      subject: '',
      recommendation: '',
      status: 'Pending',
    },
  });

  const handleSave = async (data: DecisionFormData) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add a decision.',
      });
      return;
    }

    const decisionsCollection = collection(firestore, 'users', user.uid, 'decisions');
    const newDecision = {
      ...data,
      justification: 'Manually added.',
      options: [],
      createdAt: new Date().toISOString(),
      status: data.status,
    };
    
    try {
      await addDoc(decisionsCollection, newDecision);
      toast({
        title: 'Decision Saved',
        description: 'Your new decision has been added to your tracker.',
      });
      form.reset();
      onOpenChange(false);
    } catch(e) {
       toast({
        variant: 'destructive',
        title: 'Error Saving Decision',
        description: 'Could not save your decision. Please try again.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Decision</DialogTitle>
          <DialogDescription>Manually add a past decision to your tracker.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="subject" className="text-right">
                    Question
                  </Label>
                  <Input id="subject" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recommendation"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="recommendation" className="text-right">
                    AI Advice
                  </Label>
                  <Textarea id="recommendation" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <Label>Status</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Decision</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
