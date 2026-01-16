import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'
import {
  usersApi,
  organizationsApi,
  eventsApi,
  attendanceApi,
  suggestionsApi,
  pollsApi,
  waitlistApi,
  setAuthTokenProvider,
  setUserInfoProvider,
} from './api'
import type {
  Organization,
  Event,
  AttendanceConfirmation,
  Suggestion,
  Poll,
  WaitlistEntry,
  EventStats,
  AttendanceStats,
} from './types'

// ==================== Auth Setup Hook ====================

export function useAuthSetup() {
  const { getToken, userId } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    setAuthTokenProvider(async () => {
      try {
        return await getToken()
      } catch {
        return null
      }
    })
  }, [getToken])

  useEffect(() => {
    setUserInfoProvider(() => {
      if (!userId) return null
      return {
        userId,
        email: user?.primaryEmailAddress?.emailAddress,
        firstName: user?.firstName || undefined,
        lastName: user?.lastName || undefined,
      }
    })
  }, [userId, user])
}

// ==================== User Hooks ====================

export function useSyncUser() {
  return useMutation({
    mutationFn: (data: {
      clerkId: string
      email: string
      firstName?: string
      lastName?: string
      avatarUrl?: string
    }) => usersApi.sync(data),
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await usersApi.getMe()
      return data
    },
  })
}

export function useUserOrganizations() {
  return useQuery({
    queryKey: ['userOrganizations'],
    queryFn: async () => {
      const { data } = await usersApi.getOrganizations()
      return data as Organization[]
    },
  })
}

// ==================== Organization Hooks ====================

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; clerkId: string }) =>
      organizationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userOrganizations'] })
    },
  })
}

export function useSyncOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { clerkId: string; name: string }) =>
      organizationsApi.sync(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userOrganizations'] })
    },
  })
}

export function useOrganizationByClerkId(clerkId: string | undefined) {
  return useQuery({
    queryKey: ['organization', 'clerk', clerkId],
    queryFn: async () => {
      if (!clerkId) return null
      const { data } = await organizationsApi.getByClerkId(clerkId)
      return data as Organization | null
    },
    enabled: !!clerkId,
  })
}

// ==================== Event Hooks ====================

export function useEventsByOrganization(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['events', organizationId],
    queryFn: async () => {
      if (!organizationId) return []
      const { data } = await eventsApi.getByOrganization(organizationId)
      return data as Event[]
    },
    enabled: !!organizationId,
  })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) return null
      const { data } = await eventsApi.getById(id)
      return data as Event
    },
    enabled: !!id,
  })
}

export function useEventByShareCode(shareCode: string | undefined) {
  return useQuery({
    queryKey: ['event', 'shareCode', shareCode],
    queryFn: async () => {
      if (!shareCode) return null
      const { data } = await eventsApi.getByShareCode(shareCode)
      return data as Event
    },
    enabled: !!shareCode,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: eventsApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.organizationId] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof eventsApi.update>[1]) =>
      eventsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Event['status'] }) =>
      eventsApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: eventsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useEventStats(eventId: string | undefined) {
  return useQuery({
    queryKey: ['eventStats', eventId],
    queryFn: async () => {
      if (!eventId) return null
      const { data } = await eventsApi.getStats(eventId)
      return data as EventStats
    },
    enabled: !!eventId,
  })
}

// ==================== Attendance Hooks ====================

export function useAttendanceByEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['attendance', eventId],
    queryFn: async () => {
      if (!eventId) return []
      const { data } = await attendanceApi.getByEvent(eventId)
      return data as AttendanceConfirmation[]
    },
    enabled: !!eventId,
  })
}

export function useConfirmAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, ...data }: {
      eventId: string
      name: string
      email: string
      status: AttendanceConfirmation['status']
    }) => attendanceApi.confirm(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: ['attendanceStats', variables.eventId] })
    },
  })
}

export function useCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, checkedIn }: { id: string; checkedIn: boolean; eventId?: string }) =>
      attendanceApi.checkIn(id, checkedIn),
    onSuccess: (_, variables) => {
      if (variables.eventId) {
        queryClient.invalidateQueries({ queryKey: ['attendance', variables.eventId] })
      }
    },
  })
}

