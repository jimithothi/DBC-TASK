import './App.css'
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import ProtectedRoute from './ProtectedRoute';
import ProductList from './ProductList';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div>Welcome! You are logged in.</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
