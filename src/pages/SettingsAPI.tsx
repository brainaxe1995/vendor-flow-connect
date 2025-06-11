
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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Key, Globe, Bell, Shield, Users, Code, Copy, Eye, EyeOff, Plus, Trash2, Edit, Store } from 'lucide-react';

const SettingsAPI = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeys, setApiKeys] = useState([
    {
      id: 'key-001',
      name: 'Production API Key',
      key: 'sp_live_1234567890abcdef',
      permissions: ['read', 'write'],
      lastUsed: '2024-01-15',
      status: 'active'
    },
    {
      id: 'key-002',
      name: 'Development API Key',
      key: 'sp_test_abcdef1234567890',
      permissions: ['read'],
      lastUsed: '2024-01-10',
      status: 'active'
    }
  ]);

  const [webhooks, setWebhooks] = useState([
    {
      id: 'wh-001',
      url: 'https://mystore.com/webhooks/orders',
      events: ['order.created', 'order.updated'],
      status: 'active',
      lastDelivery: '2024-01-15 14:30'
    },
    {
      id: 'wh-002',
      url: 'https://mystore.com/webhooks/inventory',
      events: ['inventory.low', 'inventory.updated'],
      status: 'inactive',
      lastDelivery: '2024-01-12 09:15'
    }
  ]);

  const [wooCommerceConfig, setWooCommerceConfig] = useState({
    storeUrl: 'https://tharavix.com',
    consumerKey: 'ck_1234567890abcdef1234567890abcdef12345678',
    consumerSecret: 'cs_1234567890abcdef1234567890abcdef12345678',
    environment: 'live',
    permissions: 'write',
    status: 'active',
    lastUsed: '2024-01-15 14:30',
    lastSync: '2024-01-15 14:25'
  });

  const [showWooKeys, setShowWooKeys] = useState(false);

  const [settings, setSettings] = useState({
    notifications: {
      emailOrders: true,
      emailInventory: true,
      smsAlerts: false,
      pushNotifications: true
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      ipWhitelist: false
    },
    integration: {
      autoSync: true,
      syncInterval: 15,
      errorRetries: 3
    }
  });

  const availableEvents = [
    'order.created',
    'order.updated',
    'order.cancelled',
    'inventory.low',
    'inventory.updated',
    'payment.received',
    'refund.processed'
  ];

  const maskApiKey = (key) => {
    if (!showApiKey) {
      return key.substring(0, 8) + '••••••••••••••••' + key.substring(key.length - 4);
    }
    return key;
  };

  const maskWooKey = (key) => {
    if (!showWooKeys) {
      return key.substring(0, 8) + '••••••••••••••••' + key.substring(key.length - 4);
    }
    return key;
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const handleWooConfigUpdate = (field, value) => {
    setWooCommerceConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveWooConfig = () => {
    // Update last used timestamp when saving
    setWooCommerceConfig(prev => ({
      ...prev,
      lastUsed: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0].substring(0, 5)
    }));
    // Here you would normally send the config to your backend
    console.log('WooCommerce configuration saved:', wooCommerceConfig);
  };

  const testWooConnection = () => {
    // Placeholder for testing WooCommerce connection
    console.log('Testing WooCommerce connection...');
    // This would make a test API call through your backend proxy
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings & API</h1>
        <Button variant="outline">
          <Code className="w-4 h-4 mr-2" />
          API Documentation
        </Button>
      </div>

      <Tabs defaultValue="woocommerce" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="woocommerce">WooCommerce</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="woocommerce" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                WooCommerce API Configuration
              </CardTitle>
              <CardDescription>
                Configure your WooCommerce store connection settings. These credentials will be used securely through the backend proxy.
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
                  <Select value={wooCommerceConfig.environment} onValueChange={(value) => handleWooConfigUpdate('environment', value)}>
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
                  <Select value={wooCommerceConfig.permissions} onValueChange={(value) => handleWooConfigUpdate('permissions', value)}>
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
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={wooCommerceConfig.status === 'active'}
                      onCheckedChange={(checked) => handleWooConfigUpdate('status', checked ? 'active' : 'inactive')}
                    />
                    <Badge className={getStatusColor(wooCommerceConfig.status)}>
                      {wooCommerceConfig.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Last Used</Label>
                  <p className="text-sm font-mono">{wooCommerceConfig.lastUsed}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Last Sync</Label>
                  <p className="text-sm font-mono">{wooCommerceConfig.lastSync}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveWooConfig}>
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={testWooConnection}>
                  Test Connection
                </Button>
                <Button variant="outline">
                  Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>Current WooCommerce integration status and health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Connection Health</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">API Rate Limit</Label>
                  <p className="text-sm font-mono">245/300 requests/hour</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Next Sync</Label>
                  <p className="text-sm font-mono">14:45 (in 15 min)</p>
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
                <Textarea id="address" defaultValue="123 Business St, Suite 100&#10;San Francisco, CA 94102" />
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure WooCommerce integration settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-sync with WooCommerce</Label>
                  <p className="text-sm text-muted-foreground">Automatically sync orders and inventory</p>
                </div>
                <Switch 
                  checked={settings.integration.autoSync}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      integration: { ...prev.integration, autoSync: checked }
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                  <Input 
                    id="syncInterval" 
                    type="number" 
                    value={settings.integration.syncInterval}
                    onChange={(e) => 
                      setSettings(prev => ({
                        ...prev,
                        integration: { ...prev.integration, syncInterval: parseInt(e.target.value) }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="errorRetries">Error Retries</Label>
                  <Input 
                    id="errorRetries" 
                    type="number" 
                    value={settings.integration.errorRetries}
                    onChange={(e) => 
                      setSettings(prev => ({
                        ...prev,
                        integration: { ...prev.integration, errorRetries: parseInt(e.target.value) }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications - Orders</Label>
                  <p className="text-sm text-muted-foreground">Receive email alerts for new orders</p>
                </div>
                <Switch 
                  checked={settings.notifications.emailOrders}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailOrders: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications - Inventory</Label>
                  <p className="text-sm text-muted-foreground">Receive email alerts for low inventory</p>
                </div>
                <Switch 
                  checked={settings.notifications.emailInventory}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailInventory: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive SMS for urgent notifications</p>
                </div>
                <Switch 
                  checked={settings.notifications.smsAlerts}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, smsAlerts: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                </div>
                <Switch 
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, pushNotifications: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch 
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, twoFactorAuth: checked }
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input 
                  id="sessionTimeout" 
                  type="number" 
                  value={settings.security.sessionTimeout}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>IP Whitelist</Label>
                  <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
                </div>
                <Switch 
                  checked={settings.security.ipWhitelist}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, ipWhitelist: checked }
                    }))
                  }
                />
              </div>
              {settings.security.ipWhitelist && (
                <div>
                  <Label htmlFor="allowedIps">Allowed IP Addresses</Label>
                  <Textarea id="allowedIps" placeholder="192.168.1.1&#10;10.0.0.1" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>API Keys</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New API Key</DialogTitle>
                      <DialogDescription>
                        Generate a new API key for accessing the supplier portal
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="keyName">Key Name</Label>
                        <Input id="keyName" placeholder="e.g., Production Key" />
                      </div>
                      <div>
                        <Label>Permissions</Label>
                        <div className="space-y-2 mt-2">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked />
                            <span className="text-sm">Read Access</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" />
                            <span className="text-sm">Write Access</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" />
                            <span className="text-sm">Delete Access</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Cancel</Button>
                        <Button>Create Key</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>Manage API keys for accessing the supplier portal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showApiKey ? 'Hide' : 'Show'} Keys
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {maskApiKey(key.key)}
                          </code>
                          <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(key.key)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {key.permissions.map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{key.lastUsed}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(key.status)}>
                          {key.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Webhooks</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Webhook</DialogTitle>
                      <DialogDescription>
                        Set up a webhook to receive real-time notifications
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="webhookUrl">Webhook URL</Label>
                        <Input id="webhookUrl" placeholder="https://yoursite.com/webhook" />
                      </div>
                      <div>
                        <Label>Events</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {availableEvents.map((event) => (
                            <label key={event} className="flex items-center gap-2">
                              <input type="checkbox" />
                              <span className="text-sm">{event}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Cancel</Button>
                        <Button>Create Webhook</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>Configure webhooks to receive real-time notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Last Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {webhook.url}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{webhook.lastDelivery}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(webhook.status)}>
                          {webhook.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Test
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsAPI;
