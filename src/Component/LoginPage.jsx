import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage, {
  Username,
  Password,
  Submit,
  Title,
  Logo,
} from '@react-login-page/page5';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function CustomLoginPage() {
  const [showRealLogin, setShowRealLogin] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [email, setEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const navigate = useNavigate();

  const handleInitialLogin = () => {
    console.log('Access Code Attempt:', { user, pass });
    if (user === 'admin' && pass === 'Admin123') {
      setShowRealLogin(true);
      toast.success('Access granted! Please enter your email and password.');
      console.log('Access granted, showing real login.');
    } else {
      toast.error('Invalid user or password for access.');
      console.log('Access denied.');
    }
  };

  const handleLogin = async () => {
    console.log('Login Attempt:', { email, userPassword });
    try {
      const response = await axios.post('http://localhost:8080/authenticate', {
        email: email,
        password: userPassword,
      });
      console.log('Login Response:', response);
      if (response.status === 200 && response.data?.token) {
        localStorage.setItem('jwtToken', response.data.token);
        toast.success('Login successful!');
        console.log('JWT stored:', localStorage.getItem('jwtToken'));
        setTimeout(() => {
          console.log('Navigating to /main');
          navigate('/main');
        }, 1500);
      } else {
        toast.error('Invalid email or password.');
        console.log('Login failed: Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed. Please check your credentials or server.');
      console.log('Login error:', error);
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      <LoginPage>
        <Title>Admin Login</Title>
        <Logo>🔐</Logo>
        {!showRealLogin ? (
          <>
            <h4 style={{ textAlign: 'center', marginBottom: '1rem' }}>
              Step 1: Enter Access Code
            </h4>
            <Username
              name="user"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Enter user"
            />
            <Password
              name="pass"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Enter password"
            />
            <Submit onClick={handleInitialLogin}>Access</Submit>
          </>
        ) : (
          <>
            <h4 style={{ textAlign: 'center', marginBottom: '1rem' }}>
              Step 2: Login with Email & Password
            </h4>
            <Username
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
            <Password
              name="password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              placeholder="Enter password"
            />
            <Submit onClick={handleLogin}>Login</Submit>
          </>
        )}
      </LoginPage>
      <ToastContainer />
    </div>
  );
}

export default CustomLoginPage;
