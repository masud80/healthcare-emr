import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectRole } from '../../redux/slices/authSlice';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../../firebase/config';
import '../../styles/components.css';
import '../../styles/userManagement.css';

const UserManagement = () => {
  const userRole = useSelector(selectRole);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleUpdate, setRoleUpdate] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user'
  });
  const [editingUser, setEditingUser] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    if (userRole !== 'admin') {
      setError('Only administrators can update user roles');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setSelectedUser(null);
      setRoleUpdate('');
    } catch (error) {
      console.error('Error updating role:', error);
      setError('Failed to update role');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (userRole !== 'admin') {
      setError('Only administrators can add new users');
      setLoading(false);
      return;
    }

    try {
      const functions = getFunctions();
      const createUserFunction = httpsCallable(functions, 'createUser');
      
      await createUserFunction(newUser);
      
      setNewUser({
        email: '',
        password: '',
        name: '',
        role: 'user'
      });
      setShowAddUser(false);
      await fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      setError(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (userId) => {
    if (userRole !== 'admin') {
      setError('Only administrators can edit users');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), {
        name: editingUser.name,
        email: editingUser.email
      });
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, name: editingUser.name, email: editingUser.email }
          : user
      ));
      setShowEditUser(null);
      setEditingUser({ name: '', email: '' });
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    }
  };

  const startEditingUser = (user) => {
    setEditingUser({
      name: user.name || '',
      email: user.email
    });
    setShowEditUser(user.id);
  };

  if (loading) {
    return <div className="container"><p>Loading users...</p></div>;
  }

  return (
    <div className="container">
      <div className="flex flex-between flex-center">
        <h1 className="title">User Management</h1>
        {userRole === 'admin' ? (
          <button
            className="button button-primary"
            onClick={() => setShowAddUser(true)}
          >
            + Add User
          </button>
        ) : (
          <p className="error-message">Only administrators can add new users</p>
        )}
      </div>
      
      {error && <p className="error-message">{error}</p>}
      
      {showAddUser && (
        <div className="paper mb-4">
          <h2>Add New User</h2>
          <form onSubmit={handleAddUser} className="form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                required
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Role:</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="select"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="facility_admin">Facility Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
              </select>
            </div>
            <div className="form-buttons">
              <button type="submit" className="button button-primary">Add User</button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowAddUser(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="paper">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    {showEditUser === user.id ? (
                      <input
                        type="text"
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                        className="input"
                      />
                    ) : (
                      user.name || 'N/A'
                    )}
                  </td>
                  <td>
                    {showEditUser === user.id ? (
                      <input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                        className="input"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>{user.role || 'user'}</td>
                  <td>
                    <div className="flex gap-2">
                      {selectedUser === user.id ? (
                        <>
                          <select
                            className="select"
                            value={roleUpdate}
                            onChange={(e) => setRoleUpdate(e.target.value)}
                          >
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="facility_admin">Facility Admin</option>
                            <option value="doctor">Doctor</option>
                            <option value="nurse">Nurse</option>
                            <option value="user">User</option>
                          </select>
                          <button
                            className="button button-primary"
                            onClick={() => handleRoleUpdate(user.id, roleUpdate)}
                            disabled={!roleUpdate}
                          >
                            Save Role
                          </button>
                          <button
                            className="button button-secondary"
                            onClick={() => {
                              setSelectedUser(null);
                              setRoleUpdate('');
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : showEditUser === user.id ? (
                        <>
                          <button
                            className="button button-primary"
                            onClick={() => handleEditUser(user.id)}
                          >
                            Save
                          </button>
                          <button
                            className="button button-secondary"
                            onClick={() => {
                              setShowEditUser(null);
                              setEditingUser({ name: '', email: '' });
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {userRole === 'admin' && (
                            <>
                              <button
                                className="button button-secondary"
                                onClick={() => startEditingUser(user)}
                              >
                                Edit
                              </button>
                              <button
                                className="button button-secondary"
                                onClick={() => {
                                  setSelectedUser(user.id);
                                  setRoleUpdate(user.role || 'user');
                                }}
                              >
                                Change Role
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
