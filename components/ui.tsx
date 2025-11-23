import React from 'react';
import { TouchableOpacity, Text, TextInput, View, StyleSheet, Modal as RNModal, ScrollView, ActivityIndicator } from 'react-native';

export const colors = {
  primary: '#1e3a8a', // Blue 900
  secondary: '#ea580c', // Orange 600
  bg: '#f8fafc',
  white: '#ffffff',
  text: '#0f172a',
  textLight: '#64748b',
  border: '#e2e8f0',
  inputBg: '#eff6ff', // Blue 50
  danger: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

export const Button = ({ onClick, children, variant = 'primary', style, loading }: any) => {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';
  
  return (
    <TouchableOpacity 
      onPress={onClick} 
      style={[
        styles.button, 
        isPrimary && styles.btnPrimary,
        isDanger && styles.btnDanger,
        isGhost && styles.btnGhost,
        style
      ]}
      disabled={loading}
    >
      {loading ? <ActivityIndicator color={isPrimary ? 'white' : colors.primary} /> : (
        <Text style={[
          styles.btnText, 
          isPrimary && { color: 'white' },
          isDanger && { color: 'white' },
          isGhost && { color: colors.textLight }
        ]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export const Input = ({ label, value, onChangeText, onChange, secureTextEntry, placeholder, keyboardType, multiline }: any) => (
  <View style={styles.inputContainer}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
      value={value ? String(value) : ''}
      onChangeText={onChangeText || (onChange ? (t) => onChange({target: {value: t}}) : undefined)}
      secureTextEntry={secureTextEntry}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      keyboardType={keyboardType}
      multiline={multiline}
    />
  </View>
);

export const AppModal = ({ visible, onClose, title, children }: any) => {
  return (
    <RNModal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{maxHeight: 500}} contentContainerStyle={{padding: 16}}>
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
};

// Export Modal alias for web pages compatibility
export const Modal = ({ isOpen, ...props }: any) => (
  <AppModal visible={isOpen} {...props} />
);

export const Select = ({ label, value, onChange, options }: any) => (
  <View style={styles.inputContainer}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={styles.input}>
       <Text style={{color: colors.primary}}>
         {options?.find((o: any) => o.value === value)?.label || value}
       </Text>
    </View>
  </View>
);

export const StatusBadge = ({ status }: { status: string }) => {
  let bg = '#f3f4f6';
  let text = '#374151';
  let label = status;

  switch(status) {
    case 'open': label = 'פתוח'; bg = '#eff6ff'; text = '#1d4ed8'; break;
    case 'in_progress': label = 'בטיפול'; bg = '#fef3c7'; text = '#b45309'; break;
    case 'done': label = 'בוצע'; bg = '#ecfdf5'; text = '#047857'; break;
    case 'ok': label = 'תקין'; bg = '#ecfdf5'; text = '#047857'; break;
    case 'issue': label = 'תקלה'; bg = '#fef2f2'; text = '#be123c'; break;
    case 'check': label = 'לבדיקה'; bg = '#fff7ed'; text = '#c2410c'; break;
    case 'paid': label = 'שולם'; bg = '#ecfdf5'; text = '#047857'; break;
    case 'unpaid': label = 'טרם שולם'; bg = '#fff7ed'; text = '#c2410c'; break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnDanger: {
    backgroundColor: colors.danger,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnText: {
    fontWeight: '600',
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'left',
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.primary,
    textAlign: 'right', // RTL
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#f8fafc',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 20,
    color: '#94a3b8',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  }
});