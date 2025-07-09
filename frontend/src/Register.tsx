import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { register } from './authSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';


const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/products');
    }
  }, [user, navigate]);

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address.').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  type FormValues = {
    email: string;
    password: string;
  };

  const initialValues: FormValues = { email: '', password: '' };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="mb-4 text-center">Register</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={({ email, password }: FormValues) => {
            dispatch(register({ email, password }));
          }}
        >
          {({ isSubmitting }: { isSubmitting: boolean }) => (
            <Form>
              <div className="mb-3">
                <Field
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Email"
                />
                <ErrorMessage name="email">
                  {msg => <div className="text-danger small mt-1">{msg}</div>}
                </ErrorMessage>
              </div>
              <div className="mb-3">
                <Field
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Password"
                />
                <ErrorMessage name="password">
                  {msg => <div className="text-danger small mt-1">{msg}</div>}
                </ErrorMessage>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading || isSubmitting}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>
        {error && <div className="text-danger mt-3 text-center">{error}</div>}
        <div className="mt-3 text-center">
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register; 