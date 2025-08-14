// /js/login.js
// Use ES modules; keep one canonical ApiClient for the app.

// Use the global API_BASE variable set by app.js
// Access it through window.API_BASE to avoid redeclaration
(function() {
  // Use a different variable name to avoid conflicts
  const apiBaseUrl = window.API_BASE || document.querySelector('meta[name="api-base"]')?.content?.replace(/\/$/, '') || 'https://hospital-management-gp1l.onrender.com';
  console.log('Login.js using API base URL:', apiBaseUrl);
  
  // Make all references to API_BASE in this file use apiBaseUrl instead
  window.LOGIN_API_BASE = apiBaseUrl;
})();

/* -------------------------
  Token store using localStorage for persistence
  ------------------------- */
const TokenStore = (function () {
  return {
    set(token, expiry) { 
      console.log('TokenStore.set() called with token:', token ? token.substring(0, 10) + '...' : 'null');
      console.log('TokenStore.set() called with expiry:', expiry);
      try {
        if (!token) {
          console.error('TokenStore.set(): Attempted to store null/empty token');
          return false;
        }
        
        // Force token to be string
        const tokenStr = String(token);
        const expiryStr = expiry ? expiry.toString() : '';
        
        // Clear storage first to avoid conflicts
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_expiry');
        
        // Set items
        localStorage.setItem('access_token', tokenStr);
        if (expiry) localStorage.setItem('token_expiry', expiryStr);
        console.log('TokenStore.set() completed successfully');
        
        // Verify storage was successful
        const storedToken = localStorage.getItem('access_token');
        const storedExpiry = localStorage.getItem('token_expiry');
        console.log('Verification - token stored:', storedToken ? 'yes' : 'no');
        console.log('Verification - expiry stored:', storedExpiry ? 'yes' : 'no');
        
        if (expiry) {
          console.log('Token expires at:', new Date(expiry * 1000).toLocaleString());
        }
        
        return !!storedToken;
      } catch (error) {
        console.error('Error in TokenStore.set():', error);
        return false;
      }
    },
    get() { 
      const token = localStorage.getItem('access_token');
      console.log('TokenStore.get() called, token exists:', !!token);
      if (token && token.length > 10) {
        console.log('Token (first 10 chars):', token.substring(0, 10) + '...');
      }
      return token;
    },
    clear() { 
      console.log('TokenStore.clear() called');
      // Store current values for logging
      const hadAccessToken = !!localStorage.getItem('access_token');
      const hadExpiry = !!localStorage.getItem('token_expiry');
      const hadRefreshToken = !!localStorage.getItem('refresh_token');
      
      localStorage.removeItem('access_token'); 
      localStorage.removeItem('token_expiry');
      localStorage.removeItem('refresh_token');
      
      console.log('TokenStore.clear() results:');
      console.log('- Access token removed:', hadAccessToken);
      console.log('- Token expiry removed:', hadExpiry);
      console.log('- Refresh token removed:', hadRefreshToken);
      
      return true;
    },
    isExpired() {
      const token = this.get();
      if (!token) {
        console.log('TokenStore.isExpired(): No token found');
        return true;
      }
      const expiry = localStorage.getItem('token_expiry');
      if (!expiry) {
        console.log('TokenStore.isExpired(): No expiry found');
        return false;
      }
      
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = parseInt(expiry);
      
      if (isNaN(expiryTime)) {
        console.error('TokenStore.isExpired(): Invalid expiry format:', expiry);
        return true;
      }
      
      const isExp = (now >= expiryTime - 10); // refresh 10s early
      const timeLeft = expiryTime - now;
      
      console.log(`TokenStore.isExpired(): Current time: ${now}, Token expiry: ${expiry}, Is expired: ${isExp}`);
      if (!isExp) {
        console.log(`Token expires in ${timeLeft} seconds (${Math.floor(timeLeft / 60)} minutes)`);
      } else {
        console.log(`Token expired ${-timeLeft + 10} seconds ago`);
      }
      
      return isExp;
    }
  };
})();

/* -------------------------
  Utility: parse JWT exp
  ------------------------- */
function parseJwtExp(jwt) {
  try {
    console.log('Parsing JWT token for expiry');
    if (!jwt) {
      console.error('parseJwtExp: No JWT token provided');
      return null;
    }
    
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      console.error('parseJwtExp: Invalid JWT format, expected 3 parts but got', parts.length);
      return null;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    try {
      const payload = JSON.parse(atob(base64));
      console.log('JWT payload parsed successfully, exp value:', payload.exp);
      return payload.exp || null;
    } catch (decodeError) {
      console.error('parseJwtExp: Failed to decode JWT payload:', decodeError);
      return null;
    }
  } catch (e) { 
    console.error('parseJwtExp: Unexpected error:', e);
    return null; 
  }
}

