import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { Task, TaskStatus } from '../types';
import { AppModal, Input, Button, StatusBadge, colors } from '../components/ui';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [filter, setFilter] = useState('all');

  const loadTasks = async () => {
    setRefreshing(true);
    const data = await api.getTasks();
    const now = Date.now();
    // Auto cleanup logic client side for demo
    const valid = [];
    for (const t of data) {
        if (t.status === TaskStatus.DONE && t.completedAt && (now - t.completedAt > 30 * 60 * 1000)) {
            await api.deleteTask(t.id);
        } else {
            valid.push(t);
        }
    }
    setTasks(valid);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { loadTasks(); }, []));

  const saveTask = async () => {
    const t = { 
        ...currentTask, 
        id: currentTask.id || Date.now().toString(),
        status: currentTask.status || TaskStatus.OPEN,
        createdBy: 'app'
    } as Task;
    if (t.status === TaskStatus.DONE && !t.completedAt) t.completedAt = Date.now();
    await api.saveTask(t);
    setModal(false);
    loadTasks();
  };

  const toggleStatus = async (task: Task) => {
    const next = task.status === TaskStatus.OPEN ? TaskStatus.IN_PROGRESS : 
                 task.status === TaskStatus.IN_PROGRESS ? TaskStatus.DONE : TaskStatus.OPEN;
    const update = { ...task, status: next, completedAt: next === TaskStatus.DONE ? Date.now() : undefined };
    await api.saveTask(update);
    loadTasks();
  };

  const renderItem = ({ item }: { item: Task }) => {
    if (filter !== 'all' && item.status !== filter) return null;
    return (
      <View style={[styles.card, item.category === 'תקלות' && { borderLeftWidth: 4, borderLeftColor: colors.danger }]}>
        <View style={styles.header}>
            <Text style={styles.cat}>{item.category}</Text>
            <TouchableOpacity onPress={() => toggleStatus(item)}>
                <StatusBadge status={item.status} />
            </TouchableOpacity>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <View style={styles.footer}>
            <Text style={styles.meta}>אחראי: {item.assignedTo}</Text>
            <TouchableOpacity onPress={() => { setCurrentTask(item); setModal(true); }}>
                <Text style={styles.edit}>עריכה</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
        <View style={styles.actions}>
            <Button onClick={() => { setCurrentTask({}); setModal(true); }} style={{flex: 1}}>+ משימה</Button>
            <Button onClick={() => { setCurrentTask({category: 'תקלות'}); setModal(true); }} variant="danger" style={{flex: 1}}>! תקלה</Button>
        </View>

        <View style={styles.filters}>
            {['all', 'open', 'done'].map(f => (
                <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.activeFilter]}>
                    <Text style={[styles.filterText, filter === f && {color: 'white'}]}>{f}</Text>
                </TouchableOpacity>
            ))}
        </View>

        <FlatList 
            data={tasks}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadTasks} />}
        />

        <AppModal visible={modal} onClose={() => setModal(false)} title="משימה">
            <Input label="כותרת" value={currentTask.title} onChangeText={(t:string) => setCurrentTask({...currentTask, title: t})} />
            <Input label="תיאור" value={currentTask.description} onChangeText={(t:string) => setCurrentTask({...currentTask, description: t})} />
            <Input label="אחראי" value={currentTask.assignedTo} onChangeText={(t:string) => setCurrentTask({...currentTask, assignedTo: t})} />
            <Input label="קטגוריה" value={currentTask.category} onChangeText={(t:string) => setCurrentTask({...currentTask, category: t})} />
            <Button onClick={saveTask}>שמירה</Button>
        </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: colors.border },
  activeFilter: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 12, fontWeight: '600' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cat: { fontSize: 10, backgroundColor: '#f3f4f6', padding: 4, borderRadius: 4 },
  title: { fontSize: 16, fontWeight: 'bold', color: colors.text, textAlign: 'left' },
  desc: { fontSize: 13, color: colors.textLight, marginVertical: 4, textAlign: 'left' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  meta: { fontSize: 12, color: colors.textLight },
  edit: { color: colors.primary, fontWeight: '600' }
});