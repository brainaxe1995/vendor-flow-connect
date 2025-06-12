
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Upload, Download, Calendar, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useSupabaseDocuments } from '@/hooks/useSupabaseDocuments';
import { toast } from 'sonner';

const ComplianceDocuments = () => {
  const { documents, loading, createDocument, updateDocument, deleteDocument } = useSupabaseDocuments();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentName: '',
    documentType: '',
    fileUrl: '',
    expiryDate: ''
  });

  const documentTypes = [
    'license',
    'certificate',
    'permit',
    'inspection_report',
    'safety_certificate',
    'quality_certificate'
  ];

  const getStatusBadge = (document: any) => {
    const isExpired = document.expiry_date && new Date(document.expiry_date) < new Date();
    const isExpiringSoon = document.expiry_date && 
      new Date(document.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (isExpired) {
      return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Expired</Badge>;
    }
    if (isExpiringSoon) {
      return <Badge className="bg-yellow-100 text-yellow-800"><Calendar className="w-3 h-3 mr-1" />Expires Soon</Badge>;
    }
    if (document.verified) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Pending Review</Badge>;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDocument({
        document_name: uploadForm.documentName,
        document_type: uploadForm.documentType as any,
        file_url: uploadForm.fileUrl,
        expiry_date: uploadForm.expiryDate || null
      });
      
      toast.success('Document uploaded successfully');
      setIsUploadOpen(false);
      setUploadForm({ documentName: '', documentType: '', fileUrl: '', expiryDate: '' });
    } catch (error) {
      toast.error('Failed to upload document');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getExpirationStatus = () => {
    const expired = documents.filter(doc => 
      doc.expiry_date && new Date(doc.expiry_date) < new Date()
    ).length;
    
    const expiringSoon = documents.filter(doc => 
      doc.expiry_date && 
      new Date(doc.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
      new Date(doc.expiry_date) >= new Date()
    ).length;

    return { expired, expiringSoon };
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading documents...</span>
        </div>
      </div>
    );
  }

  const { expired, expiringSoon } = getExpirationStatus();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Compliance & Documents
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your compliance documents and certificates
          </p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>
                Add a new compliance document to your records
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="documentName">Document Name</Label>
                <Input
                  id="documentName"
                  value={uploadForm.documentName}
                  onChange={(e) => setUploadForm({...uploadForm, documentName: e.target.value})}
                  placeholder="e.g., FDA License 2024"
                  required
                />
              </div>
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Select 
                  value={uploadForm.documentType} 
                  onValueChange={(value) => setUploadForm({...uploadForm, documentType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fileUrl">File URL</Label>
                <Input
                  id="fileUrl"
                  value={uploadForm.fileUrl}
                  onChange={(e) => setUploadForm({...uploadForm, fileUrl: e.target.value})}
                  placeholder="https://example.com/document.pdf"
                  required
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={uploadForm.expiryDate}
                  onChange={(e) => setUploadForm({...uploadForm, expiryDate: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Upload Document</Button>
                <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Active documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(doc => doc.verified).length}
            </div>
            <p className="text-xs text-muted-foreground">Approved documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expired}</div>
            <p className="text-xs text-muted-foreground">Needs renewal</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Document Registry</CardTitle>
          <CardDescription>All your compliance documents and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No documents uploaded yet</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setIsUploadOpen(true)}
              >
                Upload your first document
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">{document.document_name}</TableCell>
                    <TableCell className="capitalize">
                      {document.document_type.replace('_', ' ')}
                    </TableCell>
                    <TableCell>{formatDate(document.created_at)}</TableCell>
                    <TableCell>
                      {document.expiry_date ? formatDate(document.expiry_date) : 'No expiry'}
                    </TableCell>
                    <TableCell>{getStatusBadge(document)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-3 h-3 mr-1" />
                            View
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceDocuments;
