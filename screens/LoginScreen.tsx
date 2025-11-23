import React, { useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../App';
import { api } from '../services/api';
import { Button, Input, colors } from '../components/ui';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);

  const handleLogin = async () => {
    setLoading(true);
    try {
        const user = await api.login(email, password);
        if (user) {
            setUser(user);
        } else {
            Alert.alert('שגיאה', 'שם משתמש או סיסמה שגויים');
        }
    } catch (e) {
        Alert.alert('שגיאה', 'אירעה שגיאה בהתחברות');
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image 
          source={{ uri: "https://shtilim.org/wp-content/uploads/2023/01/%D7%9C%D7%95%D7%92%D7%95-%D7%9C%D7%9C%D7%90-%D7%A8%D7%A7%D7%A2-%D7%A9%D7%91%D7%99%D7%9C%D7%99-%D7%94%D7%AA%D7%95%D7%A8%D7%94-1536x606.png" }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>מחנה חורף תשפ"ו</Text>
        
        <View style={styles.card}>
            <Input 
                label="אימייל / טלפון" 
                value={email} 
                onChangeText={setEmail}
                placeholder="הכנס אימייל או טלפון"
                keyboardType="email-address"
            />
            <Input 
                label="סיסמה" 
                value={password} 
                onChangeText={setPassword}
                secureTextEntry
                placeholder="********"
            />
            <Button onClick={handleLogin} loading={loading} style={{marginTop: 10}}>
                התחברות
            </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary, // Using primary blue
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40
  },
  logo: {
    width: '100%',
    height: 100,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  }
});