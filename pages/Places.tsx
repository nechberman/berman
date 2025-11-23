
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Place } from '../types';
import { Button, Modal, Input, Select } from '../components/ui';

const Places = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlace, setCurrentPlace] = useState<Partial<Place>>({});

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    setPlaces(await api.getPlaces());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const placeToSave = {
      ...currentPlace,
      id: currentPlace.id || Date.now().toString(),
      paymentStatus: currentPlace.paymentStatus || 'unpaid',
      paymentMethod: currentPlace.paymentMethod || 'other'
    } as Place;
    
    await api.savePlace(placeToSave);
    setIsModalOpen(false);
    loadPlaces();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('האם למחוק מקום זה?')) {
      await api.deletePlace(id);
      loadPlaces();
    }
  };

  const openModal = (place?: Place) => {
    setCurrentPlace(place || { paymentStatus: 'unpaid', paymentMethod: 'cash' });
    setIsModalOpen(true);
  };

  const filteredPlaces = places.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const paymentMethods = {
    cash: 'מזומן',
    check: 'צ\'ק',
    transfer: 'העברה',
    other: 'אחר'
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📍 מקומות ואנשי קשר</h2>
          <p className="text-gray-500 mt-1">ספקים, אטרקציות ומידע כספי</p>
        </div>
        <Button onClick={() => openModal()}>+ הוסף מקום</Button>
      </div>

      {/* Search */}
      <div className="bg-white p-2 rounded-xl shadow-sm mb-6 border border-gray-200">
         <div className="relative">
           <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">🔍</span>
           <input 
            type="text" 
            placeholder="חיפוש מקום..." 
            className="w-full pl-4 pr-10 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlaces.map(place => (
          <div key={place.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-900">{place.name}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${place.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {place.paymentStatus === 'paid' ? 'שולם ✅' : 'טרם שולם ⏳'}
                </span>
              </div>
              
              <div className="space-y-3">
                {/* Operator 1 */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">איש קשר 1</div>
                  <div className="font-medium">{place.contactName1}</div>
                  <a href={`tel:${place.contactPhone1}`} className="flex items-center gap-2 text-indigo-600 text-sm mt-1 hover:underline">
                    <span>📞</span>
                    <span dir="ltr">{place.contactPhone1}</span>
                  </a>
                </div>

                {/* Operator 2 - Optional */}
                {(place.contactName2 || place.contactPhone2) && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                     <div className="text-xs text-gray-500 mb-1">איש קשר 2</div>
                     {place.contactName2 && <div className="font-medium">{place.contactName2}</div>}
                     {place.contactPhone2 && (
                        <a href={`tel:${place.contactPhone2}`} className="flex items-center gap-2 text-indigo-600 text-sm mt-1 hover:underline">
                          <span>📞</span>
                          <span dir="ltr">{place.contactPhone2}</span>
                        </a>
                     )}
                  </div>
                )}

                <div className="flex gap-2 text-sm text-gray-600 pt-2 border-t">
                  <span>💳</span>
                  <span>תשלום ב{paymentMethods[place.paymentMethod]}</span>
                </div>

                {place.notes && (
                  <div className="text-sm bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-100">
                    📝 {place.notes}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
               <button onClick={() => openModal(place)} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded text-sm font-medium transition">עריכה</button>
               <button onClick={() => handleDelete(place.id)} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded text-sm font-medium transition">מחיקה</button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentPlace.id ? 'עריכת מקום' : 'מקום חדש'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="שם המקום" value={currentPlace.name || ''} onChange={(e:any) => setCurrentPlace({...currentPlace, name: e.target.value})} required />
          
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
             <div className="col-span-2 text-sm font-semibold text-gray-500">מפעיל 1 (חובה)</div>
             <Input label="שם" value={currentPlace.contactName1 || ''} onChange={(e:any) => setCurrentPlace({...currentPlace, contactName1: e.target.value})} required />
             <Input label="טלפון" value={currentPlace.contactPhone1 || ''} onChange={(e:any) => setCurrentPlace({...currentPlace, contactPhone1: e.target.value})} required />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
             <div className="col-span-2 text-sm font-semibold text-gray-500">מפעיל 2 (אופציונלי)</div>
             <Input label="שם" value={currentPlace.contactName2 || ''} onChange={(e:any) => setCurrentPlace({...currentPlace, contactName2: e.target.value})} />
             <Input label="טלפון" value={currentPlace.contactPhone2 || ''} onChange={(e:any) => setCurrentPlace({...currentPlace, contactPhone2: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="אופן תשלום" 
              value={currentPlace.paymentMethod} 
              onChange={(e:any) => setCurrentPlace({...currentPlace, paymentMethod: e.target.value})}
              options={[
                { value: 'cash', label: 'מזומן' },
                { value: 'check', label: 'צ\'ק' },
                { value: 'transfer', label: 'העברה' },
                { value: 'other', label: 'אחר' }
              ]} 
            />
            <Select 
              label="סטטוס תשלום" 
              value={currentPlace.paymentStatus} 
              onChange={(e:any) => setCurrentPlace({...currentPlace, paymentStatus: e.target.value})}
              options={[
                { value: 'unpaid', label: 'טרם שולם' },
                { value: 'paid', label: 'שולם' }
              ]} 
            />
          </div>

          <Input label="הערות" value={currentPlace.notes || ''} onChange={(e:any) => setCurrentPlace({...currentPlace, notes: e.target.value})} placeholder="למשל: לתאם יומיים מראש..." />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>ביטול</Button>
            <Button type="submit">שמירה</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Places;