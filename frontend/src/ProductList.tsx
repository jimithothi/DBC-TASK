import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { fetchProducts } from './productsSlice';
import { createProduct, updateProduct, deleteProduct } from './productsSlice';
import type { Product } from './productsSlice';
import { logout } from './authSlice';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const initialForm: Omit<Product, '_id' | 'image'> = {
  name: '',
  description: '',
  quantity: 0,
  price: 0,
  category: '',
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  const normalizedPath = imagePath.replace(/\\\\/g, '/').replace(/\\/g, '/');
  return `${API_BASE_URL}/${normalizedPath}`;
};

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { products, loading, error, total, page: currentPage, totalPages } = useSelector((state: RootState) => state.products);

  // Add product form state
  const [form, setForm] = useState<Omit<Product, '_id' | 'image'>>(initialForm);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Product, '_id' | 'image'>>(initialForm);
  const [editImageFile, setEditImageFile] = useState<File | undefined>(undefined);
  const [filters, setFilters] = useState({
    name: '',
    category: '',
    stockStatus: '',
  });
  const [debouncedName, setDebouncedName] = useState('');
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts({
      ...filters,
      name: debouncedName,
      page,
      limit,
    }) as any);
  }, [dispatch, debouncedName, filters.category, filters.stockStatus, page]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditImageFile(e.target.files[0]);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createProduct({ product: { ...form, quantity: Number(form.quantity), price: Number(form.price) }, imageFile }))
      .unwrap()
      .then(() => {
        setForm(initialForm);
        setImageFile(undefined);
        // Refresh product list after add
        dispatch(fetchProducts({
          ...filters,
          name: debouncedName,
          page,
          limit,
        }) as any);
        setShowAddForm(false);
      });
  };

  const handleEdit = (product: Product) => {
    setEditId(product._id);
    setEditForm({
      name: product.name,
      description: product.description || '',
      quantity: product.quantity,
      price: product.price,
      category: product.category,
    });
    setEditImageFile(undefined);
  };

  const handleUpdate = (_id: string) => {
    dispatch(updateProduct({ product: { _id, ...editForm, quantity: Number(editForm.quantity), price: Number(editForm.price), image: '' }, imageFile: editImageFile }))
      .unwrap()
      .then(() => {
        setEditId(null);
        // Refresh product list after update
        dispatch(fetchProducts({
          ...filters,
          name: debouncedName,
          page,
          limit,
        }) as any);
      });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  // Debounce name input
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters(f => ({ ...f, name: value }));
    setPage(1);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedName(value);
    }, 500); // 500ms debounce
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(f => ({ ...f, category: e.target.value }));
    setPage(1);
  };

  const handleStockStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(f => ({ ...f, stockStatus: e.target.value }));
    setPage(1);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleExportExcel = () => {
    const exportData = products.map(product => ({
      Name: product.name,
      Quantity: product.quantity,
      Price: product.price,
      Category: product.category,
      'Stock Status': product.quantity > 0 ? 'In Stock' : 'Out of Stock',
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'products.xlsx');
  };

  if (loading) return <div className="text-center mt-5">Loading products...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Product Listing</h2>
        {authUser && (
          <button onClick={handleLogout} className="btn btn-outline-danger">Logout</button>
        )}
      </div>
      {/* Add Product Form */}
      {/* Move Add Product form above filter, and make it vertical */}
      <div className="mb-4">
        {!showAddForm ? (
          <button className="btn btn-success mb-3" onClick={() => setShowAddForm(true)}>
            Add Product
          </button>
        ) : (
          <div>
            <h4 className="mb-2">Add Product</h4>
            <form onSubmit={handleAdd}>
              <div className="mb-3">
                <label htmlFor="add-name" className="form-label">Name</label>
                <input id="add-name" name="name" className="form-control" placeholder="Name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="add-description" className="form-label">Description</label>
                <input id="add-description" name="description" className="form-control" placeholder="Description" value={form.description} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="add-quantity" className="form-label">Quantity</label>
                <input id="add-quantity" name="quantity" type="number" className="form-control" placeholder="Quantity" value={form.quantity} onChange={handleChange} required min={0} />
              </div>
              <div className="mb-3">
                <label htmlFor="add-price" className="form-label">Price</label>
                <input id="add-price" name="price" type="number" className="form-control" placeholder="Price" value={form.price} onChange={handleChange} required min={0} step="0.01" />
              </div>
              <div className="mb-3">
                <label htmlFor="add-category" className="form-label">Category</label>
                <input id="add-category" name="category" className="form-control" placeholder="Category" value={form.category} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="add-image" className="form-label">Image</label>
                <input id="add-image" name="image" type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">Add Product</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
      {/* Filter UI */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <input
            name="name"
            className="form-control"
            placeholder="Filter by name"
            value={filters.name}
            onChange={handleNameChange}
          />
        </div>
        <div className="col-md-3">
          <input
            name="category"
            className="form-control"
            placeholder="Filter by category"
            value={filters.category}
            onChange={handleCategoryChange}
          />
        </div>
        <div className="col-md-3">
          <select
            name="stockStatus"
            className="form-select"
            value={filters.stockStatus}
            onChange={handleStockStatusChange}
          >
            <option value="">All</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
        <div className="col-md-3">
          <button
            className="btn btn-primary w-100"
            onClick={() => {
              setPage(1);
              dispatch(fetchProducts({ ...filters, name: debouncedName, page: 1, limit } as any));
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
      
      <div className="table-responsive">
        <button className="btn btn-outline-primary mb-3" onClick={handleExportExcel} type="button">
          Export to Excel
        </button>
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  {product.image ? (
                    <img src={getImageUrl(product.image)} alt={product.name} style={{ width: 60, height: 60, objectFit: 'cover' }} className="rounded" />
                  ) : (
                    <span className="text-muted">No Image</span>
                  )}
                </td>
                {editId === product._id ? (
                  <>
                    <td><input name="name" className="form-control" value={editForm.name} onChange={handleEditChange} required /></td>
                    <td><input name="description" className="form-control" value={editForm.description} onChange={handleEditChange} /></td>
                    <td><input name="quantity" type="number" className="form-control" value={editForm.quantity} onChange={handleEditChange} required min={0} /></td>
                    <td><input name="price" type="number" className="form-control" value={editForm.price} onChange={handleEditChange} required min={0} step="0.01" /></td>
                    <td><input name="category" className="form-control" value={editForm.category} onChange={handleEditChange} required /></td>
                    <td><input name="image" type="file" className="form-control" accept="image/*" onChange={handleEditImageChange} /></td>
                    <td>
                      <button onClick={() => handleUpdate(product._id)} className="btn btn-primary btn-sm me-2">Save</button>
                      <button onClick={() => setEditId(null)} type="button" className="btn btn-secondary btn-sm">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{product.name}</td>
                    <td>{product.description || '-'}</td>
                    <td>{product.quantity}</td>
                    <td>{product.price}</td>
                    <td>{product.category}</td>
                    <td>
                      <button onClick={() => handleEdit(product)} className="btn btn-warning btn-sm me-2">Edit</button>
                      <button onClick={() => handleDelete(product._id)} className="btn btn-danger btn-sm">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="d-flex align-items-center gap-2 mt-4">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} className="btn btn-outline-primary btn-sm" disabled={page === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages || 1}</span>
        <button onClick={() => setPage(p => (totalPages ? Math.min(totalPages, p + 1) : p + 1))} className="btn btn-outline-primary btn-sm" disabled={page === totalPages}>Next</button>
        <span className="ms-3">Total Products: {total}</span>
      </div>
    </div>
  );
};

export default ProductList; 