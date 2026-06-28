import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from 'lucide-react';
import { loginUser } from '../../services/auth/authService';
import { setItem, getItem } from '../../utils/db';
import { useTranslate } from '../../config/translate/translateContext';

const Login = () => {
  const navigate = useNavigate();
  const { translang } = useTranslate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ username: '', password: '' });

  useEffect(() => {
    const checkToken = async () => {
      const token = await getItem('accessToken');
      if (token) {
        navigate('/');
      }
    };
    checkToken();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Custom Validation
    let hasError = false;
    const errors = { username: '', password: '' };
    
    if (!username.trim()) {
      errors.username = translang.validation_username_required;
      hasError = true;
    }
    
    if (!password) {
      errors.password = translang.validation_password_required;
      hasError = true;
    }
    
    setValidationErrors(errors);
    
    if (hasError) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await loginUser({ username, password });
      const data = response.data;

      if (data.status) {
        // Save token to IndexedDB
        await setItem('accessToken', data.data.accessToken);
        await setItem('user', data.data.user);
        navigate('/');
      } else {
        setError(data.message || translang.login_failed);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || translang.network_error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Box size={40} style={{ margin: '0 auto 16px auto', color: 'var(--fg-color)' }} />
          <h2>{translang.welcome_message}</h2>
          <p style={{ margin: 0 }}>{translang.login_description}</p>
        </div>
        
        {error && (
          <div style={{ background: '#fee', color: 'var(--error-color)', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label" htmlFor="username">{translang.username_label}</label>
            <input 
              id="username" 
              type="text" 
              className="input" 
              placeholder={translang.enter_username}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (validationErrors.username) setValidationErrors({...validationErrors, username: ''});
              }}
              style={validationErrors.username ? { borderColor: 'var(--error-color)' } : {}}
            />
            {validationErrors.username && (
              <span style={{ color: 'var(--error-color)', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.username}
              </span>
            )}
          </div>
          
          <div className="input-group">
            <label className="input-label" htmlFor="password">{translang.password_label}</label>
            <input 
              id="password" 
              type="password" 
              className="input" 
              placeholder={translang.enter_password}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) setValidationErrors({...validationErrors, password: ''});
              }}
              style={validationErrors.password ? { borderColor: 'var(--error-color)' } : {}}
            />
            {validationErrors.password && (
              <span style={{ color: 'var(--error-color)', fontSize: '12px', marginTop: '4px' }}>
                {validationErrors.password}
              </span>
            )}
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? translang.signing_in : translang.sign_in}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
