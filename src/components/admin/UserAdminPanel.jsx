import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { config } from '../../utils/config';
import { Toaster, toast } from 'react-hot-toast';

const UserAdminPanel = () => {
  const token = useSelector((state) => state.auth.token);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [pagination.page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });
      const res = await fetch(`${config.baseURL}/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.data && data.data.users) {
        setUsers(data.data.users);
        setPagination((prev) => ({ ...prev, ...data.data.pagination }));
      } else {
        setUsers([]);
        toast.error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditForm({ ...user });
    setEditMode(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      const res = await fetch(`${config.baseURL}/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
          isActive: editForm.isActive,
          isAdmin: editForm.isAdmin,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User updated');
        setEditMode(false);
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to update user');
      }
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handlePromote = async (user) => {
    try {
      const res = await fetch(`${config.baseURL}/users/${user._id}/promote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User promoted to admin');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to promote user');
      }
    } catch (err) {
      toast.error('Failed to promote user');
    }
  };

  const handleDemote = async (user) => {
    try {
      const res = await fetch(`${config.baseURL}/users/${user._id}/demote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User demoted from admin');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to demote user');
      }
    } catch (err) {
      toast.error('Failed to demote user');
    }
  };

  const handleDeactivate = async (user) => {
    try {
      const res = await fetch(`${config.baseURL}/users/${user._id}/deactivate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User deactivated');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to deactivate user');
      }
    } catch (err) {
      toast.error('Failed to deactivate user');
    }
  };

  const handleShowOrders = async (user) => {
    setShowOrders(true);
    setSelectedUser(user);
    setOrders([]);
    try {
      const res = await fetch(`${config.baseURL}/users/${user._id}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.data && data.data.orders) {
        setOrders(data.data.orders);
      } else {
        toast.error(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      toast.error('Failed to fetch orders');
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <Toaster position="top-center" />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={handleSearch}
          className="px-4 py-2 border rounded w-full md:w-64"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded-lg">
          <thead className="bg-orange-100">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Last Login</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8">No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-orange-50">
                  <td className="px-4 py-2">{user.firstName} {user.lastName}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.isAdmin ? 'Admin' : 'User'}</td>
                  <td className="px-4 py-2">{user.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                  <td className="px-4 py-2 flex flex-wrap gap-2">
                    <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => openEdit(user)}>Edit</button>
                    {user.isAdmin ? (
                      <button className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" onClick={() => handleDemote(user)}>Demote</button>
                    ) : (
                      <button className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => handlePromote(user)}>Promote</button>
                    )}
                    <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleDeactivate(user)}>Deactivate</button>
                    <button className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={() => handleShowOrders(user)}>Orders</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          className="px-4 py-2 bg-orange-200 rounded disabled:opacity-50"
          onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          disabled={pagination.page <= 1}
        >
          Previous
        </button>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
        <button
          className="px-4 py-2 bg-orange-200 rounded disabled:opacity-50"
          onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
          disabled={pagination.page >= pagination.totalPages}
        >
          Next
        </button>
      </div>
      {/* Edit Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            <div className="space-y-3">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={editForm.firstName || ''}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border rounded"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={editForm.lastName || ''}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border rounded"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={editForm.email || ''}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border rounded"
                required
              />
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={!!editForm.isActive}
                    onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isAdmin"
                    checked={!!editForm.isAdmin}
                    onChange={e => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                  />
                  Admin
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handleEditSave}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Orders Modal */}
      {showOrders && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative">
            <h3 className="text-xl font-bold mb-4">{selectedUser.firstName} {selectedUser.lastName}'s Orders</h3>
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full text-sm border rounded-lg">
                <thead className="bg-orange-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Order ID</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Total</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8">No orders found.</td></tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="border-b">
                        <td className="px-4 py-2">{order._id}</td>
                        <td className="px-4 py-2">{new Date(order.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-2">${order.totalPrice}</td>
                        <td className="px-4 py-2">{order.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => setShowOrders(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAdminPanel; 