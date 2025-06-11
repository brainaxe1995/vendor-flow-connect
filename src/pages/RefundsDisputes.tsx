
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Eye, MessageSquare, Upload, Clock, AlertTriangle, CheckCircle, X, Filter, Search } from 'lucide-react';

const RefundsDisputes = () => {
  const [selectedCase, setSelectedCase] = useState(null);

  // Mock data for refunds and disputes
  const cases = {
    pending: [
      {
        id: 'RD-001',
        type: 'refund',
        orderNumber: '12345',
        customer: 'John Doe',
        amount: '$199.99',
        reason: 'Product defective',
        date: '2024-01-15',
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'RD-002',
        type: 'dispute',
        orderNumber: '12346',
        customer: 'Jane Smith',
        amount: '$99.99',
        reason: 'Item not as described',
        date: '2024-01-14',
        status: 'pending',
        priority: 'medium'
      }
    ],
    inProgress: [
      {
        id: 'RD-003',
        type: 'refund',
        orderNumber: '12340',
        customer: 'Mike Johnson',
        amount: '$149.99',
        reason: 'Wrong item shipped',
        date: '2024-01-13',
        status: 'in-progress',
        priority: 'medium',
        assignedTo: 'Support Team A'
      }
    ],
    resolved: [
      {
        id: 'RD-004',
        type: 'dispute',
        orderNumber: '12320',
        customer: 'Sarah Wilson',
        amount: '$299.99',
        reason: 'Quality issues',
        date: '2024-01-10',
        status: 'resolved',
        priority: 'low',
        resolution: 'Partial refund issued',
        resolvedDate: '2024-01-12'
      }
    ],
    escalated: [
      {
        id: 'RD-005',
        type: 'dispute',
        orderNumber: '12300',
        customer: 'David Brown',
        amount: '$449.99',
        reason: 'Unauthorized charge',
        date: '2024-01-08',
        status: 'escalated',
        priority: 'high',
        escalatedTo: 'Legal Team'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      escalated: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    return type === 'refund' ? <RefreshCw className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />;
  };

  const CasesTable = ({ cases, showAssignee = false, showResolution = false }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Case ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Priority</TableHead>
          {showAssignee && <TableHead>Assigned To</TableHead>}
          {showResolution && <TableHead>Resolution</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cases.map((caseItem) => (
          <TableRow key={caseItem.id}>
            <TableCell className="font-medium">{caseItem.id}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {getTypeIcon(caseItem.type)}
                <span className="capitalize">{caseItem.type}</span>
              </div>
            </TableCell>
            <TableCell>#{caseItem.orderNumber}</TableCell>
            <TableCell>{caseItem.customer}</TableCell>
            <TableCell className="font-medium">{caseItem.amount}</TableCell>
            <TableCell>{caseItem.reason}</TableCell>
            <TableCell>
              <Badge className={getPriorityColor(caseItem.priority)}>
                {caseItem.priority}
              </Badge>
            </TableCell>
            {showAssignee && (
              <TableCell>{caseItem.assignedTo || '-'}</TableCell>
            )}
            {showResolution && (
              <TableCell>{caseItem.resolution || '-'}</TableCell>
            )}
            <TableCell>
              <Badge className={getStatusColor(caseItem.status)}>
                {caseItem.status.replace('-', ' ')}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Handle Case: {caseItem.id}</DialogTitle>
                      <DialogDescription>
                        Manage refund or dispute case details and communications
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Case Type</Label>
                          <select className="w-full p-2 border rounded-md">
                            <option value="refund">Refund</option>
                            <option value="dispute">Dispute</option>
                          </select>
                        </div>
                        <div>
                          <Label>Priority Level</Label>
                          <select className="w-full p-2 border rounded-md">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Refund Amount</Label>
                          <Input placeholder="Enter refund amount" />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <select className="w-full p-2 border rounded-md">
                            <option value="pending">Pending Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="escalated">Escalated</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label>Resolution Notes</Label>
                        <Textarea placeholder="Enter resolution details and actions taken..." />
                      </div>
                      <div>
                        <Label>Upload Evidence</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Upload photos, receipts, or communication logs
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Browse Files
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Send Update to Customer</Button>
                        <Button>Save Changes</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Refunds & Disputes</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search cases..." className="pl-10 w-64" />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Cases</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases.pending.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases.inProgress.length}</div>
            <p className="text-xs text-muted-foreground">Being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases.resolved.length}</div>
            <p className="text-xs text-muted-foreground">Successfully closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalated</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases.escalated.length}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending <Badge variant="secondary">{cases.pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inProgress" className="flex items-center gap-2">
            In Progress <Badge variant="secondary">{cases.inProgress.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-2">
            Resolved <Badge variant="secondary">{cases.resolved.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="escalated" className="flex items-center gap-2">
            Escalated <Badge variant="secondary">{cases.escalated.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Cases</CardTitle>
              <CardDescription>Cases awaiting review and action</CardDescription>
            </CardHeader>
            <CardContent>
              <CasesTable cases={cases.pending} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inProgress">
          <Card>
            <CardHeader>
              <CardTitle>In Progress Cases</CardTitle>
              <CardDescription>Cases currently being processed</CardDescription>
            </CardHeader>
            <CardContent>
              <CasesTable cases={cases.inProgress} showAssignee={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved">
          <Card>
            <CardHeader>
              <CardTitle>Resolved Cases</CardTitle>
              <CardDescription>Successfully completed cases</CardDescription>
            </CardHeader>
            <CardContent>
              <CasesTable cases={cases.resolved} showResolution={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalated">
          <Card>
            <CardHeader>
              <CardTitle>Escalated Cases</CardTitle>
              <CardDescription>Cases requiring special attention</CardDescription>
            </CardHeader>
            <CardContent>
              <CasesTable cases={cases.escalated} showAssignee={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RefundsDisputes;
