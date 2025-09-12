'use client';

import PentagonGame from '@/components/PentagonGame';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <header className="text-center mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-2 md:mb-4">
            Pentagon Complex Numbers
          </h1>
          <p className="text-sm md:text-lg text-slate-300 max-w-2xl mx-auto px-4">
            A mathematical puzzle game based on Dr. Alex McDonough&apos;s research into 
            group theory and complex number operations on pentagon configurations.
          </p>
        </header>
        
        <PentagonGame />
        
        <footer className="text-center mt-8 md:mt-12 text-slate-400 space-y-2">
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
  );
}
