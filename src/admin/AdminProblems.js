import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  MapPin, 
  User, 
  Calendar,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import AdminHeader from './AdminHeader';
import { useNotification } from '../contexts/NotificationContext';
import '../styles/AdminProblems.css';

const AdminProblems = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const reports = [
    {
      id: "RPT-001",
      stationId: "QCU-002",
      stationName: "Student Center",
      building: "Student Center",
      userEmail: "sarah.martinez@qcu.edu.ph",
      userName: "Sarah Martinez",
      issue: "Charging port not working",
      description: "The USB-C port on the left side is not providing power. I tried multiple cables and devices but nothing charges. The LED indicator doesn't light up when a cable is connected.",
      urgency: "high",
      status: "resolved",
      reportedDate: "2024-12-10",
      reportedTime: "14:30",
      resolvedDate: "2024-12-10",
      resolvedTime: "16:45",
      assignedTo: "Tech Team A",
      solution: "Replaced faulty USB-C port module. Tested with multiple devices - all working properly now."
    },
    {
      id: "RPT-002",
      stationId: "QCU-001",
      stationName: "Main Library",
      building: "Library Building",
      userEmail: "john.doe@qcu.edu.ph",
      userName: "John Doe",
      issue: "RFID reader not responding",
      description: "When I tap my student ID card on the RFID reader, nothing happens. The screen shows 'Ready' but doesn't recognize my card. Other students are having the same issue.",
      urgency: "medium",
      status: "investigating",
      reportedDate: "2024-12-09",
      reportedTime: "10:15",
      assignedTo: "Tech Team B",
      estimatedResolution: "2024-12-12"
    },
    {
      id: "RPT-003",
      stationId: "QCU-004",
      stationName: "Sports Complex",
      building: "Sports Complex",
      userEmail: "mike.lee@qcu.edu.ph",
      userName: "Mike Lee",
      issue: "Screen display issues",
      description: "The main display screen has flickering issues and sometimes goes completely black. You can still charge devices but can't see the status or time remaining.",
      urgency: "medium",
      status: "scheduled",
      reportedDate: "2024-12-08",
      reportedTime: "16:20",
      assignedTo: "Tech Team A",
      scheduledDate: "2024-12-13"
    },
    {
      id: "RPT-004",
      stationId: "QCU-003",
      stationName: "Engineering Building",
      building: "Engineering Building",
      userEmail: "anna.garcia@qcu.edu.ph",
      userName: "Anna Garcia",
      issue: "Payment system error",
      description: "I tried to pay for charging using the QR code but the payment keeps failing. The system shows 'Payment Error' after scanning. My bank account shows the transaction went through but charging didn't start.",
      urgency: "high",
      status: "investigating",
      reportedDate: "2024-12-11",
      reportedTime: "09:45",
      assignedTo: "Tech Team B"
    },
    {
      id: "RPT-005",
      stationId: "QCU-001",
      stationName: "Main Library",
      building: "Library Building",
      userEmail: "lisa.wong@qcu.edu.ph",
      userName: "Lisa Wong",
      issue: "Physical damage to station",
      description: "The protective glass over the solar panel has a large crack. It happened during the storm last week. The station still works but I'm concerned about water damage.",
      urgency: "low",
      status: "scheduled",
      reportedDate: "2024-12-07",
      reportedTime: "11:30",
      assignedTo: "Maintenance Team",
      scheduledDate: "2024-12-15"
    },
    {
      id: "RPT-006",
      stationId: "QCU-002",
      stationName: "Student Center",
      building: "Student Center",
      userEmail: "carlos.rivera@qcu.edu.ph",
      userName: "Carlos Rivera",
      issue: "Overheating problems",
      description: "The charging station feels very hot to touch, especially around the power outlets. I'm worried it might be a safety issue. Other students have noticed it too.",
      urgency: "critical",
      status: "investigating",
      reportedDate: "2024-12-11",
      reportedTime: "13:20",
      assignedTo: "Safety Team"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'status-resolved';
      case 'investigating': return 'status-investigating';
      case 'scheduled': return 'status-scheduled';
      case 'pending': return 'status-pending';
      default: return 'status-default';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'urgency-critical';
      case 'high': return 'urgency-high';
      case 'medium': return 'urgency-medium';
      case 'low': return 'urgency-low';
      default: return 'urgency-default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'investigating': return <Clock className="w-4 h-4" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.stationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesUrgency = filterUrgency === 'all' || report.urgency === filterUrgency;
    return matchesSearch && matchesStatus && matchesUrgency;
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

  const handleSendResponse = () => {
    if (!responseText.trim()) {
      showError('Please enter a response message');
      return;
    }
    
    showSuccess('Response sent to user successfully!');
    setResponseText('');
    setIsDialogOpen(false);
  };

  const handleUpdateStatus = (reportId, newStatus) => {
    showSuccess(`Report ${reportId} status updated to ${newStatus}`);
  };

  const statsData = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'investigating').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    critical: reports.filter(r => r.urgency === 'critical').length
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
          {filteredReports.map((report) => (
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
                      <span>{report.stationName} ({report.stationId})</span>
                    </div>
                    <div className="detail-item">
                      <User className="detail-icon" />
                      <span>{report.userEmail}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar className="detail-icon" />
                      <span>{report.reportedDate} at {report.reportedTime}</span>
                    </div>
                    <div className="detail-item">
                      <span>Assigned to: {report.assignedTo}</span>
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
                <p className="report-description">
                  {report.description}
                </p>
                
                {report.status === 'scheduled' && report.scheduledDate && (
                  <div className="status-info status-blue">
                    Scheduled for resolution: {report.scheduledDate}
                  </div>
                )}
                
                {report.status === 'investigating' && report.estimatedResolution && (
                  <div className="status-info status-yellow">
                    Estimated resolution: {report.estimatedResolution}
                  </div>
                )}
                
                {report.status === 'resolved' && report.resolvedDate && (
                  <div className="status-info status-green">
                    Resolved on {report.resolvedDate} at {report.resolvedTime}
                  </div>
                )}
              </div>
            </div>
          ))}
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
                      <p>{selectedReport.stationName}</p>
                      <p>{selectedReport.building}</p>
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

                {selectedReport.status === 'resolved' && selectedReport.solution && (
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
                  {selectedReport.status !== 'resolved' && (
                    <>
                      <button 
                        className="action-button"
                        onClick={() => handleUpdateStatus(selectedReport.id, 'investigating')}
                      >
                        Mark as Investigating
                      </button>
                      <button 
                        className="action-button"
                        onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                      >
                        Mark as Resolved
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

        {filteredReports.length === 0 && (
          <div className="no-reports">
            <AlertTriangle className="no-reports-icon" />
            <p>No problem reports found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProblems;
