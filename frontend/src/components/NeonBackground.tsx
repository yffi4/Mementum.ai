import React from "react";

const NeonBackground: React.FC = () => (
  <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
    <svg
      className="absolute inset-0 w-full h-full"
      width="100%"
      height="100%"
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient
          id="bg-grad"
          cx="50%"
          cy="50%"
          r="80%"
          fx="50%"
          fy="50%"
        >
          <stop offset="0%" stopColor="#A18AFF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0B0C2A" stopOpacity="0.0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg-grad)" />
      <g stroke="#A18AFF" strokeOpacity="0.3" strokeWidth="1">
        <line x1="120" y1="150" x2="280" y2="200" />
        <line x1="280" y1="200" x2="180" y2="320" />
        <line x1="180" y1="320" x2="320" y2="380" />
        <line x1="320" y1="380" x2="220" y2="480" />
        <line x1="220" y1="480" x2="380" y2="520" />
        <line x1="800" y1="120" x2="950" y2="180" />
        <line x1="950" y1="180" x2="850" y2="280" />
        <line x1="850" y1="280" x2="1000" y2="350" />
        <line x1="1000" y1="350" x2="900" y2="450" />
        <line x1="500" y1="100" x2="650" y2="160" />
        <line x1="650" y1="160" x2="580" y2="260" />
        <line x1="580" y1="260" x2="720" y2="320" />
        <line x1="280" y1="200" x2="500" y2="100" />
        <line x1="650" y1="160" x2="800" y2="120" />
        <line x1="320" y1="380" x2="580" y2="260" />
        <line x1="720" y1="320" x2="850" y2="280" />
      </g>
      <g>
        {[
          { x: 120, y: 150, delay: 0, moveRadius: 15, moveSpeed: 12 },
          { x: 280, y: 200, delay: 0.2, moveRadius: 20, moveSpeed: 15 },
          { x: 180, y: 320, delay: 0.4, moveRadius: 12, moveSpeed: 18 },
          { x: 320, y: 380, delay: 0.6, moveRadius: 25, moveSpeed: 14 },
          { x: 220, y: 480, delay: 0.8, moveRadius: 18, moveSpeed: 16 },
          { x: 380, y: 520, delay: 1.0, moveRadius: 22, moveSpeed: 13 },
          { x: 800, y: 120, delay: 0.3, moveRadius: 16, moveSpeed: 17 },
          { x: 950, y: 180, delay: 0.5, moveRadius: 20, moveSpeed: 15 },
          { x: 850, y: 280, delay: 0.7, moveRadius: 14, moveSpeed: 19 },
          { x: 1000, y: 350, delay: 0.9, moveRadius: 24, moveSpeed: 12 },
          { x: 900, y: 450, delay: 1.1, moveRadius: 19, moveSpeed: 16 },
          { x: 500, y: 100, delay: 0.1, moveRadius: 17, moveSpeed: 14 },
          { x: 650, y: 160, delay: 0.4, moveRadius: 21, moveSpeed: 18 },
          { x: 580, y: 260, delay: 0.6, moveRadius: 13, moveSpeed: 15 },
          { x: 720, y: 320, delay: 0.8, moveRadius: 23, moveSpeed: 17 },
        ].map((node, i) => (
          <circle
            key={i}
            cx={node.x}
            cy={node.y}
            r="4"
            fill="#A18AFF"
            fillOpacity="0.6"
          >
            <animate
              attributeName="r"
              values="4;6;4"
              dur="3s"
              repeatCount="indefinite"
              begin={`${node.delay}s`}
            />
            <animate
              attributeName="fill-opacity"
              values="0.6;0.9;0.6"
              dur="3s"
              repeatCount="indefinite"
              begin={`${node.delay}s`}
            />
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0,0; ${node.moveRadius * Math.cos(i * 0.5)},${
                node.moveRadius * Math.sin(i * 0.5)
              }; ${node.moveRadius * Math.cos(i * 0.5 + Math.PI)},${
                node.moveRadius * Math.sin(i * 0.5 + Math.PI)
              }; 0,0`}
              dur={`${node.moveSpeed}s`}
              repeatCount="indefinite"
              begin={`${node.delay}s`}
            />
          </circle>
        ))}
      </g>
    </svg>

    {/* Floating particles
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
          style={{
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div> */}

    {/* Gradient overlays */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 animate-pulse" />
    <div
      className="absolute inset-0 bg-gradient-to-tl from-cyan-500/3 via-transparent to-purple-500/3"
      style={{ animation: "gradientShift 8s ease-in-out infinite" }}
    />
  </div>
);

export default NeonBackground;
