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

function CustomLoginPage() {
  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (userName === 'admin' && userPassword === '123') {
      toast.success('Login successful!');
      setTimeout(() => {
        navigate('/main');
      }, 1500);
    } else {
      toast.error('Invalid username or password.');
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      <LoginPage>
        <Title>Admin Login</Title>
        <Logo>🔐</Logo>

        <Username
          name="username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter username"
        />
        <Password
          name="password"
          value={userPassword}
          onChange={(e) => setUserPassword(e.target.value)}
          placeholder="Enter password"
        />
        <Submit onClick={handleLogin}>Login</Submit>
      </LoginPage>

      <ToastContainer />
    </div>
  );
}

export default CustomLoginPage;
