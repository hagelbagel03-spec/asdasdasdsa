import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

interface DiscordMessagesProps {
  user: any;
  token: string; 
  selectedChannel: string;
  theme?: any;
  usersByStatus?: any; // Add usersByStatus prop
}

const DiscordMessages: React.FC<DiscordMessagesProps> = ({ user, token, selectedChannel, theme, usersByStatus }) => {
  const colors = theme?.colors || {
    primary: '#1E3A8A',
    background: '#F3F4F6',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
  };

  // Simple states
  const [currentView, setCurrentView] = useState<'channels' | 'userList' | 'chat'>('channels');
  const [selectedChannelId, setSelectedChannelId] = useState('allgemein');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const API_URL = "http://212.227.57.238:8001";

  // Simple channels
  const channels = [
    { id: 'allgemein', name: 'allgemein', icon: 'chatbubbles', color: '#5865F2' },
    { id: 'streife', name: 'streife', icon: 'car-sport', color: '#57F287' },
    { id: 'dienst', name: 'dienst', icon: 'shield-checkmark', color: '#FEE75C' },
  ];

  // Get real users from usersByStatus prop
  const users = React.useMemo(() => {
    if (!usersByStatus) return [];
    
    const allUsers = [];
    Object.entries(usersByStatus).forEach(([status, statusUsers]) => {
      (statusUsers as any[]).forEach((statusUser) => {
        allUsers.push({
          id: statusUser.id,
          username: statusUser.username,
          role: statusUser.rank || statusUser.role || 'Beamter',
          status: statusUser.is_online ? 'online' : 'offline',
          avatar: statusUser.username.charAt(0).toUpperCase() + (statusUser.username.split(' ')[1]?.[0] || '').toUpperCase(),
          department: statusUser.department,
          service_number: statusUser.service_number
        });
      });
    });
    
    // Remove current user from list
    return allUsers.filter(u => u.id !== user?.id);
  }, [usersByStatus, user]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const messageToSend = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Add message locally for immediate feedback - no backend needed
      const newMsg = {
        id: Date.now().toString(),
        content: messageToSend,
        sender_name: user?.username || 'Du',
        sender_id: user?.id || 'test-user',
        created_at: new Date().toISOString(),
        isOwn: true
      };
      
      setMessages(prev => [...prev, newMsg]);
      
      // Mock response from other users for testing
      if (Math.random() > 0.7) {
        setTimeout(() => {
          const responses = [
            'Roger that!',
            'Verstanden, Chef!',
            'Bin unterwegs',
            'Alles klar!',
            '10-4'
          ];
          const mockResponse = {
            id: (Date.now() + 1).toString(),
            content: responses[Math.floor(Math.random() * responses.length)],
            sender_name: currentView === 'chat' && selectedUser ? selectedUser.username : 'Kollege',
            sender_id: currentView === 'chat' && selectedUser ? selectedUser.id : 'other-user',
            created_at: new Date().toISOString(),
            isOwn: false
          };
          setMessages(prev => [...prev, mockResponse]);
        }, 2000);
      }

    } catch (error) {
      console.error('Error sending:', error);
      setNewMessage(messageToSend);
    } finally {
      setSending(false);
    }
  };

  // Channel List View
  if (currentView === 'channels') {
    return (
      <View style={styles.container}>
        <View style={styles.discordHeader}>
          <Text style={styles.serverName}>🏢 Stadtwache Schwelm</Text>
        </View>
        
        <View style={styles.channelSection}>
          <Text style={styles.sectionTitle}>TEXT CHANNELS</Text>
          
          {channels.map((channel) => (
            <TouchableOpacity
              key={channel.id}
              style={[
                styles.channelItem,
                selectedChannelId === channel.id && styles.channelItemActive
              ]}
              onPress={() => {
                setSelectedChannelId(channel.id);
                setMessages([]); // Clear messages
              }}
            >
              <Ionicons 
                name={channel.icon as any}
                size={20} 
                color={selectedChannelId === channel.id ? '#FFFFFF' : '#8E9297'}
                style={{ marginRight: 8 }}
              />
              <Text style={[
                styles.channelName,
                selectedChannelId === channel.id && styles.channelNameActive
              ]}>
                # {channel.name}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.userButton}
            onPress={() => setCurrentView('userList')}
          >
            <Ionicons name="person-add" size={20} color="#FFFFFF" />
            <Text style={styles.userButtonText}>Benutzer schreiben</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.chatArea}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderText}>
              # {channels.find(ch => ch.id === selectedChannelId)?.name}
            </Text>
          </View>
          
          <ScrollView style={styles.messagesArea} ref={scrollViewRef}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#5865F2" />
                <Text style={styles.loadingText}>Laden...</Text>
              </View>
            ) : messages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Noch keine Nachrichten in #{channels.find(ch => ch.id === selectedChannelId)?.name}
                </Text>
              </View>
            ) : (
              messages.map((message) => (
                <View key={message.id} style={[
                  styles.messageContainer,
                  message.isOwn ? styles.ownMessage : styles.otherMessage
                ]}>
                  {!message.isOwn && (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {message.sender_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  
                  <View style={[
                    styles.messageBubble,
                    message.isOwn ? styles.ownBubble : styles.otherBubble
                  ]}>
                    {!message.isOwn && (
                      <Text style={styles.senderName}>{message.sender_name}</Text>
                    )}
                    <Text style={[
                      styles.messageText,
                      message.isOwn ? styles.ownText : styles.otherText
                    ]}>
                      {message.content}
                    </Text>
                  </View>
                  
                  {message.isOwn && (
                    <View style={styles.ownAvatar}>
                      <Text style={styles.avatarText}>ME</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder={`Nachricht in #${channels.find(ch => ch.id === selectedChannelId)?.name}...`}
              placeholderTextColor="#72767D"
              multiline
              editable={!sending}
            />
            <TouchableOpacity
              style={[styles.sendButton, { opacity: !newMessage.trim() ? 0.5 : 1 }]}
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // User List View
  if (currentView === 'userList') {
    return (
      <View style={styles.container}>
        <View style={styles.userHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentView('channels')}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.userHeaderText}>Benutzer auswählen</Text>
        </View>
        
        <ScrollView style={{ flex: 1 }}>
          {users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Keine registrierten Benutzer gefunden
              </Text>
              <Text style={[styles.emptyText, { fontSize: 14, marginTop: 8 }]}>
                Benutzer werden geladen...
              </Text>
            </View>
          ) : (
            users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userItem}
                onPress={() => {
                  setSelectedUser(user);
                  setCurrentView('chat');
                  setMessages([]); // Clear messages
                }}
              >
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>{user.avatar}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.username}</Text>
                  <Text style={styles.userRole}>{user.role}</Text>
                </View>
                <View style={[styles.statusDot, { 
                  backgroundColor: user.status === 'online' ? '#23A55A' : 
                                  user.status === 'away' ? '#F0B232' :
                                  user.status === 'busy' ? '#F23F43' : '#80848E'
                }]} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // Direct Message View
  return (
    <View style={styles.container}>
      <View style={styles.dmHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentView('userList')}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.dmHeaderText}>@ {selectedUser?.username}</Text>
      </View>
      
      <ScrollView style={styles.messagesArea} ref={scrollViewRef}>
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Noch keine Nachrichten mit {selectedUser?.username}
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <View key={message.id} style={[
              styles.messageContainer,
              message.isOwn ? styles.ownMessage : styles.otherMessage
            ]}>
              {!message.isOwn && (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{selectedUser?.avatar}</Text>
                </View>
              )}
              
              <View style={[
                styles.messageBubble,
                message.isOwn ? styles.ownBubble : styles.otherBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  message.isOwn ? styles.ownText : styles.otherText
                ]}>
                  {message.content}
                </Text>
              </View>
              
              {message.isOwn && (
                <View style={styles.ownAvatar}>
                  <Text style={styles.avatarText}>ME</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder={`Nachricht an ${selectedUser?.username}...`}
          placeholderTextColor="#72767D"
          multiline
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, { opacity: !newMessage.trim() ? 0.5 : 1 }]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          <Ionicons name="send" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#36393F',
  },
  discordHeader: {
    backgroundColor: '#202225',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#40444B',
  },
  serverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  channelSection: {
    paddingHorizontal: 8,
    paddingVertical: 16,
    backgroundColor: '#2F3136',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E9297',
    marginBottom: 8,
    marginLeft: 8,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 2,
  },
  channelItemActive: {
    backgroundColor: '#393C43',
  },
  channelName: {
    fontSize: 16,
    color: '#8E9297',
    flex: 1,
  },
  channelNameActive: {
    color: '#FFFFFF',
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5865F2',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  userButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  chatArea: {
    flex: 2,
    backgroundColor: '#36393F',
  },
  chatHeader: {
    backgroundColor: '#36393F',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#40444B',
  },
  chatHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userHeader: {
    backgroundColor: '#202225',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#40444B',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dmHeader: {
    backgroundColor: '#202225',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#40444B',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  userHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dmHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#40444B',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5865F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#B9BBBE',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  messagesArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#5865F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  ownAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00B4D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: '70%',
  },
  ownBubble: {
    backgroundColor: '#0078FF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#404449',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  ownText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#DCDDDE',
  },
  inputContainer: {
    backgroundColor: '#40444B',
    margin: 16,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    fontSize: 14,
    color: '#DCDDDE',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#5865F2',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#B9BBBE',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#8E9297',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DiscordMessages;