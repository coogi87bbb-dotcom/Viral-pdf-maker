import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Live `prefers-reduced-motion` flag. Unlike a one-off `matchMedia(...).matches`
 * check, this subscribes to the media query's `change` event so a mid-session
 * OS-level toggle is honored without a reload — used to gate the scroll-pinned
 * frame animation and headline parallax in the landing hero.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const handleChange = () => setReduced(mql.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return reduced;
}

export default useReducedMotion;
