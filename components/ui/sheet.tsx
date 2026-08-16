'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function Sheet({ open, onOpenChange, title, description, footer, children }: SheetProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="ui-overlay" />
        <RadixDialog.Content className="ui-sheet">
          <div className="ui-sheet__head">
            <RadixDialog.Title className="ui-sheet__title">{title}</RadixDialog.Title>
            {description ? (
              <RadixDialog.Description className="ui-sheet__desc">{description}</RadixDialog.Description>
            ) : null}
          </div>
          <div className="ui-sheet__body">{children}</div>
          {footer ? <div className="ui-sheet__foot">{footer}</div> : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
