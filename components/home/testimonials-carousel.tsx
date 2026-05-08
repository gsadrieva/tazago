"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

type TestimonialsCarouselProps = {
  items: Testimonial[];
  title: string;
};

export function TestimonialsCarousel({ items, title }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = useEffectEvent(() => {
    setCurrentIndex((value) => (value + 1) % items.length);
  });

  useEffect(() => {
    if (items.length < 2) return;

    const timer = window.setInterval(() => {
      goNext();
    }, 4800);

    return () => window.clearInterval(timer);
  }, [items.length, goNext]);

  if (items.length === 0) return null;

  return (
    <section className="section-shell py-20">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-tight">
          {title}
        </h2>
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            aria-label="Previous testimonial"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/80 text-[var(--color-primary)] shadow-[var(--shadow-cloud)] transition hover:-translate-y-0.5"
            onClick={() => setCurrentIndex((value) => (value - 1 + items.length) % items.length)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_18px_34px_rgba(0,96,176,0.22)] transition hover:-translate-y-0.5"
            onClick={() => setCurrentIndex((value) => (value + 1) % items.length)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative mt-10 overflow-hidden rounded-[2rem]">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <article key={`${item.name}-${index}`} className="min-w-full">
              <div className="surface-card relative overflow-hidden p-8 md:p-10">
                <div className="absolute right-6 top-6 rounded-full bg-[var(--color-primary-container)]/20 p-3 text-[var(--color-primary)]">
                  <Quote className="h-6 w-6" />
                </div>

                <div className="absolute inset-x-0 top-0 h-1 bg-[var(--gradient-brand)]" />

                <p className="max-w-3xl text-xl leading-9 text-[var(--color-on-surface)] md:text-2xl">
                  "{item.quote}"
                </p>

                <div className="mt-8 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl font-extrabold">{item.name}</div>
                    <div className="mt-1 text-base text-[var(--color-on-surface-variant)]">{item.role}</div>
                  </div>
                  <div className="hidden rounded-full bg-[var(--color-primary-container)]/18 px-4 py-2 text-sm font-bold text-[var(--color-primary)] md:block">
                    {currentIndex + 1} / {items.length}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {items.map((item, index) => (
          <button
            key={`${item.name}-dot`}
            type="button"
            aria-label={`Go to testimonial ${index + 1}`}
            className={index === currentIndex ? "h-2.5 w-10 rounded-full bg-[var(--color-primary)]" : "h-2.5 w-2.5 rounded-full bg-[var(--color-outline-variant)]/80"}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}
