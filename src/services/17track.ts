
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
  private readonly apiKey: string | null = null; // Would come from Supabase secrets

  async getTrackingInfo(trackingNumber: string, carrier?: string): Promise<TrackingInfo | null> {
    // For now, return mock data since we don't have API key configured
    // In production, this would make real API calls to 17track
    console.log('Fetching tracking info for:', trackingNumber, 'Carrier:', carrier);
    
    // Mock tracking data
    return this.getMockTrackingInfo(trackingNumber);
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
