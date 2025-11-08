'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';
import type { Heading } from '../lib/markdown-utils';

interface TableOfContentsProps {
  headings: Heading[];
  currentHeadingId?: string;
}

export function TableOfContents({
  headings,
  currentHeadingId,
}: TableOfContentsProps) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <List className="h-4 w-4" />
        <h3 className="font-semibold">목차</h3>
      </div>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <Button
            key={heading.id}
            variant="ghost"
            className={`w-full justify-start text-left ${
              heading.level > 1 ? `pl-${(heading.level - 1) * 4}` : ''
            } ${currentHeadingId === heading.id ? 'bg-accent' : ''}`}
            onClick={() => {
              const element = document.getElementById(heading.id);
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {heading.text}
          </Button>
        ))}
      </nav>
    </Card>
  );
}
