import React from "react";

export default function Logo({ className = "h-8 w-auto text-gray-900 dark:text-white" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Gigahi Logo</title>
      
      {/* 
        Creative Concept: 'The Node & The Orbit'
        We abstract 'G' into an enclosing orbital ring and 'H' into inner connecting nodes,
        representing networking, technology, and full-stack connectivity.
      */}
      
      {/* Outer Orbit (The 'G' abstract) */}
      <circle 
        cx="50" 
        cy="50" 
        r="40" 
        strokeWidth="10" 
        className="transition-all duration-700 hover:rotate-90 origin-center"
        strokeDasharray="180 70"
        strokeLinecap="round"
      />
      {/* Target Node */}
      <circle 
        cx="50" 
        cy="10" 
        r="6" 
        fill="currentColor" 
        stroke="none"
        className="transition-all duration-500 hover:scale-125"
      />
      
      {/* Inner Connection (The 'H' abstract / Server Nodes) */}
      <path 
        d="M 35 40 V 60 M 35 50 H 65 M 65 40 V 60" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="transition-all duration-500 hover:stroke-gray-500"
      />
    </svg>
  );
}
