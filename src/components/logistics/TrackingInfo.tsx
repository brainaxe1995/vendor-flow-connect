
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Package, MapPin, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { seventeenTrackService, TrackingInfo } from '@/services/17track';

interface TrackingInfoProps {
  trackingNumber: string;
  carrier?: string;
  orderId?: number;
}

const TrackingInfoComponent: React.FC<TrackingInfoProps> = ({ 
  trackingNumber, 
  carrier, 
  orderId 
}) => {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackingInfo = async () => {
    if (!trackingNumber) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const info = await seventeenTrackService.getTrackingInfo(trackingNumber, carrier);
      setTrackingInfo(info);
    } catch (err) {
      setError('Failed to fetch tracking information');
      console.error('Tracking fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingInfo();
  }, [trackingNumber, carrier]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <Package className="w-4 h-4" />;
      case 'in transit':
      case 'out for delivery':
        return <Truck className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm">Loading tracking info...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <Button size="sm" variant="outline" onClick={fetchTrackingInfo}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trackingInfo) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            No tracking information available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Tracking: {trackingInfo.number}
          </CardTitle>
          <Button size="sm" variant="outline" onClick={fetchTrackingInfo}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={seventeenTrackService.getTrackingStatusColor(trackingInfo.status)}>
            {getStatusIcon(trackingInfo.status)}
            <span className="ml-1">{trackingInfo.status}</span>
          </Badge>
          <span className="text-xs text-muted-foreground">
            via {trackingInfo.carrier}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {trackingInfo.location && (
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Last seen: {trackingInfo.location}
            </span>
          </div>
        )}
        
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tracking Events
          </h4>
          {trackingInfo.events.map((event, index) => (
            <div key={index} className="flex items-start gap-2 py-2 border-l-2 border-muted pl-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-1.5 -ml-4 border-2 border-background" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{event.status}</span>
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(event.date)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{event.description}</p>
                <p className="text-xs text-muted-foreground">{event.location}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackingInfoComponent;
