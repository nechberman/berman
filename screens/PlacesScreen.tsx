import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { Place } from '../types';
import { AppModal, Input, Button, StatusBadge, colors } from '../components/ui';
import { Phone } from 'lucide-react-native';

export default function PlacesScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [modal, setModal] = useState(false);
  const [current, setCurrent] = useState<Partial<Place>>({});

  const loadData = async () => {
    const d = await api.getPlaces();
    setPlaces(d);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleSave = async () => {
    const p = { ...current, id: current.id || Date.now().toString(), paymentStatus: current.paymentStatus || 'unpaid', paymentMethod: 'other' } as Place;
    await api.savePlace(p);
    setModal(false);
    loadData();
  };

  const renderItem = ({ item }: { item: Place }) => (
    <TouchableOpacity style={styles.card} onPress={() => { setCurrent(item); setModal(true); }}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.title}>{item.name}</Text>
            <StatusBadge status={item.paymentStatus} />
        </View>
        <View style={styles.contact}>
            <Text style={styles.label}>איש קשר: {item.contactName1}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.contactPhone1}`)} style={styles.phone}>
                <Phone size={14} color={colors.primary} />
                <Text style={{color: colors.primary}}>{item.contactPhone1}</Text>
            </TouchableOpacity>
        </View>
        {item.notes ? <Text style={styles.note}>{item.notes}</Text> : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
        <Button onClick={() => { setCurrent({paymentStatus: 'unpaid'}); setModal(true); }} style={{marginBottom: 10}}>+ הוסף מקום</Button>
        <FlatList data={places} renderItem={renderItem} />
        
        <AppModal visible={modal} onClose={() => setModal(false)} title="מקום">
            <Input label="שם" value={current.name} onChangeText={(t:string) => setCurrent({...current, name: t})} />
            <Input label="איש קשר" value={current.contactName1} onChangeText={(t:string) => setCurrent({...current, contactName1: t})} />
            <Input label="טלפון" value={current.contactPhone1} onChangeText={(t:string) => setCurrent({...current, contactPhone1: t})} keyboardType="phone-pad" />
            <Input label="סטטוס (paid/unpaid)" value={current.paymentStatus} onChangeText={(t:string) => setCurrent({...current, paymentStatus: t as any})} placeholder="paid / unpaid" />
            <Input label="הערות" value={current.notes} onChangeText={(t:string) => setCurrent({...current, notes: t})} />
            <Button onClick={handleSave} style={{marginTop: 10}}>שמירה</Button>
        </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  contact: { backgroundColor: '#f8fafc', padding: 8, borderRadius: 8, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '500', textAlign: 'left' },
  phone: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  note: { fontSize: 12, color: '#b45309', backgroundColor: '#fff7ed', padding: 4 }
});