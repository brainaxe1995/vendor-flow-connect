
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
import { FileText, Upload, Download, Eye, Calendar, Shield, AlertTriangle, CheckCircle, Plus, Search, Filter } from 'lucide-react';

const ComplianceDocs = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Mock data for compliance documents
  const documents = {
    certifications: [
      {
        id: 'CERT-001',
        name: 'CE Certification',
        type: 'Product Certification',
        products: ['PWH-001', 'SFT-002'],
        issueDate: '2024-01-01',
        expiryDate: '2025-01-01',
        status: 'active',
        issuingBody: 'European Conformity',
        documentUrl: '/docs/ce-cert.pdf'
      },
      {
        id: 'CERT-002',
        name: 'FCC Compliance',
        type: 'Regulatory Certification',
        products: ['PWH-001'],
        issueDate: '2023-12-15',
        expiryDate: '2024-12-15',
        status: 'expiring_soon',
        issuingBody: 'Federal Communications Commission',
        documentUrl: '/docs/fcc-cert.pdf'
      }
    ],
    safetySheets: [
      {
        id: 'SDS-001',
        name: 'Battery Safety Data Sheet',
        type: 'Safety Data Sheet',
        products: ['SFT-002'],
        version: '2.1',
        lastUpdated: '2024-01-10',
        status: 'current',
        language: 'English',
        documentUrl: '/docs/battery-sds.pdf'
      }
    ],
    warranties: [
      {
        id: 'WAR-001',
        name: 'Standard Product Warranty',
        type: 'Warranty Document',
        products: ['All Products'],
        version: '1.3',
        effectiveDate: '2024-01-01',
        duration: '12 months',
        status: 'active',
        documentUrl: '/docs/warranty.pdf'
      }
    ],
    policies: [
      {
        id: 'POL-001',
        name: 'Return Policy',
        type: 'Business Policy',
        version: '2.0',
        lastUpdated: '2024-01-05',
        approvedBy: 'Legal Team',
        status: 'active',
        documentUrl: '/docs/return-policy.pdf'
      },
      {
        id: 'POL-002',
        name: 'Privacy Policy',
        type: 'Legal Policy',
        version: '1.5',
        lastUpdated: '2023-12-20',
        approvedBy: 'Legal Team',
        status: 'review_required',
        documentUrl: '/docs/privacy-policy.pdf'
      }
    ]
  };

  const complianceStats = {
    totalDocuments: 43,
    activeCompliance: 38,
    expiringSoon: 3,
    requiresReview: 2
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      current: 'bg-green-100 text-green-800',
      expiring_soon: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      review_required: 'bg-orange-100 text-orange-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: <CheckCircle className="w-4 h-4" />,
      current: <CheckCircle className="w-4 h-4" />,
      expiring_soon: <AlertTriangle className="w-4 h-4" />,
      expired: <AlertTriangle className="w-4 h-4" />,
      review_required: <AlertTriangle className="w-4 h-4" />,
      draft: <FileText className="w-4 h-4" />
    };
    return icons[status] || <FileText className="w-4 h-4" />;
  };

  const DocumentTable = ({ documents, showProducts = true, showExpiry = false, showVersion = false }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document Name</TableHead>
          <TableHead>Type</TableHead>
          {showProducts && <TableHead>Products</TableHead>}
          {showVersion && <TableHead>Version</TableHead>}
          {showExpiry && <TableHead>Expiry Date</TableHead>}
          <TableHead>Last Updated</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{doc.name}</span>
              </div>
            </TableCell>
            <TableCell>{doc.type}</TableCell>
            {showProducts && (
              <TableCell>
                {Array.isArray(doc.products) ? (
                  <div className="flex flex-wrap gap-1">
                    {doc.products.slice(0, 2).map((product, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {product}
                      </Badge>
                    ))}
                    {doc.products.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{doc.products.length - 2} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline">{doc.products}</Badge>
                )}
              </TableCell>
            )}
            {showVersion && (
              <TableCell>{doc.version}</TableCell>
            )}
            {showExpiry && (
              <TableCell>
                {doc.expiryDate ? (
                  <span className={
                    new Date(doc.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      ? 'text-destructive font-medium' : ''
                  }>
                    {doc.expiryDate}
                  </span>
                ) : '-'}
              </TableCell>
            )}
            <TableCell>{doc.lastUpdated || doc.issueDate}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {getStatusIcon(doc.status)}
                <Badge className={getStatusColor(doc.status)}>
                  {doc.status.replace('_', ' ')}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Document: {doc.name}</DialogTitle>
                      <DialogDescription>
                        Update document information and upload new versions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="docName">Document Name</Label>
                          <Input id="docName" defaultValue={doc.name} />
                        </div>
                        <div>
                          <Label htmlFor="docType">Document Type</Label>
                          <select id="docType" className="w-full p-2 border rounded-md" defaultValue={doc.type}>
                            <option>Product Certification</option>
                            <option>Safety Data Sheet</option>
                            <option>Warranty Document</option>
                            <option>Business Policy</option>
                            <option>Legal Policy</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="version">Version</Label>
                          <Input id="version" defaultValue={doc.version} placeholder="e.g., 1.0" />
                        </div>
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input id="expiryDate" type="date" defaultValue={doc.expiryDate} />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Document description..." />
                      </div>
                      <div>
                        <Label>Upload New Version</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Drop document files here or click to browse
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Browse Files
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Cancel</Button>
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
        <h1 className="text-3xl font-bold">Compliance & Documents</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-10 w-64" />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Document</DialogTitle>
                <DialogDescription>
                  Upload a new compliance document or certificate
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newDocName">Document Name</Label>
                    <Input id="newDocName" placeholder="Enter document name" />
                  </div>
                  <div>
                    <Label htmlFor="newDocType">Document Type</Label>
                    <select id="newDocType" className="w-full p-2 border rounded-md">
                      <option>Product Certification</option>
                      <option>Safety Data Sheet</option>
                      <option>Warranty Document</option>
                      <option>Business Policy</option>
                      <option>Legal Policy</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Upload Document</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drop your document here or click to browse
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Browse Files
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Upload Document</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Compliance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">All document types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.activeCompliance}</div>
            <p className="text-xs text-muted-foreground">Valid certifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{complianceStats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requires Review</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{complianceStats.requiresReview}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="certifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            Certifications <Badge variant="secondary">{documents.certifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="safetySheets" className="flex items-center gap-2">
            Safety Sheets <Badge variant="secondary">{documents.safetySheets.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="warranties" className="flex items-center gap-2">
            Warranties <Badge variant="secondary">{documents.warranties.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            Policies <Badge variant="secondary">{documents.policies.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle>Product Certifications</CardTitle>
              <CardDescription>Regulatory compliance and product certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentTable documents={documents.certifications} showExpiry={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safetySheets">
          <Card>
            <CardHeader>
              <CardTitle>Safety Data Sheets</CardTitle>
              <CardDescription>Product safety information and handling guidelines</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentTable documents={documents.safetySheets} showVersion={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warranties">
          <Card>
            <CardHeader>
              <CardTitle>Warranty Documents</CardTitle>
              <CardDescription>Product warranties and guarantee terms</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentTable documents={documents.warranties} showVersion={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>Business Policies</CardTitle>
              <CardDescription>Company policies and legal documents</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentTable documents={documents.policies} showProducts={false} showVersion={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceDocs;
