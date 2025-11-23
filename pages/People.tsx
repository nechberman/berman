
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Person, ResponsibilityGroup } from '../types';
import { Button, Modal, Input, Select } from '../components/ui';

const People = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'groups'>('directory');
  
  // Directory State
  const [people, setPeople] = useState<Person[]>([]);
  const [filter, setFilter] = useState<'all' | 'student' | 'staff'>('all');
  const [search, setSearch] = useState('');
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [currentPerson, setCurrentPerson] = useState<Partial<Person>>({ type: 'student' });

  // Groups State
  const [groups, setGroups] = useState<ResponsibilityGroup[]>([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Partial<ResponsibilityGroup>>({});
  const [groupSearch, setGroupSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setPeople(await api.getPeople());
    setGroups(await api.getGroups());
  };

  // --- PERSON LOGIC ---
  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = { ...currentPerson, id: currentPerson.id || Date.now().toString() } as Person;
    await api.savePerson(p);
    setIsPersonModalOpen(false);
    loadData();
  };

  const filteredPeople = people.filter(p => {
    if (filter !== 'all' && p.type !== filter) return false;
    if (search && !p.name.includes(search)) return false;
    return true;
  });

  const openPersonModal = (person?: Person) => {
    setCurrentPerson(person || { type: 'student', name: '' });
    setIsPersonModalOpen(true);
  };

  // --- GROUP LOGIC ---
  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const g = { 
      ...currentGroup, 
      id: currentGroup.id || Date.now().toString(),
      studentIds: currentGroup.studentIds || []
    } as ResponsibilityGroup;
    
    await api.saveGroup(g);
    setIsGroupModalOpen(false);
    loadData();
  };

  const handleDeleteGroup = async (id: string) => {
    if(window.confirm('למחוק את הקבוצה?')) {
      await api.deleteGroup(id);
      loadData();
    }
  }

  const openGroupModal = (group?: ResponsibilityGroup) => {
    setCurrentGroup(group || { name: '', studentIds: [] });
    setIsGroupModalOpen(true);
  };

  const toggleStudentInGroup = (studentId: string) => {
    const currentIds = currentGroup.studentIds || [];
    if (currentIds.includes(studentId)) {
      setCurrentGroup({ ...currentGroup, studentIds: currentIds.filter(id => id !== studentId) });
    } else {
      setCurrentGroup({ ...currentGroup, studentIds: [...currentIds, studentId] });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">👥 צוות ודיירים</h2>
          <p className="text-gray-500 mt-1">ניהול ספר טלפונים וקבוצות אחריות</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('directory')} 
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'directory' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          📖 ספר טלפונים
        </button>
        <button 
          onClick={() => setActiveTab('groups')} 
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'groups' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          🛡️ קבוצות אחריות
        </button>
      </div>

      {/* TAB 1: DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="animate-fade-in">
          <div className="flex justify-between mb-4">
            <div className="flex-1 max-w-md">
              <input 
                  type="text" 
                  placeholder="חיפוש לפי שם..." 
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <Button onClick={() => openPersonModal()} className="mr-2">+ אדם חדש</Button>
          </div>
          
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
             {['all', 'staff', 'student'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f as any)} 
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {f === 'all' ? 'כולם' : f === 'staff' ? 'אנשי צוות' : 'תלמידים'}
                </button>
             ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">שם מלא</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">סוג ותפקיד</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">טלפון / מיקום</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">פעולות</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredPeople.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 text-base">{p.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          {p.type === 'student' ? 
                            <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">תלמיד</span> : 
                            <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-purple-100 text-purple-800">צוות</span>
                          }
                          <span className="text-sm text-gray-500">{p.type === 'staff' ? p.role : `חדר ${p.roomNumber || '—'}`}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {p.phone ? (
                           <a href={`tel:${p.phone}`} className="flex items-center gap-2 text-indigo-600 hover:underline bg-indigo-50 px-3 py-1 rounded-full w-fit">
                             <span>📞</span>
                             <span dir="ltr">{p.phone}</span>
                           </a>
                        ) : (
                          <span className="text-gray-400 text-sm italic">אין טלפון</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <button onClick={() => openPersonModal(p)} className="text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100 transition-all">
                           ✏️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GROUPS */}
      {activeTab === 'groups' && (
        <div className="animate-fade-in">
           <div className="flex justify-end mb-4">
              <Button onClick={() => openGroupModal()}>+ קבוצה חדשה</Button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
             {groups.length === 0 && <div className="col-span-full text-center text-gray-500 p-10">לא הוגדרו קבוצות אחריות.</div>}
             
             {groups.map(group => {
               const staffMember = people.find(p => p.id === group.staffId);
               const groupStudents = people.filter(p => group.studentIds.includes(p.id));

               return (
                 <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                       <div className="flex gap-2">
                         <button onClick={() => openGroupModal(group)} className="text-indigo-600 text-sm hover:underline">עריכה</button>
                         <button onClick={() => handleDeleteGroup(group.id)} className="text-red-500 text-sm hover:underline">מחיקה</button>
                       </div>
                    </div>

                    <div className="bg-indigo-50 p-3 rounded-lg mb-4 flex items-center gap-3">
                       <div className="bg-white p-2 rounded-full shadow-sm text-lg">👮‍♂️</div>
                       <div>
                          <div className="text-xs text-indigo-500 font-bold uppercase">אחראי קבוצה</div>
                          <div className="font-medium text-indigo-900">{staffMember?.name || 'לא משובץ'}</div>
                       </div>
                    </div>

                    <div className="flex-1">
                       <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                         <span>חניכים ({groupStudents.length})</span>
                       </div>
                       <ul className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                         {groupStudents.map(s => (
                           <li key={s.id} className="text-sm text-gray-700 flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
                             <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0"></span>
                             <span>{s.name}</span>
                           </li>
                         ))}
                         {groupStudents.length === 0 && <li className="text-sm text-gray-400 italic">אין חניכים בקבוצה</li>}
                       </ul>
                    </div>
                 </div>
               );
             })}
           </div>
        </div>
      )}

      {/* MODAL: PERSON */}
      <Modal isOpen={isPersonModalOpen} onClose={() => setIsPersonModalOpen(false)} title={currentPerson.id ? 'עריכת פרטים' : 'הוספת אדם חדש'}>
        <form onSubmit={handleSavePerson} className="space-y-4">
           <Input label="שם מלא" value={currentPerson.name || ''} onChange={(e:any) => setCurrentPerson({...currentPerson, name: e.target.value})} required />
           <Select 
            label="סוג" 
            value={currentPerson.type} 
            onChange={(e:any) => setCurrentPerson({...currentPerson, type: e.target.value})}
            options={[
              { value: 'student', label: 'תלמיד' },
              { value: 'staff', label: 'איש צוות' }
            ]} 
          />
          
          {currentPerson.type === 'student' ? (
            <div className="grid grid-cols-2 gap-4">
               <Input label="מספר חדר" type="number" value={currentPerson.roomNumber || ''} onChange={(e:any) => setCurrentPerson({...currentPerson, roomNumber: Number(e.target.value)})} />
               <Input label="מספר אוטובוס" type="number" value={currentPerson.busId || ''} onChange={(e:any) => setCurrentPerson({...currentPerson, busId: Number(e.target.value)})} />
            </div>
          ) : (
            <>
              <Input label="תפקיד" value={currentPerson.role || ''} onChange={(e:any) => setCurrentPerson({...currentPerson, role: e.target.value})} />
              <Input label="מספר טלפון" value={currentPerson.phone || ''} onChange={(e:any) => setCurrentPerson({...currentPerson, phone: e.target.value})} />
            </>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
            <Button variant="ghost" onClick={() => setIsPersonModalOpen(false)}>ביטול</Button>
            <Button type="submit">שמירה</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: GROUP */}
      <Modal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} title={currentGroup.id ? 'עריכת קבוצה' : 'קבוצה חדשה'}>
        <form onSubmit={handleSaveGroup} className="space-y-4">
          <Input label="שם הקבוצה" value={currentGroup.name || ''} onChange={(e:any) => setCurrentGroup({...currentGroup, name: e.target.value})} required placeholder="לדוגמה: קבוצה 1" />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">איש צוות אחראי</label>
            <select 
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={currentGroup.staffId || ''}
              onChange={(e) => setCurrentGroup({...currentGroup, staffId: e.target.value})}
            >
              <option value="">-- בחר איש צוות --</option>
              {people.filter(p => p.type === 'staff').map(s => (
                <option key={s.id} value={s.id}>{s.name} - {s.role}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-gray-100 pt-4">
             <label className="block text-sm font-medium text-gray-700 mb-2">בחירת חניכים לקבוצה</label>
             <input 
               type="text" 
               placeholder="סינון תלמידים..." 
               value={groupSearch}
               onChange={(e) => setGroupSearch(e.target.value)}
               className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg mb-2 focus:outline-none focus:border-indigo-400"
             />
             <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                {people
                  .filter(p => p.type === 'student')
                  .filter(p => p.name.includes(groupSearch))
                  .map(student => (
                    <label key={student.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={currentGroup.studentIds?.includes(student.id) || false}
                        onChange={() => toggleStudentInGroup(student.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{student.name}</span>
                    </label>
                  ))
                }
             </div>
             <div className="text-xs text-gray-500 mt-1">
               נבחרו: {currentGroup.studentIds?.length || 0} תלמידים
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
            <Button variant="ghost" onClick={() => setIsGroupModalOpen(false)}>ביטול</Button>
            <Button type="submit">שמירה</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default People;