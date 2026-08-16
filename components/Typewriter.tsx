"use client";
import { useEffect, useState } from 'react';

type Props = {
  phrases: string[];
  typingSpeed?: number; // ms per char
  deletingSpeed?: number; // ms per char
  pause?: number; // ms pause after typing
};

export default function Typewriter({ phrases, typingSpeed = 80, deletingSpeed = 40, pause = 1400 }: Props) {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeout: number;

    const current = phrases[index % phrases.length];

    if (!deleting) {
      // type
      if (display.length < current.length) {
        timeout = window.setTimeout(() => {
          if (mounted) setDisplay(current.slice(0, display.length + 1));
        }, typingSpeed);
      } else {
        // pause then delete
        timeout = window.setTimeout(() => {
          if (mounted) setDeleting(true);
        }, pause);
      }
    } else {
      // deleting
      if (display.length > 0) {
        timeout = window.setTimeout(() => {
          if (mounted) setDisplay(current.slice(0, display.length - 1));
        }, deletingSpeed);
      } else {
        // move to next
        timeout = window.setTimeout(() => {
          if (mounted) {
            setDeleting(false);
            setIndex((i) => (i + 1) % phrases.length);
          }
        }, 200);
      }
    }

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
    };
  }, [display, deleting, index, phrases, typingSpeed, deletingSpeed, pause]);

  return (
    <span className="typewriter-inline">
      {display}
      <span className="typewriter-caret" aria-hidden>▌</span>
    </span>
  );
}
