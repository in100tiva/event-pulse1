import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { useUser, useOrganization, useClerk } from '@clerk/clerk-react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    ao_vivo: 'bg-green-900/50 text-green-300',
    publicado: 'bg-green-900/50 text-green-300',
    encerrado: 'bg-gray-700/50 text-gray-400',
    rascunho: 'bg-gray-700/50 text-gray-400',
  };

  const dotColor: Record<string, string> = {
    ao_vivo: 'bg-green-500 animate-pulse',
    publicado: 'bg-green-500',
    encerrado: 'bg-gray-500',
    rascunho: 'bg-gray-500',
  };

  const labels: Record<string, string> = {
    ao_vivo: 'Ao Vivo',
    publicado: 'Publicado',
    encerrado: 'Encerrado',
    rascunho: 'Rascunho',
  };

  return (
    <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      <div className={`size-2 rounded-full ${dotColor[status]}`}></div>
      {labels[status] || status}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { organization } = useOrganization();
  const { signOut } = useClerk();
  
  const [showCreateOrgModal, setShowCreateOrgModal] = React.useState(false);
  const [newOrgName, setNewOrgName] = React.useState('');
  const [isCreatingOrg, setIsCreatingOrg] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'publicados' | 'ao_vivo' | 'encerrados' | 'waitlist'>('publicados');

  // Sincronizar usuário com Convex
  const syncUser = useMutation(api.users.syncUser);
  const syncOrganization = useMutation(api.users.syncOrganization);
  const createOrganization = useMutation(api.users.createOrganization);

  // Buscar organizações e eventos
  const userOrganizations = useQuery(api.users.getUserOrganizations);
  
  // Buscar organização do Convex pelo clerkId se estivermos em uma organização do Clerk
  const currentClerkOrg = useQuery(
    api.users.getOrganizationByClerkId,
    organization?.id ? { clerkId: organization.id } : "skip"
  );
  
  // Usar a organização do Clerk (convertida para Convex ID) ou a primeira organização do usuário
  const currentOrgId = currentClerkOrg?._id || userOrganizations?.[0]?._id;
  
  const events = useQuery(
    api.events.getByOrganization, 
    currentOrgId ? { organizationId: currentOrgId } : "skip"
  );

  // Buscar leads de lista de espera da organização
  const waitlistLeads = useQuery(
    api.waitlist.getByOrganization,
    currentOrgId ? { organizationId: currentOrgId } : "skip"
  );

  // Sincronizar dados do Clerk ao montar
  useEffect(() => {
    if (user) {
      syncUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        avatarUrl: user.imageUrl || undefined,
      });
    }
  }, [user, syncUser]);

  useEffect(() => {
    if (organization) {
      syncOrganization({
        clerkId: organization.id,
        name: organization.name,
      });
    }
  }, [organization, syncOrganization]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleCreateOrganization = async () => {
    if (!user) {
      alert('Usuário não encontrado');
      return;
    }

    if (!newOrgName.trim()) {
      alert('Por favor, insira um nome para a organização');
      return;
    }

    setIsCreatingOrg(true);
    try {
      await createOrganization({
        name: newOrgName,
        clerkId: `org_${Date.now()}_${user.id}`,
      });

      alert('Organização criada com sucesso!');
      setShowCreateOrgModal(false);
      setNewOrgName('');
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      alert('Erro ao criar organização. Verifique o console.');
    } finally {
      setIsCreatingOrg(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-dark text-text-primary-dark">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1 px-4 md:px-8">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-border-dark py-4">
              <div className="flex items-center gap-4 text-white">
                <div className="size-6 text-primary">
                  <span className="material-symbols-outlined text-3xl">heart_check</span>
                </div>
                <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">EventPulse</h2>
              </div>
              <div className="flex flex-1 justify-center items-center gap-2">
                <button className="flex items-center gap-2 rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors">
                  <span className="text-sm font-medium">
                    {organization?.name || userOrganizations?.[0]?.name || 'Minha Organização'}
                  </span>
                  <span className="material-symbols-outlined text-base">unfold_more</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-gray-800/50 hover:bg-gray-800 transition-colors">
                  <span className="material-symbols-outlined">settings</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center rounded-lg h-10 w-10 bg-gray-800/50 hover:bg-gray-800 transition-colors"
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>
                <div 
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-border-dark" 
                  style={{ backgroundImage: `url("${user?.imageUrl || 'https://picsum.photos/seed/avatar/200/200'}")` }}
                ></div>
              </div>
            </header>

            <main className="flex-1 py-8">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <p className="text-4xl font-black leading-tight tracking-[-0.033em] text-white">
                  Bem-vindo, {user?.firstName || 'Organizador'}!
                </p>
                <button 
                  onClick={() => navigate('/create-event')}
                  className="flex items-center justify-center rounded-lg h-12 px-6 bg-primary text-black text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity gap-2"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  <span className="truncate">Criar Novo Evento</span>
                </button>
              </div>

              {/* Aviso quando não há organizações */}
              {userOrganizations !== undefined && userOrganizations.length === 0 && (
                <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-yellow-300 text-2xl">info</span>
                    <div className="flex-1">
                      <p className="text-yellow-300 font-semibold mb-1">Você precisa de uma organização para começar</p>
                      <p className="text-yellow-200/80 text-sm mb-3">
                        Para criar eventos, você precisa estar em uma organização. Crie a sua agora!
                      </p>
                      <button
                        onClick={() => setShowCreateOrgModal(true)}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-background-dark rounded-lg font-bold transition-colors"
                      >
                        ➕ Criar Minha Organização
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs de Eventos */}
              <div className="flex border-b border-border-dark mb-6 gap-8">
                <button
                  onClick={() => setActiveTab('publicados')}
                  className={`flex items-center gap-2 pb-3 pt-2 border-b-2 transition-colors ${
                    activeTab === 'publicados'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">public</span>
                  <span className="font-bold">Publicados</span>
                  {events && (
                    <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                      {events.filter(e => e.status === 'publicado').length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('ao_vivo')}
                  className={`flex items-center gap-2 pb-3 pt-2 border-b-2 transition-colors ${
                    activeTab === 'ao_vivo'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">play_circle</span>
                  <span className="font-bold">Ao Vivo</span>
                  {events && (
                    <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                      {events.filter(e => e.status === 'ao_vivo').length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('encerrados')}
                  className={`flex items-center gap-2 pb-3 pt-2 border-b-2 transition-colors ${
                    activeTab === 'encerrados'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  <span className="font-bold">Encerrados</span>
                  {events && (
                    <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                      {events.filter(e => e.status === 'encerrado').length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('waitlist')}
                  className={`flex items-center gap-2 pb-3 pt-2 border-b-2 transition-colors ${
                    activeTab === 'waitlist'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">group_add</span>
                  <span className="font-bold">Lista de Espera</span>
                  {waitlistLeads && (
                    <span className="text-xs bg-yellow-600/20 px-2 py-0.5 rounded-full text-yellow-300">
                      {waitlistLeads.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Conteúdo das Abas de Eventos */}
              {activeTab !== 'waitlist' && (
                <>
                  {events === undefined ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="text-gray-400">Carregando eventos...</div>
                    </div>
                  ) : events.filter(e => e.status === activeTab || (activeTab === 'publicados' && e.status === 'publicado')).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events
                        .filter(e => e.status === activeTab || (activeTab === 'publicados' && e.status === 'publicado'))
                        .map((event) => (
                    <div 
                      key={event._id}
                      onClick={() => navigate(`/manage/${event.shareLinkCode}`)}
                      className="flex flex-col gap-4 p-5 rounded-xl bg-surface-dark border border-border-dark hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer hover:border-primary/50 group"
                    >
                      <div 
                        className="w-full bg-center bg-no-repeat aspect-[16/9] bg-cover rounded-lg overflow-hidden relative" 
                        style={{ 
                          backgroundImage: `url("${event.imageUrl || `https://picsum.photos/seed/${event._id}/800/450`}")` 
                        }}
                      >
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                      </div>
                      <div>
                        <p className="text-lg font-bold leading-normal text-white">{event.title}</p>
                        <p className="text-sm font-normal leading-normal text-gray-400 mb-3">
                          {formatDate(event.startDateTime)}
                        </p>
                        <div className="flex items-center gap-2 mb-4">
                          <StatusBadge status={event.status} />
                          {event.isOnline ? (
                            <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full">Online</span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full">Presencial</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-300">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-primary">groups</span>
                            <span>{event.rsvps || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-primary">lightbulb</span>
                            <span>{event.suggestions || 0}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-primary">poll</span>
                            <span>{event.polls || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                        ))}
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center text-center py-20 px-6 rounded-xl bg-surface-dark border-2 border-dashed border-border-dark mt-6">
                      <div className="w-20 h-20 flex items-center justify-center bg-gray-800/50 rounded-full mb-6">
                        <span className="material-symbols-outlined text-4xl text-primary">event</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">
                        {activeTab === 'publicados' && 'Nenhum evento publicado'}
                        {activeTab === 'ao_vivo' && 'Nenhum evento ao vivo'}
                        {activeTab === 'encerrados' && 'Nenhum evento encerrado'}
                      </h3>
                      <p className="text-gray-400 max-w-sm">
                        {activeTab === 'publicados' && 'Publique um evento para que as pessoas possam confirmar presença.'}
                        {activeTab === 'ao_vivo' && 'Inicie um evento para interagir com os participantes em tempo real.'}
                        {activeTab === 'encerrados' && 'Eventos encerrados aparecerão aqui.'}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Conteúdo da Aba Lista de Espera */}
              {activeTab === 'waitlist' && (
                <>
                  {waitlistLeads && Array.isArray(waitlistLeads) && waitlistLeads.length > 0 ? (
                <div className="mt-12">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-white">
                        Leads de Lista de Espera
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">
                        Pessoas interessadas que não conseguiram vaga nos eventos
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
                      <span className="material-symbols-outlined text-yellow-300">groups</span>
                      <span className="text-yellow-300 font-bold">{waitlistLeads.length} leads</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border-dark bg-surface-dark overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-background-dark/50 border-b border-border-dark">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Nome
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              WhatsApp
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Evento
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Data de Cadastro
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark">
                          {waitlistLeads.map((lead) => (
                            <tr key={lead._id} className="hover:bg-background-dark/30 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-white">{lead.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-300">{lead.whatsapp}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(lead.whatsapp);
                                      alert('WhatsApp copiado!');
                                    }}
                                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                                    title="Copiar WhatsApp"
                                  >
                                    <span className="material-symbols-outlined text-sm text-gray-400">content_copy</span>
                                  </button>
                                  <a
                                    href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 hover:bg-green-700 rounded transition-colors"
                                    title="Abrir no WhatsApp"
                                  >
                                    <span className="material-symbols-outlined text-sm text-green-400">chat</span>
                                  </a>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-white">{lead.eventTitle}</div>
                                <div className="text-xs text-gray-400">
                                  {new Date(lead.eventStartDateTime).toLocaleDateString('pt-BR')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-300">
                                  {new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {new Date(lead.createdAt).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <button
                                  disabled
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-700/50 text-gray-400 text-xs font-medium rounded cursor-not-allowed opacity-50"
                                  title="Notificação automática em breve"
                                >
                                  <span className="material-symbols-outlined text-sm">notifications</span>
                                  Notificar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-blue-300 text-xl">info</span>
                      <div className="flex-1">
                        <p className="text-sm text-blue-200 font-medium">Sobre os Leads</p>
                        <p className="text-xs text-blue-300/80 mt-1">
                          Esses são contatos de pessoas que tentaram confirmar presença mas o evento já estava lotado. 
                          Use os dados para notificá-los sobre próximos eventos ou caso surjam novas vagas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center text-center py-20 px-6 rounded-xl bg-surface-dark border-2 border-dashed border-border-dark">
                      <div className="w-20 h-20 flex items-center justify-center bg-gray-800/50 rounded-full mb-6">
                        <span className="material-symbols-outlined text-4xl text-yellow-300">group_add</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">Nenhum lead na lista de espera</h3>
                      <p className="text-gray-400 max-w-sm">
                        Quando os eventos atingirem o limite, as pessoas que tentarem confirmar presença serão adicionadas à lista de espera.
                      </p>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Modal para criar organização */}
      {showCreateOrgModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Criar Nova Organização</h2>
            <p className="text-gray-300 mb-6">
              Para criar eventos, você precisa estar em uma organização. Vamos criar a sua agora!
            </p>
            <label className="flex flex-col mb-6">
              <p className="text-gray-300 text-base font-medium leading-normal pb-2">Nome da Organização *</p>
              <input 
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="ex: Minha Empresa"
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-primary/50 focus:border-primary border border-border-dark bg-[#1a2c20] h-14 placeholder:text-[#61896f] p-[15px] text-base font-normal leading-normal text-white" 
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateOrganization();
                  }
                }}
              />
            </label>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateOrgModal(false);
                  setNewOrgName('');
                }}
                disabled={isCreatingOrg}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateOrganization}
                disabled={isCreatingOrg || !newOrgName.trim()}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-background-dark rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingOrg ? 'Criando...' : 'Criar Organização'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
