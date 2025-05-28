import axios from 'axios';
import { API_BASE } from '../config/config';

export const handleLogin = async (email, password, navigate, setError, setLoading) => {
  try {
    setLoading(true);
    const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
    console.log('Raw login response:', response.data);

    const { token, user, message } = response.data;

    if (!token || !user) {
      console.error('Missing token or user data:', response.data);
      throw new Error('Invalid login response');
    }

    // Store auth data
    const authData = {
      authToken: token,
      userId: user.user_id || user.id,
      userEmail: user.email,
      username: user.username || user.userName
    };

    Object.entries(authData).forEach(([key, value]) => {
      if (!value) {
        console.error(`Missing ${key} in:`, user);
        throw new Error(`Missing ${key} in response`);
      }
      localStorage.setItem(key, value);
    });

    console.log('Auth data stored:', {
      userId: localStorage.getItem('userId'),
      hasToken: !!localStorage.getItem('authToken')
    });

    window.dispatchEvent(new Event('storage'));
    navigate('/dashboard');
    return true;
  } catch (error) {
    console.error('Login error:', error);
    setError(error?.response?.data?.message || error.message || 'Login failed');
    return false;
  } finally {
    setLoading(false);
  }
};

export const handleSignup = async (userName, email, password, navigate, setMessage, setError) => {
  try {
    // Validate name format
    if (!userName || userName.length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }

    const response = await axios.post(`${API_BASE}/auth/register`, {
      userName: userName,  // Changed to userName to match API expectation
      email,
      password
    });
    
    if (response.status === 201 || response.status === 200) {
      setMessage('Registration successful!');
      return true;
    }
    return false;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Registration failed';
    setError(errorMessage);
    return false;
  }
};
