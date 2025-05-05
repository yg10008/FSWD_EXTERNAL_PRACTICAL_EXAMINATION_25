const apiBaseUrl = 'http://localhost:108';

let currentUser = null; // to track login state
let events = [];
let filteredEvents = [];

// Utility to create elements with attributes and children
function createElement(tag, attrs = {}, ...children) {
  const elem = document.createElement(tag);
  for (const attr in attrs) {
    if (attr === 'className') {
      elem.className = attrs[attr];
    } else if (attr === 'htmlFor') {
      elem.htmlFor = attrs[attr];
    } else {
      elem.setAttribute(attr, attrs[attr]);
    }
  }
  children.forEach(child => {
    if (typeof child === 'string') {
      elem.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      elem.appendChild(child);
    }
  });
  return elem;
}

// Show login/register form
function renderAuth() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const container = createElement('div', {className: 'auth-container'});

  const title = createElement('h2', {}, 'Login or Register');

  // Login form
  const loginForm = createElement('form', {id: 'loginForm'});
  loginForm.appendChild(createElement('h3', {}, 'Login'));
  loginForm.appendChild(createElement('label', {htmlFor: 'loginEmail'}, 'Email:'));
  loginForm.appendChild(createElement('input', {type: 'email', id: 'loginEmail', name: 'email', required: true}));
  loginForm.appendChild(createElement('label', {htmlFor: 'loginPassword'}, 'Password:'));
  loginForm.appendChild(createElement('input', {type: 'password', id: 'loginPassword', name: 'password', required: true}));
  loginForm.appendChild(createElement('button', {type: 'submit'}, 'Login'));

  // Register form
  const registerForm = createElement('form', {id: 'registerForm'});
  registerForm.appendChild(createElement('h3', {}, 'Register'));
  registerForm.appendChild(createElement('label', {htmlFor: 'registerName'}, 'Name:'));
  registerForm.appendChild(createElement('input', {type: 'text', id: 'registerName', name: 'name', required: true}));
  registerForm.appendChild(createElement('label', {htmlFor: 'registerEmail'}, 'Email:'));
  registerForm.appendChild(createElement('input', {type: 'email', id: 'registerEmail', name: 'email', required: true}));
  registerForm.appendChild(createElement('label', {htmlFor: 'registerPassword'}, 'Password:'));
  registerForm.appendChild(createElement('input', {type: 'password', id: 'registerPassword', name: 'password', required: true}));
  registerForm.appendChild(createElement('button', {type: 'submit'}, 'Register'));

  container.appendChild(title);
  container.appendChild(loginForm);
  container.appendChild(registerForm);
  app.appendChild(container);

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();
    try {
      const res = await fetch(apiBaseUrl + '/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({email, password}),
      });
      if (!res.ok) throw new Error(await res.text());
      currentUser = email;
      alert('Login successful');
      renderApp();
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = registerForm.name.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value.trim();
    try {
      const res = await fetch(apiBaseUrl + '/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email, password}),
      });
      if (!res.ok) throw new Error(await res.text());
      alert('Registration successful. Please login.');
      registerForm.reset();
    } catch (err) {
      alert('Registration failed: ' + err.message);
    }
  });
}

