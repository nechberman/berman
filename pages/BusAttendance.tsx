
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Person, AttendanceSession, AttendanceRecord, AttendanceStatus } from '../types';
import { Button, Select } from '../components/ui';

const Attendance = () => {
  const [students, setStudents] = useState<Person[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({}); // Key: studentId
  const [search, setSearch] = useState('');

  useEffect(() => {
    const allPeople = api.getPeople();
    setStudents(allPeople.filter(p => p.type === 'student'));
    
    const allSessions = api.getAttendanceSessions();
    setSessions(allSessions);
    if (allSessions.length > 0) {
      setSelectedSessionId(allSessions[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      loadAttendanceForSession(selectedSessionId);
    }
  }, [selectedSessionId]);

  const loadAttendanceForSession = (sessionId: string) => {
    const allRecords = api.getAllAttendanceRecords();
    const sessionRecords = allRecords.filter(r => r.sessionId === sessionId);
    
    const map: Record<string, AttendanceRecord> = {};
    sessionRecords.forEach(r => {
      map[r.studentId] = r;
    });
    setAttendanceMap(map);
  };

  const updateRecord = (studentId: string, updates: Partial<AttendanceRecord>) => {
    const currentRecord = attendanceMap[studentId] || {
      sessionId: selectedSessionId,
      studentId: studentId,
      status: 'none',
      note: '',
      timestamp: Date.now()
    };

    const newRecord = { ...currentRecord, ...updates, timestamp: Date.now() };
    
    // Optimistic Update
    setAttendanceMap(prev => ({ ...prev, [studentId]: newRecord }));
    
    // Save to DB
    api.saveAttendanceRecord(newRecord);
  };

  const handleStatus = (studentId: string, status: AttendanceStatus) => {
    updateRecord(studentId, { status });
  };

  const handleNote = (studentId: string, note: string) => {
    updateRecord(studentId, { note });
  };

  const markAllPresent = () => {
    if (!window.confirm('האם לסמן את כל התלמידים כנוכחים?')) return;
    
    const newRecords: AttendanceRecord[] = students.map(s => ({
      sessionId: selectedSessionId,
      studentId: s.id,
      status: 'present',
      note: attendanceMap[s.id]?.note || '',
      timestamp: Date.now()
    }));

    // Optimistic update map
    const newMap = { ...attendanceMap };
    newRecords.forEach(r => newMap[r.studentId] = r);
    setAttendanceMap(newMap);

    api.bulkSaveAttendance(newRecords);
  };

  const getStats = () => {
    let present = 0;
    let absent = 0;
    let none = 0;
    
    students.forEach(s => {
      const status = attendanceMap[s.id]?.status || 'none';
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else none++;
    });
    
    return { present, absent, none, total: students.length };
  };

  const stats = getStats();
  const currentSession = sessions.find(s => s.id === selectedSessionId);
  
  const filteredStudents = students.filter(s => s.name.includes(search));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">📝 בדיקת נוכחות</h2>
        <p className="text-gray-500 mt-1">מעקב נוכחות באירועים מרכזיים</p>
      </div>

      {/* Session Selector */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">בחר אירוע לבדיקה:</label>
        <select 
          value={selectedSessionId} 
          onChange={(e) => setSelectedSessionId(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-lg font-medium"
        >
          {sessions.map(s => (
            <option key={s.id} value={s.id}>{s.day} - {s.title}</option>
          ))}
        </select>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
          <div className="text-2xl font-bold text-emerald-700">{stats.present}</div>
          <div className="text-xs text-emerald-600 font-medium">נוכחים</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-3">
          <div className="text-2xl font-bold text-red-700">{stats.absent}</div>
          <div className="text-xs text-red-600 font-medium">חסרים</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <div className="text-2xl font-bold text-gray-600">{stats.none}</div>
          <div className="text-xs text-gray-500 font-medium">לא סומנו</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 justify-between">
        <input 
          type="text" 
          placeholder="חיפוש תלמיד..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 flex-1"
        />
        <Button onClick={markAllPresent} className="whitespace-nowrap">✅ סמן את כולם כנוכחים</Button>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredStudents.map(student => {
            const record = attendanceMap[student.id];
            const status = record?.status || 'none';
            const note = record?.note || '';

            return (
              <div key={student.id} className={`p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 transition-colors ${status === 'absent' ? 'bg-red-50/30' : ''}`}>
                
                {/* Name & Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{student.name}</div>
                  <div className="text-sm text-gray-500 flex gap-2">
                     <span>חדר {student.roomNumber}</span>
                     <span>•</span>
                     <span>אוטובוס {student.busId}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 sm:gap-4 justify-between sm:justify-end w-full sm:w-auto">
                  {/* Status Toggles */}
                  <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
                    <button 
                      onClick={() => handleStatus(student.id, 'present')}
                      className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${status === 'present' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                      נוכח
                    </button>
                    <button 
                      onClick={() => handleStatus(student.id, 'absent')}
                      className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${status === 'absent' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                      חסר
                    </button>
                  </div>

                  {/* Note Input */}
                  <input 
                    type="text" 
                    placeholder="הערה..." 
                    value={note}
                    onChange={(e) => handleNote(student.id, e.target.value)}
                    className="w-24 sm:w-32 px-2 py-1.5 text-sm border-b border-gray-200 focus:border-indigo-500 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="p-8 text-center text-gray-500">לא נמצאו תלמידים.</div>
        )}
      </div>
    </div>
  );
};

export default Attendance;