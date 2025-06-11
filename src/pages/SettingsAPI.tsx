import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Store, Eye, EyeOff, Copy, TestTube } from 'lucide-react';
import { useWooCommerceConfig, useTrackingDetection } from '../hooks/useWooCommerce';
import { wooCommerceService } from '../services/woocommerce';
import { WooCommerceConfig } from '../types/woocommerce';
import { toast } from 'sonner';

const SettingsAPI = () => {
  const { config, saveConfig } = useWooCommerceConfig();
  const { data: trackingKeys } = useTrackingDetection();
  const [showWooKeys, setShowWooKeys] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  
  const [wooCommerceConfig, setWooCommerceConfig] = useState<WooCommerceConfig>({
    storeUrl: 'https://tharavix.com',
    consumerKey: 'ck_1234567890abcdef1234567890abcdef12345678',
    consumerSecret: 'cs_1234567890abcdef1234567890abcdef12345678',
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
      toast.error('Connection test failed: ' + (error as Error).message);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveWooConfig = () => {
    const updatedConfig = {
      ...wooCommerceConfig,
      status: connectionStatus === 'connected' ? 'active' as const : 'inactive' as const,
      lastUsed: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].substring(0, 5),
      lastSync: connectionStatus === 'connected' ? new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].substring(0, 5) : ''
    };
    
    saveConfig(updatedConfig);
    toast.success('WooCommerce configuration saved successfully!');
  };

  const getStatusColor = (status: string) => {
    return status === 'active' || status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings & API</h1>
        <Button variant="outline">
          API Documentation
        </Button>
      </div>

      <Tabs defaultValue="woocommerce" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="woocommerce">WooCommerce</TabsTrigger>
          <TabsTrigger value="tracking">Tracking Setup</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
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
                  <Label htmlFor="storeUrl">Store URL</Label>
                  <Input
                    id="storeUrl"
                    value={wooCommerceConfig.storeUrl}
                    onChange={(e) => handleWooConfigUpdate('storeUrl', e.target.value)}
                    placeholder="https://yourstore.com"
                  />
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
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Show API Keys</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWooKeys(!showWooKeys)}
                  >
                    {showWooKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showWooKeys ? 'Hide' : 'Show'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consumerKey">Consumer Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="consumerKey"
                        type={showWooKeys ? "text" : "password"}
                        value={showWooKeys ? wooCommerceConfig.consumerKey : maskWooKey(wooCommerceConfig.consumerKey)}
                        onChange={(e) => handleWooConfigUpdate('consumerKey', e.target.value)}
                        placeholder="ck_xxxxxxxxxxxxxxxx"
                        className="font-mono text-sm"
                      />
                      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(wooCommerceConfig.consumerKey)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consumerSecret">Consumer Secret</Label>
                    <div className="flex gap-2">
                      <Input
                        id="consumerSecret"
                        type={showWooKeys ? "text" : "password"}
                        value={showWooKeys ? wooCommerceConfig.consumerSecret : maskWooKey(wooCommerceConfig.consumerSecret)}
                        onChange={(e) => handleWooConfigUpdate('consumerSecret', e.target.value)}
                        placeholder="cs_xxxxxxxxxxxxxxxx"
                        className="font-mono text-sm"
                      />
                      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(wooCommerceConfig.consumerSecret)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <Select 
                    value={wooCommerceConfig.permissions} 
                    onValueChange={(value: 'read' | 'write') => handleWooConfigUpdate('permissions', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="write">Read & Write</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Connection Status</Label>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(connectionStatus)}>
                      {connectionStatus === 'connected' ? 'Connected' : 
                       connectionStatus === 'failed' ? 'Failed' : 'Not tested'}
                    </Badge>
                  </div>
                </div>
              </div>

              {wooCommerceConfig.lastUsed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Last Used</Label>
                    <p className="text-sm font-mono">{wooCommerceConfig.lastUsed}</p>
                  </div>
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
                  disabled={isTestingConnection}
                  variant="outline"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isTestingConnection ? 'Testing...' : 'Test Connection'}
                </Button>
                <Button onClick={handleSaveWooConfig}>
                  Save Configuration
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
                    <li>• All tracking updates sync directly to your WooCommerce store</li>
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