// Render main app after login
function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const header = createElement('div', {className: 'header'});
  const welcome = createElement('span', {}, `Welcome, ${currentUser}`);
  const logoutBtn = createElement('button', {}, 'Logout');
  logoutBtn.addEventListener('click', async () => {
    try {
      const res = await fetch(apiBaseUrl + '/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(await res.text());
      currentUser = null;
      alert('Logged out');
      renderAuth();
    } catch (err) {
      alert('Logout failed: ' + err.message);
    }
  });
  header.appendChild(welcome);
  header.appendChild(logoutBtn);

  // Search box
  const searchInput = createElement('input', {type: 'text', placeholder: 'Search events...', id: 'searchInput'});
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    filteredEvents = events.filter(ev => ev.title.toLowerCase().includes(query) || ev.description.toLowerCase().includes(query));
    renderEventList();
  });

  // Event list container
  const eventListContainer = createElement('div', {id: 'eventListContainer'});

  // Create event form
  const createEventForm = createElement('form', {id: 'createEventForm'});
  createEventForm.appendChild(createElement('h3', {}, 'Create Event'));
  createEventForm.appendChild(createElement('label', {htmlFor: 'title'}, 'Title:'));
  createEventForm.appendChild(createElement('input', {type: 'text', id: 'title', name: 'title', required: true}));
  createEventForm.appendChild(createElement('label', {htmlFor: 'description'}, 'Description:'));
  createEventForm.appendChild(createElement('textarea', {id: 'description', name: 'description', required: true}));
  createEventForm.appendChild(createElement('label', {htmlFor: 'date'}, 'Date:'));
  createEventForm.appendChild(createElement('input', {type: 'date', id: 'date', name: 'date', required: true}));
  createEventForm.appendChild(createEventForm.appendChild(createElement('label', {htmlFor: 'location'}, 'Location:')));
  createEventForm.appendChild(createElement('input', {type: 'text', id: 'location', name: 'location', required: true}));
  createEventForm.appendChild(createElement('button', {type: 'submit'}, 'Add Event'));

  createEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(createEventForm);
    const newEvent = {
      title: formData.get('title'),
      description: formData.get('description'),
      date: formData.get('date'),
      location: formData.get('location'),
    };
    try {
      const res = await fetch(apiBaseUrl + '/addEvent', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify(newEvent),
      });
      if (!res.ok) throw new Error(await res.text());
      const createdEvent = await res.json();
      events.push(createdEvent);
      filteredEvents = events;
      renderEventList();
      createEventForm.reset();
      alert('Event added successfully');
    } catch (err) {
      alert('Failed to add event: ' + err.message);
    }
  });

  app.appendChild(header);
  app.appendChild(searchInput);
  app.appendChild(eventListContainer);
  app.appendChild(createEventForm);

  fetchEvents();
}

// Render event list
function renderEventList() {
  const container = document.getElementById('eventListContainer');
  container.innerHTML = '';

  if (filteredEvents.length === 0) {
    container.appendChild(createElement('p', {}, 'No events found.'));
    return;
  }

  filteredEvents.forEach(event => {
    const eventDiv = createElement('div', {className: 'event-item'});
    const title = createElement('h4', {}, event.title);
    const date = createElement('p', {}, 'Date: ' + new Date(event.date).toLocaleDateString());
    const location = createElement('p', {}, 'Location: ' + event.location);

    // Show details button
    const detailsBtn = createElement('button', {}, 'Details');
    detailsBtn.addEventListener('click', () => showEventDetails(event));

    // Edit button (only if current user is creator)
    const editBtn = createElement('button', {}, 'Edit');
    if (event.createdBy && event.createdBy.email === currentUser) {
      editBtn.style.display = 'inline-block';
      editBtn.addEventListener('click', () => showEditEventForm(event));
    } else {
      editBtn.style.display = 'none';
    }

    // Delete button (only if current user is creator)
    const deleteBtn = createElement('button', {}, 'Delete');
    if (event.createdBy && event.createdBy.email === currentUser) {
      deleteBtn.style.display = 'inline-block';
      deleteBtn.addEventListener('click', () => deleteEvent(event._id));
    } else {
      deleteBtn.style.display = 'none';
    }

    eventDiv.appendChild(title);
    eventDiv.appendChild(date);
    eventDiv.appendChild(location);
    eventDiv.appendChild(detailsBtn);
    eventDiv.appendChild(editBtn);
    eventDiv.appendChild(deleteBtn);

    container.appendChild(eventDiv);
  });
}

