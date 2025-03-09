// https://www.api-football.com/documentation-v3
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://v3.football.api-sports.io';

let latestYear = new Date().getFullYear();
let currentSeasonYear = latestYear;

const jsonLocalStorage = {
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: key => {
    return JSON.parse(localStorage.getItem(key));
  },
  removeItem: key => {
    localStorage.removeItem(key);
  },
};

const getKeyName = year => `pl_fixtures_${year}`;

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
  fixtures.forEach(v => {
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
    button.dataset.date = `${year}-${month}`;

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
      paintMatchList(fixtures);
      updateButtonState();
    });

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

function paintMatchList(fixtures) {
  const matchListContainer = document.querySelector('.matchlist-container');
  matchListContainer.innerHTML = '';

  const [selectedYear, selectedMonth] = getSelectedDate();

  const maxLen = getMaxLengthOfTeamName(fixtures);

  let currentDate = 0;
  let currentDiv = null;
  let currentUl = null;
  fixtures.forEach(v => {
    const D = new Date(v.fixture.date);
    const year = D.getFullYear();
    const month = D.getMonth() + 1;
    const date = D.getDate();
    const day = D.getDay();
    const days = ['일', '월', '화', '수', '목', '금', '토'];

    if (year === selectedYear && month === selectedMonth) {
      if (currentDate !== date) {
        currentDate = date;
        currentDiv = document.createElement('div');
        currentDiv.className = 'matchlist-group';
        const dateTitleDiv = document.createElement('div');
        dateTitleDiv.className = 'date-title';
        const fixtureDate = document.createElement('h3');
        fixtureDate.className = 'date-text';
        fixtureDate.innerText = `${month}월 ${date}일 (${days[day]})`;
        dateTitleDiv.appendChild(fixtureDate);
        currentDiv.appendChild(dateTitleDiv);
        currentUl = document.createElement('ul');
        currentUl.className = 'match-list';
        currentDiv.appendChild(currentUl);
        matchListContainer.appendChild(currentDiv);
      }
      const li = document.createElement('li');
      li.className = 'match-item';
      const div = document.createElement('div');
      div.className = 'match-wrapper';
      div.appendChild(makeMatchContainer(v, maxLen));
      li.appendChild(div);
      currentUl.appendChild(li);
    }
  });
}

function makeMatchContainer(matchInfo, maxLenOfTeamName) {
  const containerSpan = document.createElement('span');
  containerSpan.className = 'match-container';

  const teamsSpan = document.createElement('span');
  teamsSpan.className = 'match-teams';
  const infoSpan = document.createElement('span');
  if (matchInfo.fixture.status.long === 'Match Finished') {
    infoSpan.className = 'match-score';
    infoSpan.innerText = `${matchInfo.goals.home} - ${matchInfo.goals.away}`;
  } else {
    infoSpan.className = 'match-time';
    const date = new Date(matchInfo.fixture.date);
    const hour = date.getHours();
    const minute = date.getMinutes();
    infoSpan.innerText = `${String(hour).padStart(2, '0')}:${String(
      minute
    ).padStart(2, '0')}`;
  }
  const { home, away } = matchInfo.teams;
  const homeSpan = document.createElement('span');
  homeSpan.className = 'match-team';
  const homeNameSpan = document.createElement('span');
  homeNameSpan.className = 'match-teamName';
  homeNameSpan.style.width = `${maxLenOfTeamName}ch`;
  homeNameSpan.innerText = `${home.name}`;
  const homeLogoSpan = document.createElement('span');
  homeLogoSpan.className = 'logo-container';
  const homeLogo = document.createElement('img');
  homeLogo.className = 'logo-img';
  homeLogo.src = `${home.logo}`;
  homeLogoSpan.appendChild(homeLogo);
  homeSpan.appendChild(homeNameSpan);
  homeSpan.appendChild(homeLogoSpan);
  const awaySpan = document.createElement('span');
  awaySpan.className = 'match-team';
  const awayNameSpan = document.createElement('span');
  awayNameSpan.className = 'match-teamName';
  awayNameSpan.style.width = `${maxLenOfTeamName}ch`;
  awayNameSpan.innerText = `${away.name}`;
  const awayLogoSpan = document.createElement('span');
  awayLogoSpan.className = 'logo-container';
  const awayLogo = document.createElement('img');
  awayLogo.className = 'logo-img';
  awayLogo.src = `${away.logo}`;
  awayLogoSpan.appendChild(awayLogo);
  awaySpan.appendChild(awayLogoSpan);
  awaySpan.appendChild(awayNameSpan);
  teamsSpan.appendChild(homeSpan);
  teamsSpan.appendChild(infoSpan);
  teamsSpan.appendChild(awaySpan);

  const stadiumSpan = document.createElement('span');
  stadiumSpan.className = 'match-stadium';
  stadiumSpan.innerText = `${matchInfo.fixture.venue.name}`;

  containerSpan.appendChild(teamsSpan);
  containerSpan.appendChild(stadiumSpan);
  return containerSpan;
}

function getMaxLengthOfTeamName(fixtures) {
  const team = new Set();
  fixtures.forEach(v => {
    if (team.size === 20) return;
    team.add(v.teams.home.name);
    team.add(v.teams.away.name);
  });

  let maxLength = 0;
  team.forEach(v => {
    if (v.length > maxLength) {
      maxLength = v.length;
    }
  });

  return maxLength;
}

const recentBtn = document.querySelector('.recent');
const prevSeasonBtn = document.getElementById('prev-btn');
const nextSeasonBtn = document.getElementById('next-btn');

recentBtn.addEventListener('click', () => {
  paintSeasonFixtures(latestYear);
  currentSeasonYear = latestYear;
  updateButtonState();
  recentBtn.disabled = true;
});

prevSeasonBtn.addEventListener('click', () => {
  if (currentSeasonYear > latestYear - 4) {
    currentSeasonYear--;
    updateButtonState();
    paintSeasonFixtures(currentSeasonYear);
  }
});

nextSeasonBtn.addEventListener('click', () => {
  if (currentSeasonYear < latestYear) {
    currentSeasonYear++;
    updateButtonState();
    paintSeasonFixtures(currentSeasonYear);
  }
});

function updateButtonState() {
  const DISABLE_CLASSNAME = 'disable';

  if (currentSeasonYear === latestYear) {
    recentBtn.disabled = true;
  } else {
    recentBtn.disabled = false;
  }

  if (currentSeasonYear === latestYear) {
    nextSeasonBtn.classList.add(DISABLE_CLASSNAME);
    nextSeasonBtn.disabled = true;
  } else {
    nextSeasonBtn.classList.remove(DISABLE_CLASSNAME);
    nextSeasonBtn.disabled = false;
  }

  if (currentSeasonYear === latestYear - 4) {
    prevSeasonBtn.classList.add(DISABLE_CLASSNAME);
    prevSeasonBtn.disabled = true;
  } else {
    prevSeasonBtn.classList.remove(DISABLE_CLASSNAME);
    prevSeasonBtn.disabled = false;
  }
}

function getSelectedDate() {
  const selectedDate = document.querySelector('.select').dataset.date;
  const [selectedYear, selectedMonth] = selectedDate
    .split('-')
    .map(v => parseInt(v));

  return [selectedYear, selectedMonth];
}
