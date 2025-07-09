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
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="mb-4 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            {(localErrors.email || formErrors.email) && <div className="text-danger small mt-1">{localErrors.email || formErrors.email}</div>}
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {(localErrors.password || formErrors.password) && <div className="text-danger small mt-1">{localErrors.password || formErrors.password}</div>}
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <div className="text-danger mt-3 text-center">{error}</div>}
        <div className="mt-3 text-center">
          Don't have an account? <a href="/register">Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login; 