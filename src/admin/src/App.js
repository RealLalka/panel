import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const API_URL = '/api';

const Modal = ({ show, onClose, title, children }) => {
  if (!show) {
    return null;
  }
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h4 className="modal-title">{title}</h4>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

const AccountsView = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modifiedUsers, setModifiedUsers] = useState({});

  const [selectedUser, setSelectedUser] = useState(null);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isOperationModalOpen, setOperationModalOpen] = useState(false);

  const availablePermissions = ['dashboard', 'deals', 'disputes', 'requisites', 'devices', 'messages', 'payments', 'profile'];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users.');
      const data = await response.json();
      setUsers(data.map(u => ({ ...u, permissions: u.permissions || [] })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePermissionChange = (userId, permission, isChecked) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        const currentPermissions = user.permissions || [];
        const updatedPermissions = isChecked
          ? [...new Set([...currentPermissions, permission])]
          : currentPermissions.filter(p => p !== permission);
        return { ...user, permissions: updatedPermissions };
      }
      return user;
    });
    setUsers(updatedUsers);
    setModifiedUsers(prev => ({ ...prev, [userId]: updatedUsers.find(u => u.id === userId) }));
  };

  const handleSaveAllChanges = async () => {
    const promises = Object.values(modifiedUsers).map(user =>
      fetch(`${API_URL}/users/${user.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ permissions: user.permissions })
      })
    );

    try {
      const results = await Promise.all(promises);
      const failed = results.filter(res => !res.ok);
      if (failed.length > 0) {
        throw new Error(`${failed.length} updates failed.`);
      }
      alert('All changes saved successfully!');
      setModifiedUsers({});
    } catch (err) {
      alert(`Error saving changes: ${err.message}`);
    }
  };

  const openModal = (user, modalSetter) => {
    setSelectedUser(user);
    modalSetter(true);
  };

  if (loading) return <h3>Загрузка аккаунтов...</h3>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="view-container">
      <div className="view-header">
        <h3>Аккаунты</h3>
        <button
          onClick={handleSaveAllChanges}
          disabled={Object.keys(modifiedUsers).length === 0}
          className="button button-primary"
        >
          Сохранить все изменения
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя пользователя</th>
              <th>Email</th>
              <th>2FA</th>
              <th>Права доступа</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge ${user.twoFactorEnabled ? 'status-active' : 'status-inactive'}`}>
                    {user.twoFactorEnabled ? 'Подключен' : 'Нет'}
                  </span>
                </td>
                <td>
                  <div className="permissions-grid">
                    {availablePermissions.map(perm => (
                      <div key={perm} className="permission-item">
                        <input
                          type="checkbox"
                          id={`perm-${user.id}-${perm}`}
                          checked={user.permissions.includes(perm)}
                          onChange={(e) => handlePermissionChange(user.id, perm, e.target.checked)}
                        />
                        <label htmlFor={`perm-${user.id}-${perm}`}>{perm}</label>
                      </div>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="actions-cell">
                    <button onClick={() => openModal(user, setPasswordModalOpen)} className="button-link">Пароль</button>
                    <button onClick={() => openModal(user, setOperationModalOpen)} className="button-link">Операция</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal show={isPasswordModalOpen} onClose={() => setPasswordModalOpen(false)} title={`Настройка пароля для ${selectedUser?.username}`}>
        <p>Здесь будет форма для смены пароля.</p>
      </Modal>
      <Modal show={isOperationModalOpen} onClose={() => setOperationModalOpen(false)} title={`Добавить операцию для ${selectedUser?.username}`}>
        <p>Здесь будет форма для добавления операции.</p>
      </Modal>
    </div>
  );
};

const OperationsView = () => (
  <div className="view-container">
    <h3>Операции</h3>
    <p>Здесь будет отображаться информация о последних операциях (споры, сделки, добавления реквизитов и т.д.).</p>
  </div>
);

const DepositsView = () => (
  <div className="view-container">
    <h3>Пополнения</h3>
    <p>Здесь будет информация о пополнениях.</p>
  </div>
);


function AdminPanel({ token, setToken }) {
  const [activeTab, setActiveTab] = useState('accounts');

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'accounts':
        return <AccountsView token={token} />;
      case 'operations':
        return <OperationsView />;
      case 'deposits':
        return <DepositsView />;
      default:
        return <AccountsView token={token} />;
    }
  };

  return (
    <div className="admin-panel-layout">
      <aside className="sidebar">
        <h1 className="sidebar-logo">GateCx</h1>
        <nav className="sidebar-nav">
          <button onClick={() => setActiveTab('accounts')} className={`nav-button ${activeTab === 'accounts' ? 'active' : ''}`}>Аккаунты</button>
          <button onClick={() => setActiveTab('operations')} className={`nav-button ${activeTab === 'operations' ? 'active' : ''}`}>Операции</button>
          <button onClick={() => setActiveTab('deposits')} className={`nav-button ${activeTab === 'deposits' ? 'active' : ''}`}>Пополнения</button>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-button logout-button">Выход</button>
        </div>
      </aside>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}


function Login({ setToken }) {
  const [login, setLogin] = useState('admin');
  const [password, setPassword] = useState('paneladmin');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Authentication failed.');
      if (data.role !== 'admin') throw new Error('Access denied. Admin role required.');
      setToken(data.accessToken);
      localStorage.setItem('token', data.accessToken);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Вход в панель администратора</h2>
      <form onSubmit={handleLogin}>
        <input type="text" value={login} onChange={e => setLogin(e.target.value)} placeholder="Логин" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" required />
        <button type="submit" className="button button-primary">Войти</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  return (
    <div className="App">
      {token ? <AdminPanel token={token} setToken={setToken} /> : <Login setToken={setToken} />}
    </div>
  );
}

export default App;
