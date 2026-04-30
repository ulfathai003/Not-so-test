import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Scroll-driven 3D scene: a floating diploma scroll, a torus knot ("orbit of knowledge"),
 * and orbiting books. Rotates continuously and reacts to scroll + mouse.
 */
export function Hero3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xa78bfa, 1.4);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x22d3ee, 1.1);
    rim.position.set(-5, -2, 3);
    scene.add(rim);

    const group = new THREE.Group();
    scene.add(group);

    // Central torus knot — "orbit of knowledge"
    const knotGeom = new THREE.TorusKnotGeometry(1.05, 0.32, 220, 32);
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.55,
      roughness: 0.18,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.4,
    });
    const knot = new THREE.Mesh(knotGeom, knotMat);
    group.add(knot);

    // Floating "books" (boxes) orbiting around it
    const books: THREE.Mesh[] = [];
    const bookColors = [0x22d3ee, 0xa78bfa, 0xf472b6, 0x60a5fa, 0x34d399];
    for (let i = 0; i < 5; i++) {
      const g = new THREE.BoxGeometry(0.55, 0.78, 0.12);
      const m = new THREE.MeshStandardMaterial({
        color: bookColors[i],
        metalness: 0.3,
        roughness: 0.35,
        emissive: bookColors[i],
        emissiveIntensity: 0.12,
      });
      const book = new THREE.Mesh(g, m);
      const angle = (i / 5) * Math.PI * 2;
      book.position.set(Math.cos(angle) * 2.6, Math.sin(angle * 1.3) * 0.9, Math.sin(angle) * 2.6);
      book.rotation.set(Math.random(), Math.random(), Math.random());
      group.add(book);
      books.push(book);
    }

    // Particle starfield
    const starGeom = new THREE.BufferGeometry();
    const starCount = 400;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    starGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(
      starGeom,
      new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.025, transparent: true, opacity: 0.7 })
    );
    scene.add(stars);

    let mouseX = 0;
    let mouseY = 0;
    const onMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.6;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };
    window.addEventListener("mousemove", onMouse);

    let scrollY = 0;
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      knot.rotation.x = t * 0.25;
      knot.rotation.y = t * 0.4;

      books.forEach((b, i) => {
        const angle = t * 0.4 + (i / books.length) * Math.PI * 2;
        const r = 2.6;
        b.position.x = Math.cos(angle) * r;
        b.position.z = Math.sin(angle) * r;
        b.position.y = Math.sin(angle * 1.3 + i) * 0.9;
        b.rotation.x += 0.005;
        b.rotation.y += 0.008;
      });

      // scroll parallax — push group back & tilt
      const s = Math.min(scrollY / 800, 1);
      group.position.y = -s * 1.2;
      group.rotation.z = s * 0.4;
      camera.position.z = 6 + s * 1.5;

      // mouse tilt
      group.rotation.x += (mouseY - group.rotation.x) * 0.03;
      group.rotation.y += (mouseX + t * 0.05 - group.rotation.y) * 0.03;

      stars.rotation.y = t * 0.02;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      knotGeom.dispose();
      knotMat.dispose();
      books.forEach((b) => { b.geometry.dispose(); (b.material as THREE.Material).dispose(); });
      starGeom.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden />;
}
