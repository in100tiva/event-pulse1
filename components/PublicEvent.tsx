import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

const PublicEvent: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const event = useQuery(api.events.getByShareCode, { shareLinkCode: code || '' });
  const confirmAttendance = useMutation(api.attendance.confirmAttendance);
  const createSuggestion = useMutation(api.suggestions.create);
  const voteSuggestion = useMutation(api.suggestions.vote);
  const votePoll = useMutation(api.polls.vote);
  
  const suggestions = useQuery(
    api.suggestions.getApprovedByEvent,
    event ? { eventId: event._id } : 'skip'
  );
  const activePoll = useQuery(
    api.polls.getActivePoll,
    event ? { eventId: event._id } : 'skip'
  );
  const attendanceStats = useQuery(
    api.attendance.getStats,
    event ? { eventId: event._id } : 'skip'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [suggestionText, setSuggestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [participantId, setParticipantId] = useState('');

  useEffect(() => {
    // Gerar ID único para o participante (baseado em localStorage)
    let id = localStorage.getItem('eventpulse_participant_id');
    if (!id) {
      id = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('eventpulse_participant_id', id);
    }
    setParticipantId(id);
  }, []);

  const handleRSVP = async (status: 'vou' | 'talvez' | 'nao_vou') => {
    if (!event || !name || !email) {
      alert('Por favor, preencha seu nome e email.');
      return;
    }

    try {
      await confirmAttendance({
        eventId: event._id,
        name,
        email,
        status,
      });
      alert('Confirmação registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
      alert('Erro ao confirmar presença. Tente novamente.');
    }
  };

  const handleSubmitSuggestion = async () => {
    if (!event || !suggestionText.trim()) {
      alert('Por favor, escreva sua sugestão.');
      return;
    }

    try {
      await createSuggestion({
        eventId: event._id,
        content: suggestionText,
        authorName: isAnonymous ? undefined : name || undefined,
        isAnonymous,
      });
      setSuggestionText('');
      alert('Sugestão enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error);
      alert('Erro ao enviar sugestão. Tente novamente.');
    }
  };

  const handleVoteSuggestion = async (suggestionId: Id<'suggestions'>) => {
    if (!participantId) return;

    try {
      await voteSuggestion({
        suggestionId,
        participantIdentifier: participantId,
      });
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  const handleVotePoll = async (optionId: Id<'pollOptions'>) => {
    if (!activePoll || !participantId) return;

    try {
      await votePoll({
        pollId: activePoll._id,
        pollOptionId: optionId,
        participantIdentifier: participantId,
      });
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (event === undefined) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-gray-400 text-lg">Carregando evento...</div>
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Evento não encontrado</h1>
          <p className="text-gray-400">O código do evento pode estar incorreto ou o evento foi removido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-dark font-display text-text-primary-dark">
      <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        <main className="flex-grow">
          <div className="px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col items-center">
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
              
              {/* Hero Section */}
              <section className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:justify-between gap-6 md:gap-4 p-4">
                  <div className="flex flex-col gap-3 max-w-2xl">
                    <p className="text-4xl md:text-5xl font-black leading-tight tracking-tighter text-white">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-text-secondary-dark text-lg font-normal leading-normal">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-row md:flex-col gap-4 items-start">
                    <span className="flex items-center gap-2 min-w-[84px] cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 bg-surface-dark text-sm font-bold leading-normal tracking-[0.015em] border border-border-dark text-white">
                      <span className="material-symbols-outlined text-base">
                        {event.isOnline ? 'videocam' : 'location_on'}
                      </span>
                      <span className="truncate">{event.isOnline ? 'Online' : 'Presencial'}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  <div className="flex items-center gap-4 rounded-lg p-4 border border-border-dark bg-surface-dark">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-500/20 text-green-500">
                      <span className="material-symbols-outlined">calendar_month</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-base font-medium leading-normal text-white">Data & Horário</p>
                      <p className="text-text-secondary-dark text-sm font-normal">
                        {formatDate(event.startDateTime)} às {formatTime(event.startDateTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg p-4 border border-border-dark bg-surface-dark">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-500/20 text-green-500">
                      <span className="material-symbols-outlined">
                        {event.isOnline ? 'videocam' : 'location_on'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-base font-medium leading-normal text-white">Local</p>
                      <p className="text-text-secondary-dark text-sm font-normal">
                        {event.isOnline ? 'Online via EventPulse' : event.location || 'A definir'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-2 rounded-lg p-4 border border-border-dark bg-surface-dark">
                    <p className="text-base font-medium leading-normal text-white">Confirmados</p>
                    <div className="flex items-baseline gap-2">
                      <p className="tracking-light text-2xl font-bold leading-tight text-white">
                        {attendanceStats?.confirmed || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* RSVP Form */}
              <section className="bg-surface-dark border border-border-dark rounded-lg p-6">
                <h2 className="text-2xl font-bold leading-tight tracking-tight px-4 pb-4 pt-2 text-white">
                  Você vai participar?
                </h2>
                <div className="flex flex-col md:flex-row md:items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-base font-medium leading-normal pb-2 text-gray-300">Nome completo</p>
                    <input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-dark bg-background-dark focus:border-primary h-12 placeholder:text-gray-500 p-3 text-base font-normal leading-normal" 
                      placeholder="Digite seu nome completo" 
                    />
                  </label>
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-base font-medium leading-normal pb-2 text-gray-300">Email</p>
                    <input 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-dark bg-background-dark focus:border-primary h-12 placeholder:text-gray-500 p-3 text-base font-normal leading-normal" 
                      placeholder="Digite seu email" 
                    />
                  </label>
                </div>
                <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
                  <button 
                    onClick={() => handleRSVP('vou')}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-success text-white text-sm font-bold leading-normal tracking-[0.015em] transition-transform hover:scale-105"
                  >
                    <span className="truncate">Vou</span>
                  </button>
                  <button 
                    onClick={() => handleRSVP('talvez')}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-gray-700 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-transform hover:scale-105 hover:bg-gray-600"
                  >
                    <span className="truncate">Talvez</span>
                  </button>
                  <button 
                    onClick={() => handleRSVP('nao_vou')}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-transparent text-gray-400 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-800 border border-gray-700"
                  >
                    <span className="truncate">Não vou</span>
                  </button>
                </div>
              </section>

              {/* Suggestions Wall */}
              <section className="bg-surface-dark border border-border-dark rounded-lg p-6">
                <h2 className="text-2xl font-bold leading-tight tracking-tight px-4 pb-4 pt-2 text-white">
                  Mural de Sugestões
                </h2>
                <div className="flex flex-col gap-4 px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <textarea 
                      value={suggestionText}
                      onChange={(e) => setSuggestionText(e.target.value)}
                      className="flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-dark bg-background-dark focus:border-primary p-3 text-base font-normal leading-normal" 
                      placeholder="Tem alguma pergunta ou sugestão?" 
                      rows={3}
                    ></textarea>
                    <div className="flex justify-between items-center mt-2">
                      {event.allowAnonymousSuggestions && (
                        <label className="flex items-center gap-2 text-sm text-gray-400">
                          <input 
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="rounded text-success focus:ring-success/50 bg-gray-700 border-border-dark h-4 w-4" 
                            type="checkbox" 
                          />
                          Enviar anonimamente
                        </label>
                      )}
                      <button 
                        onClick={handleSubmitSuggestion}
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-success text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-success/90"
                      >
                        <span className="truncate">Enviar</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-6">
                    {suggestions && suggestions.length > 0 ? (
                      suggestions.map((suggestion) => (
                        <div 
                          key={suggestion._id} 
                          className={`relative flex flex-col md:flex-row items-start gap-4 p-4 border border-border-dark rounded-lg bg-background-dark/50 ${suggestion.isAnswered ? 'border-success' : ''}`}
                        >
                          <div className="flex-grow">
                            <p className="text-base leading-relaxed text-white">{suggestion.content}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              por {suggestion.isAnonymous ? 'Anônimo' : suggestion.authorName || 'Participante'}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-base font-bold text-success">
                              <span className="material-symbols-outlined text-xl">thumb_up</span>
                              <span>{suggestion.votesCount}</span>
                            </div>
                            <button 
                              onClick={() => handleVoteSuggestion(suggestion._id)}
                              className="flex items-center justify-center h-10 w-10 cursor-pointer rounded-full bg-success/10 text-success hover:bg-success/20 transition-colors"
                            >
                              <span className="material-symbols-outlined text-xl">thumb_up</span>
                            </button>
                          </div>
                          {suggestion.isAnswered && (
                            <div className="absolute top-0 right-0 -mt-3 -mr-3 flex items-center gap-1 bg-success text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              <span>Respondida</span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-400 py-8">
                        Seja o primeiro a fazer uma sugestão!
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Live Poll Section */}
              {activePoll && (
                <section className="bg-surface-dark border-2 border-success rounded-lg p-6 shadow-lg shadow-green-900/10">
                  <div className="flex items-center gap-3 px-4 pt-2">
                    <div className="relative flex items-center">
                      <div className="absolute h-2 w-2 rounded-full bg-success"></div>
                      <div className="h-2 w-2 rounded-full bg-success animate-ping"></div>
                    </div>
                    <h2 className="text-2xl font-bold leading-tight tracking-tight text-success">Enquete Ativa</h2>
                  </div>
                  <p className="px-4 text-lg font-medium mt-4 text-white">{activePoll.question}</p>
                  <div className="flex flex-col gap-3 p-4">
                    {activePoll.options.map((option) => {
                      const percentage = activePoll.totalVotes > 0 
                        ? Math.round((option.votesCount / activePoll.totalVotes) * 100) 
                        : 0;
                      
                      return (
                        <button
                          key={option._id}
                          onClick={() => handleVotePoll(option._id)}
                          className="relative w-full rounded-full bg-gray-800 p-1 flex items-center text-sm font-medium h-12 overflow-hidden border border-gray-700 hover:border-success transition-colors"
                        >
                          <div 
                            className="absolute left-0 top-0 h-full rounded-full bg-success/20 transition-all duration-1000" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                          <div className="relative z-10 flex justify-between w-full px-4 items-center text-white">
                            <span>{option.optionText}</span>
                            <span>{percentage}%</span>
                          </div>
                        </button>
                      );
                    })}
                    <p className="text-right text-sm text-gray-400 mt-2">{activePoll.totalVotes} votos</p>
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>
        
        <footer className="w-full py-6 flex justify-center items-center text-center border-t border-border-dark mt-8">
          <p className="text-sm text-gray-500">
            Criado com <a className="font-bold text-success hover:underline" href="#">EventPulse</a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PublicEvent;
