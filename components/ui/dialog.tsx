'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  children?: ReactNode;
}

export function Dialog({ open, onOpenChange, title, description, footer, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="ui-overlay" />
        <RadixDialog.Content className="ui-dialog">
          <RadixDialog.Title className="ui-dialog__title">{title}</RadixDialog.Title>
          {description ? (
            <RadixDialog.Description className="ui-dialog__desc">{description}</RadixDialog.Description>
          ) : null}
          {children}
          {footer ? <div className="ui-dialog__foot">{footer}</div> : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
