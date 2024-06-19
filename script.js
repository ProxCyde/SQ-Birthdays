document.addEventListener('DOMContentLoaded', () => {
  const calendar = document.getElementById('calendar');
  const dayNamesContainer = document.getElementById('day-names');
  const currentMonthElement = document.getElementById('current-month');
  const prevMonthButton = document.getElementById('prev-month');
  const nextMonthButton = document.getElementById('next-month');
  const popup = document.getElementById('popup');
  const popupContent = document.getElementById('popup-content');
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti-container';
  document.querySelector('.main-wrapper').prepend(confettiContainer); // Use prepend to ensure it's the first child
  const birthdayIconUrl = 'images/birthday-icon.png';
  const currentYearElement = document.getElementById('current-year');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  let currentDate = new Date(today.getFullYear(), today.getMonth());

  currentYearElement.textContent = today.getFullYear();

  fetch('birthdays.json')
    .then(response => response.json())
    .then(data => {
      displayCalendar(data);
      if (isBirthdayToday(data)) {
        triggerConfetti();
      }
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
    dayNamesContainer.innerHTML = '';
    const month = currentDate.getMonth();
    const year = today.getFullYear();
    currentMonthElement.textContent = monthNames[month];
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const prevMonthLastDate = new Date(year, month, 0).getDate();
    let dayCount = 1;
    let prevMonthDayCount = prevMonthLastDate - firstDay + 1;
    let nextMonthDayCount = 1;

    dayNames.forEach(dayName => {
      const dayNameElement = document.createElement('div');
      dayNameElement.className = 'day-name';
      dayNameElement.textContent = dayName;
      dayNamesContainer.appendChild(dayNameElement);
    });

    for (let i = 0; i < 42; i++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'day';

      const dayHeader = document.createElement('div');
      dayHeader.className = 'day-header';

      if (i < firstDay) {
        dayHeader.textContent = prevMonthDayCount;
        dayElement.classList.add('previous-month');
        prevMonthDayCount++;
      } else if (dayCount <= lastDate) {
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
            showPopup(birthdays);
          });
        }

        if (isCurrentMonth && dayCount === today.getDate()) {
          dayElement.classList.add('current-day');
        }

        dayCount++;
      } else {
        dayHeader.textContent = nextMonthDayCount;
        dayElement.classList.add('next-month');
        nextMonthDayCount++;
      }

      dayElement.appendChild(dayHeader);
      calendar.appendChild(dayElement);
    }
  }

  function isBirthdayToday(data) {
    const todayStr = `-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return data.some(event => event.birthday.endsWith(todayStr));
  }

  let popupTimeout;

  function showPopup(birthdays) {
    clearTimeout(popupTimeout);
    popup.classList.remove('fade-out');
    popupContent.innerHTML = birthdays.map(event => `${event.name} joined SideQuest on ${new Date(event.birthday).toLocaleDateString()}`).join('<br>');
    popup.style.display = 'block';
    void popup.offsetWidth; // Trigger reflow to restart animation
    popup.classList.add('fade-out');
    popupTimeout = setTimeout(() => {
      popup.style.display = 'none';
    }, 3100); // Adjust the duration to match your fade-out animation
  }

  function triggerConfetti() {
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = `-${Math.random() * 20}px`; // Ensure it starts just above the container
      confetti.style.backgroundColor = getRandomColor();
      confettiContainer.appendChild(confetti);
      confetti.style.animationDuration = `${Math.random() * 5 + 5}s`; // Random duration between 5-10 seconds
      confetti.style.animationDelay = `${Math.random() * 2}s`; // Random delay between 0-2 seconds
    }
    setTimeout(() => {
      confettiContainer.innerHTML = ''; // Clear the confetti after the animation duration
    }, 12000); // Ensure this is longer than the longest animation duration
  }

  function getRandomColor() {
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Use MutationObserver to monitor DOM changes
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
        mutation.removedNodes.forEach(node => {
          if (node.classList && node.classList.contains('confetti')) {
            // Perform any necessary cleanup here
          }
        });
      }
    });
  });

  // Observe changes in the confettiContainer
  observer.observe(confettiContainer, { childList: true });
});