/* -------------------------
  ApiClient: centralized fetch with auto-refresh
  ------------------------- */
class ApiClient {
  constructor(base) {
    this.base = base;
    this._isRefreshing = false;
    this._refreshPromise = null;
  }

  // Low-level fetch wrapper
  async fetch(path, options = {}) {
    const url = path.startsWith('http') ? path : (this.base + path);
    // For cross-origin requests with credentials, we need to handle CORS differently
    // When using 'include' for credentials, the server must specify the exact origin
    // in Access-Control-Allow-Origin, not a wildcard '*'
    const opts = { 
      credentials: 'include', // Changed back to 'include' to allow cross-origin cookies
      headers: {
        'Accept': 'application/json'
      }, 
      ...options 
    };
    opts.headers['Content-Type'] = opts.headers['Content-Type'] || 'application/json';

    // Attach Authorization if we have a token
    const token = TokenStore.get();
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;

    let res = await fetch(url, opts);

    // If unauthorized, try to refresh then retry once
    if (res.status === 401) {
      const refreshed = await this._tryRefresh();
      if (refreshed) {
        const newToken = TokenStore.get();
        if (newToken) opts.headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(url, opts);
      }
    }

    // handle JSON responses
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if (!res.ok) {
      const err = new Error(data?.detail || res.statusText || 'Request failed');
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  // Refresh access token flow, concurrency-safe
  async _tryRefresh() {
    // Skip refresh if no token exists
    if (!TokenStore.get()) {
      return false;
    }
    
    if (this._isRefreshing) {
      // another call is already refreshing — wait for it
      try { await this._refreshPromise; return !!TokenStore.get(); }
      catch { return false; }
    }

    this._isRefreshing = true;
    this._refreshPromise = (async () => {
      try {
        // Get refresh token from localStorage and send it to refresh endpoint
        const storedRefreshToken = localStorage.getItem('refresh_token');
        if (!storedRefreshToken) {
          console.error('No refresh token available');
          throw new Error('No refresh token available');
        }
        
        console.log('Attempting to refresh token');
        
        // Try different refresh token endpoints
        let res;
        try {
          res = await fetch(`${this.base}/api/user/token/refresh/`, {
            method: 'POST',
            credentials: 'include',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ refresh: storedRefreshToken })
          });
          
          if (res.status === 404) {
            console.log('Trying alternate refresh endpoint');
            res = await fetch(`${this.base}/api/user/token/refresh/`, {
              method: 'POST',
              credentials: 'include',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({ refresh: storedRefreshToken })
            });
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
          throw error;
        }

        if (!res.ok) {
          // logout client-side if refresh fails
          TokenStore.clear();
          throw new Error('Refresh failed');
        }

        const data = await res.json();
        console.log('Refresh token response:', data);
        
        // Handle different response formats
        let accessToken = data.access || data.token || data.access_token;
        let refreshToken = data.refresh || data.refresh_token;
        
        if (!accessToken) {
          console.error('Refresh response missing access token:', data);
          throw new Error('No access token returned during refresh');
        }

        console.log('Updating tokens after refresh');
        const exp = parseJwtExp(accessToken);
        TokenStore.set(accessToken, exp);
        
        // Store new refresh token if provided
        if (refreshToken) {
          console.log('Storing new refresh token');
          localStorage.setItem('refresh_token', refreshToken);
        }
        
        return true;
      } finally {
        this._isRefreshing = false;
      }
    })();

    try {
      return await this._refreshPromise;
    } catch (e) {
      return false;
    }
  }

  // convenience methods
  get(path, opts) { return this.fetch(path, { method: 'GET', ...opts }); }
  post(path, body, opts = {}) {
    return this.fetch(path, { method: 'POST', body: JSON.stringify(body), ...opts });
  }
  put(path, body, opts = {}) { return this.fetch(path, { method: 'PUT', body: JSON.stringify(body), ...opts }); }
  delete(path, opts = {}) { return this.fetch(path, { method: 'DELETE', ...opts }); }
}

const api = new ApiClient(API_BASE);

/* -------------------------
  Auth flows (login/logout)
  ------------------------- */

// Safe login: server sets refresh cookie (HttpOnly). Server returns access token in body.
async function login({ username, password }) {
  // Note: send credentials via HTTPS
  console.log('Attempting login with:', { username });
  
  let response;
  let data;
  
  try {
    // First try the standard login endpoint
    console.log('Trying standard login endpoint');
    response = await fetch(`${API_BASE}/api/user/login/`, {
      method: 'POST',
      credentials: 'include', // Changed back to 'include' to allow cross-origin cookies
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    // If that fails with 404, try the token endpoint
    if (response.status === 404) {
      console.log('Trying alternate login endpoint');
      response = await fetch(`${API_BASE}/api/token/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
    }
    
    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error('Login error:', errBody);
      const err = new Error(errBody.detail || 'Login failed');
      err.status = response.status;
      err.data = errBody;
      throw err;
    }
    
    data = await response.json();
    console.log('Login successful, received data structure:', Object.keys(data));
    
    // Clear any existing tokens before storing new ones
    TokenStore.clear();


  } catch (error) {
    console.error('Login fetch error:', error);
    throw error;
  }

  // Check for token in the response
  console.log('Checking token in response data:', data);
  
  // Handle different response formats
  console.log('Raw response data:', JSON.stringify(data));
  
  // Check for nested token structure
  let accessToken, refreshToken;
  
  if (data.token && typeof data.token === 'string') {
    // Simple token format
    accessToken = data.token;
    refreshToken = data.refresh_token;
    console.log('Found simple token format');
  } else if (data.access) {
    // JWT pair format
    accessToken = data.access;
    refreshToken = data.refresh;
    console.log('Found JWT pair format');
  } else if (data.access_token) {
    // OAuth format
    accessToken = data.access_token;
    refreshToken = data.refresh_token;
    console.log('Found OAuth format');
  } else if (data.data && data.data.token) {
    // Nested format
    accessToken = data.data.token;
    refreshToken = data.data.refresh_token;
    console.log('Found nested token format');
  } else {
    // Try to find any property that might be a token
    for (const key in data) {
      if (typeof data[key] === 'string' && data[key].length > 20) {
        console.log('Found potential token in property:', key);
        accessToken = data[key];
        break;
      }
    }
  }
  
  if (!accessToken) {
    console.error('Login response missing access token:', data);
    throw new Error('Login response missing access token');
  }

  // Store tokens in localStorage
  console.log('Storing access token:', accessToken.substring(0, 10) + '...');
  const exp = parseJwtExp(accessToken);
  console.log('Token expiry:', exp);
  TokenStore.set(accessToken, exp);
  
  // Verify token was stored
  const storedToken = TokenStore.get();
  console.log('Verified stored token:', storedToken ? 'Token stored successfully' : 'Failed to store token');
  
  // Store refresh token
  if (refreshToken) {
    console.log('Storing refresh token:', refreshToken.substring(0, 10) + '...');
    localStorage.setItem('refresh_token', refreshToken);
    
    // Verify refresh token was stored
    const storedRefreshToken = localStorage.getItem('refresh_token');
    console.log('Verified stored refresh token:', storedRefreshToken ? 'Refresh token stored successfully' : 'Failed to store refresh token');
  } else {
    console.warn('No refresh token provided in response');
  }

  // Store user safely in localStorage for convenience (non-sensitive)
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data.user || null;
}

async function logout() {
  try {
    // Tell server to invalidate refresh token and clear cookie
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.warn('No refresh token found during logout');
    } else {
      console.log('Attempting to logout and invalidate token');
      
      // Try different logout endpoints
      try {
        // First try the user logout endpoint
        let response = await fetch(`${API_BASE}/api/user/logout/`, {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ refresh: refreshToken })
        });
        
        // If that fails with 404, try the token blacklist endpoint
        if (response.status === 404) {
          console.log('Trying alternate logout endpoint');
          response = await fetch(`${API_BASE}/api/token/blacklist/`, {
            method: 'POST',
            credentials: 'include',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ refresh: refreshToken })
          });
        }
        
        console.log('Logout response status:', response.status);
      } catch (error) {
        console.warn('Error during logout request:', error);
        // Continue with client-side logout even if server request fails
      }
    }
  } catch (e) {
    // ignore network errors; still clear client
    console.warn('Logout request failed', e);
  } finally {
    TokenStore.clear(); // This already clears tokens from localStorage
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  }
}

/* -------------------------
  Wire up UI (login page)
  ------------------------- */
// Function to manually set tokens for testing
function setTestTokens() {
  console.log('Setting test tokens');
  
  const testAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature';
  const testRefreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyZWZyZXNoIiwibmFtZSI6IlJlZnJlc2ggVG9rZW4iLCJpYXQiOjE1MTYyMzkwMjJ9.signature';
  const testUser = { id: 1, username: 'testuser', email: 'test@example.com' };
  
  // Set tokens using TokenStore
  const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  TokenStore.set(testAccessToken, exp);
  localStorage.setItem('refresh_token', testRefreshToken);
  localStorage.setItem('user', JSON.stringify(testUser));
  
  console.log('Test tokens set successfully');
  return true;
}

// Function to check token storage
function checkTokenStorage() {
  console.log('Checking token storage');
  
  const accessToken = TokenStore.get();
  const refreshToken = localStorage.getItem('refresh_token');
  const user = localStorage.getItem('user');
  const tokenExpiry = localStorage.getItem('token_expiry');
  
  console.log('Access token exists:', !!accessToken);
  console.log('Refresh token exists:', !!refreshToken);
  console.log('User data exists:', !!user);
  console.log('Token expiry exists:', !!tokenExpiry);
  
  if (accessToken) {
    console.log('Access token (first 10 chars):', accessToken.substring(0, 10) + '...');
  }
  
  if (refreshToken) {
    console.log('Refresh token (first 10 chars):', refreshToken.substring(0, 10) + '...');
  }
  
  if (tokenExpiry) {
    const now = Math.floor(Date.now() / 1000);
    const expiry = parseInt(tokenExpiry);
    const timeLeft = expiry - now;
    console.log(`Token expires in ${timeLeft} seconds (${Math.floor(timeLeft / 60)} minutes)`);
  }
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User data:', userData);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
  
  return {
    accessToken: !!accessToken,
    refreshToken: !!refreshToken,
    user: !!user,
    tokenExpiry: !!tokenExpiry
  };
}

// Function to test localStorage
function testLocalStorage() {
  console.log('Testing localStorage functionality');
  
  try {
    // Test basic functionality
    localStorage.setItem('test_key', 'test_value');
    const testValue = localStorage.getItem('test_key');
    console.log('localStorage test:', testValue === 'test_value' ? 'PASSED' : 'FAILED');
    
    // Test storing and retrieving a token
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    localStorage.setItem('test_token', testToken);
    const retrievedToken = localStorage.getItem('test_token');
    console.log('Token storage test:', retrievedToken === testToken ? 'PASSED' : 'FAILED');
    
    // Test TokenStore
    TokenStore.set(testToken, Math.floor(Date.now() / 1000) + 3600);
    const storedToken = TokenStore.get();
    console.log('TokenStore test:', storedToken === testToken ? 'PASSED' : 'FAILED');
    
    // Clean up
    localStorage.removeItem('test_key');
    localStorage.removeItem('test_token');
    TokenStore.clear();
    
    return true;
  } catch (error) {
    console.error('localStorage test error:', error);
    return false;
  }
}

// Function to test API directly
async function testLoginAPI(username, password) {
  console.log('Testing login API directly with:', { username, password: '***' });
  
  try {
    // Try standard endpoint
    console.log('Testing standard login endpoint');
    let response = await fetch(`${API_BASE}/api/user/login/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    console.log('Standard endpoint status:', response.status);
    
    if (response.status === 404) {
      // Try token endpoint
      console.log('Testing token endpoint');
      response = await fetch(`${API_BASE}/api/token/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      console.log('Token endpoint status:', response.status);
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log('API test successful, response data:', data);
      return data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('API test failed:', errorData);
      return { error: errorData, status: response.status };
    }
  } catch (error) {
    console.error('API test network error:', error);
    return { error: error.message };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;
  
  // Add test API button
   const testButton = document.createElement('button');
   testButton.type = 'button';
   testButton.id = 'test-api-button';
   testButton.className = 'btn btn-secondary mt-2 mr-2';
   testButton.textContent = 'Test API';
   testButton.onclick = async function() {
     const username = document.getElementById('username').value;
     const password = document.getElementById('password').value;
     if (!username || !password) {
       alert('Please enter username and password');
       return;
     }
     testButton.disabled = true;
     testButton.textContent = 'Testing...';
     await testLoginAPI(username, password);
     testButton.disabled = false;
     testButton.textContent = 'Test API';
   };
   loginForm.appendChild(testButton);
   
   // Add test localStorage button
   const testStorageButton = document.createElement('button');
   testStorageButton.type = 'button';
   testStorageButton.id = 'test-storage-button';
   testStorageButton.className = 'btn btn-info mt-2 mr-2';
   testStorageButton.textContent = 'Test Storage';
   testStorageButton.onclick = function() {
     testStorageButton.disabled = true;
     testStorageButton.textContent = 'Testing...';
     const result = testLocalStorage();
     if (result) {
       alert('localStorage tests passed! See console for details.');
     } else {
       alert('localStorage tests failed! See console for details.');
     }
     testStorageButton.disabled = false;
     testStorageButton.textContent = 'Test Storage';
   };
   loginForm.appendChild(testStorageButton);
   
   // Add check token button
   const checkTokenButton = document.createElement('button');
   checkTokenButton.type = 'button';
   checkTokenButton.id = 'check-token-button';
   checkTokenButton.className = 'btn btn-warning mt-2 mr-2';
   checkTokenButton.textContent = 'Check Tokens';
   checkTokenButton.onclick = function() {
     checkTokenButton.disabled = true;
     checkTokenButton.textContent = 'Checking...';
     const result = checkTokenStorage();
     const tokenStatus = Object.entries(result)
       .map(([key, exists]) => `${key}: ${exists ? '✓' : '✗'}`)
       .join('\n');
     alert(`Token Status:\n${tokenStatus}\n\nSee console for details.`);
     checkTokenButton.disabled = false;
     checkTokenButton.textContent = 'Check Tokens';
   };
   loginForm.appendChild(checkTokenButton);
   
   // Add set test tokens button
   const setTokensButton = document.createElement('button');
   setTokensButton.type = 'button';
   setTokensButton.id = 'set-tokens-button';
   setTokensButton.className = 'btn btn-danger mt-2';
   setTokensButton.textContent = 'Set Test Tokens';
   setTokensButton.onclick = function() {
     if (confirm('This will override any existing tokens. Continue?')) {
       setTokensButton.disabled = true;
       setTokensButton.textContent = 'Setting...';
       const result = setTestTokens();
       if (result) {
         alert('Test tokens set successfully! Click "Check Tokens" to verify.');
       } else {
         alert('Failed to set test tokens. See console for details.');
       }
       setTokensButton.disabled = false;
       setTokensButton.textContent = 'Set Test Tokens';
     }
   };
   loginForm.appendChild(setTokensButton);

  const errorEl = document.getElementById('error-message');

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
    console.error('Login error message:', msg);
  }

  loginForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (errorEl) errorEl.classList.add('hidden');
    
    console.log('Login form submitted');

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      showError('Provide both username and password.');
      return;
    }

    console.log(`Attempting login for user: ${username}`);
    
    // disable UI while authenticating
    const submit = document.getElementById('login-submit');
    submit.disabled = true;
    submit.textContent = 'Signing in...';

    try {
      await login({ username, password });
      console.log('Login successful, redirecting to dashboard');
      // Redirect to protected area (index.html)
      window.location.href = '/index.html';
    } catch (err) {
      console.error('Login error', err);
      const message = err?.data?.detail || err?.message || 'Login failed. Please check your credentials and try again.';
      showError(message);
    } finally {
      submit.disabled = false;
      submit.textContent = 'Sign in';
    }
  });
});

/* -------------------------
  Example usage on protected pages:
  ------------------------- */
// Example: fetch current user's profile
async function loadUserProfile() {
  try {
    // Only attempt to load profile if we have a token
    if (!TokenStore.get()) {
      console.log('No token available, skipping profile load');
      return;
    }
    
    const profile = await api.get('/api/user/profiles/');
    // render user profile...
    console.log('profile', profile);
  } catch (e) {
    if (e.status === 401) {
      // handled by ApiClient auto-refresh — if still 401, user must login
      console.log('Authentication failed, redirecting to login');
      window.location.href = '/login.html';
    } else {
      console.error('Error loading profile:', e);
    }
  }
}

// Export for debugging / other modules
window.App = { api, TokenStore, login, logout, loadUserProfile, parseJwtExp };

// Only load user profile and set up token refresh on pages where user should be logged in
// Check if we're on a page that requires authentication
const isAuthPage = window.location.pathname.includes('login.html') || 
                   window.location.pathname.includes('register.html');

if (!isAuthPage) {
  // Only try to load profile if we have a token
  if (TokenStore.get()) {
    // Load user profile on page load
    loadUserProfile();
    
    // Refresh token on page load
    api._tryRefresh();
    
    // Refresh token every 5 minutes
    setInterval(() => api._tryRefresh(), 5 * 60 * 1000);
  }
}

// Logout button
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    logout();
  });
}