// Show event details popup
function showEventDetails(event) {
  const popup = createElement('div', {className: 'popup'});
  const content = createElement('div', {className: 'popup-content'});

  const title = createElement('h3', {}, event.title);
  const description = createElement('p', {}, event.description);
  const date = createElement('p', {}, 'Date: ' + new Date(event.date).toLocaleDateString());
  const location = createElement('p', {}, 'Location: ' + event.location);
  const createdBy = createElement('p', {}, 'Created by: ' + (event.createdBy ? event.createdBy.name : 'Unknown'));

  const closeBtn = createElement('button', {}, 'Close');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(popup);
  });

  content.appendChild(title);
  content.appendChild(description);
  content.appendChild(date);
  content.appendChild(location);
  content.appendChild(createdBy);
  content.appendChild(closeBtn);

  popup.appendChild(content);
  document.body.appendChild(popup);
}

// Show edit event form popup
function showEditEventForm(event) {
  const popup = createElement('div', {className: 'popup'});
  const content = createElement('div', {className: 'popup-content'});

  const form = createElement('form', {id: 'editEventForm'});

  form.appendChild(createElement('h3', {}, 'Edit Event'));

  form.appendChild(createElement('label', {htmlFor: 'editTitle'}, 'Title:'));
  const titleInput = createElement('input', {type: 'text', id: 'editTitle', name: 'title', required: true, value: event.title});
  form.appendChild(titleInput);

  form.appendChild(createElement('label', {htmlFor: 'editDescription'}, 'Description:'));
  const descInput = createElement('textarea', {id: 'editDescription', name: 'description', required: true});
  descInput.value = event.description;
  form.appendChild(descInput);

  form.appendChild(createElement('label', {htmlFor: 'editDate'}, 'Date:'));
  const dateInput = createElement('input', {type: 'date', id: 'editDate', name: 'date', required: true});
  dateInput.value = new Date(event.date).toISOString().split('T')[0];
  form.appendChild(dateInput);

  form.appendChild(createElement('label', {htmlFor: 'editLocation'}, 'Location:'));
  const locationInput = createElement('input', {type: 'text', id: 'editLocation', name: 'location', required: true, value: event.location});
  form.appendChild(locationInput);

  const saveBtn = createElement('button', {type: 'submit'}, 'Save');
  const cancelBtn = createElement('button', {type: 'button'}, 'Cancel');

  form.appendChild(saveBtn);
  form.appendChild(cancelBtn);

  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(popup);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedEvent = {
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      date: dateInput.value,
      location: locationInput.value.trim(),
    };
    try {
      const res = await fetch(apiBaseUrl + '/' + event._id, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify(updatedEvent),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      // Update local events array
      const idx = events.findIndex(ev => ev._id === updated._id);
      if (idx !== -1) {
        events[idx] = updated;
        filteredEvents = events;
        renderEventList();
      }
      alert('Event updated successfully');
      document.body.removeChild(popup);
    } catch (err) {
      alert('Failed to update event: ' + err.message);
    }
  });

  content.appendChild(form);
  popup.appendChild(content);
  document.body.appendChild(popup);
}

// Delete event
async function deleteEvent(eventId) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  try {
    const res = await fetch(apiBaseUrl + '/' + eventId, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    events = events.filter(ev => ev._id !== eventId);
    filteredEvents = events;
    renderEventList();
    alert('Event deleted successfully');
  } catch (err) {
    alert('Failed to delete event: ' + err.message);
  }
}

// Fetch events from backend
async function fetchEvents() {
  try {
    const res = await fetch(apiBaseUrl + '/watchevent', {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    events = await res.json();
    filteredEvents = events;
    renderEventList();
  } catch (err) {
    alert('Failed to fetch events: ' + err.message);
  }
}

// On page load, check if user is logged in by trying to fetch events
async function checkLogin() {
  try {
    const res = await fetch(apiBaseUrl + '/watchevent', {
      credentials: 'include',
    });
    if (res.ok) {
      const userEvents = await res.json();
      events = userEvents;
      filteredEvents = events;
      // Extract user email from first event's createdBy if available
      if (events.length > 0 && events[0].createdBy && events[0].createdBy.email) {
        currentUser = events[0].createdBy.email;
      } else {
        currentUser = 'User';
      }
      renderApp();
    } else {
      renderAuth();
    }
  } catch (err) {
    renderAuth();
  }
}

checkLogin();
