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
