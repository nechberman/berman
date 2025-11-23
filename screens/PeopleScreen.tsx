import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { Person, ResponsibilityGroup } from '../types';
import { AppModal, Input, Button, colors } from '../components/ui';
import { Phone, User as UserIcon } from 'lucide-react-native';

export default function PeopleScreen() {
  const [activeTab, setActiveTab] = useState<'directory' | 'groups'>('directory');
  const [people, setPeople] = useState<Person[]>([]);
  const [groups, setGroups] = useState<ResponsibilityGroup[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modals
  const [personModal, setPersonModal] = useState(false);
  const [currentPerson, setCurrentPerson] = useState<Partial<Person>>({});
  const [groupModal, setGroupModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Partial<ResponsibilityGroup>>({});

  const loadData = async () => {
    setRefreshing(true);
    const p = await api.getPeople();
    const g = await api.getGroups();
    setPeople(p);
    setGroups(g);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  // --- Actions ---

  const savePerson = async () => {
    const p = { ...currentPerson, id: currentPerson.id || Date.now().toString() } as Person;
    await api.savePerson(p);
    setPersonModal(false);
    loadData();
  };

  const deletePerson = async () => {
    if (currentPerson.id) {
        await api.deletePerson(currentPerson.id);
        setPersonModal(false);
        loadData();
    }
  };

  const saveGroup = async () => {
    const g = { ...currentGroup, id: currentGroup.id || Date.now().toString(), studentIds: currentGroup.studentIds || [] } as ResponsibilityGroup;
    await api.saveGroup(g);
    setGroupModal(false);
    loadData();
  };

  const deleteGroup = async () => {
      if (currentGroup.id) {
          await api.deleteGroup(currentGroup.id);
          setGroupModal(false);
          loadData();
      }
  };

  // --- Renderers ---

  const renderPerson = ({ item }: { item: Person }) => {
    if (search && !item.name.includes(search)) return null;
    return (
      <TouchableOpacity style={styles.card} onPress={() => { setCurrentPerson(item); setPersonModal(true); }}>
        <View style={styles.row}>
            <View style={[styles.avatar, item.type === 'staff' ? {backgroundColor: '#f3e8ff'} : {backgroundColor: '#ecfdf5'}]}>
                <UserIcon size={20} color={item.type === 'staff' ? '#7e22ce' : '#047857'} />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>
                    {item.type === 'staff' ? item.role : `חדר ${item.roomNumber || '-'}`}
                </Text>
            </View>
            {item.phone ? (
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)} style={styles.callBtn}>
                    <Phone size={18} color="white" />
                </TouchableOpacity>
            ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroup = ({ item }: { item: ResponsibilityGroup }) => {
    const staff = people.find(p => p.id === item.staffId);
    return (
      <TouchableOpacity style={styles.card} onPress={() => { setCurrentGroup(item); setGroupModal(true); }}>
        <Text style={styles.groupTitle}>{item.name}</Text>
        <Text style={styles.sub}>אחראי: {staff?.name || 'לא משובץ'}</Text>
        <Text style={styles.sub}>חניכים: {item.studentIds.length}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
        <View style={styles.tabs}>
            <TouchableOpacity onPress={() => setActiveTab('directory')} style={[styles.tab, activeTab === 'directory' && styles.activeTab]}>
                <Text style={[styles.tabText, activeTab === 'directory' && styles.activeTabText]}>ספר טלפונים</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('groups')} style={[styles.tab, activeTab === 'groups' && styles.activeTab]}>
                <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>קבוצות</Text>
            </TouchableOpacity>
        </View>

        {activeTab === 'directory' && (
            <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', gap: 10, marginBottom: 10}}>
                    <View style={{flex: 1}}><Input value={search} onChangeText={setSearch} placeholder="חיפוש..." /></View>
                    <Button onClick={() => { setCurrentPerson({type: 'student'}); setPersonModal(true); }} style={{width: 50}}>+</Button>
                </View>
                <FlatList 
                    data={people} 
                    renderItem={renderPerson} 
                    keyExtractor={i => i.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
                />
            </View>
        )}

        {activeTab === 'groups' && (
            <View style={{flex: 1}}>
                <Button onClick={() => { setCurrentGroup({studentIds: []}); setGroupModal(true); }} style={{marginBottom: 10}}>+ קבוצה חדשה</Button>
                <FlatList 
                    data={groups} 
                    renderItem={renderGroup} 
                    keyExtractor={i => i.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
                />
            </View>
        )}

        {/* Person Modal */}
        <AppModal visible={personModal} onClose={() => setPersonModal(false)} title="עריכת אדם">
            <Input label="שם" value={currentPerson.name} onChangeText={(t:string) => setCurrentPerson({...currentPerson, name: t})} />
            <Input label="סוג (student/staff)" value={currentPerson.type} onChangeText={(t:string) => setCurrentPerson({...currentPerson, type: t as any})} placeholder="student / staff" />
            <Input label="תפקיד (לצוות)" value={currentPerson.role} onChangeText={(t:string) => setCurrentPerson({...currentPerson, role: t})} />
            <Input label="טלפון" value={currentPerson.phone} onChangeText={(t:string) => setCurrentPerson({...currentPerson, phone: t})} keyboardType="phone-pad" />
            <Input label="חדר (לתלמיד)" value={currentPerson.roomNumber} onChangeText={(t:string) => setCurrentPerson({...currentPerson, roomNumber: Number(t)})} keyboardType="numeric" />
            <Button onClick={savePerson} style={{marginTop: 10}}>שמירה</Button>
            {currentPerson.id && <Button onClick={deletePerson} variant="danger" style={{marginTop: 10}}>מחיקה</Button>}
        </AppModal>

        {/* Group Modal (Simplified for RN - full picker needed in real app) */}
        <AppModal visible={groupModal} onClose={() => setGroupModal(false)} title="עריכת קבוצה">
            <Input label="שם קבוצה" value={currentGroup.name} onChangeText={(t:string) => setCurrentGroup({...currentGroup, name: t})} />
            <Text style={{marginBottom: 10, color: 'gray'}}>ניהול חניכים וצוות מורכב יותר במובייל, יישום בסיסי כאן.</Text>
            <Button onClick={saveGroup}>שמירה</Button>
            {currentGroup.id && <Button onClick={deleteGroup} variant="danger" style={{marginTop: 10}}>מחיקה</Button>}
        </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  tabs: { flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderColor: colors.primary },
  tabText: { color: colors.textLight, fontWeight: '600' },
  activeTabText: { color: colors.primary },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 10, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: 'bold', color: colors.text, textAlign: 'left' },
  sub: { fontSize: 13, color: colors.textLight, textAlign: 'left' },
  callBtn: { backgroundColor: colors.success, padding: 8, borderRadius: 20 },
  groupTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary, textAlign: 'left', marginBottom: 4 }
});