import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { login } from './authSlice';
import * as yup from 'yup';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email address.').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localErrors, setLocalErrors] = useState<{ email?: string; password?: string }>({});
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, formErrors, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/products');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErrors({});
    try {
      await schema.validate({ email, password }, { abortEarly: false });
    } catch (validationError) {
      const errors: { email?: string; password?: string } = {};
      if (validationError instanceof yup.ValidationError && validationError.inner) {
        validationError.inner.forEach((err) => {
          if (err.path && (err.path === 'email' || err.path === 'password')) {
            errors[err.path as 'email' | 'password'] = err.message;
          }
        });
      }
      setLocalErrors(errors);
      return;
    }
    //dispatch(clearFormErrors());
    dispatch(login({ email, password }));
  };

  return (
    <div style={{ maxWidth: 300, margin: 'auto', padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        {(localErrors.email || formErrors.email) && <div style={{ color: 'red', fontSize: 12 }}>{localErrors.email || formErrors.email}</div>}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        {(localErrors.password || formErrors.password) && <div style={{ color: 'red', fontSize: 12 }}>{localErrors.password || formErrors.password}</div>}
        <button type="submit" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      <div style={{ marginTop: 10 }}>
        Don't have an account? <a href="/register">Register</a>
      </div>
    </div>
  );
};

export default Login; 