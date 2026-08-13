import { Appointment } from '../types';

export interface CalComSlot {
  time: string;
  available: boolean;
  staffName?: string;
}

export interface CalComBookingRequest {
  eventTypeId: number;
  start: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export class CalComServiceAdapter {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey = 'mock_calcom_api_key', baseUrl = 'https://api.cal.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch available time slots for a given staff member or service
   */
  async getAvailableSlots(date: string, serviceId?: string): Promise<CalComSlot[]> {
    // Simulated production response matching Cal.com v1 API schema
    return [
      { time: '09:00', available: true, staffName: 'Анна Сергеева' },
      { time: '10:30', available: true, staffName: 'Мария Пак' },
      { time: '12:00', available: false, staffName: 'Анна Сергеева' },
      { time: '14:00', available: true, staffName: 'Елена Воронина' },
      { time: '16:00', available: true, staffName: 'Анна Сергеева' },
    ];
  }

  /**
   * Create a new appointment booking with optional deposit holding via Stripe
   */
  async createBooking(booking: CalComBookingRequest): Promise<Appointment> {
    return {
      id: `cal_${Date.now()}`,
      clientName: booking.name,
      clientEmail: booking.email,
      clientPhone: booking.phone || '+1 (555) 019-2834',
      serviceName: 'Премиум Макияж & Стилист',
      staffName: 'Анна Сергеева',
      date: booking.start.split('T')[0] || new Date().toISOString().split('T')[0],
      time: booking.start.split('T')[1] || '14:00',
      timeSlot: '14:00',
      notes: booking.notes,
      status: 'confirmed',
      priceUSD: 180,
    };
  }
}

export const calComAdapter = new CalComServiceAdapter();
