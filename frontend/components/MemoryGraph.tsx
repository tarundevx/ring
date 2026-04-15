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
    const newNodes: Node[] = [{ id: "user", label: "Me", group: "center", x: 400, y: 300 }];
    const newEdges: Edge[] = [];

    const categories = [
      { key: "facts", label: "Facts", group: "facts", color: "#6366f1" },
      { key: "people", label: "People", group: "people", color: "#ec4899" },
      { key: "projects", label: "Projects", group: "projects", color: "#8b5cf6" },
      { key: "preferences", label: "Preferences", group: "prefs", color: "#10b981" },
      { key: "recurring_topics", label: "Topics", group: "topics", color: "#f59e0b" },
      { key: "tasks", label: "Tasks", group: "tasks", color: "#3b82f6" },
    ];

    const radius = 220;

    categories.forEach((cat, i) => {
      const catId = `cat-${cat.key}`;
      const cx = 400 + Math.cos((i * 2 * Math.PI) / categories.length) * radius;
      const cy = 300 + Math.sin((i * 2 * Math.PI) / categories.length) * radius;

      newNodes.push({ id: catId, label: cat.label, group: cat.group, x: cx, y: cy, color: cat.color });
      newEdges.push({ source: "user", target: catId });

      let items = [];
      if (cat.key === "tasks") {
        items = tasks.filter(t => t.status !== "done").map(t => t.title);
      } else {
        items = Array.isArray(profile[cat.key]) ? profile[cat.key] : [];
      }

      items.slice(0, 8).forEach((item: any, j: number) => {
        const itemId = `${catId}-item-${j}`;
        const itemLabel = typeof item === "string" ? item : item.name || item.title || "Item";
        const subRadius = 100;
        const subAngle = (j * 2 * Math.PI) / Math.min(items.length, 8) + (i * Math.PI / 4);
        
        newNodes.push({
          id: itemId,
          label: itemLabel.length > 30 ? itemLabel.slice(0, 27) + "..." : itemLabel,
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
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.3, Math.min(5, prev.scale * delta))
    }));
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-[16/9] bg-[#030303] rounded-[40px] overflow-hidden border border-white/5 shadow-2xl transition-all duration-1000 group"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="absolute top-10 left-10 z-10 pointer-events-none">
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
           <div className="w-2.5 h-2.5 rounded-full bg-ringaccent shadow-[0_0_10px_#8b5cf6]" />
           Neural Context Explorer
        </h2>
        <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-[0.2em] font-semibold opacity-50">Identity Mapping Engine • v2.0</p>
      </div>

      <div className="absolute top-10 right-10 z-10 hidden group-hover:flex gap-6 text-[10px] text-zinc-500 font-bold tracking-widest uppercase">
        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" /> Facts</div>
        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#ec4899]" /> People</div>
        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Preferences</div>
      </div>

      <svg 
        viewBox="0 0 800 600" 
        className="w-full h-full"
      >
        <g style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: 'center' }}>
          {/* Enhanced Defs */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="white" opacity="0.1" />
            </marker>
          </defs>

          {/* Dynamic Connection Lines */}
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
                strokeOpacity={source.group === "center" ? "0.2" : "0.1"}
                strokeWidth={source.group === "center" ? "2" : "1"}
                className="animate-in fade-in transition-all duration-700"
              />
            );
          })}

          {/* Organic Nodes */}
          {nodes.map((node) => (
            <g 
              key={node.id} 
              className="group/node transition-all duration-500"
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={node.group === "center" ? 18 : node.group === "item" ? 5 : 12}
                fill={node.group === "center" ? "white" : node.color || "#8b5cf6"}
                fillOpacity={node.group === "item" ? "0.4" : "1"}
                className={`${node.group === "center" ? "animate-pulse" : ""} transition-all duration-300 group-hover/node:r-[120%] group-hover/node:fill-opacity-100`}
                filter={node.group !== "item" ? "url(#glow)" : ""}
              />
              <text
                x={node.x}
                y={node.y + (node.group === "item" ? 16 : 28)}
                textAnchor="middle"
                className={`text-[10px] fill-zinc-400 font-bold select-none pointer-events-none tracking-tight transition-all duration-300 group-hover/node:fill-zinc-100 ${node.group === "item" ? "text-[8px] opacity-70" : "uppercase tracking-widest text-[11px]"}`}
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

