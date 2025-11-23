
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Task, TaskStatus } from '../types';
import { Button, Modal, Input, Select, StatusBadge } from '../components/ui';

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});

  useEffect(() => {
    loadTasks();
    // Check for auto-deletion every minute
    const interval = setInterval(checkAutoCleanup, 60000); 
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    const allTasks = await api.getTasks();
    const now = Date.now();
    
    // Auto cleanup logic: Filter out Done tasks older than 30 mins
    const validTasks = allTasks.filter(t => {
      if (t.status === TaskStatus.DONE && t.completedAt) {
        const diffMins = (now - t.completedAt) / 1000 / 60;
        if (diffMins > 30) {
            // Task is old, let's remove it from DB (simulated)
            // api.deleteTask is async but we don't await here to avoid blocking filtering
            // In a real app backend does this.
            api.deleteTask(t.id);
            return false;
        }
      }
      return true;
    });
    
    setTasks(validTasks);
  };

  const checkAutoCleanup = () => {
     loadTasks(); // Reloading triggers the cleanup filter
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = { 
      ...currentTask, 
      id: currentTask.id || Date.now().toString(),
      createdBy: currentTask.createdBy || 'admin', // In real app, use auth user
      status: currentTask.status || TaskStatus.OPEN
    } as Task;
    
    // If saving as DONE, add timestamp if not exists
    if (t.status === TaskStatus.DONE && !t.completedAt) {
      t.completedAt = Date.now();
    }
    
    await api.saveTask(t);
    setIsModalOpen(false);
    loadTasks();
  };

  const toggleStatus = async (task: Task) => {
    const nextStatus = task.status === TaskStatus.OPEN ? TaskStatus.IN_PROGRESS : 
                       task.status === TaskStatus.IN_PROGRESS ? TaskStatus.DONE : TaskStatus.OPEN;
    
    const updatedTask = { 
        ...task, 
        status: nextStatus,
        completedAt: nextStatus === TaskStatus.DONE ? Date.now() : undefined 
    };

    await api.saveTask(updatedTask);
    loadTasks();
  };

  const filteredTasks = tasks.filter(t => filterStatus === 'all' || t.status === filterStatus);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">✅ משימות ותקלות</h2>
           <p className="text-sm text-gray-500">תקלות ומשימות שסומנו כ"בוצע" יימחקו אוטומטית לאחר 30 דקות.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => { setCurrentTask({ category: 'תקלות' }); setIsModalOpen(true); }} className="bg-red-600 hover:bg-red-700">🚨 דווח על תקלה</Button>
            <Button onClick={() => { setCurrentTask({}); setIsModalOpen(true); }}>+ משימה חדשה</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'open', 'in_progress', 'done'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              filterStatus === status ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {status === 'all' ? 'הכל' : <StatusBadge status={status} />}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 && <div className="col-span-3 text-center text-gray-400 py-10">אין משימות להצגה</div>}
        
        {filteredTasks.map(task => (
          <div key={task.id} className={`bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between h-full ${task.category === 'תקלות' ? 'border-l-4 border-l-red-500' : ''}`}>
            <div>
              <div className="flex justify-between items-start mb-2">
                 <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${task.category === 'תקלות' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{task.category}</span>
                 <button onClick={() => toggleStatus(task)}><StatusBadge status={task.status} /></button>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{task.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{task.description}</p>
            </div>
            
            <div className="border-t pt-3 mt-2 flex justify-between items-center text-sm">
              <div className="text-gray-500">
                <span>👤 {task.assignedTo}</span>
                <span className="block text-xs mt-0.5">📅 {task.dueDate}</span>
              </div>
              <button onClick={() => { setCurrentTask(task); setIsModalOpen(true); }} className="text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded">
                עריכה
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentTask.id ? 'עריכת משימה/תקלה' : 'משימה חדשה'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="כותרת" value={currentTask.title || ''} onChange={(e:any) => setCurrentTask({...currentTask, title: e.target.value})} required />
          <Input label="תיאור" value={currentTask.description || ''} onChange={(e:any) => setCurrentTask({...currentTask, description: e.target.value})} />
          <Input label="הוקצה ל" value={currentTask.assignedTo || ''} onChange={(e:any) => setCurrentTask({...currentTask, assignedTo: e.target.value})} placeholder="שם איש צוות" />
          <Input label="תאריך יעד" type="date" value={currentTask.dueDate || ''} onChange={(e:any) => setCurrentTask({...currentTask, dueDate: e.target.value})} />
          
          <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
             <div className="flex gap-2">
               {['לוגיסטיקה', 'משמעת', 'תקלות', 'תוכן', 'כללי'].map(cat => (
                 <button 
                   type="button"
                   key={cat}
                   onClick={() => setCurrentTask({...currentTask, category: cat})}
                   className={`text-xs px-2 py-1 rounded border ${currentTask.category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'}`}
                 >
                   {cat}
                 </button>
               ))}
             </div>
             <input 
                type="text" 
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm" 
                placeholder="או הקלד קטגוריה אחרת..."
                value={currentTask.category || ''}
                onChange={(e) => setCurrentTask({...currentTask, category: e.target.value})}
             />
          </div>

          <Select 
            label="סטטוס" 
            value={currentTask.status || TaskStatus.OPEN} 
            onChange={(e:any) => setCurrentTask({...currentTask, status: e.target.value})}
            options={[
              { value: TaskStatus.OPEN, label: 'פתוח' },
              { value: TaskStatus.IN_PROGRESS, label: 'בטיפול' },
              { value: TaskStatus.DONE, label: 'בוצע' }
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

export default Tasks;