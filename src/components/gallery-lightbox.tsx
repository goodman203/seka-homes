"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type Photo = { src: string; alt: string };
const GalleryContext = createContext<(index: number, trigger: HTMLButtonElement) => void>(() => {});

export function useGallery() { return useContext(GalleryContext); }

export function GalleryLightbox({ photos, children }: { photos: Photo[]; children: React.ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const open = index !== null;
  const photo = index === null ? null : photos[index];

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  function show(at: number, button: HTMLButtonElement) {
    if (!photos[at]) return;
    trigger.current = button;
    setIndex(at); setZoomed(false);
    dialog.current?.showModal();
  }

  function navigate(step: number) {
    setIndex((current) => current === null ? null : (current + step + photos.length) % photos.length);
    setZoomed(false); swipe.current = null;
    viewport.current?.scrollTo(0, 0);
  }

  function toggleZoom() {
    setZoomed((current) => !current);
    swipe.current = null;
    viewport.current?.scrollTo(0, 0);
  }

  return <GalleryContext.Provider value={show}>
    {children}
    <dialog ref={dialog} className="lightbox" aria-labelledby="gallery-title" aria-describedby="gallery-help" onClose={() => {
      setIndex(null); setZoomed(false); trigger.current?.focus({ preventScroll: true });
    }} onKeyDown={(event) => {
      if (event.key === "Tab") {
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault(); navigate(event.key === "ArrowRight" ? 1 : -1);
      }
      // The native modal handles Escape and background inertness.
    }}>
      <div className="lightbox-layout">
        <header className="lightbox-header"><h2 id="gallery-title">Seka Homes photos</h2><div className="lightbox-tools">
          <button type="button" aria-label={zoomed ? "Zoom out to fit photo" : "Zoom in on photo"} aria-pressed={zoomed} onClick={toggleZoom}>{zoomed ? "−" : "+"}<span>Zoom</span></button>
          <button type="button" className="lightbox-close" aria-label="Close photo gallery" onClick={() => dialog.current?.close()} autoFocus>×</button>
        </div></header>
        <div ref={viewport} className={`lightbox-viewport${zoomed ? " is-zoomed" : ""}`}
          onTouchStart={(event) => {
            swipe.current = !zoomed && event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
          }} onTouchMove={(event) => { if (event.touches.length !== 1) swipe.current = null; }}
          onTouchEnd={(event) => {
            const start = swipe.current; swipe.current = null;
            if (!start || zoomed || event.touches.length || !event.changedTouches.length) return;
            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) navigate(dx < 0 ? 1 : -1);
          }} onTouchCancel={() => { swipe.current = null; }}>
          <div className="lightbox-canvas">{photo && <Image key={photo.src} className="lightbox-image" src={photo.src} alt={photo.alt} fill sizes={zoomed ? "200vw" : "100vw"} loading="eager" />}</div>
        </div>
        <footer className="lightbox-footer">
          <div className="lightbox-navigation"><button type="button" aria-label="Previous photo" onClick={() => navigate(-1)}>←</button><span role="status" aria-live="polite" aria-atomic="true">{index === null ? "" : `${index + 1} / ${photos.length}`}</span><button type="button" aria-label="Next photo" onClick={() => navigate(1)}>→</button></div>
          <p className="lightbox-caption">{photo?.alt}</p><p id="gallery-help">Swipe or use arrow keys to browse. Escape to close. Use Zoom, then scroll to explore the photo.</p>
        </footer>
      </div>
    </dialog>
  </GalleryContext.Provider>;
}
