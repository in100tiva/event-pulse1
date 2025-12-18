import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface EventStatsProps {
  eventId: Id<"events">;
}

const EventStats: React.FC<EventStatsProps> = ({ eventId }) => {
  const stats = useQuery(api.events.getEventStats, { eventId });

  if (!stats) {
    return <div className="p-4 text-white">Carregando estatísticas...</div>;
  }

  // Dados para gráfico de pizza
  const participationData = [
    { name: 'Confirmados', value: stats.participation.confirmed, color: '#22c55e' },
    { name: 'Talvez', value: stats.participation.maybe, color: '#f59e0b' },
    { name: 'Recusados', value: stats.participation.declined, color: '#ef4444' },
  ].filter(d => d.value > 0);

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

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Distribuição de Status */}
        {participationData.length > 0 && (
          <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">pie_chart</span>
              <h3 className="text-lg font-bold text-white">Distribuição de Respostas</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={participationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {participationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2c20', border: '1px solid #2d4a37' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.participation.confirmed}</p>
                <p className="text-xs text-gray-400">Confirmados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400">{stats.participation.maybe}</p>
                <p className="text-xs text-gray-400">Talvez</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{stats.participation.declined}</p>
                <p className="text-xs text-gray-400">Recusados</p>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico de Comparação - Participação Efetiva vs Check-in */}
        <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">bar_chart</span>
            <h3 className="text-lg font-bold text-white">Comparação de Presença</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { 
                name: 'Confirmados', 
                value: stats.participation.confirmed,
                fill: '#60a5fa'
              },
              { 
                name: 'Check-in Manual', 
                value: stats.participation.checkedIn,
                fill: '#34d399'
              },
              { 
                name: 'Presença Efetiva', 
                value: stats.participation.effectivelyPresent,
                fill: '#22c55e'
              },
              { 
                name: 'Ausentes', 
                value: stats.participation.effectivelyAbsent,
                fill: '#ef4444'
              },
            ]}>
              <XAxis dataKey="name" stroke="#9ca3af" angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2c20', border: '1px solid #2d4a37' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#60a5fa">
                {[0, 1, 2, 3].map((index) => (
                  <Cell key={`cell-${index}`} fill={['#60a5fa', '#34d399', '#22c55e', '#ef4444'][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
