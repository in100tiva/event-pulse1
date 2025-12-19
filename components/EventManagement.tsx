import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { showToast } from '../src/utils/toast';
import EventStats from './EventStats';

type TabType = 'confirmations' | 'suggestions' | 'polls' | 'statistics';

const EventManagement: React.FC = () => {
  const navigate = useNavigate();
  const { shareCode } = useParams<{ shareCode: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('confirmations');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showEmailFilterMenu, setShowEmailFilterMenu] = useState(false);
  const emailMenuRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emailMenuRef.current && !emailMenuRef.current.contains(event.target as Node)) {
        setShowEmailFilterMenu(false);
      }
    };

    if (showEmailFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmailFilterMenu]);

  // Buscar dados reais do Convex
  const event = useQuery(
    api.events.getByShareCode,
    shareCode ? { shareLinkCode: shareCode } : 'skip'
  );
  
  const attendanceList = useQuery(
    api.attendance.getByEvent,
    event ? { eventId: event._id } : 'skip'
  );
  
  const effectiveAttendance = useQuery(
    api.attendance.getEffectiveAttendance,
    event ? { eventId: event._id } : 'skip'
  );
  
  const stats = useQuery(
    api.attendance.getStats,
    event ? { eventId: event._id } : 'skip'
  );

  const checkInStatus = useQuery(
    api.attendance.getCheckInStatus,
    event ? { eventId: event._id } : 'skip'
  );

  const suggestions = useQuery(
    api.suggestions.getByEvent,
    event ? { eventId: event._id } : 'skip'
  );

  const polls = useQuery(
    api.polls.getByEvent,
    event ? { eventId: event._id } : 'skip'
  );

  // Mutations
  const checkInMutation = useMutation(api.attendance.checkIn);
  const updateStatusMutation = useMutation(api.events.updateStatus);
  const updateSuggestionStatus = useMutation(api.suggestions.updateStatus);
  const markSuggestionAnswered = useMutation(api.suggestions.markAsAnswered);
  const togglePollActive = useMutation(api.polls.toggleActive);
  const manualRelease = useMutation(api.attendance.manualReleaseNoShowSlots);

  // Copiar link do evento
  const handleCopyLink = async () => {
    if (!event) return;
    
    const eventUrl = `${window.location.origin}/event/${event.shareLinkCode}`;
    
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
      showToast.error('Não foi possível copiar link');
    }
  };

  // Check-in de participante
  const handleCheckIn = async (confirmationId: Id<"attendanceConfirmations">, currentCheckedIn: boolean) => {
    try {
      await checkInMutation({
        id: confirmationId,
        checkedIn: !currentCheckedIn,
      });
    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
      showToast.error('Não foi possível fazer check-in');
    }
  };

  // Atualizar status do evento
  const handleUpdateStatus = async (status: 'rascunho' | 'publicado' | 'ao_vivo' | 'encerrado') => {
    if (!event) return;
    
    try {
      await updateStatusMutation({
        id: event._id,
        status,
      });
      
      // Se finalizou o evento, voltar para o dashboard
      if (status === 'encerrado') {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showToast.error('Não foi possível atualizar status');
    }
  };

  // Liberar vagas manualmente
  const handleManualRelease = async () => {
    if (!event) return;
    try {
      const result = await manualRelease({ eventId: event._id });
      showToast.success(`${result.releasedCount} vagas liberadas`);
    } catch (error) {
      showToast.error('Erro ao liberar vagas');
    }
  };

  // Formatar tempo
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Exportar CSV
  const handleExportCSV = () => {
    if (!attendanceList || attendanceList.length === 0) {
      showToast.warning('Não há dados para exportar.');
      return;
    }

    const headers = ['Nome', 'Email', 'Status', 'Check-in'];
    const rows = attendanceList.map(a => [
      a.name,
      a.email,
      a.status === 'vou' ? 'Confirmado' : a.status === 'talvez' ? 'Talvez' : 'Recusado',
      a.checkedIn ? 'Sim' : 'Não'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `participantes_${event?.title || 'evento'}.csv`;
    link.click();
  };

  // Enviar email para confirmados com filtro
  const handleSendEmail = (filter: 'todos' | 'presentes' | 'ausentes' = 'todos') => {
    if (!effectiveAttendance || effectiveAttendance.length === 0) {
      showToast.warning('Não há participantes confirmados');
      return;
    }

    let filteredParticipants = effectiveAttendance.filter(a => a.status === 'vou');

    // Aplicar filtro de presença efetiva
    if (filter === 'presentes') {
      filteredParticipants = filteredParticipants.filter(a => a.effectivelyAttended);
    } else if (filter === 'ausentes') {
      filteredParticipants = filteredParticipants.filter(a => !a.effectivelyAttended);
    }

    const emails = filteredParticipants
      .filter(a => a.email)
      .map(a => a.email)
      .join(',');

    if (!emails) {
      const filterLabel = filter === 'presentes' ? 'presentes' : filter === 'ausentes' ? 'ausentes' : 'confirmados';
      showToast.warning(`Nenhum email encontrado nos participantes ${filterLabel}`);
      return;
    }

    // Abrir Gmail em nova aba com os emails pré-preenchidos
    const filterSubject = filter === 'presentes' 
      ? '✅ Parabéns pela participação!' 
      : filter === 'ausentes' 
      ? '⚠️ Sentimos sua falta' 
      : 'Informações';
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emails)}&su=${encodeURIComponent(`Evento: ${event?.title || 'Evento'} - ${filterSubject}`)}`;
    window.open(gmailUrl, '_blank');
    
    const filterLabel = filter === 'presentes' ? 'presentes' : filter === 'ausentes' ? 'ausentes' : 'confirmados';
    showToast.success(`Gmail aberto com ${filteredParticipants.length} emails (${filterLabel})`);
    setShowEmailFilterMenu(false);
  };

  // Loading state
  if (!event) {
    return (
      <div className="bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Carregando evento...</div>
      </div>
    );
  }

  // Helper para mapear status
  const getStatusLabel = (status: string) => {
    const labels = {
      rascunho: 'Rascunho',
      publicado: 'Publicado',
      ao_vivo: 'Ao Vivo',
      encerrado: 'Encerrado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      rascunho: 'bg-gray-700/50 text-gray-300',
      publicado: 'bg-green-900/50 text-green-300',
      ao_vivo: 'bg-blue-900/50 text-blue-300',
      encerrado: 'bg-red-900/50 text-red-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-700/50 text-gray-300';
  };

  const getAttendanceStatusLabel = (status: string) => {
    return status === 'vou' ? 'Confirmado' : status === 'talvez' ? 'Talvez' : 'Recusado';
  };

  const getAttendanceStatusColor = (status: string) => {
    return status === 'vou' 
      ? 'bg-green-900/40 text-green-300 ring-green-600/30'
      : status === 'talvez'
      ? 'bg-blue-900/40 text-blue-300 ring-blue-600/30'
      : 'bg-red-900/40 text-red-300 ring-red-600/30';
  };

  return (
    <div className="bg-background-dark font-display text-text-primary-dark min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-2 sm:px-4 md:px-8 lg:px-16 xl:px-24 flex flex-1 justify-center py-3 sm:py-5">
            <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 sm:gap-4 p-2 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center justify-center rounded-lg h-9 w-9 sm:h-10 sm:w-10 bg-gray-800/50 hover:bg-gray-800 transition-colors flex-shrink-0"
                    title="Voltar ao Dashboard"
                  >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                  </button>
                  <div className="flex flex-col gap-1 sm:gap-2 flex-1 min-w-0">
                    <p className="text-white text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] truncate">{event.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-text-secondary-dark text-sm sm:text-base font-normal leading-normal">Status:</span>
                      <span className={`inline-flex items-center rounded-full px-2 sm:px-2.5 py-0.5 text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => navigate(`/edit-event/${event._id}`)}
                    className="flex flex-1 sm:flex-initial min-w-0 sm:min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 sm:h-10 px-3 sm:px-4 bg-background-dark border border-border-dark text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-gray-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base sm:text-lg">edit</span>
                    <span className="hidden sm:inline truncate">Editar</span>
                  </button>
                  <button 
                    onClick={handleCopyLink}
                    className="flex flex-1 sm:flex-initial min-w-0 sm:min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 sm:h-10 px-3 sm:px-4 bg-primary text-background-dark text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base sm:text-lg">{copySuccess ? 'check' : 'link'}</span>
                    <span className="truncate">{copySuccess ? 'Copiado!' : 'Link'}</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="pb-3 sticky top-0 bg-background-dark z-10 overflow-x-auto">
                <div className="flex border-b border-border-dark px-2 sm:px-4 gap-4 sm:gap-8 min-w-max">
                  <button 
                    onClick={() => setActiveTab('confirmations')}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 cursor-pointer transition-colors whitespace-nowrap ${
                      activeTab === 'confirmations' 
                        ? 'border-b-primary text-primary' 
                        : 'border-b-transparent text-text-secondary-dark hover:text-white'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]">Confirmações</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('suggestions')}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 cursor-pointer transition-colors whitespace-nowrap ${
                      activeTab === 'suggestions' 
                        ? 'border-b-primary text-primary' 
                        : 'border-b-transparent text-text-secondary-dark hover:text-white'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]">Sugestões ({suggestions?.length || 0})</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('polls')}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 cursor-pointer transition-colors whitespace-nowrap ${
                      activeTab === 'polls' 
                        ? 'border-b-primary text-primary' 
                        : 'border-b-transparent text-text-secondary-dark hover:text-white'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]">Enquetes ({polls?.length || 0})</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('statistics')}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 cursor-pointer transition-colors whitespace-nowrap ${
                      activeTab === 'statistics' 
                        ? 'border-b-primary text-primary' 
                        : 'border-b-transparent text-text-secondary-dark hover:text-white'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]">📊 Estatísticas</p>
                  </button>
                </div>
              </div>

              {/* Tab Content: Confirmações */}
              {activeTab === 'confirmations' && (
                <>
                  {/* Card de Check-in */}
                  {event?.requireCheckIn && checkInStatus?.enabled && (
                    <div className="mx-4 mt-4 mb-6 p-4 bg-surface-dark border border-border-dark rounded-lg">
                      <h3 className="text-lg font-bold text-white mb-3">Status do Check-in</h3>
                      
                      {!checkInStatus.isOpen && !checkInStatus.hasPassed && (
                        <p className="text-yellow-400">
                          Check-in abre em: {formatTime(checkInStatus.opensAt)}
                        </p>
                      )}
                      
                      {checkInStatus.isOpen && (
                        <div>
                          <p className="text-green-400 font-bold">CHECK-IN ABERTO</p>
                          <p className="text-gray-400 text-sm">Fecha em: {formatTime(checkInStatus.closesAt)}</p>
                        </div>
                      )}
                      
                      {checkInStatus.hasPassed && (
                        <div className="flex items-center justify-between">
                          <p className="text-red-400">Check-in encerrado</p>
                          <button
                            onClick={handleManualRelease}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                          >
                            Liberar Vagas de No-Shows
                          </button>
                        </div>
                      )}
                      
                      <div className="mt-3 flex gap-4 text-sm">
                        <span className="text-gray-300">
                          Check-in: {stats?.checkedIn || 0} / {stats?.confirmed || 0}
                        </span>
                        <span className="text-gray-300">
                          No-shows: {(stats?.confirmed || 0) - (stats?.checkedIn || 0)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-2 sm:p-4">
                    <div className="flex min-w-0 flex-col gap-2 rounded-xl p-4 sm:p-6 border border-border-dark bg-surface-dark">
                      <p className="text-white text-sm sm:text-base font-medium leading-normal">Confirmados</p>
                      <p className="text-white tracking-light text-2xl sm:text-3xl font-bold leading-tight">{stats?.confirmed || 0}</p>
                    </div>
                    <div className="flex min-w-0 flex-col gap-2 rounded-xl p-4 sm:p-6 border border-border-dark bg-surface-dark">
                      <p className="text-white text-sm sm:text-base font-medium leading-normal">Talvez</p>
                      <p className="text-white tracking-light text-2xl sm:text-3xl font-bold leading-tight">{stats?.maybe || 0}</p>
                    </div>
                    <div className="flex min-w-0 flex-col gap-2 rounded-xl p-4 sm:p-6 border border-border-dark bg-surface-dark sm:col-span-2 lg:col-span-1">
                      <p className="text-white text-sm sm:text-base font-medium leading-normal">Recusados</p>
                      <p className="text-white tracking-light text-2xl sm:text-3xl font-bold leading-tight">{stats?.declined || 0}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 px-2 sm:px-4 py-3">
                    <div className="relative" ref={emailMenuRef}>
                      <button 
                        onClick={() => setShowEmailFilterMenu(!showEmailFilterMenu)}
                        className="flex items-center justify-center gap-2 min-w-[84px] max-w-[480px] cursor-pointer overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">mail</span>
                        <span className="truncate">Enviar Email</span>
                        <span className="material-symbols-outlined text-lg">{showEmailFilterMenu ? 'expand_less' : 'expand_more'}</span>
                      </button>
                      
                      {/* Dropdown Menu */}
                      {showEmailFilterMenu && (
                        <div className="absolute right-0 mt-2 w-64 rounded-lg bg-surface-dark border border-border-dark shadow-xl z-10">
                          <div className="p-2">
                            <button
                              onClick={() => handleSendEmail('todos')}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-blue-400">group</span>
                              <div className="flex-1">
                                <p className="text-sm font-semibold">Todos Confirmados</p>
                                <p className="text-xs text-gray-400">Enviar para todos</p>
                              </div>
                            </button>
                            
                            <button
                              onClick={() => handleSendEmail('presentes')}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-green-400">check_circle</span>
                              <div className="flex-1">
                                <p className="text-sm font-semibold">Apenas Presentes</p>
                                <p className="text-xs text-gray-400">Participação ≥ 70%</p>
                              </div>
                            </button>
                            
                            <button
                              onClick={() => handleSendEmail('ausentes')}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-red-400">cancel</span>
                              <div className="flex-1">
                                <p className="text-sm font-semibold">Apenas Ausentes</p>
                                <p className="text-xs text-gray-400">Participação &lt; 70%</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={handleExportCSV}
                      className="flex items-center justify-center gap-2 min-w-[84px] max-w-[480px] cursor-pointer overflow-hidden rounded-lg h-10 px-4 bg-surface-dark text-white text-sm font-bold leading-normal tracking-[0.015em] border border-border-dark hover:bg-gray-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">download</span>
                      <span className="truncate">Exportar CSV</span>
                    </button>
                  </div>

                  {/* Table */}
                  <div className="px-2 sm:px-4 py-3">
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden rounded-xl border border-border-dark bg-surface-dark">
                          <table className="min-w-full divide-y divide-border-dark">
                            <thead className="bg-surface-dark">
                              <tr>
                                <th className="px-3 sm:px-4 py-3 text-left text-text-secondary-dark text-xs sm:text-sm font-medium leading-normal whitespace-nowrap">Nome</th>
                                <th className="px-3 sm:px-4 py-3 text-left text-text-secondary-dark text-xs sm:text-sm font-medium leading-normal whitespace-nowrap">Email</th>
                                <th className="px-3 sm:px-4 py-3 text-left text-text-secondary-dark text-xs sm:text-sm font-medium leading-normal whitespace-nowrap">Status</th>
                                <th className="px-3 sm:px-4 py-3 text-center text-text-secondary-dark text-xs sm:text-sm font-medium leading-normal whitespace-nowrap">Check-in</th>
                                <th className="px-3 sm:px-4 py-3 text-center text-text-secondary-dark text-xs sm:text-sm font-medium leading-normal whitespace-nowrap">Presença Efetiva</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-dark bg-surface-dark">
                              {effectiveAttendance && effectiveAttendance.length > 0 ? (
                                effectiveAttendance
                                  .filter(att => att.status === 'vou') // Mostrar apenas confirmados
                                  .map((attendance) => (
                                  <tr key={attendance._id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-white text-xs sm:text-sm font-normal leading-normal">
                                      <div className="max-w-[120px] sm:max-w-none truncate">{attendance.name}</div>
                                    </td>
                                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-text-secondary-dark text-xs sm:text-sm font-normal leading-normal">
                                      <div className="max-w-[150px] sm:max-w-none truncate">{attendance.email}</div>
                                    </td>
                                    <td className="px-3 sm:px-4 py-2 sm:py-3">
                                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getAttendanceStatusColor(attendance.status)} whitespace-nowrap`}>
                                        {getAttendanceStatusLabel(attendance.status)}
                                      </span>
                                    </td>
                                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                                      <input 
                                        type="checkbox" 
                                        checked={attendance.checkedIn}
                                        onChange={() => handleCheckIn(attendance._id, attendance.checkedIn)}
                                        className="h-4 w-4 sm:h-5 sm:w-5 rounded border-[#4a6353] border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 focus:border-primary cursor-pointer" 
                                      />
                                    </td>
                                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                                      {attendance.totalPolls > 0 ? (
                                        <div className="flex flex-col items-center gap-1">
                                          {attendance.effectivelyAttended ? (
                                            <span className="inline-flex items-center gap-1 text-green-400 font-semibold text-xs sm:text-sm whitespace-nowrap">
                                              <span className="material-symbols-outlined text-base sm:text-lg">check_circle</span>
                                              <span className="hidden sm:inline">Presente</span>
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-xs sm:text-sm whitespace-nowrap">
                                              <span className="material-symbols-outlined text-base sm:text-lg">cancel</span>
                                              <span className="hidden sm:inline">Ausente</span>
                                            </span>
                                          )}
                                          <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {attendance.pollsParticipated}/{attendance.totalPolls} ({attendance.pollParticipationRate}%)
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-xs text-gray-500">Sem enquetes</span>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5} className="px-3 sm:px-4 py-8 text-center text-text-secondary-dark text-sm">
                                    Nenhuma confirmação ainda
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Tab Content: Sugestões */}
              {activeTab === 'suggestions' && (
                <div className="px-4 py-3">
                  {suggestions && suggestions.length > 0 ? (
                    <div className="space-y-3">
                      {suggestions.map((suggestion) => (
                        <div key={suggestion._id} className="p-4 rounded-lg border border-border-dark bg-surface-dark">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="text-white text-base">{suggestion.content}</p>
                              <p className="text-text-secondary-dark text-sm mt-1">
                                {suggestion.isAnonymous ? 'Anônimo' : suggestion.authorName || 'Sem nome'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <span className="flex items-center gap-1 text-primary">
                                <span className="material-symbols-outlined text-lg">thumb_up</span>
                                <span className="text-sm">{suggestion.votesCount}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              suggestion.status === 'aprovada' ? 'bg-green-900/50 text-green-300' :
                              suggestion.status === 'pendente' ? 'bg-yellow-900/50 text-yellow-300' :
                              'bg-red-900/50 text-red-300'
                            }`}>
                              {suggestion.status === 'aprovada' ? 'Aprovada' : suggestion.status === 'pendente' ? 'Pendente' : 'Rejeitada'}
                            </span>
                            {suggestion.isAnswered && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-900/50 text-blue-300">
                                Respondida
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 mt-3">
                            {suggestion.status === 'pendente' && (
                              <>
                                <button
                                  onClick={() => updateSuggestionStatus({ id: suggestion._id, status: 'aprovada' })}
                                  className="text-xs px-3 py-1 bg-green-900/50 hover:bg-green-800/50 text-green-300 rounded transition-colors"
                                >
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => updateSuggestionStatus({ id: suggestion._id, status: 'rejeitada' })}
                                  className="text-xs px-3 py-1 bg-red-900/50 hover:bg-red-800/50 text-red-300 rounded transition-colors"
                                >
                                  Rejeitar
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => markSuggestionAnswered({ id: suggestion._id, isAnswered: !suggestion.isAnswered })}
                              className="text-xs px-3 py-1 bg-blue-900/50 hover:bg-blue-800/50 text-blue-300 rounded transition-colors"
                            >
                              {suggestion.isAnswered ? 'Marcar como não respondida' : 'Marcar como respondida'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-text-secondary-dark">
                      Nenhuma sugestão ainda
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: Enquetes */}
              {activeTab === 'polls' && (
                <div className="px-4 py-3">
                  {polls && polls.length > 0 ? (
                    <div className="space-y-4">
                      {polls.map((poll) => (
                        <div key={poll._id} className="p-4 rounded-lg border border-border-dark bg-surface-dark">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-white text-lg font-bold">{poll.question}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              poll.isActive ? 'bg-green-900/50 text-green-300' : 'bg-gray-700/50 text-gray-300'
                            }`}>
                              {poll.isActive ? 'Ativa' : 'Inativa'}
                            </span>
                          </div>
                          <div className="space-y-2 mb-3">
                            {poll.options?.map((option) => (
                              <div key={option._id} className="flex items-center justify-between text-sm">
                                <span className="text-white">{option.optionText}</span>
                                <span className="text-primary font-bold">{option.votesCount} votos</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-border-dark">
                            <p className="text-text-secondary-dark text-sm">
                              Total de votos: {poll.totalVotes}
                            </p>
                            <button
                              onClick={() => togglePollActive({ id: poll._id, isActive: !poll.isActive })}
                              className={`text-xs px-3 py-1 rounded transition-colors ${
                                poll.isActive 
                                  ? 'bg-red-900/50 hover:bg-red-800/50 text-red-300' 
                                  : 'bg-green-900/50 hover:bg-green-800/50 text-green-300'
                              }`}
                            >
                              {poll.isActive ? 'Desativar' : 'Ativar'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-text-secondary-dark">
                      Nenhuma enquete criada ainda
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: Estatísticas */}
              {activeTab === 'statistics' && event && (
                <EventStats eventId={event._id} />
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 w-full bg-surface-dark/95 backdrop-blur-sm border-t border-border-dark p-3 sm:p-4 z-20">
            <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 sm:gap-4">
              <button 
                onClick={() => handleUpdateStatus('encerrado')}
                disabled={event.status === 'encerrado'}
                className="flex min-w-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-12 px-4 sm:px-6 bg-red-900/80 hover:bg-red-800 text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">stop_circle</span>
                <span className="truncate">Finalizar Evento</span>
              </button>
              <button 
                onClick={() => {
                  handleUpdateStatus('ao_vivo');
                  navigate(`/projection/${event.shareLinkCode}`);
                }}
                disabled={event.status === 'encerrado'}
                className="flex min-w-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 sm:h-12 px-4 sm:px-6 bg-primary text-background-dark text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">play_circle</span>
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