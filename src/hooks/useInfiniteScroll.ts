import { useCallback,useEffect, useState } from 'react';

type UseInfiniteScrollOptions = {
  threshold?: number;
  rootMargin?: string;
}

export const useInfiniteScroll = (
  callback: () => void,
  hasMore: boolean,
  loading: boolean,
  options: UseInfiniteScrollOptions = {}
) => {
  const { threshold = 1.0, rootMargin = '0px' } = options;
  const [target, setTarget] = useState<HTMLElement | null>(null);

  const targetRef = useCallback((node: HTMLElement | null) => {
    if (node) setTarget(node);
  }, []);

  useEffect(() => {
    if (!target || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          callback();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [target, callback, hasMore, loading, threshold, rootMargin]);

  return { targetRef };
}; 