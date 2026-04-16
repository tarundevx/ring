"use client";

import { useEffect, useState, useRef } from "react";

type Node = {
  id: string;
  label: string;
  group: string;
  x: number;
  y: number;
  color?: string;
};

type Edge = {
  source: string;
  target: string;
};

export function MemoryGraph({ profile, tasks = [] }: { profile: any; tasks?: any[] }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic data conversion from profile to graph
    const center = { x: 500, y: 500 };
    const newNodes: Node[] = [{ id: "user", label: "Me", group: "center", x: center.x, y: center.y }];
    const newEdges: Edge[] = [];

    const categories = [
      { key: "facts", label: "Facts", group: "facts", color: "#6366f1" },
      { key: "people", label: "People", group: "people", color: "#ec4899" },
      { key: "projects", label: "Projects", group: "projects", color: "#0ea5e9" },
      { key: "preferences", label: "Preferences", group: "prefs", color: "#10b981" },
      { key: "recurring_topics", label: "Topics", group: "topics", color: "#f59e0b" },
      { key: "tasks", label: "Tasks", group: "tasks", color: "#3b82f6" },
    ];

    const radius = 300;

    categories.forEach((cat, i) => {
      const catId = `cat-${cat.key}`;
      const angle = (i * 2 * Math.PI) / categories.length;
      const cx = center.x + Math.cos(angle) * radius;
      const cy = center.y + Math.sin(angle) * radius;

      newNodes.push({ id: catId, label: cat.label, group: cat.group, x: cx, y: cy, color: cat.color });
      newEdges.push({ source: "user", target: catId });

      let items = [];
      if (cat.key === "tasks") {
        items = tasks.filter(t => t.status !== "done").map(t => t.title);
      } else {
        items = Array.isArray(profile[cat.key]) ? profile[cat.key] : [];
      }

      items.slice(0, 10).forEach((item: any, j: number) => {
        const itemId = `${catId}-item-${j}`;
        const itemLabel = typeof item === "string" ? item : item.name || item.title || "Item";
        const subRadius = 130;
        const subAngle = (j * 2 * Math.PI) / Math.min(items.length, 10) + angle;
        
        newNodes.push({
          id: itemId,
          label: itemLabel.length > 25 ? itemLabel.slice(0, 22) + "..." : itemLabel,
          group: "item",
          x: cx + Math.cos(subAngle) * subRadius,
          y: cy + Math.sin(subAngle) * subRadius,
          color: cat.color
        });
        newEdges.push({ source: catId, target: itemId });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [profile, tasks]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setTransform(prev => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.2, Math.min(10, prev.scale * delta))
    }));
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-[16/10] bg-[#030303] rounded-[48px] overflow-hidden border border-white/5 shadow-2xl transition-all duration-1000 group"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="absolute top-12 left-12 z-10 pointer-events-none">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-4">
           <div className="w-3 h-3 rounded-full bg-ringaccent animate-pulse shadow-[0_0_20px_#10b981]" />
           Memory Graph
        </h2>
        <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-[0.3em] font-bold opacity-60">Identity Mapping • Visual Context Engine</p>
      </div>

      <svg 
        viewBox="0 0 1000 1000" 
        className="w-full h-full"
      >
        <g 
          style={{ 
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '500px 500px'
          }}
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {edges.map((edge, i) => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            if (!source || !target) return null;
            return (
              <line
                key={i}
                x1={source.x} y1={source.y}
                x2={target.x} y2={target.y}
                stroke={target.color || "white"}
                strokeOpacity={source.group === "center" ? "0.3" : "0.15"}
                strokeWidth={source.group === "center" ? "3" : "1.5"}
                className="transition-all duration-700"
              />
            );
          })}

          {nodes.map((node) => (
            <g key={node.id} className="group/node">
              <circle
                cx={node.x}
                cy={node.y}
                r={node.group === "center" ? 22 : node.group === "item" ? 6 : 14}
                fill={node.group === "center" ? "white" : node.color || "#0ea5e9"}
                fillOpacity={node.group === "item" ? "0.5" : "1"}
                className={`${node.group === "center" ? "animate-pulse" : ""} transition-all duration-300 group-hover/node:r-[130%] group-hover/node:fill-opacity-100`}
                filter={node.group !== "item" ? "url(#glow)" : ""}
              />
              <text
                x={node.x}
                y={node.y + (node.group === "item" ? 18 : 32)}
                textAnchor="middle"
                className={`fill-zinc-400 font-bold select-none pointer-events-none transition-all duration-300 group-hover/node:fill-white ${node.group === "item" ? "text-[10px] opacity-80" : "uppercase tracking-widest text-[12px]"}`}
              >
                {node.label}
              </text>
            </g>
          ))}
        </g>
      </svg>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
         <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
           <span className="text-zinc-700">Scroll</span> Zoom
         </div>
         <div className="w-px h-4 bg-white/10" />
         <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
           <span className="text-zinc-700">Drag</span> Pan
         </div>
      </div>
    </div>
  );
}

