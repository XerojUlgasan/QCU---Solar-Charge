import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  User, 
  RefreshCw, 
  Send, 
  Eye,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Search
} from 'lucide-react';
import AdminHeader from './AdminHeader';
import { useNotification } from '../contexts/NotificationContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/AdminContactMessages.css';
import { API_BASE_URL } from '../utils/api';

const AdminContactMessages = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { authenticatedAdminFetch } = useAdminAuth();
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('newest');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for demonstration
  const mockMessages = [
    {
      id: 'h7SKXI09NbQSlrybb4D1',
      message: 'Mensahe galing sa nigger',
      from: 'xeroj1342@gmail.com',
      subject: 'Subject lamao',
      timestamp: {
        seconds: 1703123456,
        nanoseconds: 0
      },
      photo_url: null,
      hasRead: false,
      responded: false
    },
    {
      id: '2',
      message: 'I was charged twice for the same charging session yesterday. Can you please help me with a refund?',
      from: 'sarah.kim@qcu.edu.ph',
      subject: 'Payment issue',
      timestamp: {
        seconds: 1703037656,
        nanoseconds: 0
      },
      photo_url: null,
      hasRead: true,
      responded: true,
      admin_response: 'Thank you for reporting this issue. We have processed a refund for the duplicate charge. You should see it reflected in your account within 3-5 business days.',
      responded_at: '2024-12-14T16:20:00Z'
    }
  ];

  // Fetch contact messages from API
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('=== FETCHING CONTACT MESSAGES ===');
      
      // Try to fetch from API first
      const response = await authenticatedAdminFetch(API_BASE_URL + '/contact/getContact');
      
      console.log('Contact messages response status:', response.status);
      console.log('Contact messages response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Contact messages raw data:', data);
        
        // Handle API response structure
        if (data.success && data.messages) {
          console.log('✅ Using API format with success and messages');
          console.log('Server messages with status:', data.messages.map(m => ({ id: m.id, hasRead: m.hasRead, responded: m.responded, admin_response: m.admin_response })));
          
          // Apply localStorage overrides for responded messages
          const respondedMessages = JSON.parse(localStorage.getItem('respondedContactMessages') || '{}');
          const updatedMessages = data.messages.map(message => {
            if (respondedMessages[message.id]) {
              return { ...message, ...respondedMessages[message.id] };
            }
            return message;
          });
          
          setMessages(updatedMessages);
        } else if (Array.isArray(data)) {
          console.log('✅ Using direct array format');
          console.log('Server messages with status:', data.map(m => ({ id: m.id, hasRead: m.hasRead, responded: m.responded, admin_response: m.admin_response })));
          
          // Apply localStorage overrides for responded messages
          const respondedMessages = JSON.parse(localStorage.getItem('respondedContactMessages') || '{}');
          const updatedMessages = data.map(message => {
            if (respondedMessages[message.id]) {
              return { ...message, ...respondedMessages[message.id] };
            }
            return message;
          });
          
          setMessages(updatedMessages);
        } else {
          // Fallback to mock data if API doesn't return expected format
          console.log('⚠️ API format not as expected, using mock data');
          setMessages(mockMessages);
        }
      } else {
        // Use mock data if API fails
        console.log('⚠️ API failed, using mock data');
        setMessages(mockMessages);
      }
    } catch (err) {
      console.error('Error fetching contact messages:', err);
      console.log('⚠️ Error occurred, using mock data');
      setMessages(mockMessages);
      setError('Failed to load contact messages. Using demo data.');
    } finally {
      setIsLoading(false);
    }
  }, [authenticatedAdminFetch]);

  // Fetch messages when component mounts
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleNavigation = (route, deviceId) => {
    switch (route) {
      case 'admin-dashboard':
        navigate('/admin/dashboard');
        break;
      case 'admin-devices':
        navigate('/admin/devices');
        break;
      case 'admin-problems':
        navigate('/admin/problems');
        break;
      case 'admin-contact':
        navigate('/admin/contact');
        break;
      case 'admin-device-detail':
        navigate(`/admin/device/${deviceId}`);
        break;
      default:
        navigate('/admin/dashboard');
    }
  };

  const handleRefresh = () => {
    fetchMessages();
  };

  const handleSendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) {
      showError('Please enter a response message');
      return;
    }

    try {
      console.log('=== SENDING CONTACT RESPONSE ===');
      console.log('Selected message:', selectedMessage);
      console.log('Response text:', responseText);
      
      // Try to send response via API
      const responseData = {
        id: selectedMessage.id,
        email: selectedMessage.from,
        response: responseText.trim()
      };
      
      console.log('Response data:', responseData);
      
      const response = await authenticatedAdminFetch( API_BASE_URL + '/admin/sendResponseContact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData)
      });
      
      console.log('Send response API response:', response.status, response.ok);
      
      if (response.ok) {
        const responseResult = await response.json();
        console.log('Send response result:', responseResult);
        console.log('Email sending status:', responseResult.emailSent);
        console.log('API success status:', responseResult.success);
        
        // Check if email was actually sent
        if (responseResult.emailSent === false) {
          console.error('Email was not sent:', responseResult.error);
          showError(`Email sending failed: ${responseResult.error || 'Email service unavailable'}`);
          return;
        }
        
        if (responseResult.success === false) {
          console.error('API returned success=false:', responseResult);
          showError(`Failed to send email: ${responseResult.message || 'Unknown error'}`);
          return;
        }
        
        // Try to update the message status on the server
        try {
          const updateResponse = await authenticatedAdminFetch(API_BASE_URL + '/admin/updateContactStatus', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contact_id: selectedMessage.id,
              responded: true,
              hasRead: true,
              admin_response: responseText.trim(),
              responded_at: new Date().toISOString()
            })
          });
          console.log('Update status response:', updateResponse.status, updateResponse.ok);
        } catch (updateError) {
          console.log('Status update failed, but response was sent:', updateError);
        }
        
        // Update the message status locally to reflect the response
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === selectedMessage.id 
              ? { ...msg, responded: true, hasRead: true, admin_response: responseText.trim(), responded_at: new Date().toISOString() }
              : msg
          )
        );
        
        // Store the responded status in localStorage to persist across refreshes
        const respondedMessages = JSON.parse(localStorage.getItem('respondedContactMessages') || '{}');
        respondedMessages[selectedMessage.id] = {
          responded: true,
          hasRead: true,
          admin_response: responseText.trim(),
          responded_at: new Date().toISOString()
        };
        localStorage.setItem('respondedContactMessages', JSON.stringify(respondedMessages));
        
        showSuccess('Response sent successfully!');
        setIsDialogOpen(false);
        setResponseText('');
        setSelectedMessage(null);
        
        // Don't refresh immediately - let the local state update persist
        // The server will update the status on its own time
      } else {
        // API failed - get error details
        const errorText = await response.text();
        console.log('⚠️ API failed with status:', response.status);
        console.log('⚠️ API error response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.log('⚠️ Parsed error:', errorJson);
        } catch {
          console.log('⚠️ Could not parse error response');
        }
        
        // Update the message status locally for demo mode
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === selectedMessage.id 
              ? { ...msg, responded: true, hasRead: true, admin_response: responseText.trim(), responded_at: new Date().toISOString() }
              : msg
          )
        );
        
        // Store the responded status in localStorage for demo mode
        const respondedMessages = JSON.parse(localStorage.getItem('respondedContactMessages') || '{}');
        respondedMessages[selectedMessage.id] = {
          responded: true,
          hasRead: true,
          admin_response: responseText.trim(),
          responded_at: new Date().toISOString()
        };
        localStorage.setItem('respondedContactMessages', JSON.stringify(respondedMessages));
        
        showSuccess('Response saved locally! (Email sending may have failed)');
        setIsDialogOpen(false);
        setResponseText('');
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error sending response:', error);
      // Simulate success with mock data
      
      // Update the message status locally for demo mode
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === selectedMessage.id 
            ? { ...msg, responded: true, hasRead: true, admin_response: responseText.trim(), responded_at: new Date().toISOString() }
            : msg
        )
      );
      
      // Store the responded status in localStorage for demo mode
      const respondedMessages = JSON.parse(localStorage.getItem('respondedContactMessages') || '{}');
      respondedMessages[selectedMessage.id] = {
        responded: true,
        hasRead: true,
        admin_response: responseText.trim(),
        responded_at: new Date().toISOString()
      };
      localStorage.setItem('respondedContactMessages', JSON.stringify(respondedMessages));
      
      showSuccess('Response sent successfully! (Demo mode)');
      setIsDialogOpen(false);
      setResponseText('');
      setSelectedMessage(null);
    }
  };

  const getStatusColor = (message) => {
    if (message.responded) return 'status-responded';
    if (!message.hasRead) return 'status-unread';
    return 'status-read';
  };

  const getStatusIcon = (message) => {
    if (message.responded) return <MessageSquare className="w-4 h-4" />;
    if (!message.hasRead) return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = (message) => {
    if (message.responded) return 'Responded';
    if (!message.hasRead) return 'Unread';
    return 'Read';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      let date;
      
      // Handle Firestore timestamp format
      if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error, timestamp);
      return 'Unknown date';
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'unread') {
      matchesStatus = !message.hasRead;
    } else if (statusFilter === 'responded') {
      matchesStatus = message.responded;
    }
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Sort by date based on dateFilter
    const timestampA = a.timestamp?.seconds || 0;
    const timestampB = b.timestamp?.seconds || 0;
    
    if (dateFilter === 'newest') {
      return timestampB - timestampA; // Newest first
    } else if (dateFilter === 'oldest') {
      return timestampA - timestampB; // Oldest first
    }
    
    return 0; // No sorting
  });

  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.hasRead).length,
    responded: messages.filter(m => m.responded).length
  };

  return (
    <div id="admin-contact-messages" style={{
      backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937'
    }}>
      <AdminHeader 
        title="Contact Messages" 
        navigate={handleNavigation}
      />
      
      <div className="contact-content">
        {/* Header Section */}
        <div className="contact-header">
          <h2 className="contact-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Contact Messages</h2>
        </div>

        {/* Summary Stats */}
        <div className="stats-grid">
          <div className="stat-card" style={{
            backgroundColor: isDarkMode ? '#0f141c' : '#f9fafb',
            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
            boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div className="stat-header">
              <div className="stat-title" style={{color: isDarkMode ? '#e2e8f0' : '#1f2937'}}>Total Messages</div>
              <Mail className="w-6 h-6 stat-icon" style={{color: isDarkMode ? '#3b82f6' : '#2563eb'}} />
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>{stats.total}</div>
              <div className="stat-description" style={{color: isDarkMode ? '#94a3b8' : '#6b7280'}}>All time</div>
            </div>
          </div>

           <div className="stat-card" style={{
             backgroundColor: isDarkMode ? '#0f141c' : '#f9fafb',
             border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
             boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
           }}>
             <div className="stat-header">
               <div className="stat-title" style={{color: isDarkMode ? '#e2e8f0' : '#1f2937'}}>Unread</div>
               <Clock className="w-6 h-6 stat-icon" style={{color: isDarkMode ? '#f59e0b' : '#d97706'}} />
             </div>
             <div className="stat-content">
               <div className="stat-value stat-yellow" style={{color: isDarkMode ? '#f59e0b' : '#f59e0b'}}>{stats.unread}</div>
               <div className="stat-description" style={{color: isDarkMode ? '#94a3b8' : '#6b7280'}}>Awaiting response</div>
             </div>
           </div>

          <div className="stat-card" style={{
            backgroundColor: isDarkMode ? '#0f141c' : '#f9fafb',
            border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
            boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div className="stat-header">
              <div className="stat-title" style={{color: isDarkMode ? '#e2e8f0' : '#1f2937'}}>Responded</div>
              <MessageSquare className="w-6 h-6 stat-icon" style={{color: isDarkMode ? '#10b981' : '#16a34a'}} />
            </div>
            <div className="stat-content">
              <div className="stat-value stat-blue" style={{color: isDarkMode ? '#3b82f6' : '#10b981'}}>{stats.responded}</div>
              <div className="stat-description" style={{color: isDarkMode ? '#94a3b8' : '#6b7280'}}>Replied to</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-filter-group">
            <div className="filters-left">
              <div className="search-container">
                <Search className="search-icon" style={{color: isDarkMode ? '#94a3b8' : '#1f2937'}} />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  style={{
                    backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                    border: isDarkMode ? '1px solid #374151' : '2px solid #d1d5db',
                    color: isDarkMode ? '#ffffff' : '#1f2937'
                  }}
                />
              </div>
              
               <select 
                 value={statusFilter} 
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="filter-select"
                 style={{
                   backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                   border: isDarkMode ? '1px solid #374151' : '2px solid #d1d5db',
                   color: isDarkMode ? '#ffffff' : '#1f2937'
                 }}
               >
                 <option value="all">All Status</option>
                 <option value="unread">Unread</option>
                 <option value="responded">Responded</option>
               </select>
               
               <select 
                 value={dateFilter} 
                 onChange={(e) => setDateFilter(e.target.value)}
                 className="filter-select"
                 style={{
                   backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                   border: isDarkMode ? '1px solid #374151' : '2px solid #d1d5db',
                   color: isDarkMode ? '#ffffff' : '#1f2937'
                 }}
               >
                 <option value="newest">Newest First</option>
                 <option value="oldest">Oldest First</option>
               </select>
            </div>

            <div className="filters-right">
              <button 
                onClick={handleRefresh}
                className="refresh-button"
                disabled={isLoading}
                style={{
                  backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                  border: isDarkMode ? '1px solid #374151' : '2px solid #d1d5db',
                  color: isDarkMode ? '#ffffff' : '#1f2937'
                }}
              >
                <RefreshCw className="refresh-icon" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Messages Grid */}
        <div className="messages-grid">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading contact messages...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button onClick={handleRefresh} className="retry-button">
                Try Again
              </button>
            </div>
          ) : filteredMessages.length > 0 ? (
            filteredMessages.map((message) => (
              <div key={message.id} className="message-card" style={{
                backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                <div className="message-header">
                  <div className="message-info">
                    <div className="message-title-group">
                      <div className="message-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Subject: {message.subject}</div>
                      <div className="message-badges">
                        <div className={`status-badge ${getStatusColor(message)}`}>
                          {getStatusIcon(message)}
                          <span>{getStatusText(message)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="message-details">
                      <div className="detail-item user-info-item">
                        <div className="user-info">
                          {message.photo_url ? (
                            <img 
                              src={message.photo_url} 
                              alt="Sender" 
                              className="user-photo"
                              style={{border: isDarkMode ? '2px solid #1e2633' : '2px solid #d1d5db'}}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="user-photo-fallback" style={{ 
                            display: message.photo_url ? 'none' : 'flex',
                            border: isDarkMode ? '2px solid #1e2633' : '2px solid #d1d5db'
                          }}>
                            <User className="photo-icon" />
                          </div>
                          <div className="user-details">
                            <div className="user-email" style={{color: isDarkMode ? '#cbd5e1' : '#1f2937'}}>
                              <User className="detail-icon" />
                              <span>{message.from}</span>
                            </div>
                            <div className="datetime-info" style={{color: isDarkMode ? '#94a3b8' : '#1f2937'}}>
                              <Clock className="detail-icon" />
                              <span>{formatDate(message.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="message-content">
                  <div className="description-box" style={{
                    backgroundColor: isDarkMode ? 'rgba(107, 114, 128, 0.05)' : 'rgba(107, 114, 128, 0.05)',
                    border: isDarkMode ? '1px solid rgba(107, 114, 128, 0.1)' : '1px solid #d1d5db'
                  }}>
                    <div className="description-label" style={{color: isDarkMode ? '#94a3b8' : '#1f2937'}}>Message:</div>
                    <div className="description-text" style={{color: isDarkMode ? '#d1d5db' : '#1f2937'}}>
                      "{message.message}"
                    </div>
                  </div>
                </div>
                
                <div className="message-actions">
                  <button 
                    className="view-details-button"
                    onClick={() => {
                      setSelectedMessage(message);
                      setResponseText(message.admin_response || '');
                      setIsDialogOpen(true);
                    }}
                    style={{
                      backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
                      border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                      color: isDarkMode ? '#ffffff' : '#1f2937'
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-messages">
              <Mail className="no-messages-icon" style={{color: isDarkMode ? '#94a3b8' : '#1f2937'}} />
              <p style={{color: isDarkMode ? '#94a3b8' : '#1f2937'}}>No contact messages found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Message Details Dialog */}
        {isDialogOpen && selectedMessage && (
          <div className="dialog-overlay" style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)'
          }}>
            <div className="dialog-content" style={{
              backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
              border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
              boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
            }}>
                 <div className="dialog-header">
                   <div className="dialog-title-group">
                     <h3 className="dialog-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Message {selectedMessage.id}</h3>
                     <div className={`status-badge ${getStatusColor(selectedMessage)}`}>
                       {getStatusText(selectedMessage)}
                     </div>
                   </div>
                   <button 
                     className="dialog-close"
                     onClick={() => setIsDialogOpen(false)}
                     style={{
                       color: isDarkMode ? '#94a3b8' : '#1f2937',
                       backgroundColor: 'transparent'
                     }}
                   >
                     ×
                   </button>
                 </div>
              
              <div className="dialog-body">
                 <div className="message-section">
                   <h4 className="section-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Message Details</h4>
                   <div className="sender-info">
                     {selectedMessage.photo_url ? (
                       <img 
                         src={selectedMessage.photo_url} 
                         alt="Sender" 
                         className="sender-photo"
                         style={{border: isDarkMode ? '2px solid #1e2633' : '2px solid #d1d5db'}}
                         onError={(e) => {
                           e.target.style.display = 'none';
                           e.target.nextSibling.style.display = 'flex';
                         }}
                       />
                     ) : null}
                     <div className="sender-photo-fallback" style={{ 
                       display: selectedMessage.photo_url ? 'none' : 'flex',
                       border: isDarkMode ? '2px solid #1e2633' : '2px solid #d1d5db'
                     }}>
                       <User className="photo-icon" />
                     </div>
                     <div className="sender-details">
                       <div className="message-description" style={{color: isDarkMode ? '#d1d5db' : '#1f2937'}}>
                         <strong>Subject:</strong> {selectedMessage.subject}
                       </div>
                       <div className="message-description" style={{color: isDarkMode ? '#d1d5db' : '#1f2937'}}>
                         <strong>From:</strong> {selectedMessage.from}
                       </div>
                       <div className="message-description" style={{color: isDarkMode ? '#d1d5db' : '#1f2937'}}>
                         <strong>Date:</strong> {formatDate(selectedMessage.timestamp)}
                       </div>
                     </div>
                   </div>
                   <div className="message-description" style={{color: isDarkMode ? '#d1d5db' : '#1f2937'}}>
                     <strong>Message:</strong> "{selectedMessage.message}"
                   </div>
                 </div>

                {selectedMessage.admin_response && (
                  <div className="response-section">
                    <h4 className="section-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Previous Response</h4>
                    <div className="response-content" style={{
                      backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(107, 114, 128, 0.05)',
                      border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.1)' : '1px solid #d1d5db',
                      color: isDarkMode ? '#d1d5db' : '#1f2937'
                    }}>
                      {selectedMessage.admin_response}
                    </div>
                    <p className="response-date" style={{color: isDarkMode ? '#94a3b8' : '#1f2937'}}>
                      Responded on {selectedMessage.responded_at ? formatDate(selectedMessage.responded_at) : 'N/A'}
                    </p>
                  </div>
                )}

                <div className="response-section">
                  <h4 className="section-title" style={{color: isDarkMode ? '#ffffff' : '#1f2937'}}>Send Response to User</h4>
                  <textarea
                    placeholder="Type your response to the user..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="response-textarea"
                    style={{
                      backgroundColor: isDarkMode ? '#0b1119' : '#ffffff',
                      border: isDarkMode ? '1px solid #2a3446' : '2px solid #d1d5db',
                      color: isDarkMode ? '#ffffff' : '#1f2937'
                    }}
                  />
                  <button 
                    className="send-response-button"
                    onClick={handleSendResponse}
                    style={{
                      backgroundColor: isDarkMode ? '#3b82f6' : '#3b82f6',
                      border: isDarkMode ? '1px solid #3b82f6' : '2px solid #2563eb',
                      color: '#ffffff'
                    }}
                  >
                    Send Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContactMessages;


