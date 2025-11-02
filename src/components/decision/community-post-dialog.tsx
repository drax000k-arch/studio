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
import type { Decision } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type CommunityPostDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: Pick<Decision, 'subject' | 'options' | 'recommendation' | 'justification'>;
};

export function CommunityPostDialog({
  open,
  onOpenChange,
  decision,
}: CommunityPostDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handlePost = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to post to the community.',
      });
      return;
    }

    const postsCollection = collection(firestore, 'community-posts');
    const initialVotes = decision.options.reduce((acc, option) => {
      acc[option] = 0;
      return acc;
    }, {} as { [option: string]: number });

    const postData = {
      author: {
        name: user.displayName,
        avatarUrl: user.photoURL,
        uid: user.uid,
      },
      subject: decision.subject,
      options: decision.options,
      aiRecommendation: decision.recommendation,
      aiJustification: decision.justification,
      createdAt: new Date().toISOString(),
      commentCount: 0,
      votes: initialVotes,
      voters: {},
    };
    
    try {
      await addDoc(postsCollection, postData);
      toast({
        title: 'Success!',
        description: 'Your decision has been posted to the community.',
      });
      onOpenChange(false);
      router.push('/community');
    } catch (error) {
       console.error("Error posting to community:", error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not post to the community. Please try again.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Post to Community</DialogTitle>
          <DialogDescription>
            Share your decision and the AI's recommendation with the community.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{decision.subject}</h3>
            <div>
              <h4 className="text-sm font-semibold mb-2">Options</h4>
              <ul className="space-y-1.5 list-disc list-inside text-sm text-muted-foreground">
                {decision.options.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-semibold mb-2">AI Recommendation</h4>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {decision.recommendation}
            </Badge>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {decision.justification}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handlePost} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
