window.addEventListener('load', () => {
  let carousels = document.getElementsByClassName('carousel');
  let cards = document.getElementsByClassName('card-container');

  for (let i = 0; i < carousels.length; i++) {
    addEventToCarousel(carousels[i]);
  }

  for (let i = 0; i < cards.length; i++) {
    addEventToCard(cards[i]);
  }
});

function addEventToCarousel(carouselElem) {
  let ulElem = carouselElem.querySelector('ul');
  let liElems = ulElem.querySelectorAll('li');

  let liWidth = liElems[0].clientWidth;
  let adjustedWidth = liElems.length * liWidth;
  ulElem.style.width = adjustedWidth + 'px';

  let slideButtons = carouselElem.querySelectorAll('.slide');

  for (let i = 0; i < slideButtons.length; i++) {
    slideButtons[i].addEventListener('click', createListenerSlide(carouselElem));
  }
}

function addEventToCard(cardElem) {
  let divElem = cardElem.querySelector('.card-buttons');
  let buttons = divElem.querySelectorAll('button');

  buttons.forEach(button => {
    let buttonId = button.id;

    if (buttonId === 'like-button') {
      button.addEventListener('click', createListenerPostLike(cardElem));
    }
  });
}

function createListenerPostLike(cardElem) {
  let isLiked = false;

  return function () {
    isLiked = !isLiked;

    updateHeart(cardElem, isLiked);
    updateLikeCount(cardElem, isLiked);
  };
}

function updateHeart(cardElem, isLiked) {
  let clickedHeart = cardElem.querySelector('#like-button');
  if (isLiked) {
    clickedHeart.innerHTML = '<img src="images/icon/fullheart.png" />';
  } else {
    clickedHeart.innerHTML = '<img src="images/icon/heart.png" />';
  }
}

function updateLikeCount(cardElem, isLiked) {
  let countSpan = cardElem.querySelector('div.card-likes span.like-count');
  let count = countSpan.textContent.slice(0, countSpan.textContent.length - 1).replace(',', '');

  isLiked ? count++ : count--;

  countSpan.innerText = count + '개';
}

function createListenerSlide(carouselElem) {
  return function (e) {
    let clickedButton = e.currentTarget;

    let liElems = carouselElem.querySelectorAll('li');
    let liCount = liElems.length;
    let currentIndex = carouselElem.attributes.data.value;

    if (clickedButton.className.includes('right') && currentIndex < liCount - 1) {
      currentIndex++;
    } else if (clickedButton.className.includes('left') && currentIndex > 0) {
      currentIndex--;
    }

    scrollDiv(carouselElem, currentIndex);
    updateIndicator(carouselElem, currentIndex);
    updateSlideButtonVisible(carouselElem, currentIndex, liCount);
    carouselElem.attributes.data.value = currentIndex;
  };
}

function scrollDiv(carouselElem, nextIndex) {
  let scrollable = carouselElem.querySelector('div');
  let liWidth = scrollable.clientWidth;
  let newLeft = liWidth * nextIndex;
  scrollable.scrollTo({ left: newLeft, behavior: 'smooth' });
}

function updateIndicator(carouselElem, currentIndex) {
  let indicators = carouselElem.querySelectorAll('footer > div');
  for (let i = 0; i < indicators.length; i++) {
    if (currentIndex == i) indicators[i].className = 'active';
    else indicators[i].className = '';
  }
}

function updateSlideButtonVisible(carouselElem, currentIndex, liCount) {
  let left = carouselElem.querySelector('.slide-left');
  let right = carouselElem.querySelector('.slide-right');

  if (currentIndex > 0) {
    left.style.display = 'block';
  } else {
    left.style.display = 'none';
  }

  if (currentIndex < liCount - 1) {
    right.style.display = 'block';
  } else {
    right.style.display = 'none';
  }
}