export function useAttendanceStats(eventId: string | undefined) {
  return useQuery({
    queryKey: ['attendanceStats', eventId],
    queryFn: async () => {
      if (!eventId) return null
      const { data } = await attendanceApi.getStats(eventId)
      return data as AttendanceStats
    },
    enabled: !!eventId,
  })
}

// ==================== Suggestion Hooks ====================

export function useSuggestionsByEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['suggestions', eventId],
    queryFn: async () => {
      if (!eventId) return []
      const { data } = await suggestionsApi.getByEvent(eventId)
      return data as Suggestion[]
    },
    enabled: !!eventId,
  })
}

export function useApprovedSuggestions(eventId: string | undefined) {
  return useQuery({
    queryKey: ['suggestions', eventId, 'approved'],
    queryFn: async () => {
      if (!eventId) return []
      const { data } = await suggestionsApi.getApproved(eventId)
      return data as Suggestion[]
    },
    enabled: !!eventId,
  })
}

export function useCreateSuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, ...data }: {
      eventId: string
      content: string
      authorName?: string
      isAnonymous: boolean
    }) => suggestionsApi.create(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suggestions', variables.eventId] })
    },
  })
}

export function useUpdateSuggestionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, eventId }: { id: string; status: Suggestion['status']; eventId?: string }) =>
      suggestionsApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      if (variables.eventId) {
        queryClient.invalidateQueries({ queryKey: ['suggestions', variables.eventId] })
      }
    },
  })
}

export function useVoteSuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, participantIdentifier, eventId }: {
      id: string
      participantIdentifier: string
      eventId?: string
    }) => suggestionsApi.vote(id, participantIdentifier),
    onSuccess: (_, variables) => {
      if (variables.eventId) {
        queryClient.invalidateQueries({ queryKey: ['suggestions', variables.eventId] })
      }
    },
  })
}

// ==================== Poll Hooks ====================

export function usePollsByEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['polls', eventId],
    queryFn: async () => {
      if (!eventId) return []
      const { data } = await pollsApi.getByEvent(eventId)
      return data as Poll[]
    },
    enabled: !!eventId,
  })
}

export function useActivePoll(eventId: string | undefined) {
  return useQuery({
    queryKey: ['polls', eventId, 'active'],
    queryFn: async () => {
      if (!eventId) return null
      const { data } = await pollsApi.getActive(eventId)
      return data as Poll | null
    },
    enabled: !!eventId,
    refetchInterval: 5000, // Poll every 5 seconds for active poll
  })
}

export function useCreatePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, ...data }: {
      eventId: string
      question: string
      options: string[]
      allowMultipleChoice: boolean
      showResultsAutomatically: boolean
      timerDuration?: number
    }) => pollsApi.create(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['polls', variables.eventId] })
    },
  })
}

export function useTogglePollActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive, eventId }: { id: string; isActive: boolean; eventId?: string }) =>
      pollsApi.toggleActive(id, isActive),
    onSuccess: (_, variables) => {
      if (variables.eventId) {
        queryClient.invalidateQueries({ queryKey: ['polls', variables.eventId] })
      }
    },
  })
}

export function useVotePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, pollOptionId, participantIdentifier, eventId }: {
      id: string
      pollOptionId: string
      participantIdentifier: string
      eventId?: string
    }) => pollsApi.vote(id, { pollOptionId, participantIdentifier }),
    onSuccess: (_, variables) => {
      if (variables.eventId) {
        queryClient.invalidateQueries({ queryKey: ['polls', variables.eventId] })
      }
    },
  })
}

// ==================== Waitlist Hooks ====================

export function useWaitlistByEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['waitlist', eventId],
    queryFn: async () => {
      if (!eventId) return []
      const { data } = await waitlistApi.getByEvent(eventId)
      return data as WaitlistEntry[]
    },
    enabled: !!eventId,
  })
}

export function useWaitlistByOrganization(orgId: string | undefined) {
  return useQuery({
    queryKey: ['waitlist', 'organization', orgId],
    queryFn: async () => {
      if (!orgId) return []
      const { data } = await waitlistApi.getByOrganization(orgId)
      return data as WaitlistEntry[]
    },
    enabled: !!orgId,
  })
}

export function useAddToWaitlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, ...data }: {
      eventId: string
      name: string
      whatsapp: string
    }) => waitlistApi.add(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['waitlist', variables.eventId] })
    },
  })
}

export function useRemoveFromWaitlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: waitlistApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] })
    },
  })
}
