
import React from 'react';
import OrderFilters from './OrderFilters';

interface OrderManagementHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onRefresh: () => void;
}

const OrderManagementHeader: React.FC<OrderManagementHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onRefresh,
}) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Order Management</h1>
      <OrderFilters 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default OrderManagementHeader;
