
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Mail, Bell, Send, Search, Filter, Plus, Paperclip, Star, Archive, Trash2 } from 'lucide-react';

const CommunicationCenter = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Mock data for communications
  const messages = {
    inbox: [
      {
        id: 'MSG-001',
        from: 'John Doe',
        email: 'john.doe@email.com',
        subject: 'Question about order #12345',
        preview: 'Hi, I have a question about my recent order...',
        date: '2024-01-15 14:30',
        read: false,
        priority: 'high',
        orderNumber: '12345'
      },
      {
        id: 'MSG-002',
        from: 'Jane Smith',
        email: 'jane.smith@email.com',
        subject: 'Shipping delay inquiry',
        preview: 'Could you please provide an update on...',
        date: '2024-01-15 12:15',
        read: true,
        priority: 'medium',
        orderNumber: '12346'
      }
    ],
    sent: [
      {
        id: 'MSG-003',
        to: 'Mike Johnson',
        email: 'mike.j@email.com',
        subject: 'Re: Order status update',
        preview: 'Thank you for your inquiry. Your order is...',
        date: '2024-01-14 16:45',
        orderNumber: '12340'
      }
    ],
    announcements: [
      {
        id: 'ANN-001',
        title: 'New shipping policy update',
        content: 'We have updated our shipping policies effective immediately...',
        date: '2024-01-12',
        priority: 'high',
        audience: 'All Customers'
      }
    ],
    notifications: [
      {
        id: 'NOT-001',
        type: 'order',
        title: 'New order received',
        message: 'Order #12347 has been placed by Sarah Wilson',
        date: '2024-01-15 15:30',
        read: false
      },
      {
        id: 'NOT-002',
        type: 'payment',
        title: 'Payment received',
        message: 'Payment for order #12340 has been processed',
        date: '2024-01-15 14:20',
        read: true
      }
    ]
  };

  const communicationStats = {
    unreadMessages: 3,
    responseTime: 2.5,
    satisfactionScore: 4.8,
    totalConversations: 156
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      order: '📦',
      payment: '💳',
      shipping: '🚚',
      support: '💬'
    };
    return icons[type] || '📌';
  };

  const MessagesList = ({ messages, showRecipient = false }) => (
    <div className="space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${
            !message.read ? 'bg-blue-50 border-blue-200' : 'bg-background'
          }`}
          onClick={() => setSelectedMessage(message)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {(showRecipient ? message.to : message.from)?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {showRecipient ? message.to : message.from}
                    </span>
                    {message.priority && (
                      <Badge className={getPriorityColor(message.priority)} variant="outline">
                        {message.priority}
                      </Badge>
                    )}
                    {!message.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {showRecipient ? message.email : message.email}
                  </p>
                </div>
              </div>
              <h4 className="font-medium mb-1">{message.subject}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{message.preview}</p>
              {message.orderNumber && (
                <Badge variant="outline" className="mt-2">
                  Order #{message.orderNumber}
                </Badge>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{message.date}</p>
              <div className="flex gap-1 mt-2">
                <Button variant="ghost" size="sm">
                  <Star className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Archive className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Communication Center</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-10 w-64" />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose New Message</DialogTitle>
                <DialogDescription>
                  Send a message to a customer or create an announcement
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="messageType">Message Type</Label>
                    <select id="messageType" className="w-full p-2 border rounded-md">
                      <option>Customer Message</option>
                      <option>Announcement</option>
                      <option>Order Update</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select id="priority" className="w-full p-2 border rounded-md">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="recipient">To</Label>
                  <Input id="recipient" placeholder="Enter email address..." />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Enter subject..." />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={6} placeholder="Type your message..." />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="w-4 h-4 mr-2" />
                    Attach Files
                  </Button>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationStats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationStats.responseTime}h</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationStats.satisfactionScore}/5.0</div>
            <p className="text-xs text-muted-foreground">Customer rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationStats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            Inbox <Badge variant="secondary">{messages.inbox.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            Sent <Badge variant="secondary">{messages.sent.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            Announcements <Badge variant="secondary">{messages.announcements.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            Notifications <Badge variant="secondary">{messages.notifications.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>Incoming messages from customers</CardDescription>
            </CardHeader>
            <CardContent>
              <MessagesList messages={messages.inbox} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle>Sent Messages</CardTitle>
              <CardDescription>Messages you have sent to customers</CardDescription>
            </CardHeader>
            <CardContent>
              <MessagesList messages={messages.sent} showRecipient={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>Broadcast messages and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{announcement.title}</h4>
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Audience: {announcement.audience}</span>
                      <span>{announcement.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>System notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messages.notifications.map((notification) => (
                  <div key={notification.id} className={`p-3 border rounded-lg flex items-center gap-3 ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-background'
                  }`}>
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{notification.title}</h5>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{notification.date}</p>
                      {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-auto" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationCenter;
