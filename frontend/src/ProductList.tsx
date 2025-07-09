import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { fetchProducts } from './productsSlice';
import { createProduct, updateProduct, deleteProduct } from './productsSlice';
import type { Product } from './productsSlice';

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
  const limit = 5;

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
      .then(() => setEditId(null));
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

  if (loading) return <div>Loading products...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Product Listing</h2>
      {/* Filter UI */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <input
          name="name"
          placeholder="Filter by name"
          value={filters.name}
          onChange={handleNameChange}
        />
        <input
          name="category"
          placeholder="Filter by category"
          value={filters.category}
          onChange={handleCategoryChange}
        />
        <select
          name="stockStatus"
          value={filters.stockStatus}
          onChange={handleStockStatusChange}
        >
          <option value="">All</option>
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
        <button
          onClick={() => {
            setPage(1);
            dispatch(fetchProducts({ ...filters, name: debouncedName, page: 1, limit } as any));
          }}
        >
          Apply Filters
        </button>
      </div>
      {/* Add Product Form */}
      <form onSubmit={handleAdd} style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} required min={0} />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required min={0} step="0.01" />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
        <input name="image" type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit">Add Product</button>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Image</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Name</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Description</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Quantity</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Price</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Category</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>
                {product.image ? (
                  <img src={getImageUrl(product.image)} alt={product.name} style={{ width: 60, height: 60, objectFit: 'cover' }} />
                ) : (
                  'No Image'
                )}
              </td>
              {editId === product._id ? (
                <>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
                    <input name="name" value={editForm.name} onChange={handleEditChange} required />
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
                    <input name="description" value={editForm.description} onChange={handleEditChange} />
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
                    <input name="quantity" type="number" value={editForm.quantity} onChange={handleEditChange} required min={0} />
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
                    <input name="price" type="number" value={editForm.price} onChange={handleEditChange} required min={0} step="0.01" />
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
                    <input name="category" value={editForm.category} onChange={handleEditChange} required />
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
                    <input name="image" type="file" accept="image/*" onChange={handleEditImageChange} />
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
                    <button onClick={() => handleUpdate(product._id)} style={{ marginRight: 4 }}>Save</button>
                    <button onClick={() => setEditId(null)} type="button">Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{product.name}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{product.description || '-'}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{product.quantity}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{product.price}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{product.category}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
                    <button onClick={() => handleEdit(product)} style={{ marginRight: 4 }}>Edit</button>
                    <button onClick={() => handleDelete(product._id)} style={{ color: 'red' }}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages || 1}</span>
        <button onClick={() => setPage(p => (totalPages ? Math.min(totalPages, p + 1) : p + 1))} disabled={page === totalPages}>Next</button>
        <span>Total Products: {total}</span>
      </div>
    </div>
  );
};

export default ProductList; 