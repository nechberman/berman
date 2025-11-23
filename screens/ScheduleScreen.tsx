import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { CampEvent } from '../types';
import { Button, AppModal, Input, colors } from '../components/ui';
import { MapPin, Clock } from 'lucide-react-native';

export default function ScheduleScreen() {
  const [events, setEvents] = useState<CampEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<CampEvent>>({});

  const loadEvents = async () => {
    setRefreshing(true);
    const data = await api.getEvents();
    // Sort
    data.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
    });
    setEvents(data);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const handleSave = async () => {
    const eventToSave = {
      ...currentEvent,
      id: currentEvent.id || Date.now().toString()
    } as CampEvent;
    await api.saveEvent(eventToSave);
    setModalVisible(false);
    loadEvents();
  };

  const handleDelete = async (id: string) => {
    await api.deleteEvent(id);
    loadEvents();
  };

  const openModal = (event?: CampEvent) => {
    setCurrentEvent(event || { date: new Date().toISOString().split('T')[0], startTime: '08:00', endTime: '09:00' });
    setModalVisible(true);
  };

  // Grouping
  const groupedEvents = events.reduce((acc, event) => {
    const day = event.date; // Simplified for RN list
    if (!acc[day]) acc[day] = [];
    acc[day].push(event);
    return acc;
  }, {} as Record<string, CampEvent[]>);
  
  const sections = Object.keys(groupedEvents).map(date => ({
      title: date,
      data: groupedEvents[date]
  }));

  const renderItem = ({ item }: { item: CampEvent }) => (
    <TouchableOpacity style={styles.card} onLongPress={() => openModal(item)}>
        <View style={styles.row}>
            <View style={{flex: 1}}>
                <View style={styles.timeRow}>
                    <Clock size={14} color={colors.textLight} />
                    <Text style={styles.timeText}>{item.startTime} - {item.endTime}</Text>
                </View>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <View style={styles.locRow}>
                    <MapPin size={14} color={colors.secondary} />
                    <Text style={styles.locText}>{item.locationName}</Text>
                </View>
                {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
            </View>
            {item.wazeLink ? (
                <TouchableOpacity onPress={() => Linking.openURL(item.wazeLink!)} style={styles.wazeBtn}>
                    <Text style={styles.wazeText}>Waze</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Button onClick={() => openModal()} style={styles.addBtn}>+ אירוע חדש</Button>
      
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadEvents} />}
        renderItem={({ item }) => (
            <View>
                <View style={styles.header}>
                    <Text style={styles.headerText}>{item.title}</Text>
                </View>
                {item.data.map(ev => (
                    <View key={ev.id}>{renderItem({item: ev})}</View>
                ))}
            </View>
        )}
        contentContainerStyle={{paddingBottom: 20}}
      />

      <AppModal visible={modalVisible} onClose={() => setModalVisible(false)} title={currentEvent.id ? 'עריכה' : 'חדש'}>
         <Input label="כותרת" value={currentEvent.title} onChangeText={(t: string) => setCurrentEvent({...currentEvent, title: t})} />
         <Input label="תאריך (YYYY-MM-DD)" value={currentEvent.date} onChangeText={(t: string) => setCurrentEvent({...currentEvent, date: t})} />
         <View style={{flexDirection: 'row', gap: 10}}>
             <View style={{flex: 1}}><Input label="התחלה" value={currentEvent.startTime} onChangeText={(t: string) => setCurrentEvent({...currentEvent, startTime: t})} /></View>
             <View style={{flex: 1}}><Input label="סיום" value={currentEvent.endTime} onChangeText={(t: string) => setCurrentEvent({...currentEvent, endTime: t})} /></View>
         </View>
         <Input label="מיקום" value={currentEvent.locationName} onChangeText={(t: string) => setCurrentEvent({...currentEvent, locationName: t})} />
         <Input label="Waze Link" value={currentEvent.wazeLink} onChangeText={(t: string) => setCurrentEvent({...currentEvent, wazeLink: t})} />
         <Input label="תיאור" value={currentEvent.description} onChangeText={(t: string) => setCurrentEvent({...currentEvent, description: t})} multiline />
         
         <Button onClick={handleSave} style={{marginTop: 10}}>שמירה</Button>
         {currentEvent.id && <Button onClick={() => { handleDelete(currentEvent.id!); setModalVisible(false); }} variant="danger" style={{marginTop: 10}}>מחיקה</Button>}
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 10 },
  addBtn: { marginBottom: 10 },
  header: { backgroundColor: colors.inputBg, padding: 8, borderRadius: 8, marginBottom: 8, marginTop: 8 },
  headerText: { color: colors.primary, fontWeight: 'bold', textAlign: 'center' },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 8, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  timeText: { fontSize: 12, color: colors.textLight },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4, textAlign: 'left' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locText: { fontSize: 13, color: colors.text },
  desc: { fontSize: 12, color: colors.textLight, marginTop: 4, textAlign: 'left' },
  wazeBtn: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  wazeText: { color: '#0ea5e9', fontWeight: 'bold', fontSize: 12 }
});