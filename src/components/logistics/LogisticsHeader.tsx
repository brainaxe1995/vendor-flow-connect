
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface LogisticsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const LogisticsHeader: React.FC<LogisticsHeaderProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Logistics & Shipping</h1>
      <div className="flex gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search orders..." 
            className="pl-10 w-64"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default LogisticsHeader;
