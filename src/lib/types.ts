// ==================== API Types ====================

export interface User {
  id: string
  _id?: string // Convex compatibility
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Organization {
  id: string
  _id?: string
  name: string
  clerkId: string
  role?: string
  createdAt: string
  updatedAt: string
}

export type EventStatus = 'rascunho' | 'publicado' | 'ao_vivo' | 'encerrado'

export interface Event {
  id: string
  _id?: string
  _creationTime?: number
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
  status: EventStatus
  shareLinkCode: string
  imageUrl?: string
  participantsCount?: number
  suggestionsCount?: number
  createdAt?: string
  updatedAt?: string
}

export type AttendanceStatus = 'vou' | 'talvez' | 'nao_vou'

export interface AttendanceConfirmation {
  id: string
  _id?: string
  _creationTime?: number
  eventId: string
  name: string
  email: string
  status: AttendanceStatus
  checkedIn: boolean
  checkInTime?: number
  noShow?: boolean
  createdAt?: string
  updatedAt?: string
}

export type SuggestionStatus = 'pendente' | 'aprovada' | 'rejeitada'

export interface Suggestion {
  id: string
  _id?: string
  _creationTime?: number
  eventId: string
  content: string
  authorName?: string
  isAnonymous: boolean
  status: SuggestionStatus
  isAnswered: boolean
  votesCount: number
  createdAt?: string
  updatedAt?: string
}

export interface Poll {
  id: string
  _id?: string
  _creationTime?: number
  eventId: string
  question: string
  allowMultipleChoice: boolean
  showResultsAutomatically: boolean
  isActive: boolean
  totalVotes: number
  timerDuration?: number
  activatedAt?: number
  expiresAt?: number
  options?: PollOption[]
  createdAt?: string
  updatedAt?: string
}

export interface PollOption {
  id: string
  _id?: string
  pollId: string
  optionText: string
  votesCount: number
  createdAt?: string
  updatedAt?: string
}

export interface WaitlistEntry {
  id: string
  _id?: string
  _creationTime?: number
  eventId: string
  name: string
  whatsapp: string
  eventTitle?: string
  createdAt?: string
}

// ==================== Stats Types ====================

export interface AttendanceStats {
  total: number
  vou: number
  talvez: number
  nao_vou: number
  checkedIn?: number
}

export interface EventStats {
  event?: {
    limit?: number
    hasCheckIn?: boolean
  }
  participation?: {
    total: number
    confirmed: number
    checkedIn: number
    noShows: number
    attendanceRate: number
    effectivelyPresent: number
    effectivelyAbsent: number
    effectiveAttendanceRate: number
    occupancyRate?: number
  }
  suggestions?: {
    total: number
    approved: number
    answered: number
    totalVotes: number
    topSuggestions: Array<{
      content: string
      votes: number
      authorName?: string
      isAnonymous: boolean
    }>
  }
  polls?: {
    total: number
    results: Array<{
      _id?: string
      id?: string
      question: string
      totalVotes: number
      winner?: { text: string }
      options?: Array<{
        optionText: string
        votesCount: number
      }>
    }>
  }
  waitlist?: {
    total: number
  }
}

export interface PollResults {
  poll: Poll
  results: {
    optionId: string
    optionText: string
    votes: number
    percentage: number
  }[]
  totalVotes: number
}

// ==================== WebSocket Event Types ====================

export interface WSSuggestionNew {
  suggestion: Suggestion
}

export interface WSSuggestionVote {
  suggestionId: string
  votesCount: number
}

export interface WSPollActivated {
  poll: Poll
}

export interface WSPollDeactivated {
  poll: Poll
}

export interface WSPollVote {
  poll: Poll
}

export interface WSCountsUpdated {
  eventId: string
  participantsCount: number
  suggestionsCount: number
}
