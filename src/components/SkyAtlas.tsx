// SkyAtlas.tsx
import React, { useEffect, useRef } from "react";
import A from "aladin-lite";

type SkyAtlasProps = {
  /** HiPS survey ID or URL, e.g. 'P/DSS2/color', 'P/allWISE/color' */
  survey?: string;
  /** Target can be a name ('M31'), or coords { ra, dec } in degrees */
  target?: string | { ra: number; dec: number };
  /** Field of view in degrees */
  fov?: number;
  /** 'AIT' | 'TAN' | 'SIN' ... */
  projection?: string;
  /** 'equatorial' | 'galactic' | 'icrs' */
  cooFrame?: string;
  /** Show coordinate grid */
  showGrid?: boolean;
  /** Optional className for sizing/layout */
  className?: string;
  /** Called once the viewer is ready */
  onReady?: (aladin: any) => void;
};

export default function SkyAtlas({
  survey = "P/DSS2/color",
  target = "M31",
  fov = 2,
  projection = "AIT",
  cooFrame = "equatorial",
  showGrid = false,
  className,
  onReady,
}: SkyAtlasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const aladinRef = useRef<any>(null);

  // Mount / unmount
  useEffect(() => {
    let alive = true;

    A.init.then(() => {
      if (!alive || !containerRef.current) return;

      // A.aladin accepts an HTMLElement or a selector
      const a = A.aladin(containerRef.current!, {
        survey,
        target,
        fov,
        projection,
        cooFrame,
        fullScreen: true,
        showFullscreenControl: false, 
        showCooGrid: showGrid,
        showCooGridControl: true,
        showSimbadPointerControl: true,
        
      });

      aladinRef.current = a;
      onReady?.(a);
    });

    return () => {
      alive = false;
      if (aladinRef.current) {
        // Clean up canvas and listeners
        aladinRef.current.remove();
        aladinRef.current = null;
      }
    };
  }, []); // init once

  // Reactive survey change
  useEffect(() => {
    const a = aladinRef.current;
    if (!a || !survey) return;
    // v3: prefer A.HiPS over deprecated imageHiPS
    a.setImageLayer(A.HiPS(survey));
  }, [survey]);

  // Reactive target change
  useEffect(() => {
    const a = aladinRef.current;
    if (!a || !target) return;
    if (typeof target === "string") a.gotoObject(target);
    else a.gotoRaDec(target.ra, target.dec);
  }, [target]);

  // Reactive FoV change
  useEffect(() => {
    const a = aladinRef.current;
    if (!a || !fov) return;
    a.setFoV(fov);
  }, [fov]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%", position: "relative" }}
    />
  );
}
