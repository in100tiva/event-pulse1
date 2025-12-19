import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface EventStatsProps {
  eventId: Id<"events">;
}

const EventStats: React.FC<EventStatsProps> = ({ eventId }) => {
  const stats = useQuery(api.events.getEventStats, { eventId });

  if (!stats) {
    return <div className="p-4 text-white">Carregando estatísticas...</div>;
  }

  // Dados para gráfico de barras (top sugestões)
  const topSuggestionsData = stats.suggestions.topSuggestions.map((s, i) => ({
    name: `#${i + 1}`,
    votes: s.votes,
    content: s.content.substring(0, 30) + (s.content.length > 30 ? '...' : ''),
  }));

  return (
    <div className="p-4 space-y-6">
      {/* KPI PRINCIPAL - Participação Efetiva */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary rounded-xl p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary">analytics</span>
            <h2 className="text-2xl font-black text-white">KPI Principal: Participação Efetiva</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-background-dark/50 rounded-lg p-6 border border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-green-400">check_circle</span>
              <p className="text-gray-300 text-sm font-medium">Presentes Efetivos</p>
            </div>
            <p className="text-5xl font-black text-green-400 mt-2">{stats.participation.effectivelyPresent}</p>
            <p className="text-sm text-gray-400 mt-2">
              Participaram de 70%+ das enquetes
            </p>
          </div>

          <div className="bg-background-dark/50 rounded-lg p-6 border border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-red-400">cancel</span>
              <p className="text-gray-300 text-sm font-medium">Ausentes/Baixa Participação</p>
            </div>
            <p className="text-5xl font-black text-red-400 mt-2">{stats.participation.effectivelyAbsent}</p>
            <p className="text-sm text-gray-400 mt-2">
              Participaram de menos de 70% das enquetes
            </p>
          </div>

          <div className="bg-background-dark/50 rounded-lg p-6 border border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-blue-400">percent</span>
              <p className="text-gray-300 text-sm font-medium">Taxa de Participação Real</p>
            </div>
            <p className="text-5xl font-black text-blue-400 mt-2">{stats.participation.effectiveAttendanceRate}%</p>
            <p className="text-sm text-gray-400 mt-2">
              De {stats.participation.confirmed} confirmados
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-400 text-xl">info</span>
            <p className="text-sm text-blue-200">
              <strong>Como é calculado:</strong> Participantes que confirmaram presença e votaram em pelo menos 70% das enquetes criadas durante o evento são considerados "Presentes Efetivos".
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-dark border border-border-dark rounded-lg p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Confirmados</p>
            <span className="material-symbols-outlined text-primary">people</span>
          </div>
          <p className="text-3xl font-bold text-white mt-2">{stats.participation.confirmed}</p>
          {stats.event.limit && (
            <div className="mt-2">
              <p className="text-xs text-gray-400">de {stats.event.limit} vagas</p>
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${stats.participation.occupancyRate}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {stats.event.hasCheckIn && (
          <div className="bg-surface-dark border border-border-dark rounded-lg p-6 hover:border-green-500/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Check-ins</p>
              <span className="material-symbols-outlined text-green-400">how_to_reg</span>
            </div>
            <p className="text-3xl font-bold text-green-400 mt-2">{stats.participation.checkedIn}</p>
            <p className="text-xs text-gray-400 mt-1">{stats.participation.attendanceRate}% de presença</p>
          </div>
        )}

        <div className="bg-surface-dark border border-border-dark rounded-lg p-6 hover:border-purple-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Sugestões</p>
            <span className="material-symbols-outlined text-purple-400">lightbulb</span>
          </div>
          <p className="text-3xl font-bold text-purple-400 mt-2">{stats.suggestions.total}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.suggestions.totalVotes} votos totais</p>
        </div>

        <div className="bg-surface-dark border border-border-dark rounded-lg p-6 hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Enquetes</p>
            <span className="material-symbols-outlined text-blue-400">poll</span>
          </div>
          <p className="text-3xl font-bold text-blue-400 mt-2">{stats.polls.total}</p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.polls.results.reduce((sum, p) => sum + p.totalVotes, 0)} votos totais
          </p>
        </div>
      </div>

      {/* Métricas de Engajamento */}
      <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary">trending_up</span>
          <h3 className="text-lg font-bold text-white">Métricas de Engajamento</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-background-dark rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Taxa de Conversão</p>
            <p className="text-2xl font-bold text-white">
              {stats.participation.total > 0 
                ? Math.round((stats.participation.confirmed / stats.participation.total) * 100)
                : 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.participation.confirmed} confirmaram de {stats.participation.total} respostas
            </p>
          </div>

          <div className="p-4 bg-background-dark rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Taxa de Aprovação de Sugestões</p>
            <p className="text-2xl font-bold text-white">
              {stats.suggestions.total > 0 
                ? Math.round((stats.suggestions.approved / stats.suggestions.total) * 100)
                : 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.suggestions.approved} aprovadas de {stats.suggestions.total}
            </p>
          </div>

          <div className="p-4 bg-background-dark rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Média de Votos por Enquete</p>
            <p className="text-2xl font-bold text-white">
              {stats.polls.total > 0 
                ? Math.round(stats.polls.results.reduce((sum, p) => sum + p.totalVotes, 0) / stats.polls.total)
                : 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.polls.results.reduce((sum, p) => sum + p.totalVotes, 0)} votos em {stats.polls.total} enquetes
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico Unificado de Participação */}
      <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary">analytics</span>
          <h3 className="text-lg font-bold text-white">Visão Geral de Participação</h3>
        </div>
        
        <div className="space-y-4">
          {/* Confirmados */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400 text-lg">check_circle</span>
                <span className="text-white font-semibold">Confirmados</span>
              </div>
              <span className="text-2xl font-bold text-green-400">{stats.participation.confirmed}</span>
            </div>
            <div className="relative w-full h-8 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                style={{ width: `${stats.participation.total > 0 ? (stats.participation.confirmed / stats.participation.total) * 100 : 0}%` }}
              >
                {stats.participation.confirmed > 0 && (
                  <span className="text-white text-sm font-bold">
                    {Math.round((stats.participation.confirmed / stats.participation.total) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Presença Efetiva */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">person_check</span>
                <span className="text-white font-semibold">Presença Efetiva (≥70%)</span>
              </div>
              <span className="text-2xl font-bold text-primary">{stats.participation.effectivelyPresent}</span>
            </div>
            <div className="relative w-full h-8 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-primary to-green-300 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                style={{ width: `${stats.participation.confirmed > 0 ? (stats.participation.effectivelyPresent / stats.participation.confirmed) * 100 : 0}%` }}
              >
                {stats.participation.effectivelyPresent > 0 && (
                  <span className="text-white text-sm font-bold">
                    {stats.participation.effectiveAttendanceRate}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Check-in Manual */}
          {stats.event.hasCheckIn && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-lg">how_to_reg</span>
                  <span className="text-white font-semibold">Check-in Manual</span>
                </div>
                <span className="text-2xl font-bold text-blue-400">{stats.participation.checkedIn}</span>
              </div>
              <div className="relative w-full h-8 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                  style={{ width: `${stats.participation.confirmed > 0 ? (stats.participation.checkedIn / stats.participation.confirmed) * 100 : 0}%` }}
                >
                  {stats.participation.checkedIn > 0 && (
                    <span className="text-white text-sm font-bold">
                      {stats.participation.attendanceRate}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Talvez */}
          {stats.participation.maybe > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-400 text-lg">help</span>
                  <span className="text-white font-semibold">Talvez</span>
                </div>
                <span className="text-2xl font-bold text-yellow-400">{stats.participation.maybe}</span>
              </div>
              <div className="relative w-full h-8 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                  style={{ width: `${stats.participation.total > 0 ? (stats.participation.maybe / stats.participation.total) * 100 : 0}%` }}
                >
                  <span className="text-white text-sm font-bold">
                    {Math.round((stats.participation.maybe / stats.participation.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Ausentes */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400 text-lg">cancel</span>
                <span className="text-white font-semibold">Ausentes (<70%)</span>
              </div>
              <span className="text-2xl font-bold text-red-400">{stats.participation.effectivelyAbsent}</span>
            </div>
            <div className="relative w-full h-8 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                style={{ width: `${stats.participation.confirmed > 0 ? (stats.participation.effectivelyAbsent / stats.participation.confirmed) * 100 : 0}%` }}
              >
                {stats.participation.effectivelyAbsent > 0 && (
                  <span className="text-white text-sm font-bold">
                    {Math.round((stats.participation.effectivelyAbsent / stats.participation.confirmed) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Recusados */}
          {stats.participation.declined > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400 text-lg">block</span>
                  <span className="text-white font-semibold">Recusados</span>
                </div>
                <span className="text-2xl font-bold text-gray-400">{stats.participation.declined}</span>
              </div>
              <div className="relative w-full h-8 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-gradient-to-r from-gray-600 to-gray-500 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                  style={{ width: `${stats.participation.total > 0 ? (stats.participation.declined / stats.participation.total) * 100 : 0}%` }}
                >
                  <span className="text-white text-sm font-bold">
                    {Math.round((stats.participation.declined / stats.participation.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legenda de cores */}
        <div className="mt-6 pt-6 border-t border-border-dark">
          <p className="text-sm text-gray-400 mb-3">📊 Interpretação:</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-gray-300">Confirmados: Total de confirmações</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-gray-300">Presença Efetiva: Participação ≥70% nas enquetes</span>
            </div>
            {stats.event.hasCheckIn && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-gray-300">Check-in: Presença registrada manualmente</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span className="text-gray-300">Ausentes: Participação <70% nas enquetes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras - Top Sugestões */}
      {topSuggestionsData.length > 0 && (
        <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-purple-400">trending_up</span>
            <h3 className="text-lg font-bold text-white">Top Sugestões Mais Votadas</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSuggestionsData}>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2c20', border: '1px solid #2d4a37' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value, name, props) => [value, props.payload.content]}
              />
              <Bar dataKey="votes" fill="#a855f7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detalhes de Sugestões */}
      {stats.suggestions.topSuggestions.length > 0 && (
        <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Top 5 Sugestões</h3>
          <div className="space-y-3">
            {stats.suggestions.topSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-background-dark rounded-lg">
                <span className="text-2xl font-bold text-primary">{index + 1}</span>
                <div className="flex-1">
                  <p className="text-white">{suggestion.content}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {suggestion.votes} votos • {suggestion.isAnonymous ? 'Anônimo' : suggestion.authorName || 'Usuário'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultados de Enquetes */}
      {stats.polls.results.length > 0 && (
        <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-blue-400">poll</span>
            <h3 className="text-lg font-bold text-white">Resultados das Enquetes</h3>
          </div>
          <div className="space-y-6">
            {stats.polls.results.map((poll) => (
              <div key={poll._id} className="space-y-3 p-4 bg-background-dark rounded-lg border border-border-dark/50">
                <p className="font-bold text-white text-lg">{poll.question}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">how_to_vote</span>
                    {poll.totalVotes} votos totais
                  </span>
                  {poll.winner && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <span className="material-symbols-outlined text-base">emoji_events</span>
                      Vencedor: {poll.winner.text}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {poll.options.map((option, idx) => {
                    const percentage = poll.totalVotes > 0 
                      ? Math.round((option.votesCount / poll.totalVotes) * 100)
                      : 0;
                    const isWinner = poll.winner?.text === option.optionText;
                    
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className={`${isWinner ? 'text-yellow-300 font-bold' : 'text-gray-300'} flex items-center gap-1`}>
                            {isWinner && <span className="material-symbols-outlined text-sm">emoji_events</span>}
                            {option.optionText}
                          </span>
                          <span className="text-gray-400 font-semibold">{option.votesCount} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-3 rounded-full transition-all ${isWinner ? 'bg-yellow-500' : 'bg-primary'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.event.hasCheckIn && (
          <div className="bg-surface-dark border border-border-dark rounded-lg p-6 hover:border-red-500/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">No-Shows</p>
              <span className="material-symbols-outlined text-red-400">person_off</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.participation.noShows}</p>
            <p className="text-xs text-gray-400 mt-1">Confirmaram mas não apareceram</p>
          </div>
        )}

        {stats.waitlist.total > 0 && (
          <div className="bg-surface-dark border border-border-dark rounded-lg p-6 hover:border-yellow-500/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Lista de Espera</p>
              <span className="material-symbols-outlined text-yellow-400">schedule</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.waitlist.total}</p>
            <p className="text-xs text-gray-400 mt-1">Pessoas aguardando vaga</p>
          </div>
        )}

        <div className="bg-surface-dark border border-border-dark rounded-lg p-6 hover:border-purple-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Sugestões Aprovadas</p>
            <span className="material-symbols-outlined text-purple-400">check_circle</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{stats.suggestions.approved}</p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.suggestions.answered} respondidas
          </p>
        </div>

        <div className="bg-surface-dark border border-border-dark rounded-lg p-6 hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Engajamento em Enquetes</p>
            <span className="material-symbols-outlined text-blue-400">psychology</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {stats.participation.confirmed > 0 && stats.polls.total > 0
              ? Math.round((stats.polls.results.reduce((sum, p) => sum + p.totalVotes, 0) / (stats.participation.confirmed * stats.polls.total)) * 100)
              : 0}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Taxa média de resposta</p>
        </div>
      </div>

      {/* Mensagem para eventos sem dados */}
      {stats.participation.total === 0 && stats.suggestions.total === 0 && stats.polls.total === 0 && (
        <div className="bg-surface-dark border border-border-dark rounded-lg p-8 text-center">
          <p className="text-gray-400 text-lg">Nenhum dado disponível ainda</p>
          <p className="text-gray-500 text-sm mt-2">As estatísticas aparecerão quando houver participações, sugestões ou enquetes</p>
        </div>
      )}
    </div>
  );
};

export default EventStats;
