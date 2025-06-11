
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Eye, Edit, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrderTableProps {
  orders: any[];
  isLoading: boolean;
  showTracking?: boolean;
  totalPages?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEditOrder: (order: any) => void;
  getStatusColor: (status: string) => string;
  getTrackingNumber: (order: any) => string | null;
  error?: any;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  isLoading,
  showTracking = false,
  totalPages = 1,
  currentPage,
  onPageChange,
  onEditOrder,
  getStatusColor,
  getTrackingNumber,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load orders: {error.message || 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No orders found</p>
        <p className="text-sm mt-2">Try refreshing or checking your WooCommerce configuration</p>
      </div>
    );
  }

  console.log('Rendering OrderTable with orders:', orders.length, 'totalPages:', totalPages);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            {showTracking && <TableHead>Tracking</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const tracking = getTrackingNumber(order);
            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.billing.first_name} {order.billing.last_name}</p>
                    <p className="text-sm text-muted-foreground">{order.billing.email}</p>
                  </div>
                </TableCell>
                <TableCell>{order.line_items?.length || 0}</TableCell>
                <TableCell>${order.total}</TableCell>
                <TableCell>{new Date(order.date_created).toLocaleDateString()}</TableCell>
                {showTracking && (
                  <TableCell>
                    {tracking ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{tracking}</code>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" title="View Order">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEditOrder(order)}
                      title="Edit Order"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="space-y-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else {
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => onPageChange(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <div className="text-center text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} • {orders.length} orders shown
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTable;
