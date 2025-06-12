
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useTrackingDetection } from '@/hooks/useWooCommerce';

const TrackingSettings: React.FC = () => {
  const { data: trackingKeys } = useTrackingDetection();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracking Number Setup</CardTitle>
        <CardDescription>
          Configure how tracking numbers are handled in your WooCommerce orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Detected Tracking Meta Keys</Label>
            <p className="text-xs text-muted-foreground mb-2">
              These are the tracking-related meta keys found in your recent orders:
            </p>
            <div className="space-y-2">
              {trackingKeys && trackingKeys.length > 0 ? (
                trackingKeys.map((key) => (
                  <div key={key} className="flex items-center justify-between p-2 border rounded">
                    <code className="text-sm">{key}</code>
                    <Badge variant="outline">Detected</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tracking meta keys detected. The system will use '_tracking_number' as default.
                </p>
              )}
            </div>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">How it works:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• The system automatically detects tracking meta keys from your orders</li>
              <li>• When updating tracking numbers, it uses the detected key or falls back to '_tracking_number'</li>
              <li>• All tracking updates sync directly to your WooCommerce store</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackingSettings;
