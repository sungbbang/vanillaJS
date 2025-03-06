const seasonText = document.querySelector('.current-season');

function paintSeasonText() {
  const date = new Date();
  const year = date.getFullYear();

  seasonText.innerText = `${year}-${(year + 1) % 100}`;
}

paintSeasonText();
