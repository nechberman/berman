import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { Room } from '../types';
import { AppModal, Input, StatusBadge, Button, colors } from '../components/ui';

export default function RoomsScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Partial<Room>>({});
  const [studentsText, setStudentsText] = useState('');

  const loadRooms = async () => {
    const data = await api.getRooms();
    setRooms(data);
  };

  useFocusEffect(
    useCallback(() => { loadRooms(); }, [])
  );

  const openEdit = (room: Room) => {
    setCurrentRoom(room);
    setStudentsText(room.students.join('\n'));
    setModalVisible(true);
  };

  const handleSave = async () => {
    const updatedRoom = {
      ...currentRoom,
      students: studentsText.split('\n').map(s => s.trim()).filter(s => s)
    } as Room;
    await api.saveRoom(updatedRoom);
    setModalVisible(false);
    loadRooms();
  };

  const renderItem = ({ item }: { item: Room }) => (
    <TouchableOpacity 
        style={[styles.card, item.status === 'issue' && styles.issueCard]} 
        onPress={() => openEdit(item)}
    >
        <View style={styles.header}>
            <View style={styles.roomBadge}>
                <Text style={styles.roomNum}>חדר {item.roomNumber}</Text>
            </View>
            <StatusBadge status={item.status} />
        </View>
        
        <View style={styles.content}>
            <Text style={styles.label}>דיירים ({item.students.length})</Text>
            <Text style={styles.students} numberOfLines={3}>{item.students.join(', ')}</Text>
        </View>

        <View style={styles.footer}>
            <Text style={styles.staffLabel}>אחראי: {item.staffInCharge}</Text>
            {item.notes ? <Text style={styles.note}>📝 {item.notes}</Text> : null}
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{justifyContent: 'space-between'}}
        contentContainerStyle={{paddingBottom: 20}}
      />

      <AppModal visible={modalVisible} onClose={() => setModalVisible(false)} title={`חדר ${currentRoom.roomNumber}`}>
         <Input label="אחראי חדר" value={currentRoom.staffInCharge} onChangeText={(t: string) => setCurrentRoom({...currentRoom, staffInCharge: t})} />
         <Input label="רשימת תלמידים (שורה לכל שם)" value={studentsText} onChangeText={setStudentsText} multiline />
         <Input label="סטטוס (ok/check/issue)" value={currentRoom.status} onChangeText={(t: string) => setCurrentRoom({...currentRoom, status: t as any})} placeholder="ok, check, issue" />
         <Input label="הערות" value={currentRoom.notes} onChangeText={(t: string) => setCurrentRoom({...currentRoom, notes: t})} />
         <Button onClick={handleSave} style={{marginTop: 10}}>עדכון</Button>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 10 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 12, width: '48%', elevation: 2, borderWidth: 1, borderColor: colors.border },
  issueCard: { backgroundColor: '#fef2f2', borderColor: '#fca5a5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  roomBadge: { backgroundColor: colors.inputBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  roomNum: { fontWeight: 'bold', color: colors.primary },
  content: { marginBottom: 8 },
  label: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', marginBottom: 2 },
  students: { fontSize: 12, color: colors.text, textAlign: 'left' },
  footer: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  staffLabel: { fontSize: 11, fontWeight: '600', color: colors.textLight, textAlign: 'left' },
  note: { fontSize: 10, color: '#b45309', marginTop: 4, backgroundColor: '#fff7ed', padding: 2 }
});