import React from 'react';
import { MapPin } from 'lucide-react';

const ShimmerCard: React.FC<{ delay?: string }> = ({ delay = '0s' }) => (
    <div
        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-100 animate-brochure-card"
        style={{ animationDelay: delay }}
    >
        <div className="relative h-36 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 shimmer-sweep" />
        <div className="p-3 space-y-2">
            <div className="h-3.5 rounded-full bg-amber-100 shimmer-sweep w-3/4" />
            <div className="h-3 rounded-full bg-amber-50 shimmer-sweep w-1/2" />
        </div>
    </div>
);

const BrochureLoader: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 flex flex-col items-center justify-start pt-16 px-4">
            {/* Animated header area */}
            <div className="flex flex-col items-center gap-3 mb-10">
                <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-300/50 animate-pin-pulse">
                        <MapPin className="w-7 h-7 text-white" />
                    </div>
                    {/* Ripple rings */}
                    <div className="absolute inset-0 rounded-full border-2 border-amber-400/60 animate-ripple" />
                    <div className="absolute inset-0 rounded-full border-2 border-amber-300/40 animate-ripple" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute inset-0 rounded-full border-2 border-orange-300/30 animate-ripple" style={{ animationDelay: '1s' }} />
                </div>
                {/* Skeleton title bar */}
                <div className="h-4 w-40 rounded-full bg-amber-200/80 shimmer-sweep" />
                <div className="h-3 w-24 rounded-full bg-amber-100 shimmer-sweep" style={{ animationDelay: '0.2s' }} />
            </div>

            {/* Skeleton category pills */}
            <div className="flex gap-2 mb-6 overflow-hidden">
                {['w-16', 'w-20', 'w-14', 'w-18', 'w-16'].map((w, i) => (
                    <div
                        key={i}
                        className={`h-7 ${w} rounded-full bg-amber-200/60 shimmer-sweep flex-shrink-0`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                    />
                ))}
            </div>

            {/* Skeleton cards grid */}
            <div className="w-full max-w-lg grid grid-cols-2 gap-3">
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <ShimmerCard key={i} delay={`${i * 0.12}s`} />
                ))}
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes pin-pulse {
                    0%, 100% { transform: scale(1) translateY(0); box-shadow: 0 8px 25px rgba(251,146,60,0.4); }
                    50% { transform: scale(1.08) translateY(-3px); box-shadow: 0 14px 35px rgba(251,146,60,0.5); }
                }
                @keyframes ripple {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                @keyframes brochure-card {
                    0% { opacity: 0; transform: translateY(12px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .shimmer-sweep {
                    background: linear-gradient(
                        90deg,
                        rgba(251,191,36,0.15) 25%,
                        rgba(255,255,255,0.55) 50%,
                        rgba(251,191,36,0.15) 75%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 1.6s ease-in-out infinite;
                }
                .animate-pin-pulse {
                    animation: pin-pulse 2.2s ease-in-out infinite;
                }
                .animate-ripple {
                    animation: ripple 2s ease-out infinite;
                }
                .animate-brochure-card {
                    animation: brochure-card 0.4s ease-out both;
                }
            `}</style>
        </div>
    );
};

export default BrochureLoader;
