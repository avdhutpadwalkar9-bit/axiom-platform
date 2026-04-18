"use client";

import { useEffect, useState, useRef, ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  FadeIn — scroll-triggered entrance animation                       */
/* ------------------------------------------------------------------ */
export function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 600,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const transforms: Record<string, string> = {
    up: "translateY(24px)",
    down: "translateY(-24px)",
    left: "translateX(24px)",
    right: "translateX(-24px)",
    none: "translateY(0)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0,0)" : transforms[direction],
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StaggerChildren — animates children one after another              */
/* ------------------------------------------------------------------ */
export function StaggerChildren({
  children,
  className = "",
  staggerDelay = 80,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <FadeIn key={i} delay={i * staggerDelay} direction={direction} duration={500}>
              {child}
            </FadeIn>
          ))
        : children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CountUp — animated number counter                                  */
/* ------------------------------------------------------------------ */
export function CountUp({
  end,
  prefix = "",
  suffix = "",
  duration = 1500,
  className = "",
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString("en-US")}{suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  ScaleOnHover — subtle scale + shadow on hover                      */
/* ------------------------------------------------------------------ */
export function ScaleOnHover({
  children,
  className = "",
  scale = 1.02,
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
}) {
  return (
    <div
      className={`transition-all duration-300 ease-out ${className}`}
      style={{ ["--hover-scale" as string]: scale }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = `scale(${scale})`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SlideIn — slide in from edge on scroll                             */
/* ------------------------------------------------------------------ */
export function SlideIn({
  children,
  className = "",
  from = "left",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  from?: "left" | "right";
  delay?: number;
}) {
  return (
    <FadeIn direction={from === "left" ? "right" : "left"} delay={delay} duration={700} className={className}>
      {children}
    </FadeIn>
  );
}

/* ------------------------------------------------------------------ */
/*  Pulse — subtle pulsing glow (for CTAs)                             */
/* ------------------------------------------------------------------ */
export function PulseGlow({
  children,
  className = "",
  color = "rgba(16,185,129,0.3)",
}: {
  children: ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 rounded-xl animate-pulse opacity-40 blur-xl"
        style={{ backgroundColor: color }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
