import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConnectStore } from '../../src/store/useStore';

describe('useConnectStore state management', () => {
  it('initializes with default vertical as beauty and 3 initial services', () => {
    const { result } = renderHook(() => useConnectStore());
    expect(result.current.activeVertical).toBe('beauty');
    expect(result.current.services.length).toBeGreaterThan(0);
  });

  it('allows adding a new appointment and updates state', () => {
    const { result } = renderHook(() => useConnectStore());
    const initialCount = result.current.appointments.length;

    act(() => {
      result.current.addAppointment({
        clientName: 'Test Client',
        clientHandle: '@test',
        clientEmail: 'test@example.com',
        serviceId: 'srv_1',
        serviceName: 'Aesthetic Haircut',
        staffName: 'Elena Rostova',
        date: '2026-08-15',
        timeSlot: '10:00 AM - 11:00 AM',
        status: 'confirmed',
        priceUSD: 85
      });
    });

    expect(result.current.appointments.length).toBe(initialCount + 1);
    expect(result.current.appointments[0].clientName).toBe('Test Client');
  });

  it('allows submitting freight load bids', () => {
    const { result } = renderHook(() => useConnectStore());
    const targetLoadId = result.current.freightLoads[0].id;

    act(() => {
      result.current.submitFreightBid(targetLoadId, 3200, 'Test Carrier LLC');
    });

    const updated = result.current.freightLoads.find(l => l.id === targetLoadId);
    expect(updated?.status).toBe('bid_submitted');
    expect(updated?.offerRateUSD).toBe(3200);
    expect(updated?.carrierName).toBe('Test Carrier LLC');
  });
});
