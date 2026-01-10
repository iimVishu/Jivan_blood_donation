"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  rotation: number;
  vr: number; // angular velocity
}

export default function BloodGravity() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, isDown: false, lastX: 0, lastY: 0, vx: 0, vy: 0 });
  const draggedParticleRef = useRef<Particle | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      // Increase count for more fun
      const particleCount = 20; 
      
      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 20 + 25; // Bigger cells
        let x = Math.random() * (canvas.width - radius * 2) + radius;
        let y = Math.random() * (canvas.height - radius * 2) + radius;

        // Simple overlap check to avoid spawning inside each other
        if (i > 0) {
          for (let j = 0; j < 10; j++) {
            let overlapping = false;
            for (const p of particles) {
              const dx = x - p.x;
              const dy = y - p.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist < radius + p.radius) {
                overlapping = true;
                break;
              }
            }
            if (!overlapping) break;
            x = Math.random() * (canvas.width - radius * 2) + radius;
            y = Math.random() * (canvas.height - radius * 2) + radius;
          }
        }

        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 4, // Faster initial speed
          vy: (Math.random() - 0.5) * 4,
          radius,
          mass: radius, // Mass proportional to radius
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.1,
        });
      }
    };

    // 1D Elastic collision formula
    const rotate = (vx: number, vy: number, angle: number) => {
      return {
        x: vx * Math.cos(angle) - vy * Math.sin(angle),
        y: vx * Math.sin(angle) + vy * Math.cos(angle)
      };
    };

    const resolveCollision = (p1: Particle, p2: Particle) => {
      const xVelocityDiff = p1.vx - p2.vx;
      const yVelocityDiff = p1.vy - p2.vy;

      const xDist = p2.x - p1.x;
      const yDist = p2.y - p1.y;

      // Prevent accidental overlap of particles
      if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(p2.y - p1.y, p2.x - p1.x);

        // Store mass in var for better readability in collision equation
        const m1 = p1.mass;
        const m2 = p2.mass;

        // Velocity before equation
        const u1 = rotate(p1.vx, p1.vy, angle);
        const u2 = rotate(p2.vx, p2.vy, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m1 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1.x, v1.y, -angle);
        const vFinal2 = rotate(v2.x, v2.y, -angle);

        // Swap particle velocities for realistic bounce effect
        p1.vx = vFinal1.x;
        p1.vy = vFinal1.y;
        p2.vx = vFinal2.x;
        p2.vy = vFinal2.y;
      }
    };

    const drawBloodCell = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      
      // Draw Minimalist Sphere/Cell
      ctx.beginPath();
      // Gradient for 3D effect - Red Blood Cell Color
      const gradient = ctx.createRadialGradient(0, 0, p.radius * 0.3, 0, 0, p.radius);
      gradient.addColorStop(0, "rgba(239, 68, 68, 0.4)"); // Lighter red center
      gradient.addColorStop(1, "rgba(153, 27, 27, 0.3)"); // Darker red edge
      
      ctx.fillStyle = gradient;
      // Make it slightly oval
      ctx.ellipse(0, 0, p.radius, p.radius * 0.95, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Stroke for definition
      ctx.strokeStyle = "rgba(185, 28, 28, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Inner dimple highlight
      ctx.beginPath();
      ctx.fillStyle = "rgba(254, 202, 202, 0.3)";
      ctx.ellipse(0, 0, p.radius * 0.5, p.radius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update Mouse Velocity
      // We track mouse velocity to "throw" particles
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Check Wall Collisions
        if (p.x - p.radius < 0) {
          p.x = p.radius;
          p.vx = -p.vx * 0.8; // Wall friction
        } else if (p.x + p.radius > canvas.width) {
          p.x = canvas.width - p.radius;
          p.vx = -p.vx * 0.8;
        }

        if (p.y - p.radius < 0) {
          p.y = p.radius;
          p.vy = -p.vy * 0.8;
        } else if (p.y + p.radius > canvas.height) {
          p.y = canvas.height - p.radius;
          p.vy = -p.vy * 0.8;
        }

        // 2. Check Particle Collisions
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = other.x - p.x;
          const dy = other.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < p.radius + other.radius) {
            resolveCollision(p, other);
            
            // Separate particles to prevent sticking
            const overlap = (p.radius + other.radius - distance) / 2;
            const angle = Math.atan2(dy, dx);
            p.x -= Math.cos(angle) * overlap;
            p.y -= Math.sin(angle) * overlap;
            other.x += Math.cos(angle) * overlap;
            other.y += Math.sin(angle) * overlap;
          }
        }

        // 3. Mouse Interaction (Drag & Throw)
        if (draggedParticleRef.current === p) {
            // Move to mouse
            const dx = mouseRef.current.x - p.x;
            const dy = mouseRef.current.y - p.y;
            
            // Spring-like pull to mouse
            p.vx = dx * 0.2;
            p.vy = dy * 0.2;
        } else {
            // Apply friction
            p.vx *= 0.99;
            p.vy *= 0.99;
            p.vr *= 0.98;
        }

        // 4. Update Position
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;

        drawBloodCell(ctx, p);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      mouseRef.current.isDown = true;
      mouseRef.current.x = mx;
      mouseRef.current.y = my;

      // Check if clicked on a particle
      for (const p of particles) {
        const dx = mx - p.x;
        const dy = my - p.y;
        if (Math.sqrt(dx*dx + dy*dy) < p.radius) {
          draggedParticleRef.current = p;
          break;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Calculate mouse velocity
      mouseRef.current.vx = mx - mouseRef.current.lastX;
      mouseRef.current.vy = my - mouseRef.current.lastY;
      mouseRef.current.lastX = mx;
      mouseRef.current.lastY = my;

      mouseRef.current.x = mx;
      mouseRef.current.y = my;
    };

    const handleMouseUp = () => {
      if (draggedParticleRef.current) {
        // Throw effect: impart mouse velocity to particle
        draggedParticleRef.current.vx = mouseRef.current.vx * 0.5;
        draggedParticleRef.current.vy = mouseRef.current.vy * 0.5;
        draggedParticleRef.current = null;
      }
      mouseRef.current.isDown = false;
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-auto z-0"
      style={{ background: 'transparent', cursor: 'grab' }}
    />
  );
}

