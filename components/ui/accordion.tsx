'use client';

import * as RadixAccordion from '@radix-ui/react-accordion';
import { Minus, Plus } from 'lucide-react';

export interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  return (
    <RadixAccordion.Root type="single" collapsible>
      {items.map((item) => (
        <RadixAccordion.Item key={item.id} value={item.id} className="ui-acc__item">
          <RadixAccordion.Header>
            <RadixAccordion.Trigger className="ui-acc__trigger">
              {item.question}
              <span className="ui-acc__mark" aria-hidden="true">
                <Plus size={16} className="ui-acc__plus" />
                <Minus size={16} className="ui-acc__minus" />
              </span>
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="ui-acc__panel">{item.answer}</RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
