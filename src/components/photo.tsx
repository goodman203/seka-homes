"use client";

import Image from "next/image";
import { property } from "@/content/property";
import { useGallery } from "@/components/gallery-lightbox";

export function Photo({ index, title, hero = false }: { index: number; title: string; hero?: boolean }) {
  const photo = property.photos[index];
  const openGallery = useGallery();
  return <div className={`photo ${hero ? "hero-photo" : ""}`}>
    {photo ? <button className="photo-trigger" type="button" aria-label={`Open photo ${index + 1} of ${property.photos.length}: ${photo.alt}`} aria-haspopup="dialog" onClick={(event) => openGallery(index, event.currentTarget)}><Image src={photo.src} alt={photo.alt} fill sizes={hero ? "(max-width: 760px) calc(100vw - 36px), (max-width: 1288px) 52vw, 630px" : "(max-width: 760px) calc(100vw - 36px), (max-width: 1288px) 33vw, 403px"} priority={hero} /><span className="photo-expand" aria-hidden="true">⤢</span></button> : <div className="photo-placeholder">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="5" y="7" width="30" height="26" rx="3" stroke="currentColor" /><circle cx="15" cy="15" r="3" stroke="currentColor" /><path d="m6 29 10-9 7 6 5-5 7 8" stroke="currentColor" /></svg>
      <span>{title}</span><small>Property photo coming soon</small>
      <span className="placeholder-tag">PHOTO PLACEHOLDER</span>
    </div>}
  </div>;
}
