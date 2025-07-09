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
    <div style={{ maxWidth: 300, margin: 'auto', padding: 20 }}>
      <h2>Register</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(
          { email, password }: FormValues
        ) => {
          dispatch(register({ email, password }));
        }}
      >
        {({ isSubmitting }: { isSubmitting: boolean }) => (
          <Form>
            <Field
              type="email"
              name="email"
              placeholder="Email"
              style={{ width: '100%', marginBottom: 10 }}
            />
            <ErrorMessage name="email">
              {msg => <div style={{ color: 'red', fontSize: 12 }}>{msg}</div>}
            </ErrorMessage>
            <Field
              type="password"
              name="password"
              placeholder="Password"
              style={{ width: '100%', marginBottom: 10 }}
            />
            <ErrorMessage name="password">
              {msg => <div style={{ color: 'red', fontSize: 12 }}>{msg}</div>}
            </ErrorMessage>
            <button type="submit" style={{ width: '100%' }} disabled={loading || isSubmitting}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </Form>
        )}
      </Formik>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      <div style={{ marginTop: 10 }}>
        Already have an account? <a href="/login">Login</a>
      </div>
    </div>
  );
};

export default Register; 