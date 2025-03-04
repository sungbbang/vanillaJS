const yearMonth = document.getElementById('year-month');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const datesContainer = document.getElementById('dates-container');

let date = new Date();
const TODAY = date;

function paintCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  yearMonth.innerText = `${year}.${String(month + 1).padStart(2, '0')}`;

  datesContainer.innerHTML = '';
  const dateList = getDates(date);
  const week = dateList.length / 7;
  for (let i = 0; i < week; i++) {
    for (let j = 0; j < 7; j++) {
      const div = document.createElement('div');
      div.className = 'date';
      const dateElement = dateList[i * 7 + j];
      if (dateElement.type !== 'this') div.classList.add('other');
      div.innerText = dateElement.date;
      datesContainer.appendChild(div);
    }
  }
}

function getDates(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const startDayOfThisMonth = new Date(year, month, 1).getDay();
  const endDayOfThisMonth = new Date(year, month + 1, 0).getDay();
  const lastDateOfPrevMonth = new Date(year, month, 0).getDate();
  const lastDateOfThisMonth = new Date(year, month + 1, 0).getDate();

  const datesOfThisMonth = Array.from({ length: lastDateOfThisMonth }, (_, i) => ({
    type: 'this',
    date: i + 1,
  }));
  const datesOfPrevMonth = [];
  const datesOfNextMonth = [];

  for (let i = 0; i < startDayOfThisMonth; i++) {
    datesOfPrevMonth.unshift({ type: 'prev', date: lastDateOfPrevMonth - i });
  }

  for (let i = 1; i <= 6 - endDayOfThisMonth; i++) {
    datesOfNextMonth.push({ type: 'next', date: i });
  }

  return [...datesOfPrevMonth, ...datesOfThisMonth, ...datesOfNextMonth];
}

paintCalendar(date);

yearMonth.addEventListener('click', () => {
  date = TODAY;
  paintCalendar(TODAY);
});

prevButton.addEventListener('click', () => {
  date = new Date(date.getFullYear(), date.getMonth() - 1);
  paintCalendar(date);
});

nextButton.addEventListener('click', () => {
  date = new Date(date.getFullYear(), date.getMonth() + 1);
  paintCalendar(date);
});
