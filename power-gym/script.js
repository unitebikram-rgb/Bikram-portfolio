// Demo data for the gym dashboard. This keeps the UI easy to edit and update later.
const schedule = [
  { time: '07:00', title: 'Strength Circuit', coach: 'Coach Alex', badge: 'High Energy' },
  { time: '09:30', title: 'HIIT Blast', coach: 'Coach Maya', badge: 'Cardio' },
  { time: '12:00', title: 'Core Focus', coach: 'Coach Liam', badge: 'Recovery' },
  { time: '18:30', title: 'Power Lift', coach: 'Coach Nia', badge: 'Strength' }
];

const members = [
  { name: 'Aisha Khan', plan: 'Premium', status: 'active', lastVisit: 'Today' },
  { name: 'Rohan Patel', plan: 'Gold', status: 'active', lastVisit: 'Yesterday' },
  { name: 'Mila Davis', plan: 'Standard', status: 'pending', lastVisit: '2 days ago' },
  { name: 'Ethan Brown', plan: 'Premium', status: 'inactive', lastVisit: '1 week ago' },
  { name: 'Zara Ali', plan: 'Gold', status: 'active', lastVisit: 'Today' }
];

// Render the training schedule list.
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

// Render the members table and allow quick filtering.
const memberTableBody = document.getElementById('memberTableBody');
const memberSearch = document.getElementById('memberSearch');

function renderMembers(filterText = '') {
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

memberSearch.addEventListener('input', (event) => {
  renderMembers(event.target.value);
});

renderMembers();
