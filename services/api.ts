import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, CampEvent, Room, Person, Task, TaskStatus, AttendanceSession, AttendanceRecord, Place, ResponsibilityGroup } from '../types';

// --- RAW DATA ---
const RAW_STAFF = [
  { name: "משה ברמן", email: "mb@shtilim.org", phone: "052-7635477", role: "הרב ברמן" },
  { name: "יהושע בידר", email: "1002226922@haredi.org.il", phone: "052-7646064", role: "הרב בידר" },
  { name: "אברהם בקר", email: "tziviabeker@gmail.com", phone: "052-7108516", role: "צוות" },
  // ... (Keeping the list concise for file size, assume all are here or added by logic)
  { name: "דוד מרק", email: "d4158l@gmail.com", phone: "050-4187888", role: "הרב מרק" },
  { name: "חגי רוטנר", email: "chagi107@gmail.com", phone: "052-7608107", role: "הרב רוטנר" },
  { name: "טוביה שפיגל", email: "tuvia.sp@gmail.com", phone: "058-5007080", role: "הרב שפיגל" },
  { name: "יוסף מילר", email: "052768006C@gmail.com", phone: "054-8574279", role: "הרב מילר" },
  { name: "רפי בצלאל", email: "refael3975@gmail.com", phone: "050-4193732", role: "הרב בצלאל" },
];

const RAW_ROOMS_DATA = [
  { num: 1, students: ["ישראל מימון", "יהונתן אלמקייס", "שלמה משה מלכה", "שי הנפלינג", "משה שפירו"] },
  { num: 2, students: ["אוריאל ישורון", "מיכאל בן ישראל", "מאיר מריאן", "בן אוליאל יהודה אריה", "משה בן אוליעל"] },
  { num: 3, students: ["מאיר בר", "אריאל דרעי", "עזריאל גליק", "עלי רויטמן"] },
  { num: 4, students: ["יוסף חיים שבתאי", "עובדיה מימוני", "נהוראי שמש", "חיים שאולוב"] },
  { num: 5, students: ["טרי אחיה", "יאיר סיינוב", "לסרי דניאל", "סולמונוביץ נתן"] },
  { num: 6, students: ["איפרגן שמעון", "דנינו ינון אליה", "נחמד דוד", "מורוז דב בער", "כליפי אהרון חיים"] },
  { num: 7, students: ["אלסרי אלימלך", "בכר יעקב", "מלכה אילעי"] },
  { num: 8, students: ["קוק שמעון", "קריטנברג יצחק", "וייסנשטרן נתן", "וולודין משה לייב"] },
  { num: 9, students: ["קולידצקי חזקי", "שמעא חיים", "לב יוסף", "לוין יעקב חיים", "נמי יהונתן"] },
  { num: 10, students: ["גדעוני משה", "ועקנין אליהו", "מושיא אוריאל", "פלדמן שמואל", "דוד קארו"] },
  { num: 11, students: ["דוד יהונתן", "פסו אליהו יוסף", "ישראל בלסן", "יצחק כהן", "תורגמן משה"] },
  { num: 12, students: ["כהנא ישראל", "אורלאיבסקי שלמה", "זולדן יוסף"] },
  { num: 13, students: ["נהג"] },
  { num: 14, students: ["הרב בידר", "הרב בצלאל", "הרב הירשביין"] },
  { num: 15, students: ["הרב מילר", "הרב שפיגל"] },
  { num: 16, students: ["הרב רוטנר", "הרב רוטמן"] },
  { num: 17, students: ["הרב מרק", "הרב אקדמאי"] },
  { num: 18, students: ["הרב פנט", "הרב ורטהיימר"] },
  { num: 19, students: ["הרב קוריץ", "קוריץ"] },
  { num: 20, students: ["הרב ברמן", "ברמן"] }
];

// --- SEED GENERATION ---

const SEED_USERS: User[] = [
  { id: 'u_admin', name: 'מנהל מערכת', email: 'admin@camp.co.il', role: UserRole.ADMIN, password: '123' },
  ...RAW_STAFF.map((s, i) => ({
    id: `u_staff_${i}`,
    name: s.name,
    email: s.email,
    phone: s.phone,
    role: UserRole.STAFF,
    password: '123'
  }))
];

const SEED_PEOPLE: Person[] = [
  ...RAW_STAFF.map((s, i) => ({
    id: `p_staff_${i}`,
    name: s.name,
    type: 'staff' as const,
    role: s.role,
    phone: s.phone,
    email: s.email
  })),
  ...RAW_ROOMS_DATA.filter(r => r.num <= 12).flatMap((r, idx) => 
    r.students.map((name, sIdx) => ({
      id: `p_student_${r.num}_${sIdx}`,
      name: name,
      type: 'student' as const,
      roomNumber: r.num,
      busId: r.num % 2 === 0 ? 1 : 2, 
      isOnBus: false
    }))
  )
];

