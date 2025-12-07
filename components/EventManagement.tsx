import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-dark font-display text-text-primary-dark min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              {/* Header */}
              <div className="flex flex-wrap justify-between items-center gap-4 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Gerenciamento do Evento</p>
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary-dark text-base font-normal leading-normal">Status:</span>
                    <span className="inline-flex items-center rounded-full bg-yellow-900/50 px-2.5 py-0.5 text-xs font-medium text-yellow-300">Rascunho</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate('/create-event')}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background-dark border border-border-dark text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-gray-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    <span className="truncate">Editar Evento</span>
                  </button>
                  <button 
                    onClick={() => navigate('/event/123')}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-dark text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">link</span>
                    <span className="truncate">Copiar Link</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="pb-3 sticky top-0 bg-background-dark z-10">
                <div className="flex border-b border-border-dark px-4 gap-8">
                  <a className="flex flex-col items-center justify-center border-b-[3px] border-b-primary text-primary pb-[13px] pt-4 cursor-pointer">
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Confirmações</p>
                  </a>
                  <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-text-secondary-dark hover:text-white pb-[13px] pt-4 cursor-pointer transition-colors">
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Sugestões</p>
                  </a>
                  <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-text-secondary-dark hover:text-white pb-[13px] pt-4 cursor-pointer transition-colors">
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Enquetes</p>
                  </a>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap gap-4 p-4">
                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-border-dark bg-surface-dark">
                  <p className="text-white text-base font-medium leading-normal">Confirmados</p>
                  <p className="text-white tracking-light text-3xl font-bold leading-tight">128</p>
                </div>
                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-border-dark bg-surface-dark">
                  <p className="text-white text-base font-medium leading-normal">Talvez</p>
                  <p className="text-white tracking-light text-3xl font-bold leading-tight">34</p>
                </div>
                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-border-dark bg-surface-dark">
                  <p className="text-white text-base font-medium leading-normal">Recusados</p>
                  <p className="text-white tracking-light text-3xl font-bold leading-tight">12</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 px-4 py-3">
                <button className="flex items-center justify-center gap-2 min-w-[84px] max-w-[480px] cursor-pointer overflow-hidden rounded-lg h-10 px-4 bg-surface-dark text-white text-sm font-bold leading-normal tracking-[0.015em] border border-border-dark hover:bg-gray-800 transition-colors">
                  <span className="material-symbols-outlined text-lg">download</span>
                  <span className="truncate">Exportar CSV</span>
                </button>
              </div>

              {/* Table */}
              <div className="px-4 py-3 @container">
                <div className="flex overflow-hidden rounded-xl border border-border-dark bg-surface-dark">
                  <table className="flex-1">
                    <thead className="border-b border-b-border-dark">
                      <tr className="bg-surface-dark">
                        <th className="px-4 py-3 text-left text-text-secondary-dark w-auto text-sm font-medium leading-normal">Nome</th>
                        <th className="px-4 py-3 text-left text-text-secondary-dark w-auto text-sm font-medium leading-normal">Email</th>
                        <th className="px-4 py-3 text-left text-text-secondary-dark w-40 text-sm font-medium leading-normal">Status</th>
                        <th className="px-4 py-3 text-center text-text-secondary-dark w-28 text-sm font-medium leading-normal">Check-in</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-dark">
                      {[
                        { name: "Ana Oliveira", email: "ana.o@email.com", status: "Confirmado", color: "green", checked: true },
                        { name: "Bruno Costa", email: "bruno.c@email.com", status: "Confirmado", color: "green", checked: false },
                        { name: "Carla Dias", email: "carla.d@email.com", status: "Talvez", color: "blue", checked: false },
                        { name: "Daniel Martins", email: "daniel.m@email.com", status: "Recusado", color: "red", checked: false },
                      ].map((row, idx) => (
                        <tr key={idx}>
                          <td className="h-[72px] px-4 py-2 w-auto text-white text-sm font-normal leading-normal">{row.name}</td>
                          <td className="h-[72px] px-4 py-2 w-auto text-text-secondary-dark text-sm font-normal leading-normal">{row.email}</td>
                          <td className="h-[72px] px-4 py-2 w-40 text-sm font-normal leading-normal">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              row.color === 'green' ? 'bg-green-900/40 text-green-300 ring-green-600/30' :
                              row.color === 'blue' ? 'bg-blue-900/40 text-blue-300 ring-blue-600/30' :
                              'bg-red-900/40 text-red-300 ring-red-600/30'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="h-[72px] px-4 py-2 w-28 text-center text-sm font-normal leading-normal">
                            <input 
                              type="checkbox" 
                              defaultChecked={row.checked}
                              className="h-5 w-5 rounded border-[#4a6353] border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 focus:border-primary cursor-pointer" 
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 w-full bg-surface-dark/95 backdrop-blur-sm border-t border-border-dark p-4 z-20">
            <div className="max-w-[960px] mx-auto flex justify-end items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-red-900/80 hover:bg-red-800 text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">stop_circle</span>
                <span className="truncate">Finalizar Evento</span>
              </button>
              <button 
                onClick={() => navigate('/projection/123')}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-background-dark text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">play_circle</span>
                <span className="truncate">Iniciar Evento</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagement;