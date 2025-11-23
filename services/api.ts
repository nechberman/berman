
import { User, UserRole, CampEvent, Room, Person, Task, TaskStatus, AttendanceSession, AttendanceRecord, Place, ResponsibilityGroup } from '../types';

// --- RAW DATA FROM USER PROMPT ---

const RAW_STAFF = [
  { name: "משה ברמן", email: "mb@shtilim.org", phone: "052-7635477", role: "הרב ברמן" },
  { name: "יהושע בידר", email: "1002226922@haredi.org.il", phone: "052-7646064", role: "הרב בידר" },
  { name: "אברהם בקר", email: "tziviabeker@gmail.com", phone: "052-7108516", role: "צוות" },
  { name: "אושרת אוחנה", email: "ob330391@gmail.com", phone: "054-2821518", role: "צוות" },
  { name: "אסתר כהן", email: "estercohen555@gmail.com", phone: "052-7610620", role: "צוות" },
  { name: "אסתר מוסקוביץ", email: "lwbgiok@gmail.com", phone: "058-3236262", role: "צוות" },
  { name: "דוד מרק", email: "d4158l@gmail.com", phone: "050-4187888", role: "הרב מרק" },
  { name: "זהבה אייזרמן", email: "zshshtilim@gmail.com", phone: "050-4111529", role: "צוות" },
  { name: "חגי רוטנר", email: "chagi107@gmail.com", phone: "052-7608107", role: "הרב רוטנר" },
  { name: "חיה עטר", email: "atarchaya@gmail.com", phone: "055-6651650", role: "צוות" },
  { name: "חיים שנפ", email: "esti.sh82@gmail.com", phone: "052-7657681", role: "צוות" },
  { name: "חננאל אזולאס", email: "3187888@gmail.com", phone: "058-5335116", role: "צוות" },
  { name: "טוביה שפיגל", email: "tuvia.sp@gmail.com", phone: "058-5007080", role: "הרב שפיגל" },
  { name: "יאיר בן מנחם", email: "yair.benmenahem@gmail.com", phone: "052-8612736", role: "צוות" },
  { name: "יהודה אדם", email: "y0585836160@gmail.com", phone: "053-4653855", role: "צוות" },
  { name: "יהושע פנט", email: "shpanet91@gmail.com", phone: "050-4193392", role: "הרב פנט" },
  { name: "יוסף מילר", email: "052768006C@gmail.com", phone: "054-8574279", role: "הרב מילר" },
  { name: "יטא מירל בראה", email: "yitamirelb@gmail.com", phone: "054-6908559", role: "צוות" },
  { name: "יצחק אקדמאי", email: "e0548486654@gmail.com", phone: "054-8486654", role: "הרב אקדמאי" },
  { name: "יצחק הוכמן", email: "hochman.yi@gmail.com", phone: "052-7173788", role: "צוות" },
  { name: "יצחק קורקוס", email: "izakmk@gmail.com", phone: "050-3331055", role: "צוות" },
  { name: "ישראל מאיר אהרוני", email: "a0556703454@gmail.com", phone: "055-6703454", role: "צוות" },
  { name: "מנדי קוריץ", email: "0527169118mk@gmail.com", phone: "052-8036200", role: "הרב קוריץ" },
  { name: "מרדכי ורטהיימר", email: "mottiwer@gmail.com", phone: "053-3116001", role: "הרב ורטהיימר" },
  { name: "נחמיה מאיר כהן", email: "nemcohen@gmail.com", phone: "052-7690269", role: "צוות" },
  { name: "נפתלי רוטמן", email: "naftalirotman1@gmail.com", phone: "052-7162724", role: "הרב רוטמן" },
  { name: "נתנאל כהן", email: "netanelco@gmail.com", phone: "052-3622264", role: "צוות" },
  { name: "פנחס הריס", email: "ph0583216831@gmail.com", phone: "058-3216831", role: "צוות" },
  { name: "רפי בצלאל", email: "refael3975@gmail.com", phone: "050-4193732", role: "הרב בצלאל" },
  { name: "שי גמליאל", email: "Shayszg@gmail.com", phone: "050-4144811", role: "צוות" },
  { name: "שמואל ברזון", email: "shmuelandayala@gmail.com", phone: "052-3993796", role: "צוות" },
  { name: "שמעון טרייסמן", email: "t6779948@gmail.com", phone: "050-4128188", role: "צוות" }
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

// --- SEED GENERATION LOGIC ---

// 1. Users (Login) - Generated from Raw Staff + Admin
const SEED_USERS: User[] = [
  { id: 'u_admin', name: 'מנהל מערכת', email: 'admin@camp.co.il', role: UserRole.ADMIN, password: '123' },
  ...RAW_STAFF.map((s, i) => ({
    id: `u_staff_${i}`,
    name: s.name,
    email: s.email,
    phone: s.phone,
    role: UserRole.STAFF,
    password: '123' // Default password for everyone
  }))
];

// 2. People (Directory) - Students from Rooms + Staff
const SEED_PEOPLE: Person[] = [
  // Staff
  ...RAW_STAFF.map((s, i) => ({
    id: `p_staff_${i}`,
    name: s.name,
    type: 'staff' as const,
    role: s.role,
    phone: s.phone,
    email: s.email
  })),
  // Students (Extracted from Rooms 1-12)
  ...RAW_ROOMS_DATA.filter(r => r.num <= 12).flatMap((r, idx) => 
    r.students.map((name, sIdx) => ({
      id: `p_student_${r.num}_${sIdx}`,
      name: name,
      type: 'student' as const,
      roomNumber: r.num,
      // Assign Bus 1 to even rooms, Bus 2 to odd rooms for demo
      busId: r.num % 2 === 0 ? 1 : 2, 
      isOnBus: false
    }))
  )
];

// 3. Rooms
const generateRooms = (): Room[] => {
  return RAW_ROOMS_DATA.map((r, index) => {
    let assignedStaff = 'צוות';
    
    if (r.num >= 14) {
      assignedStaff = r.students.join(', ');
    } 
    else if (r.num === 13) {
      assignedStaff = 'נהג';
    }
    else {
      assignedStaff = RAW_STAFF[index % RAW_STAFF.length].name;
    }

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

// 4. Events (Schedule)
const SEED_EVENTS: CampEvent[] = [
  // Day 1: Tuesday 9/12/25
  { id: 'd1_1', date: '2025-12-09', startTime: '10:00', endTime: '11:45', title: 'יציאה מהישיבה', description: 'רחוב חזקיהו שבתאי 25 רמות ירושלים', locationName: 'ישיבה', wazeLink: 'https://waze.com/ul?q=Hezekiah+Shabtai+25+Jerusalem' },
  { id: 'd1_2', date: '2025-12-09', startTime: '11:45', endTime: '13:00', title: 'נחל השופט - ארוחת בוקר', locationName: 'נחל השופט', wazeLink: 'https://waze.com/ul?q=Nahal+HaShofet' },
  { id: 'd1_3', date: '2025-12-09', startTime: '13:00', endTime: '13:50', title: 'יציאה לכיוון קטרון', locationName: 'דרכים' },
  { id: 'd1_4', date: '2025-12-09', startTime: '13:50', endTime: '14:00', title: 'הגעה לקטרון', locationName: 'מלון בוטיק כפר היין', wazeLink: 'https://waze.com/ul?q=Kfar+HaYain+Boutique+Hotel' },
  { id: 'd1_5', date: '2025-12-09', startTime: '14:00', endTime: '14:30', title: 'תפילת מנחה', locationName: 'בית כנסת' },
  { id: 'd1_6', date: '2025-12-09', startTime: '14:30', endTime: '15:30', title: 'ארוחת צהרים', locationName: 'חדר אוכל' },
  { id: 'd1_7', date: '2025-12-09', startTime: '15:30', endTime: '17:00', title: 'קבלת חדרים', locationName: 'מגורים' },
  { id: 'd1_8', date: '2025-12-09', startTime: '17:00', endTime: '18:00', title: 'יציאה לשייט', locationName: 'הסעות' },
  { id: 'd1_9', date: '2025-12-09', startTime: '18:00', endTime: '19:00', title: 'שייט בכנרת', locationName: 'כנרת טבריה', wazeLink: 'https://waze.com/ul?q=Tiberias+Marina' },
  { id: 'd1_10', date: '2025-12-09', startTime: '19:00', endTime: '20:00', title: 'יציאה למירון', locationName: 'הסעות' },
  { id: 'd1_11', date: '2025-12-09', startTime: '20:00', endTime: '20:45', title: 'מירון - מעריב + עמוד היומי', locationName: 'קבר הרשב״י', wazeLink: 'https://waze.com/ul?q=Kever+Rashbi' },
  { id: 'd1_12', date: '2025-12-09', startTime: '20:45', endTime: '21:30', title: 'חזרה לקטרון', locationName: 'הסעות', wazeLink: 'https://waze.com/ul?q=Kfar+HaYain+Boutique+Hotel' },
  { id: 'd1_13', date: '2025-12-09', startTime: '21:30', endTime: '22:00', title: 'ארוחת ערב', locationName: 'חדר אוכל' },
  { id: 'd1_14', date: '2025-12-09', startTime: '22:00', endTime: '23:30', title: 'הטורניר הגדול - חלוקת הגביע', locationName: 'אולם ספורט' },
  { id: 'd1_15', date: '2025-12-09', startTime: '23:30', endTime: '23:59', title: 'כיבוי אורות', locationName: 'חדרים' },

  // Day 2: Wednesday 10/12/25
  { id: 'd2_1', date: '2025-12-10', startTime: '08:30', endTime: '08:45', title: 'קפה ועוגה', locationName: 'לובי' },
  { id: 'd2_2', date: '2025-12-10', startTime: '08:45', endTime: '09:30', title: 'תפילת שחרית', locationName: 'בית כנסת' },
  { id: 'd2_3', date: '2025-12-10', startTime: '09:30', endTime: '11:00', title: 'ארוחת בוקר', locationName: 'חדר אוכל' },
  { id: 'd2_4', date: '2025-12-10', startTime: '11:00', endTime: '11:30', title: 'יציאה', locationName: 'הסעות' },
  { id: 'd2_5', date: '2025-12-10', startTime: '11:30', endTime: '12:30', title: 'נחל ציפורי', locationName: 'נחל ציפורי', wazeLink: 'https://waze.com/ul?q=Nahal+Tzipori' },
  { id: 'd2_6', date: '2025-12-10', startTime: '12:30', endTime: '13:00', title: 'יציאה לקארטינג', locationName: 'דרכים' },
  { id: 'd2_7', date: '2025-12-10', startTime: '13:00', endTime: '15:30', title: 'קארטינג חיפה', locationName: 'חיפה', wazeLink: 'https://waze.com/ul?q=Karting+Haifa' },
  { id: 'd2_8', date: '2025-12-10', startTime: '15:30', endTime: '16:00', title: 'פארק הכט - זיץ / נחל חדרה', locationName: 'פארק הכט', wazeLink: 'https://waze.com/ul?q=Hecht+Park' },
  { id: 'd2_9', date: '2025-12-10', startTime: '16:00', endTime: '18:00', title: 'יציאה (זמן גמיש)', locationName: 'דרכים' },
  { id: 'd2_10', date: '2025-12-10', startTime: '18:00', endTime: '20:30', title: 'ארוחה - מסעדה', locationName: 'מסעדה' },
  { id: 'd2_11', date: '2025-12-10', startTime: '20:30', endTime: '21:30', title: 'הגעה לירושלים', description: 'שעת חזרה משוערת', locationName: 'ירושלים' },
];

const SEED_TASKS: Task[] = [
  { id: 't1', title: 'בדיקת חדרים', description: 'לוודא שכל התלמידים בחדרים', assignedTo: 'הרב בידר', status: TaskStatus.OPEN, dueDate: '2025-12-09', category: 'משמעת', createdBy: 'admin' },
  { id: 't2', title: 'תיקון מזגן חדר 5', description: 'לא מקרר', assignedTo: 'תחזוקה', status: TaskStatus.OPEN, dueDate: '2025-12-09', category: 'תקלות', createdBy: 'admin' }
];

const SEED_ATTENDANCE_SESSIONS: AttendanceSession[] = [
  // Tuesday 9/12
  { id: 'att_1', title: 'ביציאה מהישיבה', day: 'יום שלישי 9/12', order: 1 },
  { id: 'att_2', title: 'ביציאה לכיוון קטרון', day: 'יום שלישי 9/12', order: 2 },
  { id: 'att_3', title: 'תפילת מנחה', day: 'יום שלישי 9/12', order: 3 },
  { id: 'att_4', title: 'יציאה לשייט', day: 'יום שלישי 9/12', order: 4 },
  { id: 'att_5', title: 'יציאה למירון', day: 'יום שלישי 9/12', order: 5 },
  { id: 'att_6', title: 'בחזרה לקטרון', day: 'יום שלישי 9/12', order: 6 },
  // Wednesday 10/12
  { id: 'att_7', title: 'תפילת שחרית', day: 'יום רביעי 10/12', order: 7 },
  { id: 'att_8', title: 'ביציאה לנחל ציפורי', day: 'יום רביעי 10/12', order: 8 },
  { id: 'att_9', title: 'ביציאה לקארטינג', day: 'יום רביעי 10/12', order: 9 },
  { id: 'att_10', title: 'ביציאה לפארק הכט', day: 'יום רביעי 10/12', order: 10 },
  { id: 'att_11', title: 'ביציאה למסעדה', day: 'יום רביעי 10/12', order: 11 },
  { id: 'att_12', title: 'ביציאה לכיוון הישיבה (חזרה לירושלים)', day: 'יום רביעי 10/12', order: 12 },
];

const SEED_PLACES: Place[] = [
  { id: 'pl1', name: 'קארטינג חיפה', contactName1: 'דני', contactPhone1: '050-1234567', paymentMethod: 'check', paymentStatus: 'unpaid', notes: 'להביא צ\'ק ליום האירוע' },
  { id: 'pl2', name: 'סירות כנרת', contactName1: 'יוסי הספן', contactPhone1: '052-9876543', paymentMethod: 'cash', paymentStatus: 'paid', notes: 'שולם מקדמה' },
];

const SEED_GROUPS: ResponsibilityGroup[] = [
  { id: 'g1', name: 'קבוצה 1 - הרא"ה', staffId: 'p_staff_0', studentIds: [] }
];

// --- LOCAL STORAGE HELPERS ---

const get = <T>(key: string, seed: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(data);
};

const set = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- API METHODS ---

export const api = {
  // Auth
  login: async (email: string, pass: string): Promise<User | null> => {
    const users = get<User[]>('users', SEED_USERS);
    const user = users.find(u => (u.email === email || u.phone === email || u.name === email) && u.password === pass);
    return user || null;
  },

  // Users
  getUsers: () => get<User[]>('users', SEED_USERS),
  addUser: (user: User) => {
    const users = get<User[]>('users', SEED_USERS);
    users.push(user);
    set('users', users);
  },
  saveUser: (user: User) => {
    const users = get<User[]>('users', SEED_USERS);
    const idx = users.findIndex(u => u.id === user.id);
    
    if (idx >= 0) {
       // Update existing
       // If password is blank string (from UI), keep old password
       const existingPassword = users[idx].password;
       const finalUser = {
         ...user,
         password: user.password && user.password.length > 0 ? user.password : existingPassword
       };
       users[idx] = finalUser;
    } else {
      // Add new
      // Ensure default pass if none provided
      if (!user.password) user.password = '123'; 
      users.push(user);
    }
    set('users', users);
  },
  deleteUser: (id: string) => {
    const users = get<User[]>('users', SEED_USERS);
    const userToDelete = users.find(u => u.id === id);
    
    set('users', users.filter(u => u.id !== id));
    
    // If deleted user was also a staff member in "People", remove them there too?
    // Only if we want tight coupling. For now, let's just remove the login access.
    if (userToDelete) {
        const people = get<Person[]>('people', SEED_PEOPLE);
        set('people', people.filter(p => p.email !== userToDelete.email));
    }
  },

  // Events
  getEvents: () => get<CampEvent[]>('events', SEED_EVENTS),
  saveEvent: (event: CampEvent) => {
    const events = get<CampEvent[]>('events', SEED_EVENTS);
    const idx = events.findIndex(e => e.id === event.id);
    if (idx >= 0) {
      events[idx] = event;
    } else {
      events.push(event);
    }
    set('events', events);
  },
  deleteEvent: (id: string) => {
    const events = get<CampEvent[]>('events', SEED_EVENTS);
    set('events', events.filter(e => e.id !== id));
  },

  // Rooms
  getRooms: () => get<Room[]>('rooms', generateRooms()),
  saveRoom: (room: Room) => {
    const rooms = get<Room[]>('rooms', generateRooms());
    const idx = rooms.findIndex(r => r.id === room.id);
    if (idx >= 0) {
      rooms[idx] = room;
    } else {
      rooms.push(room);
    }
    set('rooms', rooms);
  },

  // People
  getPeople: () => get<Person[]>('people', SEED_PEOPLE),
  savePerson: (person: Person) => {
    const people = get<Person[]>('people', SEED_PEOPLE);
    const idx = people.findIndex(p => p.id === person.id);
    let savedPerson = person;
    
    if (idx >= 0) {
      people[idx] = person;
    } else {
      people.push(person);
    }
    set('people', people);

    // Sync with Users (If staff)
    if (person.type === 'staff' && person.email) {
        const users = get<User[]>('users', SEED_USERS);
        const userIdx = users.findIndex(u => u.email === person.email);
        
        if (userIdx >= 0) {
            // Update existing user info
            users[userIdx].name = person.name;
            users[userIdx].phone = person.phone;
            // DO NOT overwrite password or role here, handled in Admin
        } else {
            // Create new User for this staff
            users.push({
                id: `u_${Date.now()}`,
                name: person.name,
                email: person.email,
                phone: person.phone,
                role: UserRole.STAFF,
                password: '123'
            });
        }
        set('users', users);
    }
  },
  deletePerson: (id: string) => {
      const people = get<Person[]>('people', SEED_PEOPLE);
      const person = people.find(p => p.id === id);
      set('people', people.filter(p => p.id !== id));

      // If they have a user account, delete it
      if (person && person.email) {
          const users = get<User[]>('users', SEED_USERS);
          set('users', users.filter(u => u.email !== person.email));
      }
  },
  updatePeople: (peopleToUpdate: Person[]) => {
    const people = get<Person[]>('people', SEED_PEOPLE);
    const updateMap = new Map(peopleToUpdate.map(p => [p.id, p]));
    const newPeople = people.map(p => updateMap.has(p.id) ? updateMap.get(p.id)! : p);
    set('people', newPeople);
  },

  // Tasks
  getTasks: () => get<Task[]>('tasks', SEED_TASKS),
  saveTask: (task: Task) => {
    const tasks = get<Task[]>('tasks', SEED_TASKS);
    const idx = tasks.findIndex(t => t.id === task.id);
    if (idx >= 0) {
      tasks[idx] = task;
    } else {
      tasks.push(task);
    }
    set('tasks', tasks);
  },
  deleteTask: (id: string) => {
    const tasks = get<Task[]>('tasks', SEED_TASKS);
    set('tasks', tasks.filter(t => t.id !== id));
  },

  // Attendance
  getAttendanceSessions: () => SEED_ATTENDANCE_SESSIONS,
  
  getAllAttendanceRecords: () => get<AttendanceRecord[]>('attendance_records', []),
  
  saveAttendanceRecord: (record: AttendanceRecord) => {
    const records = get<AttendanceRecord[]>('attendance_records', []);
    const idx = records.findIndex(r => r.sessionId === record.sessionId && r.studentId === record.studentId);
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.push(record);
    }
    set('attendance_records', records);
  },
  
  bulkSaveAttendance: (recordsToSave: AttendanceRecord[]) => {
    const records = get<AttendanceRecord[]>('attendance_records', []);
    // Create a map for current records of this session for O(1) access
    const recordsMap = new Map(records.map(r => [`${r.sessionId}_${r.studentId}`, r]));
    
    recordsToSave.forEach(r => {
      recordsMap.set(`${r.sessionId}_${r.studentId}`, r);
    });
    
    set('attendance_records', Array.from(recordsMap.values()));
  },

  // Places
  getPlaces: () => get<Place[]>('places', SEED_PLACES),
  savePlace: (place: Place) => {
    const places = get<Place[]>('places', SEED_PLACES);
    const idx = places.findIndex(p => p.id === place.id);
    if (idx >= 0) places[idx] = place;
    else places.push(place);
    set('places', places);
  },
  deletePlace: (id: string) => {
    const places = get<Place[]>('places', SEED_PLACES);
    set('places', places.filter(p => p.id !== id));
  },

  // Responsibility Groups
  getGroups: () => get<ResponsibilityGroup[]>('groups', SEED_GROUPS),
  saveGroup: (group: ResponsibilityGroup) => {
    const groups = get<ResponsibilityGroup[]>('groups', SEED_GROUPS);
    const idx = groups.findIndex(g => g.id === group.id);
    if (idx >= 0) groups[idx] = group;
    else groups.push(group);
    set('groups', groups);
  },
  deleteGroup: (id: string) => {
    const groups = get<ResponsibilityGroup[]>('groups', SEED_GROUPS);
    set('groups', groups.filter(g => g.id !== id));
  }
};
