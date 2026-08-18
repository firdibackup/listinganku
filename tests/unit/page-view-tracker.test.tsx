import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const recordEventActionMock = vi.fn();
vi.mock('@/app/(public)/[slug]/actions', () => ({
  recordEventAction: (...args: unknown[]) => recordEventActionMock(...args),
}));

import { PageViewTracker } from '@/components/landing/PageViewTracker';

describe('PageViewTracker', () => {
  beforeEach(() => {
    recordEventActionMock.mockClear();
    sessionStorage.clear();
  });

  it('mencatat event visitor sekali saat mount pertama', () => {
    render(<PageViewTracker projectId="prj_parkspring" />);
    expect(recordEventActionMock).toHaveBeenCalledTimes(1);
    expect(recordEventActionMock).toHaveBeenCalledWith('prj_parkspring', 'visitor');
  });

  it('tidak mencatat lagi saat komponen yang sama mount ulang dalam sesi yang sama', () => {
    render(<PageViewTracker projectId="prj_parkspring" />);
    render(<PageViewTracker projectId="prj_parkspring" />);
    expect(recordEventActionMock).toHaveBeenCalledTimes(1);
  });

  it('mencatat lagi untuk project berbeda dalam sesi yang sama (kunci per project)', () => {
    render(<PageViewTracker projectId="prj_a" />);
    render(<PageViewTracker projectId="prj_b" />);
    expect(recordEventActionMock).toHaveBeenCalledTimes(2);
    expect(recordEventActionMock).toHaveBeenNthCalledWith(1, 'prj_a', 'visitor');
    expect(recordEventActionMock).toHaveBeenNthCalledWith(2, 'prj_b', 'visitor');
  });

  it('tidak merender apa pun ke DOM', () => {
    const { container } = render(<PageViewTracker projectId="prj_parkspring" />);
    expect(container).toBeEmptyDOMElement();
  });
});
