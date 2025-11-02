'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import type { Decision, DecisionStatus } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from './status-badge';

export function StatusSelector({ decision }: { decision: Decision }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleStatusChange = (newStatus: DecisionStatus) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to change the status.',
      });
      return;
    }

    const decisionRef = doc(firestore, 'users', user.uid, 'decisions', decision.id);
    updateDocumentNonBlocking(decisionRef, { status: newStatus });

    toast({
      title: 'Status Updated',
      description: `Decision moved to "${newStatus}".`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <StatusBadge status={decision.status} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange('Pending')}>
          <StatusBadge status="Pending" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('Completed')}>
          <StatusBadge status="Completed" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('Failed')}>
          <StatusBadge status="Failed" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
