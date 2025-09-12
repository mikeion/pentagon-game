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
            Pentagon Complex Number Firing Game
          </h1>
        </header>
        
        <div className="flex-1 overflow-hidden">
          <PentagonGame />
        </div>
      </div>
      
      {/* Desktop layout with full content */}
      <div className="hidden lg:block lg:h-screen lg:overflow-hidden">
        <div className="flex flex-col h-full">
          <header className="text-center py-4 px-4 flex-shrink-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Pentagon Complex Number Firing Game
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mx-auto">
              A mathematical puzzle game based on Dr. Alex McDonough&apos;s research into 
              group theory and complex number operations on pentagon configurations.
            </p>
          </header>
          
          <div className="flex-1 overflow-auto">
            <PentagonGame />
          </div>
          
          <footer className="text-center py-4 px-4 text-slate-400 text-sm flex-shrink-0 border-t border-slate-700">
            <p className="mb-1">
              Based on research by{' '}
              <a 
                href="https://sites.google.com/view/alexmcdonough/home" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Dr. Alex McDonough
              </a>
              {' • '}
              Exactly 162 unique orbital configurations exist in this mathematical system.
            </p>
            <p className="text-xs text-slate-500">
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
