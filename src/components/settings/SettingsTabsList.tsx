
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

const SettingsTabsList: React.FC = () => {
  return (
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="woocommerce">WooCommerce</TabsTrigger>
      <TabsTrigger value="tracking">Tracking Setup</TabsTrigger>
      <TabsTrigger value="general">General</TabsTrigger>
    </TabsList>
  );
};

export default SettingsTabsList;
