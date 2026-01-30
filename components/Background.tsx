import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none bg-gray-950">
      {/* Deep, rich base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-gray-950 to-gray-950" />
      
      {/* Animated Glowing Orbs with will-change-transform for smoother fps */}
      <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob opacity-60 will-change-transform"></div>
      <div className="absolute top-[20%] right-[-15%] w-[35rem] h-[35rem] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 opacity-60 will-change-transform"></div>
      <div className="absolute bottom-[-20%] left-[30%] w-[45rem] h-[45rem] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000 opacity-50 will-change-transform"></div>
      
      {/* Subtle Grid Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay contrast-150"></div>
      
      {/* Floating Particles (Simulated with CSS) */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full opacity-20 animate-float will-change-transform"></div>
      <div className="absolute top-3/4 left-2/3 w-1.5 h-1.5 bg-indigo-300 rounded-full opacity-10 animate-float animation-delay-2000 will-change-transform"></div>
      <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-purple-300 rounded-full opacity-15 animate-float animation-delay-4000 will-change-transform"></div>
    </div>
  );
};

export default Background;