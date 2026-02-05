import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100 relative overflow-hidden">
      {/* Floating clouds with shadows */}
      <div className="absolute top-10 left-10 w-16 h-8 bg-white/60 rounded-full blur-sm animate-float-slow shadow-lg"></div>
      <div className="absolute top-20 right-20 w-20 h-10 bg-white/50 rounded-full blur-sm animate-float-slower shadow-lg"></div>
      <div className="absolute top-32 left-1/3 w-12 h-6 bg-white/40 rounded-full blur-sm animate-float-slow shadow-lg"></div>
      <div className="absolute top-40 right-1/4 w-14 h-7 bg-white/45 rounded-full blur-sm animate-float-slower shadow-lg"></div>

      {/* Multiple seagull flocks */}
      <div className="absolute top-16 right-32 text-gray-600/40 text-xs animate-fly-by">
        <span className="inline-block animate-flap">ᐯ</span>
        <span className="inline-block animate-flap ml-2" style={{ animationDelay: '0.3s' }}>ᐯ</span>
        <span className="inline-block animate-flap ml-2" style={{ animationDelay: '0.6s' }}>ᐯ</span>
      </div>
      <div className="absolute top-24 left-1/4 text-gray-600/30 text-xs animate-fly-by-slow">
        <span className="inline-block animate-flap">ᐯ</span>
        <span className="inline-block animate-flap ml-2" style={{ animationDelay: '0.2s' }}>ᐯ</span>
      </div>

      {/* Floating bubbles */}
      <div className="absolute bottom-20 left-10 w-2 h-2 bg-white/40 rounded-full animate-bubble"></div>
      <div className="absolute bottom-32 left-16 w-1.5 h-1.5 bg-white/30 rounded-full animate-bubble" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-24 right-16 w-2.5 h-2.5 bg-white/35 rounded-full animate-bubble" style={{ animationDelay: '1s' }}></div>

      <div className="relative">
        {/* Enhanced sun with glow */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          {/* Sun glow effect */}
          <div className="absolute inset-0 w-20 h-20 -left-2 -top-2 bg-yellow-300/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute inset-0 w-24 h-24 -left-4 -top-4 bg-orange-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Sun core */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-200 via-yellow-300 to-orange-400 rounded-full shadow-xl shadow-yellow-400/60">
            {/* Inner sun detail */}
            <div className="absolute inset-2 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full opacity-70"></div>
            
            {/* Rotating sun rays */}
            <div className="absolute inset-0 animate-spin-slow">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-1.5 h-7 bg-gradient-to-t from-yellow-300 to-transparent rounded-full left-1/2 top-1/2 origin-bottom -translate-x-1/2"
                  style={{ 
                    transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-2rem)`,
                  }}
                ></div>
              ))}
            </div>
            
            {/* Counter-rotating secondary rays */}
            <div className="absolute inset-0 animate-spin-slow-reverse">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-1 h-5 bg-gradient-to-t from-orange-300 to-transparent rounded-full left-1/2 top-1/2 origin-bottom -translate-x-1/2"
                  style={{ 
                    transform: `translate(-50%, -50%) rotate(${i * 45 + 22.5}deg) translateY(-1.75rem)`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main ocean scene container */}
        <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-2xl border-4 border-white/30 animate-scene-pulse">
          {/* Sky gradient in circle */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-300 to-blue-400"></div>
          
          {/* Animated ocean waves with better movement */}
          <div className="absolute bottom-0 left-0 w-full h-full">
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 animate-wave opacity-90"></div>
            <div className="absolute bottom-1 left-0 w-full h-10 bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300 animate-wave-delayed opacity-80"></div>
            <div className="absolute bottom-2 left-0 w-full h-8 bg-gradient-to-t from-blue-400 via-blue-300 to-cyan-300 animate-wave-slower opacity-70"></div>
            
            {/* Water sparkles - more of them */}
            <div className="absolute bottom-6 left-8 w-1 h-1 bg-white rounded-full animate-sparkle shadow-lg shadow-white"></div>
            <div className="absolute bottom-8 left-16 w-1 h-1 bg-white rounded-full animate-sparkle shadow-lg shadow-white" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-7 left-24 w-0.5 h-0.5 bg-white rounded-full animate-sparkle shadow-lg shadow-white" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-9 left-12 w-0.5 h-0.5 bg-cyan-200 rounded-full animate-sparkle shadow-lg shadow-cyan-200" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-6 left-20 w-1 h-1 bg-cyan-100 rounded-full animate-sparkle shadow-lg shadow-cyan-100" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Dolphin jumping */}
          <div className="absolute bottom-10 left-12 w-6 h-4 animate-dolphin-jump">
            <div className="relative w-full h-full">
              {/* Dolphin body */}
              <div className="absolute bottom-0 left-0 w-4 h-3 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full transform -rotate-12"></div>
              {/* Dolphin tail */}
              <div className="absolute bottom-0.5 -left-1 w-2 h-1.5 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full transform rotate-45"></div>
              {/* Dolphin nose */}
              <div className="absolute bottom-1 right-0 w-1.5 h-1 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full transform rotate-12"></div>
            </div>
          </div>

          {/* Small sailboat */}
          <div className="absolute top-16 left-16 animate-boat-float">
            {/* Sail */}
            <div className="absolute -top-4 left-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-white/90"></div>
            {/* Boat body */}
            <div className="w-6 h-2 bg-gradient-to-br from-red-700 to-red-800 rounded-full"></div>
            {/* Mast */}
            <div className="absolute -top-4 left-3 w-0.5 h-4 bg-amber-900"></div>
          </div>

          {/* Beach ball with better design */}
          <div className="absolute top-6 right-6 w-10 h-10 rounded-full shadow-lg animate-beach-ball">
            {/* Ball segments */}
            <div className="absolute inset-0 overflow-hidden rounded-full border-2 border-white/40">
              {/* Red segment */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-red-400 via-red-500 to-red-600"></div>
              {/* White segment */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-white via-gray-100 to-gray-200 clip-triangle"></div>
              {/* Yellow segment */}
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-tr from-yellow-400 via-yellow-300 to-yellow-200"></div>
              {/* Blue segment */}
              <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 opacity-80"></div>
              
              {/* Ball shine */}
              <div className="absolute top-1 right-1 w-3 h-3 bg-white/60 rounded-full blur-sm"></div>
            </div>
          </div>

          {/* Sandy beach at bottom */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-amber-200 via-amber-100 to-transparent"></div>

          {/* Enhanced palm tree */}
          <div className="absolute bottom-8 left-6 animate-sway">
            {/* Palm trunk with texture */}
            <div className="relative w-2 h-10 bg-gradient-to-b from-amber-800 to-amber-900 rounded-sm">
              <div className="absolute inset-0 bg-amber-700/40 rounded-sm" style={{ 
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)'
              }}></div>
            </div>
            
            {/* Enhanced palm leaves */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
              {/* Multiple fronds */}
              {[
                { rotation: -45, length: 'h-6', width: 'w-3', delay: '0s' },
                { rotation: -20, length: 'h-7', width: 'w-3', delay: '0.1s' },
                { rotation: 0, length: 'h-8', width: 'w-3', delay: '0.2s' },
                { rotation: 20, length: 'h-7', width: 'w-3', delay: '0.3s' },
                { rotation: 45, length: 'h-6', width: 'w-3', delay: '0.4s' },
              ].map((leaf, i) => (
                <div 
                  key={i}
                  className={`absolute ${leaf.length} ${leaf.width} bg-gradient-to-t from-green-700 via-green-600 to-green-500 rounded-t-full origin-bottom animate-palm-sway`}
                  style={{ 
                    left: '50%',
                    transform: `translateX(-50%) rotate(${leaf.rotation}deg)`,
                    animationDelay: leaf.delay,
                  }}
                >
                  {/* Leaf detail lines */}
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)'
                  }}></div>
                </div>
              ))}
              
              {/* Coconuts */}
              <div className="absolute top-1 -left-1 w-1.5 h-1.5 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full"></div>
              <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full"></div>
            </div>
          </div>

          {/* Beach elements */}
          <div className="absolute bottom-3 right-10 w-2 h-1.5 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full opacity-70 transform rotate-12 animate-pulse-slow"></div>
          <div className="absolute bottom-4 right-6 w-1.5 h-1 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full opacity-60 transform -rotate-12"></div>
          <div className="absolute bottom-2 left-12 w-1 h-1 bg-orange-200 rounded-full opacity-50"></div>
          
          {/* Small crab scuttling */}
          <div className="absolute bottom-2 left-8 animate-crab-walk">
            <div className="w-2 h-1.5 bg-gradient-to-br from-orange-600 to-red-700 rounded-full"></div>
            <div className="absolute -left-0.5 top-0 w-1 h-0.5 bg-orange-600 rounded-full"></div>
            <div className="absolute -right-0.5 top-0 w-1 h-0.5 bg-orange-600 rounded-full"></div>
          </div>

          {/* Fish swimming */}
          <div className="absolute bottom-8 right-8 w-3 h-2 animate-fish-swim">
            <div className="w-2 h-1.5 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full"></div>
            <div className="absolute right-0 top-0.5 w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[4px] border-l-orange-300"></div>
          </div>
        </div>
      </div>

      {/* Add custom animations to index.css via style tag */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-10px) translateX(5px); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(-8px); }
        }
        @keyframes fly-by {
          0% { transform: translateX(0px) translateY(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(400px) translateY(-60px); opacity: 0; }
        }
        @keyframes fly-by-slow {
          0% { transform: translateX(0px) translateY(0px); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(500px) translateY(-40px); opacity: 0; }
        }
        @keyframes flap {
          0%, 100% { transform: scaleX(1) scaleY(1); }
          50% { transform: scaleX(1.3) scaleY(0.8); }
        }
        @keyframes bubble {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-400px) scale(1.5); opacity: 0; }
        }
        @keyframes scene-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes dolphin-jump {
          0%, 100% { transform: translateY(0) translateX(0) rotate(-20deg); opacity: 0; }
          15% { opacity: 1; }
          50% { transform: translateY(-20px) translateX(15px) rotate(20deg); opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(10px) translateX(30px) rotate(-30deg); opacity: 0; }
        }
        @keyframes boat-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(-2deg); }
          50% { transform: translateY(0px) rotate(0deg); }
          75% { transform: translateY(-2px) rotate(2deg); }
        }
        @keyframes crab-walk {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(8px); }
        }
        @keyframes fish-swim {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(-5px) translateY(-3px); }
          50% { transform: translateX(0) translateY(3px); }
          75% { transform: translateX(5px) translateY(-2px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-4px) scaleY(1.1); }
        }
        @keyframes wave-delayed {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-3px) scaleY(1.08); }
        }
        @keyframes wave-slower {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-2px) scaleY(1.05); }
        }
        @keyframes beach-ball {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(90deg); }
          50% { transform: translateY(0) rotate(180deg); }
          75% { transform: translateY(-10px) rotate(270deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes palm-sway {
          0%, 100% { transform: translateX(-50%) rotate(var(--rotation, 0deg)) scaleY(1); }
          50% { transform: translateX(-50%) rotate(var(--rotation, 0deg)) scaleY(1.05); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 8s ease-in-out infinite;
        }
        .animate-fly-by {
          animation: fly-by 12s linear infinite;
        }
        .animate-fly-by-slow {
          animation: fly-by-slow 18s linear infinite;
        }
        .animate-flap {
          animation: flap 0.5s ease-in-out infinite;
        }
        .animate-bubble {
          animation: bubble 8s ease-in infinite;
        }
        .animate-scene-pulse {
          animation: scene-pulse 4s ease-in-out infinite;
        }
        .animate-dolphin-jump {
          animation: dolphin-jump 5s ease-in-out infinite;
        }
        .animate-boat-float {
          animation: boat-float 3s ease-in-out infinite;
        }
        .animate-crab-walk {
          animation: crab-walk 4s ease-in-out infinite;
        }
        .animate-fish-swim {
          animation: fish-swim 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 16s linear infinite;
        }
        .animate-wave {
          animation: wave 2s ease-in-out infinite;
        }
        .animate-wave-delayed {
          animation: wave-delayed 2.3s ease-in-out infinite 0.2s;
        }
        .animate-wave-slower {
          animation: wave-slower 2.8s ease-in-out infinite 0.4s;
        }
        .animate-beach-ball {
          animation: beach-ball 3s ease-in-out infinite;
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        .animate-sway {
          animation: sway 3s ease-in-out infinite;
        }
        .animate-palm-sway {
          animation: palm-sway 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