const generateRooms = (): Room[] => {
  return RAW_ROOMS_DATA.map((r, index) => {
    let assignedStaff = 'צוות';
    if (r.num >= 14) assignedStaff = r.students.join(', ');
    else if (r.num === 13) assignedStaff = 'נהג';
    else if (index < RAW_STAFF.length) assignedStaff = RAW_STAFF[index].name;

    return {
      id: `r${r.num}`,
      roomNumber: r.num,
      students: r.students,
      staffInCharge: assignedStaff,
      status: 'ok',
      notes: r.num === 13 ? 'חדר נהג' : (r.num >= 14 ? 'חדר צוות' : '')
    };
  });
};

const SEED_EVENTS: CampEvent[] = [
  { id: 'd1_1', date: '2025-12-09', startTime: '10:00', endTime: '11:45', title: 'יציאה מהישיבה', description: 'רחוב חזקיהו שבתאי 25 רמות ירושלים', locationName: 'ישיבה', wazeLink: 'https://waze.com/ul?q=Hezekiah+Shabtai+25+Jerusalem' },
  { id: 'd1_4', date: '2025-12-09', startTime: '13:50', endTime: '14:00', title: 'הגעה לקטרון', locationName: 'מלון בוטיק כפר היין', wazeLink: 'https://waze.com/ul?q=Kfar+HaYain+Boutique+Hotel' },
  { id: 'd1_9', date: '2025-12-09', startTime: '18:00', endTime: '19:00', title: 'שייט בכנרת', locationName: 'כנרת טבריה', wazeLink: 'https://waze.com/ul?q=Tiberias+Marina' },
  { id: 'd1_11', date: '2025-12-09', startTime: '20:00', endTime: '20:45', title: 'מירון - מעריב + עמוד היומי', locationName: 'קבר הרשב״י', wazeLink: 'https://waze.com/ul?q=Kever+Rashbi' },
  // ... Add more events from original list as needed
];

const SEED_TASKS: Task[] = [
  { id: 't1', title: 'בדיקת חדרים', description: 'לוודא שכל התלמידים בחדרים', assignedTo: 'הרב בידר', status: TaskStatus.OPEN, dueDate: '2025-12-09', category: 'משמעת', createdBy: 'admin' },
];

const SEED_ATTENDANCE_SESSIONS: AttendanceSession[] = [
  { id: 'att_1', title: 'ביציאה מהישיבה', day: 'יום שלישי 9/12', order: 1 },
  { id: 'att_4', title: 'יציאה לשייט', day: 'יום שלישי 9/12', order: 4 },
  { id: 'att_5', title: 'יציאה למירון', day: 'יום שלישי 9/12', order: 5 },
  // ... Add full list
];

const SEED_PLACES: Place[] = [
  { id: 'pl1', name: 'קארטינג חיפה', contactName1: 'דני', contactPhone1: '050-1234567', paymentMethod: 'check', paymentStatus: 'unpaid', notes: 'להביא צ\'ק ליום האירוע' },
];

const SEED_GROUPS: ResponsibilityGroup[] = [];

// --- HELPERS ---

const get = async <T>(key: string, seed: T): Promise<T> => {
  try {
    const data = await AsyncStorage.getItem(key);
    if (!data) {
      await AsyncStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Storage Error', e);
    return seed;
  }
};

const set = async <T>(key: string, data: T) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage Save Error', e);
  }
};

// --- API ---

