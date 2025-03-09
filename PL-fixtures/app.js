// https://www.api-football.com/documentation-v3
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://v3.football.api-sports.io';

let latestYear = new Date().getFullYear();
let currentSeasonYear = latestYear;

const jsonLocalStorage = {
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: (key) => {
    return JSON.parse(localStorage.getItem(key));
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
  },
};

const getKeyName = (year) => `pl_fixtures_${year}`;

window.addEventListener('load', async () => {
  const fixtures = await setFixtures(latestYear);

  if (!fixtures) {
    return '경기 일정 정보가 없습니다';
  }

  latestYear = new Date(fixtures[0].fixture.date).getFullYear();
  currentSeasonYear = latestYear;

  paintSeasonFixtures(currentSeasonYear);
});

async function setFixtures(season) {
  const fetchedData =
    fetchLocalStorageFixtures(season) || (await fetchSeasonFixtures(season, 0));

  if (!fetchedData || fetchedData.error) {
    return null;
  }

  const result = fetchedData.data.sort(function (a, b) {
    const A = new Date(a.fixture.date);
    const B = new Date(b.fixture.date);
    if (A < B) {
      return -1;
    }
    if (A > B) {
      return 1;
    }
    return 0;
  });

  currentSeasonYear = new Date(result[0].fixture.date).getFullYear();

  if (!jsonLocalStorage.getItem(getKeyName(currentSeasonYear))) {
    jsonLocalStorage.setItem(getKeyName(currentSeasonYear), fetchedData);
  }

  return result;
}

function fetchLocalStorageFixtures(year) {
  const item =
    jsonLocalStorage.getItem(getKeyName(year)) ||
    jsonLocalStorage.getItem(getKeyName(year - 1));

  if (!item) {
    return null;
  }

  const { id } = item;

  if (new Date(id).getDate() !== new Date().getDate()) {
    jsonLocalStorage.removeItem(getKeyName(year));
    return null;
  }

  return item;
}

async function fetchSeasonFixtures(year, depth) {
  if (depth < 2) {
    const option = {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': API_KEY,
      },
    };

    const url = `${BASE_URL}/fixtures?league=39&season=${year}`;

    try {
      const response = await fetch(url, option);
      const json = await response.json();
      const data = json.response;
      if (data.length === 0) {
        year--;
        return fetchSeasonFixtures(year, depth + 1);
      }
      return { id: Date.now(), data };
    } catch (error) {
      console.log(error);
      return { error };
    }
  }
  return null;
}

async function paintSeasonFixtures(season) {
  const data = await setFixtures(season);

  paintSeasonText(season);
  paintMonthTab(data);
  paintMatchList(data);
}

function paintSeasonText(year) {
  const seasonText = document.querySelector('.current-season');
  seasonText.innerText = `${year}-${(year + 1) % 100}`;
}

function paintMonthTab(fixtures) {
  const monthList = [];

  let current = 0;
  fixtures.forEach((v) => {
    const year = new Date(v.fixture.date).getFullYear();
    const month = new Date(v.fixture.date).getMonth() + 1;

    if (current !== month) {
      monthList.push({ year, month });
      current = month;
    }
  });

  const ul = document.querySelector('.tab-list');

  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;

  ul.innerHTML = '';

  let selectedBtn = null;
  monthList.forEach((v, i) => {
    const { year, month } = v;
    const li = document.createElement('li');
    li.className = 'tab-item';
    const button = document.createElement('button');
    button.className = 'month-btn';

    if (year === nowYear && month === nowMonth) {
      button.classList.add('select');
      selectedBtn = button;
    } else if (year < nowYear && i === monthList.length - 1) {
      button.classList.add('select');
      selectedBtn = button;
    }

    button.addEventListener('click', () => {
      if (selectedBtn) {
        selectedBtn.classList.remove('select');
      }
      button.classList.add('select');
      selectedBtn = button;
    });

    button.dataset.date = `${year}-${month}`;

    const outerSpan = document.createElement('span');
    outerSpan.className = 'month';
    const monthNumberSpan = document.createElement('span');
    monthNumberSpan.className = 'month-number';
    monthNumberSpan.innerText = month;
    const monthSpan = document.createElement('span');
    monthSpan.className = 'month-text';
    monthSpan.innerText = '월';
    outerSpan.appendChild(monthNumberSpan);
    outerSpan.appendChild(monthSpan);
    button.appendChild(outerSpan);
    li.appendChild(button);
    ul.appendChild(li);
  });
}

const matchListContainer = document.querySelector('.matchlist-container');

function paintMatchList(fixtures) {
  matchListContainer.innerHTML = '';

  const selectedDate = document.querySelector('.select').dataset.date;
  const [selectedYear, selectedMonth] = selectedDate
    .split('-')
    .map((v) => parseInt(v));

  fixtures.forEach((v) => {
    const date = new Date(v.fixture.date);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    if (y === selectedYear && m === selectedMonth) {
      // console.log(date);
    }
  });
}

const recentBtn = document.querySelector('.recent');
const prevSeasonBtn = document.getElementById('prev-btn');
const nextSeasonBtn = document.getElementById('next-btn');

recentBtn.addEventListener('click', () => {
  paintSeasonFixtures(latestYear);
  updateButtonState(latestYear);
});

prevSeasonBtn.addEventListener('click', () => {
  if (currentSeasonYear > latestYear - 4) {
    currentSeasonYear--;
    updateButtonState(currentSeasonYear);
    paintSeasonFixtures(currentSeasonYear);
  }
});

nextSeasonBtn.addEventListener('click', () => {
  if (currentSeasonYear < latestYear) {
    currentSeasonYear++;
    updateButtonState(currentSeasonYear);
    paintSeasonFixtures(currentSeasonYear);
  }
});

function updateButtonState(year) {
  const DISABLE_CLASSNAME = 'disable';

  if (year === latestYear) {
    recentBtn.disabled = true;
  } else {
    recentBtn.disabled = false;
  }

  if (year === latestYear) {
    nextSeasonBtn.classList.add(DISABLE_CLASSNAME);
    nextSeasonBtn.disabled = true;
  } else {
    nextSeasonBtn.classList.remove(DISABLE_CLASSNAME);
    nextSeasonBtn.disabled = false;
  }

  if (year === latestYear - 4) {
    prevSeasonBtn.classList.add(DISABLE_CLASSNAME);
    prevSeasonBtn.disabled = true;
  } else {
    prevSeasonBtn.classList.remove(DISABLE_CLASSNAME);
    prevSeasonBtn.disabled = false;
  }
}
