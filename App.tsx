import 'react-native-gesture-handler';
import React, { useEffect, useState, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, ActivityIndicator, I18nManager } from 'react-native';
import { User, UserRole } from './types';
import { api } from './services/api';

// Screens
import LoginScreen from './screens/LoginScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import RoomsScreen from './screens/RoomsScreen';
import PeopleScreen from './screens/PeopleScreen';
import TasksScreen from './screens/TasksScreen';
import AdminScreen from './screens/AdminScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import PlacesScreen from './screens/PlacesScreen';
import { colors } from './components/ui';
import { LucideIcon, Calendar, Home, Users, CheckSquare, Settings, MapPin, ClipboardList, LogOut } from 'lucide-react-native';

// Force RTL
try {
  I18nManager.forceRTL(true);
} catch (e) {}

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

export const AuthContext = React.createContext<{
  user: User | null;
  setUser: (u: User | null) => void;
  isLoading: boolean;
}>({ user: null, setUser: () => {}, isLoading: true });

function DrawerContent(props: any) {
    // Custom drawer can be added here if needed
    return <props.descriptors />;
}

function MainApp() {
  const { user, setUser } = React.useContext(AuthContext);

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        drawerActiveBackgroundColor: colors.inputBg,
        drawerActiveTintColor: colors.primary,
        drawerLabelStyle: { textAlign: 'left', marginLeft: 10 },
        headerTitleAlign: 'center',
      }}
    >
      <Drawer.Screen 
        name="Schedule" 
        component={ScheduleScreen} 
        options={{ title: 'לוח זמנים', drawerIcon: ({color}) => <Calendar size={22} color={color} /> }} 
      />
      <Drawer.Screen 
        name="Rooms" 
        component={RoomsScreen} 
        options={{ title: 'חדרים', drawerIcon: ({color}) => <Home size={22} color={color} /> }} 
      />
      <Drawer.Screen 
        name="People" 
        component={PeopleScreen} 
        options={{ title: 'צוות ודיירים', drawerIcon: ({color}) => <Users size={22} color={color} /> }} 
      />
      <Drawer.Screen 
        name="Places" 
        component={PlacesScreen} 
        options={{ title: 'מקומות', drawerIcon: ({color}) => <MapPin size={22} color={color} /> }} 
      />
      <Drawer.Screen 
        name="Tasks" 
        component={TasksScreen} 
        options={{ title: 'משימות', drawerIcon: ({color}) => <CheckSquare size={22} color={color} /> }} 
      />
      <Drawer.Screen 
        name="Attendance" 
        component={AttendanceScreen} 
        options={{ title: 'נוכחות', drawerIcon: ({color}) => <ClipboardList size={22} color={color} /> }} 
      />
      
      {isAdmin && (
        <Drawer.Screen 
          name="Admin" 
          component={AdminScreen} 
          options={{ title: 'ניהול', drawerIcon: ({color}) => <Settings size={22} color={color} /> }} 
        />
      )}

      {/* Logout "Screen" - handled by custom drawer usually, but for simplicity: */}
      <Drawer.Screen 
        name="Logout" 
        component={() => {
            useEffect(() => setUser(null), []);
            return <View />;
        }} 
        options={{ title: 'יציאה', drawerIcon: ({color}) => <LogOut size={22} color={'red'} />, drawerLabelStyle: { color: 'red' } }} 
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading auth state
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500); 
  }, []);

  const authContext = useMemo(() => ({
    user, setUser, isLoading
  }), [user, isLoading]);

  if (isLoading) {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary}}>
            <ActivityIndicator size="large" color="#fff" />
        </View>
    )
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <Stack.Screen name="Main" component={MainApp} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}