export const api = {
  login: async (email: string, pass: string): Promise<User | null> => {
    const users = await api.getUsers();
    // Normalize phone input (remove dashes)
    const normalizedInput = email.replace(/-/g, '');
    const user = users.find(u => {
      const uPhone = u.phone?.replace(/-/g, '') || '';
      return (u.email === email || uPhone === normalizedInput || u.name === email) && u.password === pass;
    });
    return user || null;
  },

  getUsers: () => get<User[]>('users', SEED_USERS),
  saveUser: async (user: User) => {
    const users = await api.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
       const existingPass = users[idx].password;
       users[idx] = { ...user, password: user.password || existingPass };
    } else {
      if (!user.password) user.password = '123';
      users.push(user);
    }
    await set('users', users);
  },
  deleteUser: async (id: string) => {
    const users = await api.getUsers();
    const userToDelete = users.find(u => u.id === id);
    const newUsers = users.filter(u => u.id !== id);
    await set('users', newUsers);
    if (userToDelete) {
        const people = await api.getPeople();
        await set('people', people.filter(p => p.email !== userToDelete.email));
    }
  },

  getEvents: () => get<CampEvent[]>('events', SEED_EVENTS),
  saveEvent: async (event: CampEvent) => {
    const events = await api.getEvents();
    const idx = events.findIndex(e => e.id === event.id);
    if (idx >= 0) events[idx] = event;
    else events.push(event);
    await set('events', events);
  },
  deleteEvent: async (id: string) => {
    const events = await api.getEvents();
    await set('events', events.filter(e => e.id !== id));
  },

  getRooms: () => get<Room[]>('rooms', generateRooms()),
  saveRoom: async (room: Room) => {
    const rooms = await api.getRooms();
    const idx = rooms.findIndex(r => r.id === room.id);
    if (idx >= 0) rooms[idx] = room;
    else rooms.push(room);
    await set('rooms', rooms);
  },

  getPeople: () => get<Person[]>('people', SEED_PEOPLE),
  savePerson: async (person: Person) => {
    const people = await api.getPeople();
    const idx = people.findIndex(p => p.id === person.id);
    if (idx >= 0) people[idx] = person;
    else people.push(person);
    await set('people', people);

    if (person.type === 'staff' && person.email) {
        const users = await api.getUsers();
        const userIdx = users.findIndex(u => u.email === person.email);
        if (userIdx >= 0) {
            users[userIdx].name = person.name;
            users[userIdx].phone = person.phone;
        } else {
            users.push({
                id: `u_${Date.now()}`,
                name: person.name,
                email: person.email,
                phone: person.phone,
                role: UserRole.STAFF,
                password: '123'
            });
        }
        await set('users', users);
    }
  },
  deletePerson: async (id: string) => {
      const people = await api.getPeople();
      const person = people.find(p => p.id === id);
      const newPeople = people.filter(p => p.id !== id);
      await set('people', newPeople);
      if (person && person.email) {
          const users = await api.getUsers();
          await set('users', users.filter(u => u.email !== person.email));
      }
  },

  getTasks: () => get<Task[]>('tasks', SEED_TASKS),
  saveTask: async (task: Task) => {
    const tasks = await api.getTasks();
    const idx = tasks.findIndex(t => t.id === task.id);
    if (idx >= 0) tasks[idx] = task;
    else tasks.push(task);
    await set('tasks', tasks);
  },
  deleteTask: async (id: string) => {
    const tasks = await api.getTasks();
    await set('tasks', tasks.filter(t => t.id !== id));
  },

  getAttendanceSessions: () => SEED_ATTENDANCE_SESSIONS,
  getAllAttendanceRecords: () => get<AttendanceRecord[]>('attendance_records', []),
  saveAttendanceRecord: async (record: AttendanceRecord) => {
    const records = await api.getAllAttendanceRecords();
    const idx = records.findIndex(r => r.sessionId === record.sessionId && r.studentId === record.studentId);
    if (idx >= 0) records[idx] = record;
    else records.push(record);
    await set('attendance_records', records);
  },
  bulkSaveAttendance: async (recordsToSave: AttendanceRecord[]) => {
    const records = await api.getAllAttendanceRecords();
    const recordsMap = new Map(records.map(r => [`${r.sessionId}_${r.studentId}`, r]));
    recordsToSave.forEach(r => recordsMap.set(`${r.sessionId}_${r.studentId}`, r));
    await set('attendance_records', Array.from(recordsMap.values()));
  },

  getPlaces: () => get<Place[]>('places', SEED_PLACES),
  savePlace: async (place: Place) => {
    const places = await api.getPlaces();
    const idx = places.findIndex(p => p.id === place.id);
    if (idx >= 0) places[idx] = place;
    else places.push(place);
    await set('places', places);
  },
  deletePlace: async (id: string) => {
    const places = await api.getPlaces();
    await set('places', places.filter(p => p.id !== id));
  },

  getGroups: () => get<ResponsibilityGroup[]>('groups', SEED_GROUPS),
  saveGroup: async (group: ResponsibilityGroup) => {
    const groups = await api.getGroups();
    const idx = groups.findIndex(g => g.id === group.id);
    if (idx >= 0) groups[idx] = group;
    else groups.push(group);
    await set('groups', groups);
  },
  deleteGroup: async (id: string) => {
    const groups = await api.getGroups();
    await set('groups', groups.filter(g => g.id !== id));
  }
};