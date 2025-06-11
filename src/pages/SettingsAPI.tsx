
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Store, Eye, EyeOff, Copy, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import { useWooCommerceConfig, useTrackingDetection } from '../hooks/useWooCommerce';
import { wooCommerceService } from '../services/woocommerce';
import { WooCommerceConfig } from '../types/woocommerce';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const SettingsAPI = () => {
  const { config, saveConfig } = useWooCommerceConfig();
  const { data: trackingKeys } = useTrackingDetection();
  const { user } = useAuth();
  const [showWooKeys, setShowWooKeys] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  
  const [wooCommerceConfig, setWooCommerceConfig] = useState<WooCommerceConfig>({
    storeUrl: 'https://tharavix.com',
    consumerKey: '',
    consumerSecret: '',
    environment: 'live',
    permissions: 'write',
    status: 'inactive',
    lastUsed: '',
    lastSync: ''
  });

  useEffect(() => {
    if (config) {
      setWooCommerceConfig(config);
      setConnectionStatus(config.status === 'active' ? 'connected' : 'unknown');
    }
  }, [config]);

  const maskWooKey = (key: string) => {
    if (!key || key.length < 8) return key;
    if (!showWooKeys) {
      return key.substring(0, 8) + '••••••••••••••••' + key.substring(key.length - 4);
    }
    return key;
  };

  const handleWooConfigUpdate = (field: keyof WooCommerceConfig, value: string | boolean) => {
    setWooCommerceConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testWooConnection = async () => {
    if (!wooCommerceConfig.storeUrl || !wooCommerceConfig.consumerKey || !wooCommerceConfig.consumerSecret) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsTestingConnection(true);
    
    try {
      // Temporarily set the config for testing
      wooCommerceService.setConfig(wooCommerceConfig);
      const isConnected = await wooCommerceService.testConnection();
      
      if (isConnected) {
        setConnectionStatus('connected');
        toast.success('WooCommerce connection successful!');
      } else {
        setConnectionStatus('failed');
        toast.error('WooCommerce connection failed. Please check your credentials.');
      }
    } catch (error) {
      setConnectionStatus('failed');
      console.error('Connection test failed:', error);
      toast.error('Connection test failed: ' + (error as Error).message);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveWooConfig = async () => {
    if (!wooCommerceConfig.storeUrl || !wooCommerceConfig.consumerKey || !wooCommerceConfig.consumerSecret) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    
    try {
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0].substring(0, 5);
      
      const updatedConfig = {
        ...wooCommerceConfig,
        status: connectionStatus === 'connected' ? 'active' as const : 'inactive' as const,
        lastUsed: timestamp,
        lastSync: connectionStatus === 'connected' ? timestamp : wooCommerceConfig.lastSync || ''
      };
      
      const success = await saveConfig(updatedConfig);
      
      if (success) {
        toast.success('WooCommerce configuration saved successfully!');
        setConnectionStatus('connected');
      } else {
        toast.error('Failed to save configuration. Please test connection first.');
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings & API</h1>
          <p className="text-muted-foreground mt-1">
            Configure your WooCommerce store connection and manage settings
          </p>
        </div>
        <Button variant="outline">
          API Documentation
        </Button>
      </div>

      <Tabs defaultValue="woocommerce" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="woocommerce">WooCommerce</TabsTrigger>
          <TabsTrigger value="tracking">Tracking Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="woocommerce" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                WooCommerce API Configuration
              </CardTitle>
              <CardDescription>
                Configure your WooCommerce store connection settings. These credentials are stored securely and used for all API communications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeUrl">Store URL *</Label>
                  <Input
                    id="storeUrl"
                    value={wooCommerceConfig.storeUrl}
                    onChange={(e) => handleWooConfigUpdate('storeUrl', e.target.value)}
                    placeholder="https://tharavix.com"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Your WooCommerce store URL</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environment">API Environment</Label>
                  <Select 
                    value={wooCommerceConfig.environment} 
                    onValueChange={(value: 'live' | 'development') => handleWooConfigUpdate('environment', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live (Production)</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>API Credentials</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWooKeys(!showWooKeys)}
                  >
                    {showWooKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showWooKeys ? 'Hide' : 'Show'}
                  </Button>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Generate these keys in your WooCommerce Admin → Settings → Advanced → REST API. 
                    Make sure to set permissions to "Read/Write".
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consumerKey">Consumer Key *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="consumerKey"
                        type={showWooKeys ? "text" : "password"}
                        value={showWooKeys ? wooCommerceConfig.consumerKey : maskWooKey(wooCommerceConfig.consumerKey)}
                        onChange={(e) => handleWooConfigUpdate('consumerKey', e.target.value)}
                        placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (wooCommerceConfig.consumerKey) {
                            navigator.clipboard.writeText(wooCommerceConfig.consumerKey);
                            toast.success('Consumer key copied to clipboard');
                          }
                        }}
                        disabled={!wooCommerceConfig.consumerKey}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consumerSecret">Consumer Secret *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="consumerSecret"
                        type={showWooKeys ? "text" : "password"}
                        value={showWooKeys ? wooCommerceConfig.consumerSecret : maskWooKey(wooCommerceConfig.consumerSecret)}
                        onChange={(e) => handleWooConfigUpdate('consumerSecret', e.target.value)}
                        placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (wooCommerceConfig.consumerSecret) {
                            navigator.clipboard.writeText(wooCommerceConfig.consumerSecret);
                            toast.success('Consumer secret copied to clipboard');
                          }
                        }}
                        disabled={!wooCommerceConfig.consumerSecret}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>API Permissions</Label>
                  <Select 
                    value={wooCommerceConfig.permissions} 
                    onValueChange={(value: 'read' | 'write') => handleWooConfigUpdate('permissions', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="write">Read & Write (Recommended)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Connection Status</Label>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(connectionStatus)} flex items-center gap-1`}>
                      {getStatusIcon(connectionStatus)}
                      {connectionStatus === 'connected' ? 'Connected' : 
                       connectionStatus === 'failed' ? 'Failed' : 'Not tested'}
                    </Badge>
                  </div>
                </div>
              </div>

              {(wooCommerceConfig.lastUsed || wooCommerceConfig.lastSync) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  {wooCommerceConfig.lastUsed && (
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Last Used</Label>
                      <p className="text-sm font-mono">{wooCommerceConfig.lastUsed}</p>
                    </div>
                  )}
                  {wooCommerceConfig.lastSync && (
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Last Sync</Label>
                      <p className="text-sm font-mono">{wooCommerceConfig.lastSync}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={testWooConnection}
                  disabled={isTestingConnection || !wooCommerceConfig.storeUrl || !wooCommerceConfig.consumerKey || !wooCommerceConfig.consumerSecret}
                  variant="outline"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isTestingConnection ? 'Testing...' : 'Test Connection'}
                </Button>
                <Button 
                  onClick={handleSaveWooConfig}
                  disabled={isSaving || connectionStatus !== 'connected'}
                >
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Number Setup</CardTitle>
              <CardDescription>
                Configure how tracking numbers are handled in your WooCommerce orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Detected Tracking Meta Keys</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    These are the tracking-related meta keys found in your recent orders:
                  </p>
                  <div className="space-y-2">
                    {trackingKeys && trackingKeys.length > 0 ? (
                      trackingKeys.map((key) => (
                        <div key={key} className="flex items-center justify-between p-2 border rounded">
                          <code className="text-sm">{key}</code>
                          <Badge variant="outline">Detected</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No tracking meta keys detected. The system will use '_tracking_number' as default.
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">How it works:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• The system automatically detects tracking meta keys from your orders</li>
                    <li>• When updating tracking numbers, it uses the detected key or falls back to '_tracking_number'</li>
                    <li>• AAll tracking updates sync directly to your WooCommerce store</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="Acme Suppliers Inc." />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input id="contactEmail" defaultValue="contact@acmesuppliers.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select id="timezone" className="w-full p-2 border rounded-md">
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC+0 (GMT)</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="address">Business Address</Label>
                <textarea id="address" className="w-full p-2 border rounded-md" defaultValue="123 Business St, Suite 100&#10;San Francisco, CA 94102" />
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsAPI;
