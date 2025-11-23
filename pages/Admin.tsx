
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { Button, Modal, Input, Select } from '../components/ui';

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(api.getUsers());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = { ...currentUser, id: currentUser.id || Date.now().toString() } as User;
    api.saveUser(newUser); 
    setIsModalOpen(false);
    loadUsers();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('האם למחוק משתמש זה?')) {
      api.deleteUser(id);
      loadUsers();
    }
  };

  const openModal = (user?: User) => {
    setCurrentUser(user || { role: UserRole.STAFF, password: '' });
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">⚙️ ניהול משתמשים והרשאות</h2>
        <Button onClick={() => openModal()}>+ משתמש חדש</Button>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">שם</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">אימייל / כניסה</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">טלפון</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">תפקיד</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">פעולות</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{u.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {u.role === 'admin' ? 'מנהל' : 'צוות'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium flex gap-2 justify-end">
                    <button 
                      onClick={() => openModal(u)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded hover:bg-indigo-100"
                    >
                      עריכה / סיסמה
                    </button>
                    {u.id !== 'u_admin' && (
                      <button 
                        onClick={() => handleDelete(u.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded hover:bg-red-100"
                      >
                        מחיקה
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentUser.id ? 'עריכת פרטי משתמש' : 'משתמש חדש'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="שם מלא" value={currentUser.name || ''} onChange={(e:any) => setCurrentUser({...currentUser, name: e.target.value})} required />
          <Input label="אימייל (משמש לכניסה)" value={currentUser.email || ''} onChange={(e:any) => setCurrentUser({...currentUser, email: e.target.value})} required />
          <Input label="טלפון" value={currentUser.phone || ''} onChange={(e:any) => setCurrentUser({...currentUser, phone: e.target.value})} />
          
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
             <Input 
               label={currentUser.id ? "סיסמה חדשה (השאר ריק אם לא משנה)" : "סיסמה"} 
               value={currentUser.password || ''} 
               onChange={(e:any) => setCurrentUser({...currentUser, password: e.target.value})} 
               required={!currentUser.id}
               placeholder={currentUser.id ? "********" : ""}
             />
          </div>

          <Select 
            label="הרשאה" 
            value={currentUser.role || UserRole.STAFF} 
            onChange={(e:any) => setCurrentUser({...currentUser, role: e.target.value})}
            options={[
              { value: UserRole.STAFF, label: 'צוות (Staff)' },
              { value: UserRole.ADMIN, label: 'מנהל (Admin)' }
            ]} 
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>ביטול</Button>
            <Button type="submit">שמירה</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Admin;
