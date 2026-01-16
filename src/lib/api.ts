import axios, { AxiosInstance } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth providers
let getAuthToken: (() => Promise<string | null>) | null = null
let getUserInfo: (() => { userId: string; email?: string; firstName?: string; lastName?: string } | null) | null = null

export function setAuthTokenProvider(provider: () => Promise<string | null>) {
  getAuthToken = provider
}

export function setUserInfoProvider(provider: () => { userId: string; email?: string; firstName?: string; lastName?: string } | null) {
  getUserInfo = provider
}

apiClient.interceptors.request.use(async (config) => {
  if (getAuthToken) {
    const token = await getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  
  // Add user info headers for backend auth
  if (getUserInfo) {
    const userInfo = getUserInfo()
    if (userInfo) {
      config.headers['X-User-Id'] = userInfo.userId
      if (userInfo.email) config.headers['X-User-Email'] = userInfo.email
      if (userInfo.firstName) config.headers['X-User-FirstName'] = userInfo.firstName
      if (userInfo.lastName) config.headers['X-User-LastName'] = userInfo.lastName
    }
  }
  
  return config
})

// Error interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.error || 'Erro na requisição'
      console.error('API Error:', message)
    }
    return Promise.reject(error)
  }
)

// ==================== API Functions ====================

// Users
export const usersApi = {
  sync: (data: {
    clerkId: string
    email: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
  }) => apiClient.post('/api/users/sync', data),

  getMe: () => apiClient.get('/api/users/me'),

  getOrganizations: () => apiClient.get('/api/users/organizations'),
}

// Organizations
export const organizationsApi = {
  create: (data: { name: string; clerkId: string }) =>
    apiClient.post('/api/organizations', data),

  sync: (data: { clerkId: string; name: string }) =>
    apiClient.post('/api/organizations/sync', data),

  getByClerkId: (clerkId: string) =>
    apiClient.get(`/api/organizations/clerk/${clerkId}`),

  addUser: (orgId: string, data: { userEmail: string; role: 'admin' | 'member' }) =>
    apiClient.post(`/api/organizations/${orgId}/users`, data),
}

// Events
export const eventsApi = {
  getByOrganization: (organizationId: string) =>
    apiClient.get('/api/events', { params: { organizationId } }),

  getById: (id: string) => apiClient.get(`/api/events/${id}`),

  getByShareCode: (shareCode: string) =>
    apiClient.get(`/api/events/public/${shareCode}`),

  create: (data: {
    organizationId: string
    title: string
    description?: string
    startDateTime: number
    isOnline: boolean
    location?: string
    participantLimit?: number
    confirmationDeadline?: number
    requireCheckIn?: boolean
    checkInWindowHours?: number
    checkInDeadlineMinutes?: number
    allowAnonymousSuggestions: boolean
    moderateSuggestions: boolean
    status: 'rascunho' | 'publicado' | 'ao_vivo' | 'encerrado'
    imageUrl?: string
  }) => apiClient.post('/api/events', data),

  update: (id: string, data: Partial<{
    title: string
    description: string
    startDateTime: number
    isOnline: boolean
    location: string
    participantLimit: number
    confirmationDeadline: number
    requireCheckIn: boolean
    checkInWindowHours: number
    checkInDeadlineMinutes: number
    allowAnonymousSuggestions: boolean
    moderateSuggestions: boolean
    status: 'rascunho' | 'publicado' | 'ao_vivo' | 'encerrado'
    imageUrl: string
  }>) => apiClient.patch(`/api/events/${id}`, data),

  updateStatus: (id: string, status: 'rascunho' | 'publicado' | 'ao_vivo' | 'encerrado') =>
    apiClient.patch(`/api/events/${id}/status`, { status }),

  delete: (id: string) => apiClient.delete(`/api/events/${id}`),

  getStats: (id: string) => apiClient.get(`/api/events/${id}/stats`),
}

