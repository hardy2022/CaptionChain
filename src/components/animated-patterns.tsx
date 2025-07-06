"use client"

import React from "react"

export function AnimatedPatterns() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 w-full h-full overflow-hidden">
      {/* Floating blurred circles */}
      <div className="absolute top-[-60px] left-[-60px] w-64 h-64 rounded-full bg-white opacity-20 blur-3xl animate-float-slow" />
      <div className="absolute bottom-[-80px] right-[-40px] w-80 h-80 rounded-full bg-white opacity-10 blur-3xl animate-float-slower" />
      <div className="absolute top-[30%] right-[-100px] w-56 h-56 rounded-full bg-white opacity-10 blur-2xl animate-float-slow" />
      <div className="absolute bottom-[20%] left-[-80px] w-40 h-40 rounded-full bg-white opacity-10 blur-2xl animate-float-slower" />
      <style jsx global>{`
        @keyframes float-slow {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(18px) scale(1.04); }
          100% { transform: translateY(0px) scale(1); }
        }
        .animate-float-slow {
          animation: float-slow 14s ease-in-out infinite;
        }
        @keyframes float-slower {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-14px) scale(1.02); }
          100% { transform: translateY(0px) scale(1); }
        }
        .animate-float-slower {
          animation: float-slower 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
} 