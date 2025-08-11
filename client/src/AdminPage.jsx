import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        navigate('/');
      }
    };
    fetchUsers();
  }, [navigate, token, user]);

  const updateRole = async (id, role) => {
    try {
      await axios.put(`http://localhost:4000/api/admin/users/${id}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.map(u => (u.id === id ? { ...u, role } : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async id => {
    try {
      await axios.delete(`http://localhost:4000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Admin Panel</h1>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">User</th>
            <th className="text-left">Role</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td className="py-2">{u.username}</td>
              <td className="py-2">
                <select
                  className="border p-1"
                  value={u.role}
                  onChange={e => updateRole(u.id, e.target.value)}
                >
                  <option value="user">user</option>
                  <option value="creator">creator</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td className="py-2">
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => deleteUser(u.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
