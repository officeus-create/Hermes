/**
 * Fleetbase Modular Logistics OS Adapter (fleetbase/fleetbase)
 * Connects Hermes Connect to Order Board (Kanban), Live Fleet Map & Service Zones
 */

export interface FleetbaseVehicle {
  id: string;
  name: string;
  driverName: string;
  latitude: number;
  longitude: number;
  status: 'en_route' | 'idle' | 'loading' | 'unloading';
  speedMph: number;
}

export interface FleetbaseOrder {
  id: string;
  customerName: string;
  stage: 'created' | 'dispatched' | 'picked_up' | 'in_transit' | 'completed';
  address: string;
  payoutUSD: number;
}

export class FleetbaseServiceAdapter {
  async getLiveFleetMap(): Promise<FleetbaseVehicle[]> {
    return [
      { id: 'veh_01', name: 'Car Hauler #104 (9-Car)', driverName: 'Дмитрий Соколов', latitude: 41.8781, longitude: -87.6298, status: 'en_route', speedMph: 62 },
      { id: 'veh_02', name: 'Dry Van #202 (53ft)', driverName: 'Александр Громов', latitude: 32.7767, longitude: -96.7970, status: 'loading', speedMph: 0 },
      { id: 'veh_03', name: 'Enclosed Hauler #301', driverName: 'Сергей Волков', latitude: 33.7490, longitude: -84.3880, status: 'en_route', speedMph: 58 }
    ];
  }

  async getOrderKanbanBoard(): Promise<FleetbaseOrder[]> {
    return [
      { id: 'ord_901', customerName: 'Manheim Auto Auction', stage: 'in_transit', address: 'Dallas, TX', payoutUSD: 3550 },
      { id: 'ord_902', customerName: 'Publix Logistics', stage: 'dispatched', address: 'Miami, FL', payoutUSD: 2450 },
      { id: 'ord_903', customerName: 'Exotic Motors USA', stage: 'picked_up', address: 'Phoenix, AZ', payoutUSD: 7200 }
    ];
  }
}

export const fleetbaseAdapter = new FleetbaseServiceAdapter();
