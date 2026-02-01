import React, { memo } from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden bg-gray-950 transition-all duration-1000 ease-in-out">
      {/* Deep, rich base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/50 via-[#030712] to-[#030712]" />
      
      {/* Animated Glowing Orbs - Restored & Optimized */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[80px] md:blur-[120px] animate-blob bg-indigo-600/20 opacity-40 will-change-transform"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full mix-blend-screen filter blur-[60px] md:blur-[100px] animate-blob animation-delay-2000 bg-blue-600/20 opacity-30 will-change-transform"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full mix-blend-screen filter blur-[90px] md:blur-[130px] animate-blob animation-delay-4000 bg-violet-600/20 opacity-30 will-change-transform"></div>
      
      {/* Subtle Grid Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay contrast-150"></div>
    </div>
  );
};

export default memo(Background);