import React, { useEffect, useState } from "react";
import api from '../services/api';
import { User, Plus, Edit, Trash2, X, Check } from "lucide-react";

const initialForm = { username: '', name: '', email: '', role: 'staff', password: '', is_active: true };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowModal(true);
  };
  const openEdit = (user) => {
    setForm({ ...user, password: '' });
    setEditingId(user.id);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setEditingId(null);
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
      } else {
        await api.post('/users', form);
      }
      fetchUsers();
      closeModal();
    } catch (err) {
      setError('Failed to save user.');
    } finally {
      setLoading(false);
    }
  };
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };
  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/users/${deleteId}`);
      fetchUsers();
      setShowDelete(false);
      setDeleteId(null);
    } catch (err) {
      setError('Failed to delete user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-7 h-7 text-blue-600" /> User Management
          </h1>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Username</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Created</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="px-4 py-2 font-medium text-gray-800">{user.name}</td>
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 capitalize">{user.role}</td>
                  <td className="px-4 py-2">
                    {user.is_active ? (
                      <span className="text-green-600 font-semibold">Active</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{user.created_at && user.created_at.split('T')[0]}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button onClick={() => openEdit(user)} className="btn-secondary flex items-center gap-1 text-xs px-2 py-1">
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => confirmDelete(user.id)} className="btn-danger flex items-center gap-1 text-xs px-2 py-1">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit User' : 'Add User'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input type="text" name="username" value={form.username} onChange={handleChange} className="input-field" required disabled={!!editingId} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="input-field">
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} className="input-field" required />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} id="is_active" />
                <label htmlFor="is_active" className="text-sm">Active</label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={closeModal} className="btn-secondary px-4 py-2">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Delete User</h2>
              <button onClick={() => setShowDelete(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDelete(false)} className="btn-secondary px-4 py-2">Cancel</button>
              <button onClick={handleDelete} className="btn-danger px-4 py-2 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 