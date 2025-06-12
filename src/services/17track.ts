
interface TrackingInfo {
  number: string;
  carrier: string;
  status: string;
  lastUpdate: string;
  location?: string;
  events: TrackingEvent[];
}

interface TrackingEvent {
  date: string;
  status: string;
  location: string;
  description: string;
}

class SeventeenTrackService {
  private readonly baseUrl = 'https://api.17track.net/track/v2.2';
  private readonly apiKey: string | undefined = import.meta.env.VITE_TRACK17_API_KEY;

  async getTrackingInfo(trackingNumber: string, carrier?: string): Promise<TrackingInfo | null> {
    try {
      if (!this.apiKey) {
        console.warn('17track API key not configured, returning mock data');
        return this.getMockTrackingInfo(trackingNumber);
      }

      await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          '17token': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{ number: trackingNumber, carrier: carrier || 0 }])
      });

      const infoRes = await fetch(`${this.baseUrl}/gettrackinfo`, {
        method: 'POST',
        headers: {
          '17token': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{ number: trackingNumber }])
      });

      const json = await infoRes.json();
      const data = json.data?.[0];
      if (!data) return null;

      const events = (data?.tracks || data?.origin_info?.trackinfo || []).map((e: any) => ({
        date: e.time || e.track_time,
        status: e.status || e.description,
        location: e.location || '',
        description: e.description || e.status
      }));

      const last = events[events.length - 1];

      return {
        number: trackingNumber,
        carrier: data.carrier ?? '',
        status: last?.status || 'Unknown',
        lastUpdate: last?.date || new Date().toISOString(),
        location: last?.location,
        events
      };
    } catch (error) {
      console.error('17track API error:', error);
      return this.getMockTrackingInfo(trackingNumber);
    }
  }

  private getMockTrackingInfo(trackingNumber: string): TrackingInfo {
    const mockStatuses = ['In Transit', 'Delivered', 'Out for Delivery', 'Exception', 'Processing'];
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    
    return {
      number: trackingNumber,
      carrier: 'USPS',
      status: randomStatus,
      lastUpdate: new Date().toISOString(),
      location: 'New York, NY',
      events: [
        {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'Package shipped',
          location: 'Origin facility',
          description: 'Package departed from origin facility'
        },
        {
          date: new Date().toISOString(),
          status: randomStatus,
          location: 'New York, NY',
          description: `Package is ${randomStatus.toLowerCase()}`
        }
      ]
    };
  }

  async trackMultiplePackages(trackingNumbers: string[]): Promise<TrackingInfo[]> {
    // In production, this would batch track multiple packages
    const results = await Promise.all(
      trackingNumbers.map(num => this.getTrackingInfo(num))
    );
    
    return results.filter((result): result is TrackingInfo => result !== null);
  }

  getTrackingStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in transit':
      case 'out for delivery':
        return 'bg-blue-100 text-blue-800';
      case 'exception':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

export const seventeenTrackService = new SeventeenTrackService();
export type { TrackingInfo, TrackingEvent };
