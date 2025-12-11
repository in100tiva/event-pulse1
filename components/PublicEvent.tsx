import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { showToast } from '../src/utils/toast';

const PublicEvent: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const event = useQuery(api.events.getByShareCode, { shareLinkCode: code || '' });
  const confirmAttendance = useMutation(api.attendance.confirmAttendance);
  const createSuggestion = useMutation(api.suggestions.create);
  const voteSuggestion = useMutation(api.suggestions.vote);
  const votePoll = useMutation(api.polls.vote);
  // @ts-ignore - waitlist module will be available after Convex regenerates types
  const addToWaitlist = useMutation((api as any).waitlist?.addToWaitlist);
  
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
  const [votedSuggestions, setVotedSuggestions] = useState<Set<string>>(new Set());
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistName, setWaitlistName] = useState('');
  const [waitlistWhatsapp, setWaitlistWhatsapp] = useState('');
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());
  
  // Verificar se usuário confirmou presença
  const userConfirmation = useQuery(
    api.attendance.hasConfirmedAttendance,
    event && email ? { eventId: event._id, email } : 'skip'
  );

  // Atualizar status de confirmação quando userConfirmation mudar
  useEffect(() => {
    if (userConfirmation !== undefined) {
      setHasConfirmed(userConfirmation);
    }
  }, [userConfirmation]);

  // Verificar se o prazo de confirmação expirou
  const isPastDeadline = event?.confirmationDeadline && Date.now() > event.confirmationDeadline;

  useEffect(() => {
    // Gerar ID único para o participante (baseado em localStorage)
    let id = localStorage.getItem('eventpulse_participant_id');
    if (!id) {
      id = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('eventpulse_participant_id', id);
    }
    setParticipantId(id);

    // Recuperar nome e email salvos
    const savedName = localStorage.getItem('eventpulse_user_name');
    const savedEmail = localStorage.getItem('eventpulse_user_email');
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);

    // Recuperar sugestões votadas para este evento
    const votedKey = `eventpulse_voted_suggestions_${code}`;
    const savedVotes = localStorage.getItem(votedKey);
    if (savedVotes) {
      setVotedSuggestions(new Set(JSON.parse(savedVotes)));
    }

    // Recuperar enquetes votadas para este evento
    const votedPollsKey = `eventpulse_voted_polls_${code}`;
    const savedPollVotes = localStorage.getItem(votedPollsKey);
    if (savedPollVotes) {
      setVotedPolls(new Set(JSON.parse(savedPollVotes)));
    }
  }, [code]);

  const handleRSVP = async (status: 'vou' | 'talvez' | 'nao_vou') => {
    console.log('[PublicEvent] handleRSVP chamado');
    console.log('[PublicEvent] Status:', status);
    console.log('[PublicEvent] Nome:', name);
    console.log('[PublicEvent] Email:', email);
    console.log('[PublicEvent] Limite do evento:', event?.participantLimit);
    
    if (!event || !name || !email) {
      showToast.warning('Por favor, preencha seu nome e email.');
      return;
    }

    // Verificar se usuário já tinha confirmado antes
    const wasAlreadyConfirmed = hasConfirmed && status === 'vou';

    try {
      console.log('[PublicEvent] Enviando confirmação para o Convex...');
      await confirmAttendance({
        eventId: event._id,
        name,
        email,
        status,
      });
      
      console.log('[PublicEvent] Confirmação aceita com sucesso!');
      
      // Salvar nome e email no localStorage para próximas vezes
      localStorage.setItem('eventpulse_user_name', name);
      localStorage.setItem('eventpulse_user_email', email);
      
      // Se confirmou "vou", marcar como confirmado
      if (status === 'vou') {
        setHasConfirmed(true);
      }
      
      // Mensagem diferente se já estava confirmado
      if (wasAlreadyConfirmed) {
        showToast.info('Você já confirmou presença neste evento!');
      } else if (status === 'vou') {
        showToast.success('Confirmação registrada com sucesso!');
      } else if (status === 'talvez') {
        showToast.info('Status atualizado para "Talvez"');
      } else {
        showToast.info('Status atualizado para "Não vou"');
      }
    } catch (error: any) {
      console.error('[PublicEvent] ERRO ao confirmar presença:', error);
      console.error('[PublicEvent] Nome do erro:', error?.name);
      console.error('[PublicEvent] Tipo do erro:', typeof error);
      console.error('[PublicEvent] Mensagem do erro:', error?.message);
      console.error('[PublicEvent] Data do erro:', error?.data);
      console.error('[PublicEvent] Stack:', error?.stack);
      
      // ConvexError retorna os dados em error.data
      const errorMessage = error?.data?.message || error?.message || '';
      const errorCode = error?.data?.code || '';
      const errorString = error?.toString() || '';
      
      console.log('[PublicEvent] errorMessage:', errorMessage);
      console.log('[PublicEvent] errorCode:', errorCode);
      console.log('[PublicEvent] errorString:', errorString);
      
      // Verificar se é erro de prazo encerrado
      const isPrazoEncerrado = errorMessage === 'PRAZO_ENCERRADO' || 
                               errorCode === 'PRAZO_ENCERRADO' ||
                               errorMessage?.includes('PRAZO_ENCERRADO') || 
                               errorString?.includes('PRAZO_ENCERRADO');
      
      if (isPrazoEncerrado) {
        console.log('[PublicEvent] Prazo de confirmação encerrado');
        showToast.error('O prazo para confirmação de presença já encerrou.');
        return;
      }
      
      // Se o evento está lotado, mostrar modal de lista de espera
      const isEventoLotado = errorMessage === 'EVENTO_LOTADO' ||
                            errorCode === 'EVENTO_LOTADO' ||
                            errorMessage?.includes('EVENTO_LOTADO') || 
                            errorString?.includes('EVENTO_LOTADO');
      
      console.log('[PublicEvent] É evento lotado?', isEventoLotado);
      
      if (isEventoLotado) {
        console.log('[PublicEvent] Mostrando modal de lista de espera');
        setWaitlistName(name);
        setWaitlistWhatsapp('');
        setShowWaitlistModal(true);
      } else {
        console.log('[PublicEvent] Mostrando alerta de erro genérico');
        showToast.error(`Erro ao confirmar presença: ${errorMessage || 'Tente novamente.'}`);
      }
    }
  };

  const handleSubmitSuggestion = async () => {
    if (!hasConfirmed) {
      showToast.warning('Você precisa confirmar sua presença no evento para enviar sugestões.');
      return;
    }
    
    if (!event || !suggestionText.trim()) {
      showToast.warning('Por favor, escreva sua sugestão.');
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
      showToast.success('Sugestão enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error);
      showToast.error('Erro ao enviar sugestão. Tente novamente.');
    }
  };

  const handleVoteSuggestion = async (suggestionId: Id<'suggestions'>) => {
    if (!hasConfirmed) {
      showToast.warning('Você precisa confirmar sua presença no evento para votar em sugestões.');
      return;
    }
    
    if (!participantId) return;

    const suggestionIdStr = suggestionId.toString();
    
    // Verificar se já votou nesta sugestão
    if (votedSuggestions.has(suggestionIdStr)) {
      showToast.info('Você já votou nesta sugestão!');
      return;
    }

    try {
      const result = await voteSuggestion({
        suggestionId,
        participantIdentifier: participantId,
      });

      // Se votou com sucesso, adicionar à lista de votadas
      if (result.action === 'voted') {
        const newVoted = new Set(votedSuggestions);
        newVoted.add(suggestionIdStr);
        setVotedSuggestions(newVoted);
        
        // Salvar no localStorage
        const votedKey = `eventpulse_voted_suggestions_${code}`;
        localStorage.setItem(votedKey, JSON.stringify(Array.from(newVoted)));
      }
    } catch (error) {
      console.error('Erro ao votar:', error);
      showToast.error('Erro ao votar. Tente novamente.');
    }
  };

  const handleVotePoll = async (optionId: Id<'pollOptions'>) => {
    if (!hasConfirmed) {
      showToast.warning('Você precisa confirmar sua presença no evento para votar em enquetes.');
      return;
    }
    
    if (!activePoll || !participantId) return;

    // Verificar se já votou nesta enquete
    const pollIdStr = activePoll._id.toString();
    if (votedPolls.has(pollIdStr)) {
      showToast.info('Você já votou nesta enquete!');
      return;
    }

    try {
      await votePoll({
        pollId: activePoll._id,
        pollOptionId: optionId,
        participantIdentifier: participantId,
      });

      // Marcar enquete como votada e salvar no localStorage
      const newVotedPolls = new Set(votedPolls);
      newVotedPolls.add(pollIdStr);
      setVotedPolls(newVotedPolls);
      
      const votedPollsKey = `eventpulse_voted_polls_${code}`;
      localStorage.setItem(votedPollsKey, JSON.stringify(Array.from(newVotedPolls)));
      
      showToast.success('Voto registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao votar:', error);
      showToast.error('Erro ao votar. Tente novamente.');
    }
  };

  const handleJoinWaitlist = async () => {
    if (!event || !waitlistName.trim() || !waitlistWhatsapp.trim()) {
      showToast.warning('Por favor, preencha seu nome e WhatsApp.');
      return;
    }

    // Validar formato básico do WhatsApp
    const whatsappRegex = /^[\d\s\-\+\(\)]+$/;
    if (!whatsappRegex.test(waitlistWhatsapp)) {
      showToast.warning('Por favor, insira um número de WhatsApp válido.');
      return;
    }

    try {
      await addToWaitlist({
        eventId: event._id,
        name: waitlistName,
        whatsapp: waitlistWhatsapp,
      });

      showToast.success('Você foi adicionado à lista de espera! Entraremos em contato caso surjam novas vagas.');
      setShowWaitlistModal(false);
      setWaitlistName('');
      setWaitlistWhatsapp('');
    } catch (error: any) {
      console.error('Erro ao entrar na lista de espera:', error);
      showToast.error(error?.message || 'Erro ao entrar na lista de espera. Tente novamente.');
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

              {/* Badge de Prazo de Confirmação */}
              {event.confirmationDeadline && (
                <section className="bg-surface-dark border border-border-dark rounded-lg p-4">
                  {isPastDeadline ? (
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-red-500 text-2xl">schedule</span>
                      <div>
                        <p className="text-red-400 font-bold">Prazo encerrado</p>
                        <p className="text-gray-400 text-sm">
                          {(() => {
                            const deadlineDate = new Date(event.confirmationDeadline);
                            const isEndOfDay = deadlineDate.getHours() === 23 && deadlineDate.getMinutes() === 59;
                            
                            if (isEndOfDay) {
                              return `As confirmações foram encerradas em ${formatDate(event.confirmationDeadline)}`;
                            } else {
                              return `As confirmações foram encerradas em ${formatDate(event.confirmationDeadline)} às ${formatTime(event.confirmationDeadline)}`;
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-yellow-500 text-2xl">schedule</span>
                      <div>
                        <p className="text-yellow-400 font-bold">
                          {(() => {
                            const deadlineDate = new Date(event.confirmationDeadline);
                            const isEndOfDay = deadlineDate.getHours() === 23 && deadlineDate.getMinutes() === 59;
                            
                            if (isEndOfDay) {
                              return `Confirmações até: ${formatDate(event.confirmationDeadline)}`;
                            } else {
                              return `Confirmações até: ${formatDate(event.confirmationDeadline)} às ${formatTime(event.confirmationDeadline)}`;
                            }
                          })()}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Não perca o prazo para confirmar sua presença!
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              )}

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
                    disabled={isPastDeadline}
                    className={`flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-success text-white text-sm font-bold leading-normal tracking-[0.015em] transition-transform ${isPastDeadline ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                  >
                    <span className="truncate">Vou</span>
                  </button>
                  <button 
                    onClick={() => handleRSVP('talvez')}
                    disabled={isPastDeadline}
                    className={`flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-gray-700 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-transform ${isPastDeadline ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:bg-gray-600'}`}
                  >
                    <span className="truncate">Talvez</span>
                  </button>
                  <button 
                    onClick={() => handleRSVP('nao_vou')}
                    disabled={isPastDeadline}
                    className={`flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-transparent text-gray-400 text-sm font-bold leading-normal tracking-[0.015em] border border-gray-700 ${isPastDeadline ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-800'}`}
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
                      suggestions.map((suggestion) => {
                        const hasVoted = votedSuggestions.has(suggestion._id.toString());
                        return (
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
                                disabled={hasVoted}
                                className={`flex items-center justify-center h-10 w-10 rounded-full transition-colors ${
                                  hasVoted 
                                    ? 'bg-success text-white cursor-not-allowed' 
                                    : 'bg-success/10 text-success hover:bg-success/20 cursor-pointer'
                                }`}
                                title={hasVoted ? 'Você já votou nesta sugestão' : 'Votar nesta sugestão'}
                              >
                                <span className="material-symbols-outlined text-xl">
                                  {hasVoted ? 'check' : 'thumb_up'}
                                </span>
                              </button>
                            </div>
                            {suggestion.isAnswered && (
                              <div className="absolute top-0 right-0 -mt-3 -mr-3 flex items-center gap-1 bg-success text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                <span>Respondida</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-gray-400 py-8">
                        Seja o primeiro a fazer uma sugestão!
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Live Poll Section - Só mostra se não votou ainda */}
              {activePoll && !votedPolls.has(activePoll._id.toString()) && (
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

      {/* Modal de Lista de Espera */}
      {showWaitlistModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-yellow-500 text-4xl">info</span>
              <h2 className="text-2xl font-bold text-white">Evento Lotado</h2>
            </div>
            
            <p className="text-gray-300 mb-6">
              Infelizmente o evento atingiu o limite de participantes. Mas você pode entrar na lista de espera 
              e ser avisado caso surjam novas vagas!
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Nome Completo *
                </label>
                <input 
                  value={waitlistName}
                  onChange={(e) => setWaitlistName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="w-full rounded-lg border border-border-dark bg-background-dark h-12 px-4 text-white placeholder:text-gray-500 focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  WhatsApp (com DDD) *
                </label>
                <input 
                  value={waitlistWhatsapp}
                  onChange={(e) => setWaitlistWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  type="tel"
                  className="w-full rounded-lg border border-border-dark bg-background-dark h-12 px-4 text-white placeholder:text-gray-500 focus:outline-0 focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <p className="text-xs text-gray-400">
                * Entraremos em contato via WhatsApp caso surjam vagas
              </p>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowWaitlistModal(false);
                  setWaitlistName('');
                  setWaitlistWhatsapp('');
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleJoinWaitlist}
                disabled={!waitlistName.trim() || !waitlistWhatsapp.trim()}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-background-dark rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Entrar na Lista de Espera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicEvent;
