import { useEffect, useRef } from "react";

export function useInfiniteScroll(onIntersect: () => void, enabled: boolean) {
  const sentinel_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const sentinel = sentinel_ref.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect();
      },
      { rootMargin: "200px" }, // fire slightly before it's fully on-screen
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return sentinel_ref;
}