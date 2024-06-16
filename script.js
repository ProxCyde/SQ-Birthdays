document.addEventListener('DOMContentLoaded', () => {
  const calendar = document.getElementById('calendar');
  const dayNamesContainer = document.getElementById('day-names'); // Get the day names container
  const currentMonthElement = document.getElementById('current-month');
  const prevMonthButton = document.getElementById('prev-month');
  const nextMonthButton = document.getElementById('next-month');
  const popup = document.getElementById('popup');
  const popupContent = document.getElementById('popup-content');
  const birthdayIconUrl = 'images/birthday-icon.png'; // Update this path to your icon
  const currentYearElement = document.getElementById('current-year'); // Get the year element

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  let currentDate = new Date(today.getFullYear(), today.getMonth()); // Only month will change

  // Set the current year
  currentYearElement.textContent = today.getFullYear();

  // Fetch birthdays from the JSON file
  fetch('birthdays.json')
    .then(response => response.json())
    .then(data => {
      displayCalendar(data);
    })
    .catch(error => console.error('Error fetching birthdays:', error));

  prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    fetch('birthdays.json')
      .then(response => response.json())
      .then(data => {
        displayCalendar(data);
      })
      .catch(error => console.error('Error fetching birthdays:', error));
  });

  nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    fetch('birthdays.json')
      .then(response => response.json())
      .then(data => {
        displayCalendar(data);
      })
      .catch(error => console.error('Error fetching birthdays:', error));
  });

  function displayCalendar(data) {
    const isCurrentMonth = today.getMonth() === currentDate.getMonth();
    calendar.innerHTML = '';
    dayNamesContainer.innerHTML = ''; // Clear previous day names
    const month = currentDate.getMonth();
    const year = today.getFullYear(); // Keep the year constant
    currentMonthElement.textContent = monthNames[month];
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const prevMonthLastDate = new Date(year, month, 0).getDate();
    let dayCount = 1;
    let prevMonthDayCount = prevMonthLastDate - firstDay + 1;
    let nextMonthDayCount = 1; // Initialize nextMonthDayCount

    // Add day names row
    dayNames.forEach(dayName => {
      const dayNameElement = document.createElement('div');
      dayNameElement.className = 'day-name';
      dayNameElement.textContent = dayName;
      dayNamesContainer.appendChild(dayNameElement);
    });

    for (let i = 0; i < 42; i++) { // 7 days x 6 weeks = 42 cells
      const dayElement = document.createElement('div');
      dayElement.className = 'day';

      const dayHeader = document.createElement('div');
      dayHeader.className = 'day-header';

      if (i < firstDay) {
        // Display the previous month's days
        dayHeader.textContent = prevMonthDayCount;
        dayElement.classList.add('previous-month');
        prevMonthDayCount++;
      } else if (dayCount <= lastDate) {
        // Display the current month days
        dayHeader.textContent = dayCount;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;

        const birthdays = data.filter(event => {
          const eventDate = new Date(event.birthday);
          return eventDate.getMonth() === month && eventDate.getDate() === dayCount;
        });

        if (birthdays.length > 0) {
          const birthdayNames = document.createElement('div');
          birthdayNames.className = 'birthday-names';
          birthdayNames.innerHTML = birthdays.map(event => event.name).join('<br>');
          dayElement.appendChild(birthdayNames);

          const birthdayIcon = document.createElement('img');
          birthdayIcon.src = birthdayIconUrl;
          birthdayIcon.className = 'birthday-icon';
          dayElement.appendChild(birthdayIcon);

          dayElement.addEventListener('click', () => {
            popupContent.innerHTML = birthdays.map(event => `${event.name} joined SideQuest on ${new Date(event.birthday).toLocaleDateString()}`).join('<br>');
            popup.classList.remove('fade-out');
            popup.style.display = 'block';
            setTimeout(() => {
              popup.classList.add('fade-out');
            }, 100); // Start the fade-out effect after a short delay

            setTimeout(() => {
              popup.style.display = 'none';
            }, 3100); // Hide the popup after the fade-out duration
          });
        }

        if (isCurrentMonth && dayCount === today.getDate()) {
          dayElement.classList.add('current-day');
          console.log(`Highlighting current day: ${dayCount}`); // Debugging statement
        }

        dayCount++;
      } else {
        // Display the next month's days if needed
        dayHeader.textContent = nextMonthDayCount;
        dayElement.classList.add('next-month');
        nextMonthDayCount++;
      }

      dayElement.appendChild(dayHeader);
      calendar.appendChild(dayElement);
    }

    document.body.addEventListener('click', (e) => {
      if (popup.style.display === 'block' && !e.target.closest('.day')) {
        popup.classList.add('fade-out');
        setTimeout(() => {
          popup.style.display = 'none';
        }, 3000); // Hide the popup after the fade-out duration
      }
    });
  }
});
