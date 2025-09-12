'use client';

import PentagonGame from '@/components/PentagonGame';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile full-screen layout */}
      <div className="lg:hidden h-screen flex flex-col">
        {/* Compact header for mobile */}
        <header className="flex-shrink-0 text-center py-2 px-4">
          <h1 className="text-lg font-bold text-white mb-1">
            Pentagon Complex Numbers
          </h1>
        </header>
        
        <div className="flex-1 overflow-hidden">
          <PentagonGame />
        </div>
      </div>
      
      {/* Desktop layout with full content */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              Pentagon Complex Numbers
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto px-4">
              A mathematical puzzle game based on Dr. Alex McDonough&apos;s research into 
              group theory and complex number operations on pentagon configurations.
            </p>
          </header>
          
          <PentagonGame />
          
          <footer className="text-center mt-12 text-slate-400 space-y-2">
            <p className="mb-2">
              Based on research by{' '}
              <a 
                href="https://sites.google.com/view/alexmcdonough/home" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Dr. Alex McDonough
              </a>
            </p>
            <p className="text-sm">
              Exactly 162 unique orbital configurations exist in this mathematical system.
            </p>
            <p className="text-xs text-slate-500 mt-4">
              Developed by{' '}
              <a 
                href="https://mikeion.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-300 underline"
              >
                Mike Ion
              </a>
              {' • '}
              <a 
                href="https://github.com/mikeion/pentagon-game" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-300 underline"
              >
                View Source
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
