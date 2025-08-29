import { api } from './api'

export interface Event {
  id: number
  title: string
  description?: string
  event_type: 'Open House' | 'Seminar' | 'Workshop' | 'Training' | 'Meeting' | 'Appointment'
  status: 'Scheduled' | 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled'
  start_date: string
  end_date: string
  location?: string
  is_virtual: boolean
  meeting_url?: string
  max_attendees?: number
  current_attendees: number
  organizer_id: number
  created_at: string
  updated_at?: string
}

export interface EventAttendee {
  id: number
  event_id: number
  user_id: number
  status: string
  registered_at: string
}

export const eventService = {
  createEvent: async (eventData: {
    title: string
    description?: string
    event_type: string
    start_date: string
    end_date: string
    location?: string
    is_virtual?: boolean
    meeting_url?: string
    max_attendees?: number
  }): Promise<Event> => {
    const response = await api.post('/events/events', eventData)
    return response.data
  },

  getEvents: async (params?: {
    skip?: number
    limit?: number
    event_type?: string
    status?: string
  }): Promise<Event[]> => {
    const response = await api.get('/events/events', { params })
    return response.data
  },

  getEvent: async (eventId: number): Promise<Event> => {
    const response = await api.get(`/events/events/${eventId}`)
    return response.data
  },

  updateEvent: async (eventId: number, eventData: {
    title?: string
    description?: string
    event_type?: string
    status?: string
    start_date?: string
    end_date?: string
    location?: string
    is_virtual?: boolean
    meeting_url?: string
    max_attendees?: number
  }): Promise<Event> => {
    const response = await api.put(`/events/events/${eventId}`, eventData)
    return response.data
  },

  registerForEvent: async (eventId: number): Promise<EventAttendee> => {
    const response = await api.post(`/events/events/${eventId}/register`)
    return response.data
  },

  getTodayEvents: async (): Promise<Event[]> => {
    const response = await api.get('/events/events/upcoming/today')
    return response.data
  },

  getEventStats: async (): Promise<{
    total_events: number
    this_month: number
    avg_attendance: number
  }> => {
    const response = await api.get('/events/events/stats')
    return response.data
  }
}