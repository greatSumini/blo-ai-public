"use client";

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Heading } from '../lib/markdown-utils';

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const t = useTranslations('articles');
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -80% 0px',
        threshold: 1.0,
      }
    );

    const elements: Element[] = [];
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
        elements.push(element);
      }
    });

    return () => {
      elements.forEach((element) => {
        observer.unobserve(element);
      });
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <List className="h-4 w-4" />
        <h3 className="font-semibold">{t('tableOfContents.title')}</h3>
      </div>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <Button
            key={heading.id}
            variant="ghost"
            className={cn(
              'w-full justify-start text-left text-sm',
              heading.level === 1 && 'pl-2',
              heading.level === 2 && 'pl-4',
              heading.level === 3 && 'pl-6',
              heading.level === 4 && 'pl-8',
              heading.level === 5 && 'pl-10',
              heading.level === 6 && 'pl-12',
              activeId === heading.id && 'bg-accent font-medium'
            )}
            onClick={() => handleClick(heading.id)}
          >
            {heading.text}
          </Button>
        ))}
      </nav>
    </Card>
  );
}
