import { auth } from '../firebase';

// Centralized API Base URL
export const API_BASE_URL = 'https://my-node-api-j9ua.onrender.com';

/**
 * Make an authenticated API call with JWT token
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Response>} - Fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
    const user = auth.currentUser;
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Add JWT token if user is authenticated
    if (user) {
        try {
            
            const token = await user.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
            console.log('JWT token added to request');
        } catch (error) {
            console.error('Error getting ID token:', error);
        }
    } else {
        console.log('No authenticated user found');
    }
    
    console.log('Making request to:', url);
    console.log('Request options:', { ...options, headers: { ...headers, Authorization: headers.Authorization ? 'Bearer [TOKEN]' : 'None' } });
    
    return fetch(url, {
        ...options,
        headers
    });
};

/**
 * Make a GET request with authentication
 * @param {string} url - API endpoint URL
 * @returns {Promise<Response>} - Fetch response
 */
export const authenticatedGet = (url) => {
    return authenticatedFetch(url, { method: 'GET' });
};

/**
 * Make a POST request with authentication
 * @param {string} url - API endpoint URL
 * @param {Object} data - Request body data
 * @returns {Promise<Response>} - Fetch response
 */
export const authenticatedPost = (url, data) => {
    return authenticatedFetch(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

/**
 * Make a PUT request with authentication
 * @param {string} url - API endpoint URL
 * @param {Object} data - Request body data
 * @returns {Promise<Response>} - Fetch response
 */
export const authenticatedPut = (url, data) => {
    return authenticatedFetch(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

/**
 * Make a DELETE request with authentication
 * @param {string} url - API endpoint URL
 * @returns {Promise<Response>} - Fetch response
 */
export const authenticatedDelete = (url) => {
    return authenticatedFetch(url, { method: 'DELETE' });
};

/**
 * Send contact message
 * @param {string} from - Sender's email
 * @param {string} subject - Message subject
 * @param {string} message - Message content
 * @param {string} photo_url - Sender's photo URL
 * @returns {Promise<Response>} - Fetch response
 */
export const postContact = async (from, subject, message, photo_url) => {
    const url = API_BASE_URL + '/contact/postContact';
    const data = {
        from,
        subject,
        message,
        photo_url
    };
    return authenticatedPost(url, data);
};

/**
 * Get admin information
 * @returns {Promise<Response>} - Fetch response
 */
export const getAdminInformation = async () => {
    const url = API_BASE_URL + '/admin/getAdminInformation';
    return authenticatedGet(url);
};

/**
 * Set admin information
 * @param {string} full_name - Admin's full name
 * @param {string} primary_email - Admin's primary email
 * @param {string} backup_email - Admin's backup email
 * @returns {Promise<Response>} - Fetch response
 */
export const setAdminInformation = async (full_name, primary_email, backup_email) => {
    const url = API_BASE_URL + '/admin/setAdminInformation';
    const data = {
        full_name,
        primary_email,
        backup_email
    };
    console.log('setAdminInformation API call:', { url, data });
    console.log('Backup email value:', backup_email);
    console.log('Backup email type:', typeof backup_email);
    console.log('Backup email length:', backup_email ? backup_email.length : 'null/undefined');
    return authenticatedPost(url, data);
};

/**
 * Change admin username
 * @param {string} new_username - New username
 * @param {string} current_password - Current password for verification
 * @returns {Promise<Response>} - Fetch response
 */
export const changeAdminUsername = async (new_username, current_password) => {
    const url = API_BASE_URL + '/admin/changeAdminUsername';
    const data = {
        new_username,
        current_password
    };
    console.log('changeAdminUsername API call:', { url, data });
    return authenticatedPost(url, data);
};

/**
 * Change admin password
 * @param {string} current_password - Current password for verification
 * @param {string} new_password - New password
 * @returns {Promise<Response>} - Fetch response
 */
export const changeAdminPassword = async (current_password, new_password) => {
    const url = API_BASE_URL + '/admin/changeAdminPassword';
    const data = {
        current_password,
        new_password
    };
    console.log('changeAdminPassword API call:', { url, data });
    return authenticatedPost(url, data);
};

/**
 * Send OTP for admin password reset
 * @param {string} email - Admin email address
 * @returns {Promise<Response>} - Fetch response
 */
export const sendOtp = async (email) => {
    const url = API_BASE_URL + '/admin/sendOtp';
    const data = {
        email
    };
    
    console.log('=== API SEND OTP DEBUG ===');
    console.log('URL:', url);
    console.log('Data being sent:', data);
    console.log('Data JSON string:', JSON.stringify(data));
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        console.log('API Response received');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Handle 404 error - endpoint doesn't exist
        if (response.status === 404) {
            console.warn('⚠️ API endpoint /admin/sendOtp not found (404)');
            console.warn('Backend needs to implement this endpoint');
            
            // Only use demo mode for specific test emails
            const testEmails = ['admin@ecocharge.com', 'test@admin.com', 'demo@admin.com'];
            if (testEmails.includes(email.toLowerCase())) {
                // Generate demo OTP only for test emails
                const demoOtp = generateDemoOtp();
                console.log('🎯 Generated demo OTP for test email:', demoOtp);
                
                // Return a mock response for development
                const mockResponse = new Response(JSON.stringify({
                    success: true,
                    message: 'OTP endpoint not implemented yet - using demo mode for test email',
                    otp: demoOtp,
                    demo: true
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
                
                console.log('📤 Returning mock response with status 200');
                return mockResponse;
            } else {
                // For non-test emails, return proper 404 error
                console.log('❌ Email not found in system:', email);
                return response;
            }
        }
        
        return response;
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
};

// Generate demo OTP for development
const generateDemoOtp = () => {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let otp = '';
    for (let i = 0; i < 6; i++) {
        otp += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return otp;
};

/**
 * Verify OTP for admin password reset
 * @param {string} otp - OTP code to verify
 * @param {string} email - Admin email address
 * @returns {Promise<Response>} - Fetch response
 */
export const verifyOtp = async (otp, email) => {
    const url = API_BASE_URL + '/admin/verifyOtp';
    const data = {
        otp,
        email
    };
    
    console.log('=== API VERIFY OTP DEBUG ===');
    console.log('URL:', url);
    console.log('Data being sent:', data);
    console.log('Data JSON string:', JSON.stringify(data));
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        console.log('API Response received');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        return response;
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
};

export const changePassword = async (otp, email, newPassword) => {
    const url = API_BASE_URL + '/admin/changePassword';
    const data = {
        otp,
        email,
        new_password: newPassword
    };
    
    console.log('=== API CHANGE PASSWORD DEBUG ===');
    console.log('URL:', url);
    console.log('Data being sent:', data);
    console.log('Data JSON string:', JSON.stringify(data));
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        console.log('API Response received');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        return response;
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
};
