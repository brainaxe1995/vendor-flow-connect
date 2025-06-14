
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store, Eye, EyeOff, Copy, TestTube, CheckCircle, AlertTriangle } from 'lucide-react';
import { useWooCommerceConfig } from '@/hooks/useWooCommerceConfig';
import { wooCommerceService } from '@/services/woocommerce';
import { WooCommerceConfig } from '@/types/woocommerce';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface WooCommerceSettingsProps {
  user: any;
}

const WooCommerceSettings: React.FC<WooCommerceSettingsProps> = ({ user: contextUser }) => {
  const { user: supabaseUser } = useSupabaseAuth();
  const { config, saveConfig } = useWooCommerceConfig();
  const [showWooKeys, setShowWooKeys] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [wooCommerceConfig, setWooCommerceConfig] = useState<WooCommerceConfig>({
    storeUrl: '',
    consumerKey: '',
    consumerSecret: '',
    environment: 'live',
    permissions: 'write',
    status: 'inactive',
    lastUsed: '',
    lastSync: ''
  });

  // Use Supabase user if available, otherwise fall back to context user
  const currentUser = supabaseUser || contextUser;

  useEffect(() => {
    if (config) {
      setWooCommerceConfig(config);
      setConnectionStatus(config.status === 'active' ? 'connected' : 'unknown');
    }
  }, [config]);

  const validateConfig = (configToValidate: WooCommerceConfig): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!configToValidate.storeUrl?.trim()) {
      errors.storeUrl = 'Store URL is required';
    } else if (!configToValidate.storeUrl.match(/^https?:\/\/.+/)) {
      errors.storeUrl = 'Store URL must be a valid URL starting with http:// or https://';
    }
    
    if (!configToValidate.consumerKey?.trim()) {
      errors.consumerKey = 'Consumer Key is required';
    } else if (!configToValidate.consumerKey.startsWith('ck_')) {
      errors.consumerKey = 'Consumer Key should start with "ck_"';
    }
    
    if (!configToValidate.consumerSecret?.trim()) {
      errors.consumerSecret = 'Consumer Secret is required';
    } else if (!configToValidate.consumerSecret.startsWith('cs_')) {
      errors.consumerSecret = 'Consumer Secret should start with "cs_"';
    }
    
    return errors;
  };

  const maskWooKey = (key: string) => {
    if (!key) return '';
    if (!showWooKeys) {
      return key.substring(0, 8) + '••••••••••••••••' + key.substring(key.length - 4);
    }
    return key;
  };

  const handleWooConfigUpdate = (field: keyof WooCommerceConfig, value: string | boolean) => {
    const updatedConfig = {
      ...wooCommerceConfig,
      [field]: value
    };
    setWooCommerceConfig(updatedConfig);
    
    // Clear validation errors for this field
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const testWooConnection = async () => {
    // Validate before testing
    const errors = validateConfig(wooCommerceConfig);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix validation errors before testing connection');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('unknown');
    
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Connection test failed: ${errorMessage}`);
      console.error('Connection test error:', error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveWooConfig = async () => {
    if (!currentUser) {
      toast.error('Please log in to save configuration');
      return;
    }

    // Validate before saving
    const errors = validateConfig(wooCommerceConfig);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    try {
      const success = await saveConfig(wooCommerceConfig);
      
      if (success) {
        setConnectionStatus('connected');
        toast.success('WooCommerce configuration saved successfully!');
      } else {
        setConnectionStatus('failed');
        toast.error('Failed to save configuration. Please check your credentials.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save configuration: ${errorMessage}`);
      console.error('Save config error:', error);
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' || status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          WooCommerce API Configuration
          {getConnectionIcon()}
        </CardTitle>
        <CardDescription>
          Configure your WooCommerce store connection settings. These credentials are stored securely in your database and used for all API communications.
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
              placeholder="https://yourstore.com"
              className={validationErrors.storeUrl ? 'border-red-500' : ''}
            />
            {validationErrors.storeUrl && (
              <p className="text-sm text-red-600">{validationErrors.storeUrl}</p>
            )}
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
              <Label htmlFor="consumerKey">Consumer Key *</Label>
              <div className="flex gap-2">
                <Input
                  id="consumerKey"
                  type={showWooKeys ? "text" : "password"}
                  value={showWooKeys ? wooCommerceConfig.consumerKey : maskWooKey(wooCommerceConfig.consumerKey)}
                  onChange={(e) => handleWooConfigUpdate('consumerKey', e.target.value)}
                  placeholder="ck_xxxxxxxxxxxxxxxx"
                  className={`font-mono text-sm ${validationErrors.consumerKey ? 'border-red-500' : ''}`}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleCopyToClipboard(wooCommerceConfig.consumerKey)}
                  disabled={!wooCommerceConfig.consumerKey}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {validationErrors.consumerKey && (
                <p className="text-sm text-red-600">{validationErrors.consumerKey}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="consumerSecret">Consumer Secret *</Label>
              <div className="flex gap-2">
                <Input
                  id="consumerSecret"
                  type={showWooKeys ? "text" : "password"}
                  value={showWooKeys ? wooCommerceConfig.consumerSecret : maskWooKey(wooCommerceConfig.consumerSecret)}
                  onChange={(e) => handleWooConfigUpdate('consumerSecret', e.target.value)}
                  placeholder="cs_xxxxxxxxxxxxxxxx"
                  className={`font-mono text-sm ${validationErrors.consumerSecret ? 'border-red-500' : ''}`}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleCopyToClipboard(wooCommerceConfig.consumerSecret)}
                  disabled={!wooCommerceConfig.consumerSecret}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {validationErrors.consumerSecret && (
                <p className="text-sm text-red-600">{validationErrors.consumerSecret}</p>
              )}
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
          <Button 
            onClick={handleSaveWooConfig}
            disabled={isTestingConnection}
          >
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WooCommerceSettings;
