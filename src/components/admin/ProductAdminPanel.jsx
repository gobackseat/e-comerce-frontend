import React, { useEffect, useState, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { config } from '../../utils/config';
import { Toaster, toast } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const defaultImage = '/Assets/imgs/backseat-extender-for-dogs (1).png';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center border border-orange-200">
      <div className="text-orange-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button onClick={resetErrorBoundary} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">Try again</button>
    </div>
  </div>
);

const ProductAdminPanel = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [inventory, setInventory] = useState(0);
  const [showDelete, setShowDelete] = useState(false);
  const [analytics, setAnalytics] = useState({});
  const token = useSelector((state) => state.auth.token);

  // Fetch product on mount
  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.baseURL}/products/`);
      const data = await res.json();
      if (res.ok && data.data && data.data.product) {
        setProduct(data.data.product);
        setForm(data.data.product);
        setInventory(data.data.product.countInStock);
        setAnalytics({
          viewCount: data.data.product.viewCount,
          purchaseCount: data.data.product.purchaseCount,
          lastViewedAt: data.data.product.lastViewedAt,
        });
      } else {
        setProduct(null);
        toast.error(data.message || 'Failed to fetch product');
      }
    } catch (err) {
      toast.error('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
    setForm(product);
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm(product);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-generate slug from name if name changes and not manually overridden
    if (name === 'name') {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setForm((prev) => ({
        ...prev,
        name: value,
        slug: prev.slugManuallySet ? prev.slug : autoSlug,
      }));
    } else if (name === 'slug') {
      setForm((prev) => ({ ...prev, slug: value, slugManuallySet: true }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!form.name || !form.description || !form.price || !form.countInStock) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      // Prepare clean payload
      const payload = { ...form };
      // Convert numeric fields
      payload.price = Number(payload.price);
      payload.countInStock = Number(payload.countInStock);
      // Remove frontend-only fields
      delete payload.slugManuallySet;
      // Remove any other non-schema fields if needed
      // (add more deletes here if you add more UI-only fields)

      let res, data;
      if (!product) {
        // No product exists, create new
        res = await fetch(`${config.baseURL}/products/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Product exists, update
        res = await fetch(`${config.baseURL}/products/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }
      data = await res.json();
      if (res.ok) {
        toast.success(product ? 'Product updated successfully' : 'Product created successfully');
        setEditMode(false);
        fetchProduct();
      } else {
        toast.error(data.message || 'Failed to save product');
      }
    } catch (err) {
      toast.error('Failed to save product');
    }
  };

  const handleInventoryUpdate = async () => {
    if (isNaN(inventory) || inventory < 0) {
      toast.error('Inventory must be a non-negative number');
      return;
    }
    try {
      const res = await fetch(`${config.baseURL}/products/inventory`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ countInStock: Number(inventory) }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Inventory updated');
        fetchProduct();
      } else {
        toast.error(data.message || 'Failed to update inventory');
      }
    } catch (err) {
      toast.error('Failed to update inventory');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${config.baseURL}/products/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Product deleted');
        setProduct(null);
      } else {
        toast.error(data.message || 'Failed to delete product');
      }
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setShowDelete(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-gray-700 mb-4">No product found.</p>
        <button
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          onClick={() => setEditMode(true)}
        >
          Add Product
        </button>
        <Toaster position="top-center" />
        {/* Edit Modal for Add Product */}
        {editMode && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
              <h3 className="text-xl font-bold mb-4">Add Product</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  value={form.name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="slug"
                  placeholder="Slug (auto-generated, can edit)"
                  value={form.slug || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={form.description || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded"
                  rows={3}
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={form.price || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded"
                  min="0"
                  required
                />
                <input
                  type="number"
                  name="countInStock"
                  placeholder="Inventory"
                  value={form.countInStock || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded"
                  min="0"
                  required
                />
                <input
                  type="text"
                  name="sku"
                  placeholder="SKU"
                  value={form.sku || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="text"
                  name="metaTitle"
                  placeholder="Meta Title"
                  value={form.metaTitle || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="text"
                  name="metaDescription"
                  placeholder="Meta Description"
                  value={form.metaDescription || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="text"
                  name="keywords"
                  placeholder="Keywords (comma separated)"
                  value={form.keywords ? form.keywords.join(', ') : ''}
                  onChange={e => setForm({ ...form, keywords: e.target.value.split(',').map(k => k.trim()) })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  onClick={() => { setEditMode(false); setForm({}); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<Skeleton height={400} className="mb-8" count={2} />}>
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8" role="main">
          <Toaster position="top-center" />
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <img
              src={product.image || defaultImage}
              alt={product.name}
              className="w-48 h-48 object-contain rounded-lg border"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <p className="text-gray-700 mb-2">{product.description}</p>
              <div className="mb-2">
                <span className="font-semibold">Price:</span> ${product.price}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Inventory:</span>
                <input
                  type="number"
                  min="0"
                  value={inventory}
                  onChange={e => setInventory(e.target.value)}
                  className="w-20 ml-2 px-2 py-1 border rounded"
                />
                <button
                  className="ml-2 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                  onClick={handleInventoryUpdate}
                >
                  Update
                </button>
              </div>
              <div className="mb-2">
                <span className="font-semibold">SKU:</span> {product.sku || 'N/A'}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Slug:</span> {product.slug}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Meta Title:</span> {product.metaTitle || 'N/A'}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Meta Description:</span> {product.metaDescription || 'N/A'}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Keywords:</span> {product.keywords?.join(', ') || 'N/A'}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Active:</span> {product.isActive ? 'Yes' : 'No'}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Created:</span> {new Date(product.createdAt).toLocaleString()}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Updated:</span> {new Date(product.updatedAt).toLocaleString()}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Analytics:</span>
                <ul className="ml-4 text-sm">
                  <li>Views: {analytics.viewCount}</li>
                  <li>Purchases: {analytics.purchaseCount}</li>
                  <li>Last Viewed: {analytics.lastViewedAt ? new Date(analytics.lastViewedAt).toLocaleString() : 'Never'}</li>
                </ul>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handleEdit}
                >
                  Edit
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => setShowDelete(true)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Edit Modal */}
          {editMode && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                <h3 className="text-xl font-bold mb-4">{product ? 'Edit Product' : 'Add Product'}</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Product Name"
                    value={form.name || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    name="slug"
                    placeholder="Slug (auto-generated, can edit)"
                    value={form.slug || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded"
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded"
                    rows={3}
                    required
                  />
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={form.price || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded"
                    min="0"
                    required
                  />
                  <input
                    type="number"
                    name="countInStock"
                    placeholder="Inventory"
                    value={form.countInStock || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded"
                    min="0"
                    required
                  />
                  <input
                    type="text"
                    name="sku"
                    placeholder="SKU"
                    value={form.sku || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <input
                    type="text"
                    name="metaTitle"
                    placeholder="Meta Title"
                    value={form.metaTitle || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <input
                    type="text"
                    name="metaDescription"
                    placeholder="Meta Description"
                    value={form.metaDescription || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded"
                  />
                  <input
                    type="text"
                    name="keywords"
                    placeholder="Keywords (comma separated)"
                    value={form.keywords ? form.keywords.join(', ') : ''}
                    onChange={e => setForm({ ...form, keywords: e.target.value.split(',').map(k => k.trim()) })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
                <h3 className="text-xl font-bold mb-4">Delete Product?</h3>
                <p className="mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
                <div className="flex gap-3 justify-center">
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    onClick={() => setShowDelete(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default ProductAdminPanel; 