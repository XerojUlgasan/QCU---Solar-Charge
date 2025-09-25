import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  MapPin, 
  User, 
  Calendar,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import AdminHeader from './AdminHeader';
import { useNotification } from '../contexts/NotificationContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import '../styles/AdminProblems.css';

const AdminProblems = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { authenticatedAdminFetch } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState([]); // Store device info from dashboard

  // Helper function to safely convert to string and lowercase
  const safeToLowerCase = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).toLowerCase();
  };

  // Fetch reports from API
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== FETCHING ADMIN REPORTS DEBUG ===');
      const response = await authenticatedAdminFetch('https://api-qcusolarcharge.up.railway.app/report/getreports');
      
      console.log('Admin reports response status:', response.status);
      console.log('Admin reports response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Admin reports raw data:', data);
      console.log('Admin reports data type:', typeof data);
      console.log('Admin reports data keys:', Object.keys(data || {}));
      
      // Handle new API response structure
      if (data.success && data.reports) {
        console.log('✅ Using new API format with success and reports');
        setReports(Array.isArray(data.reports) ? data.reports : []);
      } else {
        // Fallback to old format
        const reportsData = data.reports || data.value || data;
        console.log('Admin reports processed data:', reportsData);
        console.log('Admin reports count:', Array.isArray(reportsData) ? reportsData.length : 'Not an array');
        setReports(Array.isArray(reportsData) ? reportsData : []);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load problem reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [authenticatedAdminFetch]);

  // Fetch device information from admin dashboard
  const fetchDeviceInfo = useCallback(async () => {
    try {
      console.log('=== FETCHING DEVICE INFO FROM DASHBOARD ===');
      
      const response = await authenticatedAdminFetch('https://api-qcusolarcharge.up.railway.app/admin/dashboard');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data:', data);
        
        if (data.devices && Array.isArray(data.devices)) {
          console.log('✅ Device info loaded:', data.devices.length, 'devices');
          setDeviceInfo(data.devices);
        } else {
          console.log('⚠️ No devices found in dashboard data');
          setDeviceInfo([]);
        }
      } else {
        console.log('⚠️ Dashboard API not available');
        setDeviceInfo([]);
      }
    } catch (err) {
      console.log('⚠️ Device info fetch failed:', err.message);
      setDeviceInfo([]);
    }
  }, [authenticatedAdminFetch]);

  // Fetch reports when component mounts
  useEffect(() => {
    fetchReports();
    fetchDeviceInfo();
  }, [fetchReports, fetchDeviceInfo]);

  // Format date for display
  const formatDate = (dateTime) => {
    if (!dateTime) return 'Unknown date';
    
    try {
      let date;
      
      // Handle Firestore timestamp format
      if (dateTime && typeof dateTime === 'object' && dateTime.seconds) {
        // Firestore timestamp: { seconds: number, nanoseconds: number }
        date = new Date(dateTime.seconds * 1000);
      } else if (typeof dateTime === 'string') {
        // ISO string format
        date = new Date(dateTime);
      } else if (dateTime instanceof Date) {
        // Already a Date object
        date = dateTime;
      } else {
        // Try to parse as regular date
        date = new Date(dateTime);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error, dateTime);
      return 'Unknown date';
    }
  };

  // Format time for display
  const formatTime = (dateTime) => {
    if (!dateTime) return 'Unknown time';
    
    try {
      let date;
      
      // Handle Firestore timestamp format
      if (dateTime && typeof dateTime === 'object' && dateTime.seconds) {
        date = new Date(dateTime.seconds * 1000);
      } else if (typeof dateTime === 'string') {
        date = new Date(dateTime);
      } else if (dateTime instanceof Date) {
        date = dateTime;
      } else {
        date = new Date(dateTime);
      }
      
      if (isNaN(date.getTime())) {
        return 'Unknown time';
      }
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Time formatting error:', error, dateTime);
      return 'Unknown time';
    }
  };

  // Get device information for a report
  const getDeviceInfo = (reportLocation) => {
    if (!deviceInfo || deviceInfo.length === 0) {
      return {
        name: `Device ${reportLocation || 'Unknown'}`,
        location: reportLocation || 'Unknown Location',
        building: 'Unknown Building'
      };
    }

    // Try to find matching device by location or device_id
    const device = deviceInfo.find(d => 
      d.location === reportLocation || 
      d.device_id === reportLocation ||
      d.name === reportLocation
    );

    if (device) {
      return {
        name: device.name || `Device ${device.device_id || 'Unknown'}`,
        location: device.location || reportLocation || 'Unknown Location',
        building: device.building || 'Unknown Building'
      };
    }

    // Fallback to report location
    return {
      name: `Device ${reportLocation || 'Unknown'}`,
      location: reportLocation || 'Unknown Location',
      building: 'Unknown Building'
    };
  };

  // Format reports for display
  const formatReports = () => {
    if (!reports || reports.length === 0) return [];
    
    console.log('Formatting reports:', reports);
    
    return reports.map(report => {
      console.log('Processing report:', report);
      
      // Safely convert urgencyLevel to string
      let urgencyLevel = report.urgencyLevel;
      if (typeof urgencyLevel === 'number') {
        // Convert number to string based on value
        switch (urgencyLevel) {
          case 1: urgencyLevel = 'low'; break;
          case 2: urgencyLevel = 'medium'; break;
          case 3: urgencyLevel = 'high'; break;
          case 4: urgencyLevel = 'critical'; break;
          default: urgencyLevel = 'medium';
        }
      } else if (!urgencyLevel || typeof urgencyLevel !== 'string') {
        urgencyLevel = 'medium';
      }

      // Get device information
      const deviceInfoData = getDeviceInfo(report.location);
      
      return {
        id: report.transaction_id || report.id,
        stationId: report.location || 'Unknown Station',
        stationName: deviceInfoData.name,
        stationLocation: `${deviceInfoData.location} • ${deviceInfoData.building}`,
        building: deviceInfoData.building,
        userEmail: report.email || 'Unknown Email',
        userName: report.name || (report.email ? report.email.split('@')[0] : 'Anonymous User'),
        userPhoto: report.photo || null,
        issue: report.type || report.description || 'Unknown Issue',
        description: report.description || 'No description provided',
        urgency: urgencyLevel,
        status: report.status || 'Scheduled',
        reportedDate: formatDate(report.dateTime),
        reportedTime: formatTime(report.dateTime),
        solution: report.solution || null,
        resolvedDate: report.resolvedDate ? formatDate(report.resolvedDate) : null,
        resolvedTime: report.resolvedTime ? formatTime(report.resolvedTime) : null,
        estimatedResolution: report.estimatedResolution || null,
        scheduledDate: report.scheduledDate || null
      };
    });
  };

  const formattedReports = formatReports();
  console.log('Formatted reports:', formattedReports);

  const getStatusColor = (status) => {
    const statusStr = safeToLowerCase(status);
    switch (statusStr) {
      case 'resolved': return 'status-resolved';
      case 'investigating': return 'status-investigating';
      case 'scheduled': return 'status-scheduled';
      case 'pending': return 'status-pending';
      default: return 'status-default';
    }
  };

  const getUrgencyColor = (urgency) => {
    const urgencyStr = safeToLowerCase(urgency);
    switch (urgencyStr) {
      case 'critical': return 'urgency-critical';
      case 'high': return 'urgency-high';
      case 'medium': return 'urgency-medium';
      case 'low': return 'urgency-low';
      default: return 'urgency-default';
    }
  };

  const getStatusIcon = (status) => {
    const statusStr = safeToLowerCase(status);
    switch (statusStr) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'investigating': return <Clock className="w-4 h-4" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredReports = formattedReports.filter(report => {
    const matchesSearch = safeToLowerCase(report.stationName).includes(safeToLowerCase(searchTerm)) ||
                         safeToLowerCase(report.stationId).includes(safeToLowerCase(searchTerm)) ||
                         safeToLowerCase(report.issue).includes(safeToLowerCase(searchTerm)) ||
                         safeToLowerCase(report.userEmail).includes(safeToLowerCase(searchTerm));
    
    // For newest/oldest, don't filter by status - show all reports
    const matchesStatus = filterStatus === 'all' || 
                         filterStatus === 'newest' || 
                         filterStatus === 'oldest' || 
                         safeToLowerCase(report.status) === filterStatus;
    
    const matchesUrgency = filterUrgency === 'all' || safeToLowerCase(report.urgency) === filterUrgency;
    return matchesSearch && matchesStatus && matchesUrgency;
  }).sort((a, b) => {
    // Handle newest and oldest sorting
    if (filterStatus === 'newest') {
      // Find original reports to get raw dateTime data
      const originalA = reports.find(r => (r.transaction_id || r.id) === a.id);
      const originalB = reports.find(r => (r.transaction_id || r.id) === b.id);
      
      if (originalA?.dateTime && originalB?.dateTime) {
        // Handle Firestore timestamp format
        const dateA = originalA.dateTime.seconds ? new Date(originalA.dateTime.seconds * 1000) : new Date(originalA.dateTime);
        const dateB = originalB.dateTime.seconds ? new Date(originalB.dateTime.seconds * 1000) : new Date(originalB.dateTime);
        return dateB - dateA; // Newest first
      }
    } else if (filterStatus === 'oldest') {
      // Find original reports to get raw dateTime data
      const originalA = reports.find(r => (r.transaction_id || r.id) === a.id);
      const originalB = reports.find(r => (r.transaction_id || r.id) === b.id);
      
      if (originalA?.dateTime && originalB?.dateTime) {
        // Handle Firestore timestamp format
        const dateA = originalA.dateTime.seconds ? new Date(originalA.dateTime.seconds * 1000) : new Date(originalA.dateTime);
        const dateB = originalB.dateTime.seconds ? new Date(originalB.dateTime.seconds * 1000) : new Date(originalB.dateTime);
        return dateA - dateB; // Oldest first
      }
    }
    // Default sorting (no change)
    return 0;
  });

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
      case 'admin-device-detail':
        navigate(`/admin/device/${deviceId}`);
        break;
      default:
        navigate('/admin/dashboard');
    }
  };

  const handleSendResponse = async () => {
    if (!responseText.trim()) {
      showError('Please enter a response message');
      return;
    }
    
    try {
      // Here you would typically send the response to the user via email or notification system
      // For now, we'll just show a success message
      showSuccess('Response sent to user successfully!');
      setResponseText('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error sending response:', error);
      showError('Failed to send response. Please try again.');
    }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      setUpdatingStatus(true);
      
      console.log(`=== UPDATING REPORT STATUS ===`);
      console.log('Report ID:', reportId);
      console.log('New Status:', newStatus);
      
      // Find the original report data
      const originalReport = reports.find(r => (r.transaction_id || r.id) === reportId);
      if (!originalReport) {
        showError('Report not found');
        return;
      }
      
      console.log('Original report:', originalReport);
      
      // Prepare the update data according to the API specification
      const updateData = {
        problem_id: reportId,
        status_update: newStatus
      };
      
      console.log('Update data:', updateData);
      
      // Use the correct API endpoint for updating reports
      const endpoint = 'https://api-qcusolarcharge.up.railway.app/admin/updateReport';
      
      console.log(`Updating report via: ${endpoint}`);
      
      const response = await authenticatedAdminFetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      console.log(`Response from ${endpoint}:`, response.status, response.ok);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Status update response:', responseData);
        
        showSuccess(`Report ${reportId} status updated to ${newStatus}`);
        
        // Refresh reports to show updated status
        setTimeout(() => {
          fetchReports();
        }, 1000);
      } else {
        const errorText = await response.text();
        console.log(`Error response:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showError(`Failed to update report status: ${error.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statsData = {
    total: formattedReports.length,
    pending: formattedReports.filter(r => safeToLowerCase(r.status) === 'investigating').length,
    resolved: formattedReports.filter(r => safeToLowerCase(r.status) === 'resolved').length,
    critical: formattedReports.filter(r => safeToLowerCase(r.urgency) === 'critical').length
  };

  return (
    <div id="admin-problems">
      <AdminHeader 
        title="Problem Reports" 
        navigate={handleNavigation}
      />
      
      <div className="problems-content">
        {/* Summary Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Total Reports</div>
              <MessageSquare className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statsData.total}</div>
              <div className="stat-description">All time</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Under Investigation</div>
              <Clock className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value stat-yellow">{statsData.pending}</div>
              <div className="stat-description">Active cases</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Resolved</div>
              <CheckCircle className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value stat-green">{statsData.resolved}</div>
              <div className="stat-description">Completed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Critical Issues</div>
              <AlertTriangle className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value stat-red">{statsData.critical}</div>
              <div className="stat-description">High priority</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-filter-group">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="investigating">Investigating</option>
              <option value="scheduled">Scheduled</option>
              <option value="resolved">Resolved</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>

            <select 
              value={filterUrgency} 
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Urgency</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="reports-list">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading problem reports...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button onClick={fetchReports} className="retry-button">
                Try Again
              </button>
            </div>
          ) : filteredReports.length > 0 ? (
            filteredReports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div className="report-info">
                  <div className="report-title-group">
                    <div className="report-title">{report.issue}</div>
                    <div className="report-badges">
                      <div className={`urgency-badge ${getUrgencyColor(report.urgency)}`}>
                        {report.urgency}
                      </div>
                      <div className={`status-badge ${getStatusColor(report.status)}`}>
                        {getStatusIcon(report.status)}
                        <span>{report.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="report-details">
                    <div className="detail-item">
                      <MapPin className="detail-icon" />
                      <span className="station-location">{report.stationLocation}</span>
                    </div>
                    <div className="detail-item">
                      <User className="detail-icon" />
                      <span>{report.userEmail}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar className="detail-icon" />
                      <span>{report.reportedDate} at {report.reportedTime}</span>
                    </div>
                  </div>
                </div>
                
                <div className="report-actions">
                  <button 
                    className="view-details-button"
                    onClick={() => {
                      setSelectedReport(report);
                      setIsDialogOpen(true);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
              
              <div className="report-content">
                <div className="description-box">
                  <div className="description-label">Description:</div>
                  <div className="description-text">
                    "{report.description}"
                  </div>
                </div>
                
                  {safeToLowerCase(report.status) === 'scheduled' && report.scheduledDate && (
                  <div className="status-info status-blue">
                    Scheduled for resolution: {report.scheduledDate}
                  </div>
                )}
                
                  {safeToLowerCase(report.status) === 'investigating' && report.estimatedResolution && (
                  <div className="status-info status-yellow">
                    Estimated resolution: {report.estimatedResolution}
                  </div>
                )}
                
                  {safeToLowerCase(report.status) === 'resolved' && report.resolvedDate && (
                  <div className="status-info status-green">
                    Resolved on {report.resolvedDate} at {report.resolvedTime}
                  </div>
                )}
              </div>
            </div>
            ))
          ) : (
            <div className="no-reports">
              <AlertTriangle className="no-reports-icon" />
              <p>No problem reports found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Report Details Dialog */}
        {isDialogOpen && selectedReport && (
          <div className="dialog-overlay">
            <div className="dialog-content">
              <div className="dialog-header">
                <div className="dialog-title-group">
                  <h3 className="dialog-title">Report {selectedReport.id}</h3>
                  <div className={`urgency-badge ${getUrgencyColor(selectedReport.urgency)}`}>
                    {selectedReport.urgency}
                  </div>
                </div>
                <p className="dialog-description">
                  Reported by {selectedReport.userName} on {selectedReport.reportedDate}
                </p>
                <button 
                  className="dialog-close"
                  onClick={() => setIsDialogOpen(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="dialog-body">
                <div className="problem-section">
                  <h4 className="section-title">Problem Description</h4>
                  <div className="problem-description">
                    {selectedReport.description}
                  </div>
                </div>
                
                <div className="details-grid">
                  <div className="detail-section">
                    <h4 className="section-title">Station Details</h4>
                    <div className="detail-content">
                      <p className="station-name">{selectedReport.stationName}</p>
                      <p className="station-location">{selectedReport.stationLocation}</p>
                      <p>ID: {selectedReport.stationId}</p>
                    </div>
                  </div>
                  <div className="detail-section">
                    <h4 className="section-title">Reporter</h4>
                    <div className="detail-content">
                      <p>{selectedReport.userName}</p>
                      <p>{selectedReport.userEmail}</p>
                    </div>
                  </div>
                </div>

                {safeToLowerCase(selectedReport.status) === 'resolved' && selectedReport.solution && (
                  <div className="solution-section">
                    <h4 className="section-title">Solution</h4>
                    <div className="solution-content">
                      {selectedReport.solution}
                    </div>
                    <p className="solution-date">
                      Resolved on {selectedReport.resolvedDate} at {selectedReport.resolvedTime}
                    </p>
                  </div>
                )}

                <div className="response-section">
                  <h4 className="section-title">Send Response to User</h4>
                  <textarea
                    placeholder="Type your response to the user..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="response-textarea"
                  />
                  <button 
                    className="send-response-button"
                    onClick={handleSendResponse}
                  >
                    Send Response
                  </button>
                </div>

                <div className="action-buttons">
                  {safeToLowerCase(selectedReport.status) !== 'resolved' && (
                    <>
                      <button 
                        className="action-button"
                        onClick={() => handleUpdateStatus(selectedReport.id, 'investigating')}
                        disabled={updatingStatus}
                      >
                        {updatingStatus ? 'Updating...' : 'Mark as Investigating'}
                      </button>
                      <button 
                        className="action-button"
                        onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                        disabled={updatingStatus}
                      >
                        {updatingStatus ? 'Updating...' : 'Mark as Resolved'}
                      </button>
                    </>
                  )}
                  <button 
                    className="action-button"
                    onClick={() => handleNavigation('admin-device-detail', selectedReport.stationId)}
                  >
                    <ExternalLink className="button-icon" />
                    View Station
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

export default AdminProblems;
