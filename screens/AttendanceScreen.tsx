import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { api } from '../services/api';
import { Person, AttendanceSession, AttendanceRecord } from '../types';
import { Button, colors } from '../components/ui';

export default function AttendanceScreen() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [students, setStudents] = useState<Person[]>([]);
  const [recordsMap, setRecordsMap] = useState<Record<string, AttendanceRecord>>({});

  useEffect(() => {
    const init = async () => {
        const s = await api.getAttendanceSessions();
        setSessions(s);
        if (s.length > 0) setSelectedSessionId(s[0].id);
        const p = await api.getPeople();
        setStudents(p.filter(x => x.type === 'student'));
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedSessionId) loadRecords();
  }, [selectedSessionId]);

  const loadRecords = async () => {
    const all = await api.getAllAttendanceRecords();
    const relevant = all.filter(r => r.sessionId === selectedSessionId);
    const map: Record<string, AttendanceRecord> = {};
    relevant.forEach(r => map[r.studentId] = r);
    setRecordsMap(map);
  };

  const updateStatus = async (studentId: string, status: 'present' | 'absent') => {
    const record: AttendanceRecord = {
        sessionId: selectedSessionId,
        studentId,
        status,
        note: recordsMap[studentId]?.note || '',
        timestamp: Date.now()
    };
    // Optimistic
    setRecordsMap(prev => ({ ...prev, [studentId]: record }));
    await api.saveAttendanceRecord(record);
  };

  const markAll = async () => {
    const newRecords: AttendanceRecord[] = students.map(s => ({
        sessionId: selectedSessionId,
        studentId: s.id,
        status: 'present',
        note: recordsMap[s.id]?.note || '',
        timestamp: Date.now()
    }));
    // Optimistic
    const nextMap = { ...recordsMap };
    newRecords.forEach(r => nextMap[r.studentId] = r);
    setRecordsMap(nextMap);
    await api.bulkSaveAttendance(newRecords);
  };

  const stats = students.reduce((acc, s) => {
    const st = recordsMap[s.id]?.status || 'none';
    if (st === 'present') acc.p++;
    else if (st === 'absent') acc.a++;
    else acc.n++;
    return acc;
  }, { p: 0, a: 0, n: 0 });

  return (
    <View style={styles.container}>
        <View style={{height: 50}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {sessions.map(s => (
                    <TouchableOpacity 
                        key={s.id} 
                        onPress={() => setSelectedSessionId(s.id)}
                        style={[styles.sessChip, selectedSessionId === s.id && styles.activeSess]}
                    >
                        <Text style={[styles.sessText, selectedSessionId === s.id && {color: 'white'}]}>{s.title}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        <View style={styles.stats}>
            <View style={[styles.statBox, {backgroundColor: '#ecfdf5', borderColor: '#d1fae5'}]}>
                <Text style={[styles.statNum, {color: '#047857'}]}>{stats.p}</Text>
                <Text style={styles.statLabel}>נוכחים</Text>
            </View>
            <View style={[styles.statBox, {backgroundColor: '#fef2f2', borderColor: '#fee2e2'}]}>
                <Text style={[styles.statNum, {color: '#b91c1c'}]}>{stats.a}</Text>
                <Text style={styles.statLabel}>חסרים</Text>
            </View>
            <View style={styles.statBox}>
                <Text style={styles.statNum}>{stats.n}</Text>
                <Text style={styles.statLabel}>טרם</Text>
            </View>
        </View>

        <Button onClick={markAll} style={{marginBottom: 10}} variant="ghost">סמן הכל נוכח</Button>

        <FlatList 
            data={students}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
                const status = recordsMap[item.id]?.status || 'none';
                return (
                    <View style={[styles.row, status === 'absent' && {backgroundColor: '#fff1f2'}]}>
                        <Text style={[styles.name, {flex: 1}]}>{item.name}</Text>
                        <View style={{flexDirection: 'row', gap: 8}}>
                            <TouchableOpacity onPress={() => updateStatus(item.id, 'present')} style={[styles.btn, status === 'present' ? styles.btnP : styles.btnOff]}>
                                <Text style={status === 'present' ? {color:'white'} : {color:'gray'}}>V</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => updateStatus(item.id, 'absent')} style={[styles.btn, status === 'absent' ? styles.btnA : styles.btnOff]}>
                                <Text style={status === 'absent' ? {color:'white'} : {color:'gray'}}>X</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            }}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  sessChip: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'white', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: colors.border, height: 40 },
  activeSess: { backgroundColor: colors.primary, borderColor: colors.primary },
  sessText: { fontSize: 12, fontWeight: '600', color: colors.text },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0' },
  statNum: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: '#64748b' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 6, elevation: 1 },
  name: { fontSize: 14, fontWeight: '500', color: colors.text, textAlign: 'left' },
  btn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnP: { backgroundColor: colors.success },
  btnA: { backgroundColor: colors.danger },
  btnOff: { backgroundColor: '#f1f5f9' }
});