'use client';

import { Badge } from '@/components/ui/badge';
import type { DecisionStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import * as React from 'react';

type StatusInfo = {
  label: string;
  icon: React.ElementType;
  className: string;
};

const statusMap: Record<DecisionStatus, StatusInfo> = {
  Pending: {
    label: 'Pending',
    icon: AlertCircle,
    className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
  },
  Completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  },
  Failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  },
};

export function StatusBadge({ status }: { status?: DecisionStatus }) {
  const currentStatus = status || 'Pending';
  const { label, icon: Icon, className } = statusMap[currentStatus] || {
    label: 'Unknown',
    icon: HelpCircle,
    className: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200',
  };

  return (
    <Badge variant="secondary" className={cn('gap-1.5', className)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </Badge>
  );
}
