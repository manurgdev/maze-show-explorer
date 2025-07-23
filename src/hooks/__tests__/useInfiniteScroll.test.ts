import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  mockIntersectionObserver.mockImplementation((callback) => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    callback,
  }));

  vi.stubGlobal('IntersectionObserver', mockIntersectionObserver);
  vi.clearAllMocks();
});

describe('useInfiniteScroll', () => {
  const mockCallback = vi.fn();
  const defaultProps = {
    callback: mockCallback,
    hasMore: true,
    loading: false,
  };

  beforeEach(() => {
    mockCallback.mockClear();
  });

  it('returns targetRef function', () => {
    const { result } = renderHook(() => useInfiniteScroll(
      defaultProps.callback,
      defaultProps.hasMore,
      defaultProps.loading
    ));

    expect(typeof result.current.targetRef).toBe('function');
  });

  it('does not create observer when no target is set', () => {
    renderHook(() => useInfiniteScroll(
      defaultProps.callback,
      defaultProps.hasMore,
      defaultProps.loading
    ));

    expect(mockIntersectionObserver).not.toHaveBeenCalled();
  });

  it('creates observer when target is set', async () => {
    const { result } = renderHook(() => useInfiniteScroll(
      defaultProps.callback,
      defaultProps.hasMore,
      defaultProps.loading
    ));

    const mockElement = document.createElement('div');
    
    await act(async () => {
      result.current.targetRef(mockElement);
    });

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 1.0,
        rootMargin: '0px',
      }
    );
    expect(mockObserve).toHaveBeenCalledWith(mockElement);
  });

  it('calls callback when element intersects', async () => {
    const { result } = renderHook(() => useInfiniteScroll(
      defaultProps.callback,
      defaultProps.hasMore,
      defaultProps.loading
    ));

    const mockElement = document.createElement('div');
    
    await act(async () => {
      result.current.targetRef(mockElement);
    });

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('does not call callback when element is not intersecting', async () => {
    const { result } = renderHook(() => useInfiniteScroll(
      defaultProps.callback,
      defaultProps.hasMore,
      defaultProps.loading
    ));

    const mockElement = document.createElement('div');
    
    await act(async () => {
      result.current.targetRef(mockElement);
    });

    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    
    act(() => {
      observerCallback([{ isIntersecting: false }]);
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('does not create observer when hasMore is false', async () => {
    const { result } = renderHook(() => useInfiniteScroll(
      defaultProps.callback,
      false,
      defaultProps.loading
    ));

    const mockElement = document.createElement('div');
    
    await act(async () => {
      result.current.targetRef(mockElement);
    });

    expect(mockIntersectionObserver).not.toHaveBeenCalled();
  });

  it('does not create observer when loading is true', async () => {
    const { result } = renderHook(() => useInfiniteScroll(
      defaultProps.callback,
      defaultProps.hasMore,
      true
    ));

    const mockElement = document.createElement('div');
    
    await act(async () => {
      result.current.targetRef(mockElement);
    });

    expect(mockIntersectionObserver).not.toHaveBeenCalled();
  });

  it('unobserves target on cleanup', async () => {
    const { result, unmount } = renderHook(() => useInfiniteScroll(
      defaultProps.callback,
      defaultProps.hasMore,
      defaultProps.loading
    ));

    const mockElement = document.createElement('div');
    
    await act(async () => {
      result.current.targetRef(mockElement);
    });

    act(() => {
      unmount();
    });

    expect(mockUnobserve).toHaveBeenCalledWith(mockElement);
  });

  it('recreates observer when dependencies change', async () => {
    const { result, rerender } = renderHook(
      (props) => useInfiniteScroll(props.callback, props.hasMore, props.loading),
      { initialProps: defaultProps }
    );

    const mockElement = document.createElement('div');
    
    await act(async () => {
      result.current.targetRef(mockElement);
    });

    expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);

    await act(async () => {
      rerender({ ...defaultProps, hasMore: false });
    });

    expect(mockUnobserve).toHaveBeenCalledWith(mockElement);
  });

  it('uses custom threshold and rootMargin options', async () => {
    const customOptions = {
      threshold: 0.5,
      rootMargin: '100px',
    };

    const { result } = renderHook(() => useInfiniteScroll(
      defaultProps.callback,
      defaultProps.hasMore,
      defaultProps.loading,
      customOptions
    ));

    const mockElement = document.createElement('div');
    
    await act(async () => {
      result.current.targetRef(mockElement);
    });

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.5,
        rootMargin: '100px',
      }
    );
  });

  it('handles targetRef being called with null', async () => {
    const { result } = renderHook(() => useInfiniteScroll(
      defaultProps.callback,
      defaultProps.hasMore,
      defaultProps.loading
    ));

    await act(async () => {
      result.current.targetRef(null);
    });

    expect(mockIntersectionObserver).not.toHaveBeenCalled();
  });

  it('updates target when targetRef is called multiple times', async () => {
    const { result } = renderHook(() => useInfiniteScroll(
      defaultProps.callback,
      defaultProps.hasMore,
      defaultProps.loading
    ));

    const firstElement = document.createElement('div');
    
    await act(async () => {
      result.current.targetRef(firstElement);
    });

    expect(mockObserve).toHaveBeenCalledWith(firstElement);

    const secondElement = document.createElement('div');
    
    await act(async () => {
      result.current.targetRef(secondElement);
    });

    expect(mockUnobserve).toHaveBeenCalledWith(firstElement);
    expect(mockObserve).toHaveBeenCalledWith(secondElement);
  });

  it('does not call callback when loading becomes true after intersection', async () => {
    const { result, rerender } = renderHook(
      (props) => useInfiniteScroll(props.callback, props.hasMore, props.loading),
      { initialProps: defaultProps }
    );

    const mockElement = document.createElement('div');
    
    await act(async () => {
      result.current.targetRef(mockElement);
    });

    expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);
    expect(mockObserve).toHaveBeenCalledWith(mockElement);

    await act(async () => {
      rerender({ ...defaultProps, loading: true });
    });

    expect(mockUnobserve).toHaveBeenCalledWith(mockElement);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('handles default options correctly', async () => {
    const { result } = renderHook(() => useInfiniteScroll(
      defaultProps.callback,
      defaultProps.hasMore,
      defaultProps.loading
    ));

    const mockElement = document.createElement('div');
    
    await act(async () => {
      result.current.targetRef(mockElement);
    });

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 1.0,
        rootMargin: '0px',
      }
    );
  });
}); 