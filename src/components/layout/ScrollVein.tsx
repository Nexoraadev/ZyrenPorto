"use client";

import { useEffect, useRef } from "react";

interface VeinNode {
  x: number;
  y: number;
  angle: number;
  width: number;
  length: number;
  children: VeinNode[];
  drawn: number; // 0-1 progress of this segment being drawn
  startProgress: number; // scroll progress at which this node starts drawing
}

function buildVeinTree(
  x: number,
  y: number,
  angle: number,
  width: number,
  depth: number,
  scrollStart: number,
  totalHeight: number
): VeinNode {
  const segLength = width * (8 + Math.random() * 10);
  const node: VeinNode = {
    x, y, angle, width,
    length: segLength,
    children: [],
    drawn: 0,
    startProgress: scrollStart,
  };

  if (depth <= 0 || width < 0.3) return node;

  const endX = x + Math.cos(angle) * segLength;
  const endY = y + Math.sin(angle) * segLength;
  const childStart = scrollStart + segLength / totalHeight;

  // Main continuation
  const mainAngle = angle + (Math.random() - 0.5) * 0.5;
  node.children.push(
    buildVeinTree(endX, endY, mainAngle, width * 0.82, depth - 1, childStart, totalHeight)
  );

  // Branch off
  const numBranches = depth > 3 ? (Math.random() < 0.7 ? 1 : 2) : (Math.random() < 0.4 ? 1 : 0);
  for (let i = 0; i < numBranches; i++) {
    const side = Math.random() < 0.5 ? 1 : -1;
    const branchAngle = angle + side * (0.4 + Math.random() * 0.8);
    const branchWidth = width * (0.45 + Math.random() * 0.25);
    node.children.push(
      buildVeinTree(endX, endY, branchAngle, branchWidth, depth - 2, childStart, totalHeight)
    );
  }

  return node;
}

function drawVein(
  ctx: CanvasRenderingContext2D,
  node: VeinNode,
  scrollProgress: number
) {
  if (scrollProgress < node.startProgress) return;

  // How far along this segment is drawn
  const segDuration = node.length / window.innerHeight;
  const segProgress = Math.min(1, (scrollProgress - node.startProgress) / Math.max(segDuration, 0.01));

  if (segProgress <= 0) return;

  const endX = node.x + Math.cos(node.angle) * node.length * segProgress;
  const endY = node.y + Math.sin(node.angle) * node.length * segProgress;

  // Dark vein (thick base)
  ctx.beginPath();
  ctx.moveTo(node.x, node.y);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = `rgba(30, 0, 0, ${Math.min(0.9, node.width * 0.4)})`;
  ctx.lineWidth = node.width * 1.8;
  ctx.lineCap = "round";
  ctx.stroke();

  // Red vein (main)
  ctx.beginPath();
  ctx.moveTo(node.x, node.y);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = `rgba(160, 10, 10, ${Math.min(0.85, node.width * 0.35)})`;
  ctx.lineWidth = node.width;
  ctx.lineCap = "round";
  ctx.stroke();

  // Bright core for thick veins
  if (node.width > 1.5) {
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `rgba(220, 30, 30, ${Math.min(0.5, node.width * 0.15)})`;
    ctx.lineWidth = node.width * 0.3;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  // Recurse children only if this segment is fully drawn
  if (segProgress >= 1) {
    for (const child of node.children) {
      drawVein(ctx, child, scrollProgress);
    }
  }
}

export function ScrollVein() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);
  const rootsRef  = useRef<VeinNode[]>([]);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;

    // Build two vein trees — one from top-right, one from top-left
    const totalH = H * 3; // scale: full scroll = 3 viewports worth of growth
    const roots: VeinNode[] = [
      buildVeinTree(W * 0.85, -10, Math.PI / 2 + 0.2, 6, 10, 0.02, totalH),
      buildVeinTree(W * 0.15, -10, Math.PI / 2 - 0.15, 4, 8, 0.05, totalH),
    ];
    rootsRef.current = roots;

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - H;
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // Soft glow background for thick main veins
      ctx.save();
      ctx.globalAlpha = 0.03;
      ctx.fillStyle = "#8b0000";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      ctx.save();
      ctx.shadowBlur  = 6;
      ctx.shadowColor = "rgba(180, 0, 0, 0.3)";

      for (const root of rootsRef.current) {
        drawVein(ctx, root, scrollRef.current);
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  );
}
