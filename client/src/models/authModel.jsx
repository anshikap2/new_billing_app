import { loginUser, signupUser } from '../controllers/authController';

export const handleLogin = async (email, password, navigate, setError) => {
  try {
    console.log('Attempting login with:', email);
    await loginUser(email, password);
    window.dispatchEvent(new Event('storage'));
    navigate('/dashboardd');
  } catch (error) {
    console.error('Login Error:', error);

    // Debug additional info (if error is from Axios or fetch)
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request made but no response:', error.request);
    } else {
      console.error('Error message:', error.message);
    }

    setError(error?.response?.data?.message || error.message || 'Login failed');
  }
};

export const handleSignup = async (userName, email, password, navigate, setMessage, setError) => {
  try {
    const response = await signupUser(userName, email, password);
    setMessage('Signup successful! Please login with your credentials.');
    return true;  // Return success status
  } catch (error) {
    setError(error?.response?.data?.message || 'Signup failed');
    return false;
  }
};
