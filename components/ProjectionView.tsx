import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectionView: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'Sugestões' | 'Enquete'>('Sugestões');

  return (
    <div className="bg-dark-bg font-display text-text-primary-dark min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col items-center p-4 sm:p-6 md:p-8">
        
        {/* Top Controls */}
        <header className="w-full max-w-7xl relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(-1)}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-dark-surface text-text-secondary-dark transition-colors hover:bg-[#2A2A2A]"
              >
                <span className="material-symbols-outlined text-3xl">arrow_back</span>
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-lg bg-dark-surface text-text-secondary-dark transition-colors hover:bg-[#2A2A2A]">
                <span className="material-symbols-outlined text-3xl">fullscreen</span>
              </button>
            </div>

            {/* Toggle */}
            <div className="flex h-14 w-full max-w-md items-center justify-center rounded-xl bg-dark-surface p-1.5 border border-border-dark">
              <label className={`flex h-full flex-1 cursor-pointer items-center justify-center rounded-lg px-2 text-lg font-medium leading-normal transition-all ${viewMode === 'Sugestões' ? 'bg-primary text-black shadow-lg' : 'text-text-secondary-dark hover:text-white'}`}>
                <span className="truncate">Sugestões</span>
                <input 
                  className="invisible w-0 absolute" 
                  name="view-mode" 
                  type="radio" 
                  checked={viewMode === 'Sugestões'}
                  onChange={() => setViewMode('Sugestões')}
                />
              </label>
              <label className={`flex h-full flex-1 cursor-pointer items-center justify-center rounded-lg px-2 text-lg font-medium leading-normal transition-all ${viewMode === 'Enquete' ? 'bg-primary text-black shadow-lg' : 'text-text-secondary-dark hover:text-white'}`}>
                <span className="truncate">Enquete</span>
                <input 
                  className="invisible w-0 absolute" 
                  name="view-mode" 
                  type="radio" 
                  checked={viewMode === 'Enquete'}
                  onChange={() => setViewMode('Enquete')}
                />
              </label>
            </div>
            
            <div className="w-28 flex-shrink-0"></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col items-center justify-center w-full max-w-5xl py-10">
          {viewMode === 'Sugestões' ? (
            <>
              <h1 className="tracking-light text-center text-5xl font-bold leading-tight text-white mb-8">Sugestões mais votadas</h1>
              <div className="w-full grid grid-cols-1 gap-6">
                {[
                  { rank: 1, text: "Adicionar uma sessão de Q&A com os palestrantes no final.", author: "Ana Silva", votes: 123 },
                  { rank: 2, text: "Disponibilizar os slides das apresentações para download.", author: "Carlos Pereira", votes: 98 },
                  { rank: 3, text: "Mais opções de comida vegetariana no coffee break.", author: "Mariana Costa", votes: 75 },
                ].map((item) => (
                  <div key={item.rank} className="flex items-center gap-6 rounded-xl bg-dark-surface p-8 border border-border-dark shadow-2xl">
                    <p className="text-7xl font-black text-primary">{item.rank}</p>
                    <div className="flex-1">
                      <p className="text-4xl font-bold leading-tight text-white">{item.text}</p>
                      <div className="mt-4 flex items-center gap-8 text-2xl text-text-secondary-dark">
                        <p>{item.author}</p>
                        <div className="flex items-center gap-2 text-primary">
                          <span className="material-symbols-outlined text-3xl">thumb_up</span>
                          <p className="font-bold">{item.votes} votos</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="w-full max-w-4xl">
               <h1 className="tracking-light text-center text-5xl font-bold leading-tight text-white mb-12">Enquete ao Vivo</h1>
               <h2 className="text-3xl font-medium text-center text-text-secondary-dark mb-8">Qual tecnologia vai impactar mais o mercado em 2025?</h2>
               
               <div className="flex flex-col gap-6">
                  {[
                    { label: "Inteligência Artificial Generativa", percent: 72 },
                    { label: "Computação Quântica", percent: 18 },
                    { label: "Realidade Aumentada", percent: 10 }
                  ].map((opt, i) => (
                    <div key={i} className="relative w-full h-24 bg-dark-surface rounded-xl border border-border-dark overflow-hidden flex items-center px-8">
                       <div className="absolute left-0 top-0 h-full bg-primary/20 transition-all duration-1000 ease-out" style={{ width: `${opt.percent}%` }}></div>
                       <div className="relative z-10 w-full flex justify-between items-center">
                          <span className="text-3xl font-bold text-white">{opt.label}</span>
                          <span className="text-4xl font-black text-primary">{opt.percent}%</span>
                       </div>
                    </div>
                  ))}
               </div>
               <p className="text-center text-xl text-gray-500 mt-8">Total de votos: 342</p>
            </div>
          )}
        </main>

        {/* QR Code Footer */}
        <footer className="absolute bottom-8 right-8 animate-fade-in-up">
          <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-4 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <img 
              className="h-40 w-40 rounded-lg mix-blend-multiply" 
              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://eventpulse.app/vote" 
              alt="QR Code to access the voting page" 
            />
            <p className="text-xl font-black text-black uppercase tracking-wider">Vote agora!</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ProjectionView;