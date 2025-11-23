
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Room } from '../types';
import { Button, Modal, Input, Select, StatusBadge } from '../components/ui';

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Partial<Room>>({});
  const [studentsText, setStudentsText] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
        const data = await api.getRooms();
        setRooms(data);
    };
    fetchRooms();
  }, []);

  const openEdit = (room: Room) => {
    setCurrentRoom(room);
    setStudentsText(room.students.join('\n'));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRoom = {
      ...currentRoom,
      students: studentsText.split('\n').map(s => s.trim()).filter(s => s)
    } as Room;
    await api.saveRoom(updatedRoom);
    const data = await api.getRooms();
    setRooms(data); // Refresh
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">🛏️ ניהול חדרים</h2>
        <p className="text-gray-500 mt-1">צפייה ושיבוץ דיירים ואנשי צוות אחראיים</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rooms.map(room => (
          <div 
            key={room.id} 
            onClick={() => openEdit(room)}
            className={`
              group cursor-pointer rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border
              ${room.status === 'issue' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}
              ${room.status === 'check' ? 'border-orange-200' : ''}
              transform hover:-translate-y-1
            `}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg">
                חדר {room.roomNumber}
              </span>
              <StatusBadge status={room.status} />
            </div>
            
            <div className="mb-4">
               <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">דיירים</div>
               <div className="text-sm text-gray-700 space-y-1 min-h-[4rem]">
                 {room.students.slice(0, 4).map((s, i) => (
                   <div key={i} className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></span>
                     {s}
                   </div>
                 ))}
                 {room.students.length > 4 && (
                   <div className="text-xs text-indigo-500 font-medium pt-1">+ עוד {room.students.length - 4} דיירים</div>
                 )}
               </div>
            </div>

            <div className="border-t border-gray-100 pt-3 mt-auto">
               <div className="flex items-center gap-2 mb-1">
                 <span className="text-lg">👮‍♂️</span>
                 <div>
                   <div className="text-xs text-gray-400">אחראי חדר</div>
                   <div className="text-sm font-medium text-gray-800 truncate max-w-[150px]" title={room.staffInCharge}>
                     {room.staffInCharge}
                   </div>
                 </div>
               </div>
               
               {room.notes && (
                 <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100">
                   📝 {room.notes}
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`עריכת חדר ${currentRoom.roomNumber}`}>
        <form onSubmit={handleSave} className="space-y-5">
          <Input label="אחראי חדר" value={currentRoom.staffInCharge || ''} onChange={(e:any) => setCurrentRoom({...currentRoom, staffInCharge: e.target.value})} />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">רשימת תלמידים (כל שם בשורה)</label>
            <textarea 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 h-40 text-sm"
              value={studentsText}
              onChange={(e) => setStudentsText(e.target.value)}
            />
          </div>

          <Select 
            label="סטטוס חדר" 
            value={currentRoom.status} 
            onChange={(e:any) => setCurrentRoom({...currentRoom, status: e.target.value})}
            options={[
              { value: 'ok', label: '✅ תקין' },
              { value: 'check', label: '⚠️ לבדיקה' },
              { value: 'issue', label: '🚨 תקלה' }
            ]} 
          />

          <Input label="הערות" value={currentRoom.notes || ''} onChange={(e:any) => setCurrentRoom({...currentRoom, notes: e.target.value})} placeholder="לדוגמה: חסר מזרן, חלון שבור..." />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>ביטול</Button>
            <Button type="submit">שמירה ועדכון</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Rooms;