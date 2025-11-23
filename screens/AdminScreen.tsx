import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { AppModal, Input, Button, colors } from '../components/ui';

export default function AdminScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [modal, setModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});

  const loadData = async () => {
    const u = await api.getUsers();
    setUsers(u);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const save = async () => {
    await api.saveUser({ ...currentUser, id: currentUser.id || Date.now().toString() } as User);
    setModal(false);
    loadData();
  };

  const del = async (id: string) => {
    Alert.alert('מחיקה', 'האם למחוק?', [
        { text: 'ביטול' },
        { text: 'מחיקה', onPress: async () => { await api.deleteUser(id); loadData(); } }
    ]);
  };

  return (
    <View style={styles.container}>
        <Button onClick={() => { setCurrentUser({role: UserRole.STAFF}); setModal(true); }} style={{marginBottom: 10}}>+ משתמש חדש</Button>
        <FlatList 
            data={users}
            keyExtractor={u => u.id}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.email}>{item.email}</Text>
                        </View>
                        <View style={styles.roleTag}>
                            <Text style={styles.roleText}>{item.role}</Text>
                        </View>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => { setCurrentUser(item); setModal(true); }}>
                            <Text style={styles.edit}>עריכה</Text>
                        </TouchableOpacity>
                        {item.id !== 'u_admin' && (
                            <TouchableOpacity onPress={() => del(item.id)}>
                                <Text style={styles.del}>מחיקה</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        />

        <AppModal visible={modal} onClose={() => setModal(false)} title="משתמש">
            <Input label="שם" value={currentUser.name} onChangeText={(t:string) => setCurrentUser({...currentUser, name: t})} />
            <Input label="אימייל" value={currentUser.email} onChangeText={(t:string) => setCurrentUser({...currentUser, email: t})} keyboardType="email-address" />
            <Input label="טלפון" value={currentUser.phone} onChangeText={(t:string) => setCurrentUser({...currentUser, phone: t})} keyboardType="phone-pad" />
            <Input label="סיסמה" value={currentUser.password} onChangeText={(t:string) => setCurrentUser({...currentUser, password: t})} placeholder="******" />
            <Input label="תפקיד (admin/staff)" value={currentUser.role} onChangeText={(t:string) => setCurrentUser({...currentUser, role: t as any})} />
            <Button onClick={save} style={{marginTop: 10}}>שמירה</Button>
        </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 10, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: 'bold', fontSize: 16, textAlign: 'left' },
  email: { color: colors.textLight, fontSize: 14, textAlign: 'left' },
  roleTag: { backgroundColor: '#f3e8ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  roleText: { color: '#7e22ce', fontSize: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
  edit: { color: colors.primary, fontWeight: '600' },
  del: { color: colors.danger, fontWeight: '600' }
});