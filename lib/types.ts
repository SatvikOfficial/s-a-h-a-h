export type Language = 'hi' | 'en'

export interface Member {
  id: string
  phoneNumber: string
  firstName: string
  lastName: string
  state: string
  district: string
  city: string
  memberCode?: string
  email?: string
  role?: string
  createdAt: Date
}

// Raw `members` table row as returned by Supabase (snake_case columns).
export interface MemberRow {
  id: string
  phone?: string | null
  phoneNumber?: string | null
  first_name?: string | null
  last_name?: string | null
  state?: string | null
  district?: string | null
  city?: string | null
  member_code?: string | null
  email?: string | null
  created_at?: string | null
}

export function toMember(row: MemberRow): Member {
  return {
    id: row.id,
    phoneNumber: row.phone ?? row.phoneNumber ?? '',
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
    state: row.state ?? '',
    district: row.district ?? '',
    city: row.city ?? '',
    memberCode: row.member_code ?? undefined,
    email: row.email ?? undefined,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  }
}

export interface Report {
  id: string
  memberId: string
  reporterName: string
  incidentType: 'intruder' | 'disturbance' | 'vandalism' | 'other'
  location: string
  latitude: number
  longitude: number
  date: string
  time: string
  description: string
  photos: string[]
  status: 'new' | 'reviewing' | 'acknowledged' | 'resolved'
  createdAt: Date
  updatedAt: Date
}

export interface LocationData {
  state: string
  districts: string[]
  cities?: Record<string, string[]>
}
