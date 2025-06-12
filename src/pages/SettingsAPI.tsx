
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsTabsList from '@/components/settings/SettingsTabsList';
import WooCommerceSettings from '@/components/settings/WooCommerceSettings';
import TrackingSettings from '@/components/settings/TrackingSettings';
import GeneralSettings from '@/components/settings/GeneralSettings';

const SettingsAPI = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6 space-y-6">
        <SettingsHeader />
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Please log in to access settings and API configuration.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <SettingsHeader />

      <Tabs defaultValue="woocommerce" className="space-y-4">
        <SettingsTabsList />

        <TabsContent value="woocommerce" className="space-y-6">
          <WooCommerceSettings user={user} />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <TrackingSettings />
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettings user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsAPI;
