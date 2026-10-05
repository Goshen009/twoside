import { useEffect, useRef, useState } from "react";

export function useIsInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [is_in_view, setIsInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, is_in_view };
}