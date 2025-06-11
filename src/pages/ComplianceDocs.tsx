
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Download, CheckCircle, AlertTriangle, Calendar, Plus } from 'lucide-react';
import { toast } from 'sonner';

const ComplianceDocs = () => {
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  // Mock compliance documents data
  const documents = [
    {
      id: 1,
      name: 'CE Certification',
      type: 'CE',
      product: 'Wireless Headphones',
      status: 'valid',
      expiryDate: '2025-06-15',
      uploadDate: '2024-01-10',
      fileUrl: '#'
    },
    {
      id: 2,
      name: 'FCC Declaration',
      type: 'FCC',
      product: 'Fitness Tracker',
      status: 'valid',
      expiryDate: '2025-12-20',
      uploadDate: '2024-01-08',
      fileUrl: '#'
    },
    {
      id: 3,
      name: 'Safety Data Sheet',
      type: 'SDS',
      product: 'Bluetooth Speaker',
      status: 'expiring',
      expiryDate: '2024-03-15',
      uploadDate: '2023-03-15',
      fileUrl: '#'
    },
    {
      id: 4,
      name: 'ISO 9001 Certificate',
      type: 'ISO',
      product: 'All Products',
      status: 'expired',
      expiryDate: '2024-01-01',
      uploadDate: '2023-01-01',
      fileUrl: '#'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expiring':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleUpload = () => {
    toast.success('Document uploaded successfully');
  };

  const expiringDocs = documents.filter(doc => doc.status === 'expiring' || doc.status === 'expired');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Compliance & Documents</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Compliance Document</DialogTitle>
              <DialogDescription>
                Add a new compliance document or certificate
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="docType">Document Type</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Select type...</option>
                  <option value="ce">CE Certification</option>
                  <option value="fcc">FCC Declaration</option>
                  <option value="sds">Safety Data Sheet</option>
                  <option value="iso">ISO Certificate</option>
                  <option value="fda">FDA Approval</option>
                  <option value="rohs">RoHS Compliance</option>
                </select>
              </div>
              <div>
                <Label htmlFor="product">Related Product</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Select product...</option>
                  <option value="all">All Products</option>
                  <option value="headphones">Wireless Headphones</option>
                  <option value="tracker">Fitness Tracker</option>
                  <option value="speaker">Bluetooth Speaker</option>
                </select>
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" type="date" />
              </div>
              <div>
                <Label>Upload File</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drop files here or click to browse
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={handleUpload}>
                    Browse Files
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleUpload}>Upload Document</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Card for Expiring Documents */}
      {expiringDocs.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              Document Expiry Alert
            </CardTitle>
            <CardDescription>
              {expiringDocs.length} document(s) require attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringDocs.map((doc) => (
                <div key={doc.id} className="flex justify-between items-center">
                  <span className="text-sm">{doc.name} - {doc.product}</span>
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status} - {doc.expiryDate}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Compliance documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.status === 'valid').length}
            </div>
            <p className="text-xs text-muted-foreground">Up to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {documents.filter(d => d.status === 'expiring').length}
            </div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {documents.filter(d => d.status === 'expired').length}
            </div>
            <p className="text-xs text-muted-foreground">Need renewal</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Compliance Documents</CardTitle>
          <CardDescription>Manage and track all compliance documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.type}</Badge>
                  </TableCell>
                  <TableCell>{doc.product}</TableCell>
                  <TableCell>{doc.uploadDate}</TableCell>
                  <TableCell>{doc.expiryDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceDocs;