// Attendance
export const attendanceApi = {
  getByEvent: (eventId: string) =>
    apiClient.get(`/api/events/${eventId}/attendance`),

  confirm: (eventId: string, data: {
    name: string
    email: string
    status: 'vou' | 'talvez' | 'nao_vou'
  }) => apiClient.post(`/api/events/${eventId}/attendance`, data),

  checkHasConfirmed: (eventId: string, email: string) =>
    apiClient.get(`/api/events/${eventId}/attendance/check`, { params: { email } }),

  checkIn: (id: string, checkedIn: boolean) =>
    apiClient.patch(`/api/attendance/${id}/checkin`, { checkedIn }),

  publicCheckIn: (eventId: string, email: string) =>
    apiClient.post(`/api/events/${eventId}/checkin-public`, { email }),

  getStats: (eventId: string) =>
    apiClient.get(`/api/events/${eventId}/attendance/stats`),

  getEffective: (eventId: string) =>
    apiClient.get(`/api/events/${eventId}/attendance/effective`),

  export: (eventId: string) =>
    apiClient.get(`/api/events/${eventId}/attendance/export`),
}

// Suggestions
export const suggestionsApi = {
  getByEvent: (eventId: string) =>
    apiClient.get(`/api/events/${eventId}/suggestions`),

  getApproved: (eventId: string) =>
    apiClient.get(`/api/events/${eventId}/suggestions/approved`),

  create: (eventId: string, data: {
    content: string
    authorName?: string
    isAnonymous: boolean
  }) => apiClient.post(`/api/events/${eventId}/suggestions`, data),

  updateStatus: (id: string, status: 'pendente' | 'aprovada' | 'rejeitada') =>
    apiClient.patch(`/api/suggestions/${id}/status`, { status }),

  markAsAnswered: (id: string, isAnswered: boolean) =>
    apiClient.patch(`/api/suggestions/${id}/answered`, { isAnswered }),

  vote: (id: string, participantIdentifier: string) =>
    apiClient.post(`/api/suggestions/${id}/vote`, { participantIdentifier }),

  hasVoted: (id: string, participantIdentifier: string) =>
    apiClient.get(`/api/suggestions/${id}/hasVoted`, { params: { participantIdentifier } }),

  delete: (id: string) => apiClient.delete(`/api/suggestions/${id}`),
}

// Polls
export const pollsApi = {
  getByEvent: (eventId: string) =>
    apiClient.get(`/api/events/${eventId}/polls`),

  getActive: (eventId: string) =>
    apiClient.get(`/api/events/${eventId}/polls/active`),

  create: (eventId: string, data: {
    question: string
    options: string[]
    allowMultipleChoice: boolean
    showResultsAutomatically: boolean
    timerDuration?: number
  }) => apiClient.post(`/api/events/${eventId}/polls`, data),

  toggleActive: (id: string, isActive: boolean) =>
    apiClient.patch(`/api/polls/${id}/activate`, { isActive }),

  vote: (id: string, data: {
    pollOptionId: string
    participantIdentifier: string
  }) => apiClient.post(`/api/polls/${id}/vote`, data),

  getResults: (id: string) => apiClient.get(`/api/polls/${id}/results`),

  getParticipantVotes: (id: string, participantIdentifier: string) =>
    apiClient.get(`/api/polls/${id}/participantVotes`, { params: { participantIdentifier } }),

  delete: (id: string) => apiClient.delete(`/api/polls/${id}`),
}

// Waitlist
export const waitlistApi = {
  getByEvent: (eventId: string) =>
    apiClient.get(`/api/events/${eventId}/waitlist`),

  add: (eventId: string, data: { name: string; whatsapp: string }) =>
    apiClient.post(`/api/events/${eventId}/waitlist`, data),

  getByOrganization: (orgId: string) =>
    apiClient.get(`/api/organizations/${orgId}/waitlist`),

  remove: (id: string) => apiClient.delete(`/api/waitlist/${id}`),

  count: (eventId: string) =>
    apiClient.get(`/api/events/${eventId}/waitlist/count`),
}

export default apiClient
