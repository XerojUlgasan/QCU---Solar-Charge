import { auth } from '../firebase';

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
    const url = 'https://api-qcusolarcharge.up.railway.app/contact/postContact';
    const data = {
        from,
        subject,
        message,
        photo_url
    };
    return authenticatedPost(url, data);
};
