// Generate unique share code for events
export function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Convert Convex timestamp to Date
export function convexTimestampToDate(timestamp: number): Date {
  return new Date(timestamp)
}

// Convert Date to ISO string for response
export function formatDate(date: Date): string {
  return date.toISOString()
}

// Map Convex status to Prisma enum
export function mapEventStatus(status: string): 'RASCUNHO' | 'PUBLICADO' | 'AO_VIVO' | 'ENCERRADO' {
  const map: Record<string, 'RASCUNHO' | 'PUBLICADO' | 'AO_VIVO' | 'ENCERRADO'> = {
    'rascunho': 'RASCUNHO',
    'publicado': 'PUBLICADO',
    'ao_vivo': 'AO_VIVO',
    'encerrado': 'ENCERRADO',
  }
  return map[status] || 'RASCUNHO'
}

// Map Prisma enum to frontend status
export function mapEventStatusToFrontend(status: string): string {
  const map: Record<string, string> = {
    'RASCUNHO': 'rascunho',
    'PUBLICADO': 'publicado',
    'AO_VIVO': 'ao_vivo',
    'ENCERRADO': 'encerrado',
  }
  return map[status] || 'rascunho'
}

// Map attendance status
export function mapAttendanceStatus(status: string): 'VOU' | 'TALVEZ' | 'NAO_VOU' {
  const map: Record<string, 'VOU' | 'TALVEZ' | 'NAO_VOU'> = {
    'vou': 'VOU',
    'talvez': 'TALVEZ',
    'nao_vou': 'NAO_VOU',
  }
  return map[status] || 'VOU'
}

// Map attendance status to frontend
export function mapAttendanceStatusToFrontend(status: string): string {
  const map: Record<string, string> = {
    'VOU': 'vou',
    'TALVEZ': 'talvez',
    'NAO_VOU': 'nao_vou',
  }
  return map[status] || 'vou'
}

// Map suggestion status
export function mapSuggestionStatus(status: string): 'PENDENTE' | 'APROVADA' | 'REJEITADA' {
  const map: Record<string, 'PENDENTE' | 'APROVADA' | 'REJEITADA'> = {
    'pendente': 'PENDENTE',
    'aprovada': 'APROVADA',
    'rejeitada': 'REJEITADA',
  }
  return map[status] || 'PENDENTE'
}

// Map suggestion status to frontend
export function mapSuggestionStatusToFrontend(status: string): string {
  const map: Record<string, string> = {
    'PENDENTE': 'pendente',
    'APROVADA': 'aprovada',
    'REJEITADA': 'rejeitada',
  }
  return map[status] || 'pendente'
}

// Map organization role
export function mapOrganizationRole(role: string): 'ADMIN' | 'MEMBER' {
  return role.toLowerCase() === 'admin' ? 'ADMIN' : 'MEMBER'
}

// Map organization role to frontend
export function mapOrganizationRoleToFrontend(role: string): string {
  return role.toLowerCase()
}
