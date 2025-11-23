
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CampEvent } from '../types';
import { Button, Modal, Input } from '../components/ui';

const Schedule = () => {
  const [events, setEvents] = useState<CampEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<CampEvent>>({});

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const allEvents = api.getEvents();
    // Sort by Date then Time
    allEvents.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
    setEvents(allEvents);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const eventToSave = {
      ...currentEvent,
      id: currentEvent.id || Date.now().toString()
    } as CampEvent;
    
    api.saveEvent(eventToSave);
    setIsModalOpen(false);
    loadEvents();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('האם למחוק אירוע זה?')) {
      api.deleteEvent(id);
      loadEvents();
    }
  };

  const openModal = (event?: CampEvent) => {
    setCurrentEvent(event || { date: new Date().toISOString().split('T')[0], startTime: '08:00', endTime: '09:00' });
    setIsModalOpen(true);
  };

  // Group by Date
  const groupedEvents = events.reduce((acc, event) => {
    const day = new Date(event.date).toLocaleDateString('he-IL', { weekday: 'long', month: 'numeric', day: 'numeric' });
    if (!acc[day]) acc[day] = [];
    acc[day].push(event);
    return acc;
  }, {} as Record<string, CampEvent[]>);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📅 לוח זמנים</h2>
        <Button onClick={() => openModal()}>+ אירוע חדש</Button>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedEvents).length === 0 && (
            <p className="text-center text-gray-500">אין אירועים בלוח הזמנים.</p>
        )}
        
        {Object.entries(groupedEvents).map(([day, dayEvents]: [string, CampEvent[]]) => (
          <div key={day} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
              <h3 className="text-lg font-semibold text-indigo-800">{day}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {dayEvents.map(ev => (
                <div key={ev.id} className="p-4 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{ev.startTime} - {ev.endTime}</span>
                      <span className="mx-2">•</span>
                      <span>📍 {ev.locationName}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">{ev.title}</h4>
                    {ev.description && <p className="text-gray-600 text-sm mt-1">{ev.description}</p>}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {ev.wazeLink && (
                      <a 
                        href={ev.wazeLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-500 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full text-sm font-medium transition"
                      >
                        🚙 Waze
                      </a>
                    )}
                    <button onClick={() => openModal(ev)} className="text-gray-400 hover:text-indigo-600 p-2">✏️</button>
                    <button onClick={() => handleDelete(ev.id)} className="text-gray-400 hover:text-red-600 p-2">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentEvent.id ? 'עריכת אירוע' : 'אירוע חדש'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="כותרת" value={currentEvent.title || ''} onChange={(e:any) => setCurrentEvent({...currentEvent, title: e.target.value})} required />
          <Input label="תיאור" value={currentEvent.description || ''} onChange={(e:any) => setCurrentEvent({...currentEvent, description: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
             <Input label="תאריך" type="date" value={currentEvent.date || ''} onChange={(e:any) => setCurrentEvent({...currentEvent, date: e.target.value})} required />
             <div className="grid grid-cols-2 gap-2">
                <Input label="התחלה" type="time" value={currentEvent.startTime || ''} onChange={(e:any) => setCurrentEvent({...currentEvent, startTime: e.target.value})} required />
                <Input label="סיום" type="time" value={currentEvent.endTime || ''} onChange={(e:any) => setCurrentEvent({...currentEvent, endTime: e.target.value})} required />
             </div>
          </div>
          <Input label="מיקום" value={currentEvent.locationName || ''} onChange={(e:any) => setCurrentEvent({...currentEvent, locationName: e.target.value})} required />
          <Input label="קישור Waze" value={currentEvent.wazeLink || ''} onChange={(e:any) => setCurrentEvent({...currentEvent, wazeLink: e.target.value})} />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>ביטול</Button>
            <Button type="submit">שמירה</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Schedule;
