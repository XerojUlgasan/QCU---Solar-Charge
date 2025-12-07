import React, { useState, useMemo } from 'react';
import { X, Play, Loader2, AlertCircle, Database, ArrowUp, ArrowDown } from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { API_BASE_URL } from '../utils/api';
import '../styles/CustomQueryModal.css';

const CustomQueryModal = ({ isOpen, onClose }) => {
  const { authenticatedAdminFetch } = useAdminAuth();
  const { isDarkMode } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleExecuteQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await authenticatedAdminFetch(API_BASE_URL + '/admin/customquery', {
        method: 'POST',
        body: JSON.stringify({ query: query.trim() })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // Handle different response formats
      // If it's an array, use it directly
      // If it's an object with a 'data' or 'results' property, use that
      // Otherwise, wrap it in an array for display
      if (Array.isArray(data)) {
        setResults(data);
      } else if (data.data && Array.isArray(data.data)) {
        setResults(data.data);
      } else if (data.results && Array.isArray(data.results)) {
        setResults(data.results);
      } else if (data.rows && Array.isArray(data.rows)) {
        setResults(data.rows);
      } else {
        // For non-array responses (like UPDATE, DELETE, INSERT), show the message
        setResults([{ message: data.message || 'Query executed successfully', ...data }]);
      }
    } catch (err) {
      console.error('Query execution error:', err);
      setError(err.message || 'Failed to execute query. Please check your query syntax.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuery('');
    setResults(null);
    setError('');
    onClose();
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return <span style={{ color: isDarkMode ? '#6b7280' : '#9ca3af', fontStyle: 'italic' }}>null</span>;
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const getTableHeaders = () => {
    if (!results || !Array.isArray(results) || results.length === 0) {
      return [];
    }
    return Object.keys(results[0]);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = useMemo(() => {
    if (!results || !Array.isArray(results) || !sortConfig.key) {
      return results;
    }

    return [...results].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Handle different types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Convert to string for comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [results, sortConfig]);

  if (!isOpen) return null;

  return (
    <div 
      className={`custom-query-modal-overlay ${isDarkMode ? '' : 'light'}`} 
      onClick={handleClose}
      style={{
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <div 
        className={`custom-query-modal ${isDarkMode ? '' : 'light'}`} 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
          border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
          boxShadow: isDarkMode ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 20px 40px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Header */}
        <div 
          className="modal-header"
          style={{
            backgroundColor: isDarkMode ? '#0f141c' : '#ffffff',
            borderBottom: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database className="w-5 h-5" style={{ color: '#3b82f6' }} />
            <h2 className="modal-title" style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>
              Custom SQL Query
            </h2>
          </div>
          <button 
            className="close-button" 
            onClick={handleClose}
            style={{
              color: isDarkMode ? '#9aa3b2' : '#1f2937',
              backgroundColor: 'transparent',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isDarkMode ? '#1e2633' : '#f3f4f6';
              e.target.style.color = isDarkMode ? '#ffffff' : '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = isDarkMode ? '#9aa3b2' : '#1f2937';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content" style={{ backgroundColor: isDarkMode ? '#0f141c' : '#ffffff' }}>
          {/* Main Container - Side by Side Layout (Desktop) / Stacked (Mobile) */}
          <div className="query-layout-container">
            {/* Left Side - Query Input Section */}
            <div className="query-input-section" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <label 
                className="query-label" 
                style={{ color: isDarkMode ? '#9aa3b2' : '#1f2937' }}
              >
                Enter SQL Query
              </label>
              <div style={{ position: 'relative', marginBottom: error ? '0' : '0', flex: '0 0 auto' }}>
                <textarea
                  className="query-textarea"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SELECT * FROM tbl_devices LIMIT 10;"
                  style={{
                    backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
                    border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                    color: isDarkMode ? '#ffffff' : '#1f2937',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    width: '100%',
                    overflow: 'auto',
                    boxSizing: 'border-box'
                  }}
                  rows={12}
                  disabled={loading}
                />
              </div>
              {error && (
                <div 
                  className="error-message"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: isDarkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '2px solid rgba(239, 68, 68, 0.3)',
                    color: isDarkMode ? '#fca5a5' : '#dc2626',
                    marginTop: '0.75rem',
                    flex: '0 0 auto'
                  }}
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <button
                className="execute-button"
                onClick={handleExecuteQuery}
                disabled={loading || !query.trim()}
                style={{
                  backgroundColor: loading || !query.trim() 
                    ? (isDarkMode ? '#1e2633' : '#d1d5db')
                    : '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '500',
                  marginTop: '1rem',
                  cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                  flex: '0 0 auto',
                  width: 'auto',
                  alignSelf: 'flex-start',
                  padding: '0.75rem 1.5rem'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Execute Query
                  </>
                )}
              </button>
            </div>

            {/* Right Side - Results Section */}
            <div className="results-section" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {results ? (
                <>
              <div 
                className="results-header"
                style={{
                  borderBottom: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
                  paddingBottom: '0.75rem',
                  marginBottom: '1rem',
                  flex: '0 0 auto'
                }}
              >
                <h3 style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>
                  Query Results
                  {Array.isArray(results) && (
                    <span style={{ 
                      color: isDarkMode ? '#9aa3b2' : '#6b7280',
                      fontSize: '0.875rem',
                      fontWeight: 'normal',
                      marginLeft: '0.5rem'
                    }}>
                      ({results.length} row{results.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </h3>
              </div>

              {Array.isArray(results) && results.length > 0 ? (
                <div className="results-table-container">
                  <table 
                    className="results-table"
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff',
                      tableLayout: 'auto'
                    }}
                  >
                    <thead>
                      <tr style={{ 
                        backgroundColor: isDarkMode ? '#1e2633' : '#f9fafb',
                        borderBottom: isDarkMode ? '2px solid #374151' : '2px solid #e5e7eb'
                      }}>
                        {getTableHeaders().map((header, index) => (
                          <th
                            key={index}
                            onClick={() => handleSort(header)}
                            style={{
                              padding: '0.75rem',
                              textAlign: 'left',
                              color: isDarkMode ? '#ffffff' : '#1f2937',
                              fontWeight: '600',
                              fontSize: '0.875rem',
                              borderRight: index < getTableHeaders().length - 1
                                ? (isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb')
                                : 'none',
                              cursor: 'pointer',
                              userSelect: 'none',
                              transition: 'background-color 0.2s',
                              position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#e5e7eb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#1e2633' : '#f9fafb';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>{header}</span>
                              {sortConfig.key === header && (
                                sortConfig.direction === 'asc' 
                                  ? <ArrowUp className="w-4 h-4" style={{ opacity: 0.7 }} />
                                  : <ArrowDown className="w-4 h-4" style={{ opacity: 0.7 }} />
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedResults.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          style={{
                            borderBottom: isDarkMode ? '1px solid #1e2633' : '1px solid #e5e7eb',
                            backgroundColor: rowIndex % 2 === 0
                              ? (isDarkMode ? '#0b0e13' : '#ffffff')
                              : (isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#f9fafb')
                          }}
                        >
                          {getTableHeaders().map((header, colIndex) => (
                            <td
                              key={colIndex}
                              style={{
                                padding: '0.75rem',
                                color: isDarkMode ? '#ffffff' : '#1f2937',
                                fontSize: '0.875rem',
                                borderRight: colIndex < getTableHeaders().length - 1
                                  ? (isDarkMode ? '1px solid #1e2633' : '1px solid #e5e7eb')
                                  : 'none',
                                maxWidth: '300px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={formatValue(row[header])}
                            >
                              {formatValue(row[header])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : Array.isArray(results) && results.length === 0 ? (
                <div 
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: isDarkMode ? '#9aa3b2' : '#6b7280'
                  }}
                >
                  Query executed successfully but returned no results.
                </div>
              ) : (
                <div 
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: isDarkMode ? '#9aa3b2' : '#6b7280'
                  }}
                >
                  <pre style={{
                    backgroundColor: isDarkMode ? '#0b0e13' : '#f9fafb',
                    padding: '1rem',
                    borderRadius: '0.375rem',
                    overflow: 'auto',
                    textAlign: 'left',
                    color: isDarkMode ? '#ffffff' : '#1f2937'
                  }}>
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              )}
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: isDarkMode ? '#9aa3b2' : '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  Execute a query to see results here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomQueryModal;

