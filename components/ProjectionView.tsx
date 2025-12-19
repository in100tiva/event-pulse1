import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { showToast } from '../src/utils/toast';

// Componente de Contador Regressivo
const PollTimer: React.FC<{ expiresAt: number }> = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = timeLeft > 0 ? 100 : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        <svg className="transform -rotate-90" width="96" height="96">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="#374151"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke={timeLeft <= 10 ? '#ef4444' : timeLeft <= 30 ? '#f59e0b' : '#22c55e'}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400' : timeLeft <= 30 ? 'text-yellow-400' : 'text-green-400'}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-400">
        {timeLeft > 0 ? 'Tempo restante' : 'Enquete encerrada'}
      </p>
    </div>
  );
};

const ProjectionView: React.FC = () => {
  const navigate = useNavigate();
  const { shareCode } = useParams<{ shareCode: string }>();
  const [viewMode, setViewMode] = useState<'Sugestões' | 'Enquete'>('Sugestões');
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [timerDuration, setTimerDuration] = useState<number | undefined>(undefined);

  // Buscar dados reais do Convex
  const event = useQuery(
    api.events.getByShareCode,
    shareCode ? { shareLinkCode: shareCode } : 'skip'
  );
  
  const suggestions = useQuery(
    api.suggestions.getApprovedByEvent,
    event ? { eventId: event._id } : 'skip'
  );

  const activePoll = useQuery(
    api.polls.getActivePoll,
    event ? { eventId: event._id } : 'skip'
  );

  const allPolls = useQuery(
    api.polls.getByEvent,
    event ? { eventId: event._id } : 'skip'
  );

  // Mutations
  const createPoll = useMutation(api.polls.create);
  const togglePollActive = useMutation(api.polls.toggleActive);

  // Handlers
  const handleCreatePoll = async () => {
    if (!event || !pollQuestion.trim()) {
      showToast.warning('Preencha a pergunta da enquete');
      return;
    }

    const validOptions = pollOptions.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      showToast.warning('Adicione pelo menos 2 opções');
      return;
    }

    try {
      await createPoll({
        eventId: event._id,
        question: pollQuestion,
        options: validOptions,
        allowMultipleChoice: allowMultiple,
        showResultsAutomatically: showResults,
        timerDuration,
      });

      // Reset form
      setPollQuestion('');
      setPollOptions(['', '']);
      setAllowMultiple(false);
      setShowResults(true);
      setTimerDuration(undefined);
      setShowCreatePoll(false);
      setViewMode('Enquete');
    } catch (error) {
      console.error('Erro ao criar enquete:', error);
      showToast.error('Não foi possível criar enquete');
    }
  };

  const handleAddOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Loading state
  if (!event) {
    return (
      <div className="bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Carregando evento...</div>
      </div>
    );
  }

  return (
    <div className="bg-background-dark font-display text-text-primary-dark min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col items-center p-4 sm:p-6 md:p-8">
        
        {/* Top Controls */}
        <header className="w-full max-w-7xl relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/manage/${shareCode}`)}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-dark text-text-secondary-dark transition-colors hover:bg-gray-800"
              >
                <span className="material-symbols-outlined text-3xl">arrow_back</span>
              </button>
              <button 
                onClick={handleToggleFullscreen}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-dark text-text-secondary-dark transition-colors hover:bg-gray-800"
              >
                <span className="material-symbols-outlined text-3xl">fullscreen</span>
              </button>
            </div>

            {/* Toggle */}
            <div className="flex h-14 w-full max-w-md items-center justify-center rounded-xl bg-surface-dark p-1.5 border border-border-dark">
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
            
            <button
              onClick={() => setShowCreatePoll(true)}
              className="flex h-12 items-center gap-2 rounded-lg bg-primary px-4 text-background-dark font-bold hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined">add_circle</span>
              <span className="hidden sm:inline">Nova Enquete</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col items-center justify-center w-full max-w-5xl py-10">
          {viewMode === 'Sugestões' ? (
            <>
              <h1 className="tracking-light text-center text-5xl font-bold leading-tight text-white mb-8">Sugestões mais votadas</h1>
              <div className="w-full grid grid-cols-1 gap-6">
                {suggestions && suggestions.length > 0 ? (
                  suggestions.slice(0, 5).map((suggestion, index) => (
                    <div key={suggestion._id} className="flex items-center gap-6 rounded-xl bg-surface-dark p-8 border border-border-dark shadow-2xl">
                      <p className="text-7xl font-black text-primary">{index + 1}</p>
                      <div className="flex-1">
                        <p className="text-4xl font-bold leading-tight text-white">{suggestion.content}</p>
                        <div className="mt-4 flex items-center gap-8 text-2xl text-text-secondary-dark">
                          <p>{suggestion.isAnonymous ? 'Anônimo' : suggestion.authorName || 'Participante'}</p>
                          <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-3xl">thumb_up</span>
                            <p className="font-bold">{suggestion.votesCount} votos</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-text-secondary-dark">
                    <p className="text-3xl">Nenhuma sugestão aprovada ainda</p>
                    <p className="text-xl mt-4">As sugestões aparecerão aqui quando os participantes enviarem e você aprová-las</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="w-full max-w-4xl">
               <h1 className="tracking-light text-center text-5xl font-bold leading-tight text-white mb-12">Enquete ao Vivo</h1>
               
               {activePoll ? (
                 <>
                   <h2 className="text-3xl font-medium text-center text-text-secondary-dark mb-8">{activePoll.question}</h2>

                   {/* Timer Visual */}
                   {activePoll.expiresAt && (
                     <div className="flex justify-center mb-8">
                       <PollTimer expiresAt={activePoll.expiresAt} />
                     </div>
                   )}

                   <div className="flex flex-col gap-6">
                      {activePoll.options?.map((option) => {
                        const percentage = activePoll.totalVotes > 0 
                          ? Math.round((option.votesCount / activePoll.totalVotes) * 100) 
                          : 0;
                        
                        return (
                          <div key={option._id} className="relative w-full h-24 bg-surface-dark rounded-xl border border-border-dark overflow-hidden flex items-center px-8">
                             <div className="absolute left-0 top-0 h-full bg-primary/20 transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }}></div>
                             <div className="relative z-10 w-full flex justify-between items-center">
                                <span className="text-3xl font-bold text-white">{option.optionText}</span>
                                <span className="text-4xl font-black text-primary">{percentage}%</span>
                             </div>
                          </div>
                        );
                      })}
                   </div>
                   <p className="text-center text-xl text-gray-500 mt-8">Total de votos: {activePoll.totalVotes}</p>
                   
                   <div className="flex justify-center gap-4 mt-8">
                     <button
                       onClick={() => togglePollActive({ id: activePoll._id, isActive: false })}
                       className="px-6 py-3 bg-red-900/50 hover:bg-red-800/50 text-red-300 rounded-lg font-bold transition-colors"
                     >
                       Encerrar Enquete
                     </button>
                   </div>
                 </>
               ) : (
                 <div className="text-center py-20 text-text-secondary-dark">
                   <p className="text-3xl mb-4">Nenhuma enquete ativa</p>
                   <p className="text-xl mb-8">Clique em "Nova Enquete" para criar uma ou ative uma enquete existente</p>
                   
                   {allPolls && allPolls.length > 0 && (
                     <div className="mt-8 space-y-4">
                       <h3 className="text-2xl text-white mb-4">Enquetes Disponíveis:</h3>
                       {allPolls.map((poll) => (
                         <div key={poll._id} className="bg-surface-dark border border-border-dark rounded-lg p-4 flex justify-between items-center">
                           <div className="text-left">
                             <p className="text-white font-bold">{poll.question}</p>
                             <p className="text-sm text-gray-400">{poll.totalVotes} votos</p>
                           </div>
                           <button
                             onClick={() => togglePollActive({ id: poll._id, isActive: true })}
                             className="px-4 py-2 bg-primary hover:bg-primary/90 text-background-dark rounded-lg font-bold transition-colors"
                           >
                             Ativar
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               )}
            </div>
          )}
        </main>


        {/* Modal para Criar Enquete */}
        {showCreatePoll && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-dark border border-border-dark rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-bold text-white mb-6">Criar Nova Enquete</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-base font-medium mb-2">
                    Pergunta da Enquete *
                  </label>
                  <input 
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Ex: Qual a melhor funcionalidade?"
                    className="w-full rounded-lg border border-border-dark bg-background-dark h-14 px-4 text-white placeholder:text-gray-500 focus:outline-0 focus:ring-2 focus:ring-primary/50"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-base font-medium mb-2">
                    Opções de Resposta *
                  </label>
                  <div className="space-y-3">
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Opção ${index + 1}`}
                          className="flex-1 rounded-lg border border-border-dark bg-background-dark h-12 px-4 text-white placeholder:text-gray-500 focus:outline-0 focus:ring-2 focus:ring-primary/50"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            onClick={() => handleRemoveOption(index)}
                            className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-900/50 hover:bg-red-800/50 text-red-300 transition-colors"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {pollOptions.length < 6 && (
                    <button
                      onClick={handleAddOption}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                      <span>Adicionar Opção</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowMultiple}
                      onChange={(e) => setAllowMultiple(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-border-dark bg-transparent text-primary focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-gray-300">Permitir múltipla escolha</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showResults}
                      onChange={(e) => setShowResults(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-border-dark bg-transparent text-primary focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-gray-300">Mostrar resultados automaticamente</span>
                  </label>
                </div>

                <div>
                  <label className="block text-gray-300 text-base font-medium mb-3">
                    Temporizador (Opcional)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={() => setTimerDuration(undefined)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        timerDuration === undefined
                          ? 'bg-primary text-background-dark ring-2 ring-primary'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Sem timer
                    </button>
                    {[30, 60, 90, 120].map((seconds) => (
                      <button
                        key={seconds}
                        type="button"
                        onClick={() => setTimerDuration(seconds)}
                        className={`px-4 py-3 rounded-lg font-medium transition-all ${
                          timerDuration === seconds
                            ? 'bg-primary text-background-dark ring-2 ring-primary'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {seconds}s
                      </button>
                    ))}
                  </div>
                  {timerDuration && (
                    <p className="text-sm text-gray-400 mt-2">
                      ⏱️ A enquete será encerrada automaticamente após {timerDuration} segundos
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <button
                  onClick={() => {
                    setShowCreatePoll(false);
                    setPollQuestion('');
                    setPollOptions(['', '']);
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePoll}
                  disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-background-dark rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar e Ativar Enquete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectionView;