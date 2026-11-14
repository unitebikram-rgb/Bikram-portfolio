// Demo data for the gym dashboard. This keeps the UI easy to edit and update later.
const schedule = [
  { time: '07:00', title: 'Strength Circuit', coach: 'Coach Alex', badge: 'High Energy' },
  { time: '09:30', title: 'HIIT Blast', coach: 'Coach Maya', badge: 'Cardio' },
  { time: '12:00', title: 'Core Focus', coach: 'Coach Liam', badge: 'Recovery' },
  { time: '18:30', title: 'Power Lift', coach: 'Coach Nia', badge: 'Strength' }
];

const defaultMembers = [
  { name: 'Aisha Khan', plan: 'Premium', status: 'active', lastVisit: 'Today' },
  { name: 'Rohan Patel', plan: 'Gold', status: 'active', lastVisit: 'Yesterday' },
  { name: 'Mila Davis', plan: 'Standard', status: 'pending', lastVisit: '2 days ago' },
  { name: 'Ethan Brown', plan: 'Premium', status: 'inactive', lastVisit: '1 week ago' },
  { name: 'Zara Ali', plan: 'Gold', status: 'active', lastVisit: 'Today' }
];

const STORAGE_KEY = 'power-gym-members-v1';
const firebaseConfig = window.POWER_GYM_FIREBASE_CONFIG || null;
let db = null;
let isFirebaseEnabled = false;
let members = [];

function readStoredMembers() {
  try {
    const savedMembers = localStorage.getItem(STORAGE_KEY);
    if (!savedMembers) {
      return [...defaultMembers];
    }

    const parsedMembers = JSON.parse(savedMembers);
    return Array.isArray(parsedMembers) && parsedMembers.length ? parsedMembers : [...defaultMembers];
  } catch (error) {
    return [...defaultMembers];
  }
}

function saveMembersToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

function updateDataStateMessage(message) {
  const stateNode = document.getElementById('dataState');
  if (stateNode) {
    stateNode.textContent = message;
  }
}

async function initializeFirebase() {
  if (!firebaseConfig || !window.firebase) {
    members = readStoredMembers();
    updateDataStateMessage('Demo mode: storing data in the browser for now.');
    return false;
  }

  try {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }

    db = firebase.firestore();
    isFirebaseEnabled = true;

    const snapshot = await db.collection('members').orderBy('createdAt', 'desc').get();
    if (!snapshot.empty) {
      members = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        lastVisit: doc.data().lastVisit || 'Just now'
      }));
      saveMembersToLocalStorage();
      updateDataStateMessage('Connected to Firebase Firestore.');
      return true;
    }

    members = readStoredMembers();
    updateDataStateMessage('Firebase is ready, but no members are stored yet.');
    return true;
  } catch (error) {
    console.warn('Firebase unavailable. Falling back to local browser storage.', error);
    members = readStoredMembers();
    updateDataStateMessage('Demo mode: storing data in the browser for now.');
    return false;
  }
}

function renderSchedule() {
  const scheduleList = document.getElementById('scheduleList');

  scheduleList.innerHTML = schedule
    .map(
      (item) => `
        <article class="schedule-item">
          <div class="schedule-time">${item.time}</div>
          <div>
            <h4>${item.title}</h4>
            <p>${item.coach}</p>
          </div>
          <span class="pill">${item.badge}</span>
        </article>
      `
    )
    .join('');
}

function renderMembers(filterText = '') {
  const memberTableBody = document.getElementById('memberTableBody');
  const normalized = filterText.trim().toLowerCase();

  const filteredMembers = members.filter((member) => {
    const name = member.name.toLowerCase();
    return name.includes(normalized);
  });

  memberTableBody.innerHTML = filteredMembers
    .map(
      (member) => `
        <tr>
          <td>
            <div class="member-cell">
              <span class="member-avatar">${member.name.charAt(0)}</span>
              <span>${member.name}</span>
            </div>
          </td>
          <td>${member.plan}</td>
          <td>
            <span class="status-tag ${member.status}">${member.status}</span>
          </td>
          <td>${member.lastVisit}</td>
        </tr>
      `
    )
    .join('');
}

async function persistMember(member) {
  if (isFirebaseEnabled && db) {
    try {
      const docRef = await db.collection('members').add({
        ...member,
        createdAt: Date.now()
      });
      return { ...member, id: docRef.id };
    } catch (error) {
      console.warn('Unable to save to Firestore. Falling back to browser storage.', error);
      isFirebaseEnabled = false;
    }
  }

  members = [member, ...members];
  saveMembersToLocalStorage();
  return member;
}

async function handleMemberSubmit(event) {
  event.preventDefault();

  const memberName = document.getElementById('memberName');
  const memberPlan = document.getElementById('memberPlan');
  const memberStatus = document.getElementById('memberStatus');

  const name = memberName.value.trim();
  const plan = memberPlan.value;
  const status = memberStatus.value;

  if (!name) {
    memberName.focus();
    return;
  }

  const record = {
    name,
    plan,
    status,
    lastVisit: 'Just now'
  };

  if (!isFirebaseEnabled || !db) {
    members = [record, ...members];
    saveMembersToLocalStorage();
  } else {
    const saved = await persistMember(record);
    members = [saved, ...members.filter((item) => item.name !== saved.name || item.lastVisit !== 'Just now')];
  }

  event.target.reset();
  memberPlan.value = 'Premium';
  memberStatus.value = 'active';
  renderMembers(document.getElementById('memberSearch').value);
  memberName.focus();
}

async function initializeApp() {
  members = readStoredMembers();
  renderSchedule();
  renderMembers();

  const memberSearch = document.getElementById('memberSearch');
  memberSearch.addEventListener('input', (event) => {
    renderMembers(event.target.value);
  });

  const memberForm = document.getElementById('memberForm');
  memberForm.addEventListener('submit', handleMemberSubmit);

  await initializeFirebase();
  renderMembers(memberSearch.value);
}

initializeApp();
