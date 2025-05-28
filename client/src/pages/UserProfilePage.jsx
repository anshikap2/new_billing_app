import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import axiosInstance from '../utils/axiosConfig';
import { API_BASE } from "../config/config";
import '../css/UserProfilePage.css';

const modalRoot = document.createElement('div');
modalRoot.id = 'modal-root';
document.body.appendChild(modalRoot);

// Base64 encoded default avatar - replace with your minimal default avatar
const DEFAULT_AVATAR_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjQiIGZpbGw9IiNjY2MiLz48cGF0aCBkPSJNNCAxOWMwLTMuMzE0IDMuNTgyLTYgOC02czggMi42ODYgOCA2SDR6IiBmaWxsPSIjY2NjIi8+PC9zdmc+';

const ProfilePage = ({ isOpen, onClose, profileImage, onImageUpdate }) => {
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log('Image clicked, opening file dialog');
    }
  };

  // Update local image when profileImage prop changes
  useEffect(() => {
    if (profileImage) {
      setImageSrc(profileImage);
    }
  }, [profileImage]);

  const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  let previewUrl = null;

  try {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    // Show temporary preview
    previewUrl = URL.createObjectURL(file);
    setImageSrc(previewUrl);

    const formData = new FormData();
    formData.append('profile_image', file);
    formData.append('user_id', userId);

    const response = await axiosInstance.post(`${API_BASE}/auth/upload-image`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true"
      }
    });

    // Check for different possible response formats
    const imageUrl = response.data?.imageUrl || response.data?.url || response.data?.profile_image;
    
    if (imageUrl) {
      const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`;
      setImageSrc(fullImageUrl);
      onImageUpdate?.(fullImageUrl);
      // Store the image URL in localStorage
      localStorage.setItem('userProfileImage', fullImageUrl);
      setUploadError(null);
    } else {
      throw new Error('Invalid response format from server');
    }

  } catch (error) {
    console.error('Upload error:', error);
    setUploadError(error.response?.data?.message || error.message || 'Failed to upload image');
    setImageSrc(null);
  } finally {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }
};

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Add debug logging for state changes
  useEffect(() => {
    console.log('Auth State:', {
      token: !!localStorage.getItem('authToken'),
      userId: localStorage.getItem('userId'),
      user: user,
      error: error
    });
  }, [user, error]);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  };

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      
      const decoded = parseJwt(token);
      if (!decoded) return null;

      // Try different possible user ID fields
      return decoded.user_id || decoded.userId || decoded.id || decoded.sub;
    } catch (error) {
      console.error('Error getting user ID from token:', error);
      return null;
    }
  };

  const validateSession = () => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error('Missing credentials');
      }

      const decoded = parseJwt(token);
      if (!decoded) {
        throw new Error('Invalid token');
      }

      return { isValid: true, userId, token };
    } catch (error) {
      console.error('Session validation failed:', error);
      return { isValid: false, error: error.message };
    }
  };

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    console.log('Checking auth:', { hasToken: !!token, userId });
    return { token, userId };
  };

  // Modified fetch user details logic
useEffect(() => {
  const fetchUserDetails = async (attempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const { token, userId } = checkAuth();
      if (!token || !userId) {
        throw new Error('Please log in to view profile');
      }

      // Check localStorage first for cached image
      const cachedImageUrl = localStorage.getItem('userProfileImage');
      if (cachedImageUrl) {
        setImageSrc(cachedImageUrl);
      }

      const response = await axiosInstance.get(`${API_BASE}/auth/userDetails`, {
        params: { user_id: userId },
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true"
        }
      });

      if (!response.data?.userExist?.[0]) {
        throw new Error('User data not found');
      }

      const userData = response.data.userExist[0];
      setUser(userData);
      console.log('Profile loaded:', userData);

      // Only update image if no cached image exists
      if (!cachedImageUrl && userData.profile_image) {
        const imageUrl = processImageUrl(userData.profile_image);
        if (imageUrl) {
          setImageSrc(imageUrl);
          localStorage.setItem('userProfileImage', imageUrl);
        }
      }

    } catch (error) {
      console.error('Profile load error:', error);
      setError(error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (isOpen) {
    console.log('Initializing profile load...');
    fetchUserDetails();
  }
}, [isOpen]); // Only re-fetch when modal opens

  // Update processImageUrl function
  const processImageUrl = (imageData) => {
    if (!imageData) {
      return DEFAULT_AVATAR_BASE64;
    }
    
    try {
      if (typeof imageData === 'string') {
        if (imageData.startsWith('blob:') || 
            imageData.startsWith('data:') ||
            imageData.startsWith('http')) {
          return imageData;
        }
        return `${API_BASE}${imageData}`;
      }
      
      if (imageData.data) {
        const byteArray = new Uint8Array(imageData.data);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        return URL.createObjectURL(blob);
      }

      return DEFAULT_AVATAR_BASE64;
    } catch (error) {
      console.error('Error processing image:', error);
      return DEFAULT_AVATAR_BASE64;
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="profile-overlay">
      <div className="profile-dialog">
        <button onClick={onClose} className="close-button" aria-label="Close">✕</button>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : !user ? (
          <div className="not-found">User not found.</div>
        ) : (
          <>
            <div className="profile-gradient">
              <div className="profile-image-container">
                <button onClick={handleImageClick} type="button">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <img
                    src={processImageUrl(imageSrc)}
                    alt={user?.username || "Profile"}
                    className="profile-image"
                    onError={(e) => {
                      console.warn('Image load failed:', e.target.src);
                      e.target.src = DEFAULT_AVATAR_BASE64;
                      e.target.onerror = null;
                    }}
                  />
                </button>
                {uploadError && <div className="error-message">{uploadError}</div>}
              </div>
              <h2 className="profile-name">{user.username}</h2>
              <p className="profile-role">User</p>
            </div>

            <div className="profile-content">
              <div className="profile-section">
                <h3>Account Information</h3>
                <p>Email: {user.email}</p>
                <p>User ID: {user.user_id}</p>
                <p>Member since: {new Date(user.created_at).toLocaleDateString()}</p>
              </div>

              <div className="profile-section">
                <h3>Account Details</h3>
                <p>Created: {new Date(user.created_at).toLocaleString()}</p>
                <p>Last Updated: {new Date(user.updated_at).toLocaleString()}</p>
                <p>Status: <span className="status-badge active">Active</span></p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    modalRoot
  );
};

// Enhanced error boundary
class ProfileErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Profile Error:', { error, errorInfo });
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h3>Profile Load Error</h3>
          <p>{this.state.error?.message || 'Unknown error occurred'}</p>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function WrappedProfilePage(props) {
  return (
    <ProfileErrorBoundary>
      <ProfilePage {...props} />
    </ProfileErrorBoundary>
  );
}
