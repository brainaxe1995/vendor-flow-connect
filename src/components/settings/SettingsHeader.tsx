
import React from 'react';
import { Button } from '@/components/ui/button';

const SettingsHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Settings & API</h1>
      <Button variant="outline">
        API Documentation
      </Button>
    </div>
  );
};

export default SettingsHeader;
