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
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
          <p className="text-gray-400 text-sm">Confirmados</p>
          <p className="text-3xl font-bold text-white mt-2">{stats.participation.confirmed}</p>
          {stats.event.limit && (
            <p className="text-xs text-gray-400 mt-1">de {stats.event.limit} vagas</p>
          )}
        </div>

        {stats.event.hasCheckIn && (
          <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
            <p className="text-gray-400 text-sm">Check-ins</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{stats.participation.checkedIn}</p>
            <p className="text-xs text-gray-400 mt-1">{stats.participation.attendanceRate}% de presença</p>
          </div>
        )}

        <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
          <p className="text-gray-400 text-sm">Ocupação</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{stats.participation.occupancyRate}%</p>
          <p className="text-xs text-gray-400 mt-1">do limite do evento</p>
        </div>

        <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
          <p className="text-gray-400 text-sm">Sugestões</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">{stats.suggestions.total}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.suggestions.totalVotes} votos</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Distribuição de Status */}
        {participationData.length > 0 && (
          <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Distribuição de Respostas</h3>
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
          </div>
        )}

        {/* Gráfico de Barras - Top Sugestões */}
        {topSuggestionsData.length > 0 && (
          <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Top Sugestões Mais Votadas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSuggestionsData}>
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2c20', border: '1px solid #2d4a37' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="votes" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

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
          <h3 className="text-lg font-bold text-white mb-4">Resultados das Enquetes</h3>
          <div className="space-y-6">
            {stats.polls.results.map((poll) => (
              <div key={poll._id} className="space-y-3">
                <p className="font-bold text-white">{poll.question}</p>
                <p className="text-sm text-gray-400">{poll.totalVotes} votos totais</p>
                <div className="space-y-2">
                  {poll.options.map((option, idx) => {
                    const percentage = poll.totalVotes > 0 
                      ? Math.round((option.votesCount / poll.totalVotes) * 100)
                      : 0;
                    
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{option.optionText}</span>
                          <span className="text-gray-400">{option.votesCount} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {poll.winner && (
                  <p className="text-sm text-green-400 mt-2">
                    🏆 Vencedor: {poll.winner.text} ({poll.winner.votes} votos)
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.event.hasCheckIn && (
          <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">No-Shows</p>
            <p className="text-2xl font-bold text-red-400">{stats.participation.noShows}</p>
            <p className="text-xs text-gray-400 mt-1">Confirmaram mas não apareceram</p>
          </div>
        )}

        {stats.waitlist.total > 0 && (
          <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Lista de Espera</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.waitlist.total}</p>
            <p className="text-xs text-gray-400 mt-1">Pessoas aguardando vaga</p>
          </div>
        )}

        <div className="bg-surface-dark border border-border-dark rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-2">Enquetes Criadas</p>
          <p className="text-2xl font-bold text-blue-400">{stats.polls.total}</p>
          <p className="text-xs text-gray-400 mt-1">Total de enquetes</p>
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
