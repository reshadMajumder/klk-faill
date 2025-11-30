'use client';

import { useState, useEffect, useMemo } from 'react';

type TypewriterEffectProps = {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenTexts?: number;
};

export function TypewriterEffect({
  texts,
  typingSpeed = 150,
  deletingSpeed = 100,
  delayBetweenTexts = 2000,
}: TypewriterEffectProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const currentText = useMemo(() => texts[textIndex], [texts, textIndex]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText((prev) => prev.slice(0, -1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }
    } else {
      if (displayedText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayedText((prev) => currentText.slice(0, prev.length + 1));
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, delayBetweenTexts);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, textIndex, texts, currentText, typingSpeed, deletingSpeed, delayBetweenTexts]);

  return (
    <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white shadow-lg h-[100px] md:h-24">
      {displayedText}
      <span className="animate-pulse">|</span>
    </h1>
  );
}
