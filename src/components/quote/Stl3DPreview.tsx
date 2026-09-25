'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { parseSTL, verticesFromTris } from './stl';

// Rotating 3D preview of an STL buffer (pink mesh on a dark stage), ported from the reference.
// Reusable at any size — the canvas fills its CSS box.
export function Stl3DPreview({
  buffer,
  className,
  onClick,
}: {
  buffer: ArrayBuffer;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    // A live WebGL context is created only while the card is on/near screen, and torn
    // down when it scrolls away. Browsers cap concurrent contexts (~16), and the quote
    // calculator allows up to 20 file cards — without this, off-screen previews would
    // exhaust the limit and earlier previews would go black.
    let teardown: (() => void) | null = null;

    const start = () => {
      if (teardown) return;
      const w = canvas.clientWidth || 160;
      const h = canvas.clientHeight || 120;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x232323);
      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 10000);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(verticesFromTris(parseSTL(buffer)), 3),
      );
      geometry.computeVertexNormals();
      geometry.center();
      const material = new THREE.MeshPhongMaterial({
        color: 0xff1b5c,
        specular: 0x222222,
        shininess: 40,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const size = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      camera.position.set(maxDim * 0.8, maxDim * 0.6, maxDim * 1.2);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(maxDim, maxDim, maxDim);
      const fill = new THREE.DirectionalLight(0xffffff, 0.3);
      fill.position.set(-maxDim, -maxDim * 0.5, -maxDim);
      scene.add(dir, fill);

      let raf = 0;
      let angle = 0;
      const animate = () => {
        angle += 0.008;
        mesh.rotation.y = angle;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      animate();

      teardown = () => {
        cancelAnimationFrame(raf);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.forceContextLoss(); // release the GL context promptly, not at GC
      };
    };

    const stop = () => {
      teardown?.();
      teardown = null;
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? start() : stop();
      },
      { rootMargin: '250px' },
    );
    io.observe(canvas);

    return () => {
      io.disconnect();
      stop();
    };
  }, [buffer]);

  return <canvas ref={ref} className={className} onClick={onClick} />;
}
