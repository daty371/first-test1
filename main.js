document.addEventListener('DOMContentLoaded', () => {
  const ballContainer = document.getElementById('ball-container');
  const generateBtn = document.getElementById('generate-btn');
  const themeToggle = document.getElementById('theme-toggle');
  const setCountSelect = document.getElementById('set-count');
  const bonusCheckbox = document.getElementById('bonus-checkbox');
  const fortuneBtn = document.getElementById('fortune-btn');
  const fortuneDisplay = document.getElementById('fortune-display');
  const body = document.body;

  let map;
  let markers = [];

  // --- Theme Logic ---
  const updateThemeUI = (isDark) => {
    themeToggle.textContent = isDark ? '라이트 모드' : '다크 모드';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    updateThemeUI(true);
  }

  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    updateThemeUI(body.classList.contains('dark-mode'));
  });

  // --- Today's Fortune Logic (Lottery Specific) ---
  const fortunes = [
    { text: "금전운 대폭발! 💰 오늘은 복권을 사도 좋은 날입니다. 104회차를 노려보세요!", type: "lucky" },
    { text: "직관을 믿으세요. 당신이 고른 그 번호가 1등 번호가 될지도 모릅니다! ✨", type: "lucky" },
    { text: "행운의 여신이 미소 짓고 있습니다. 스피또 1000에서 예상치 못한 기쁨이? 🎁", type: "lucky" },
    { text: "작은 당첨이 큰 행운으로 이어질 징조입니다. 오늘 하루는 기대하셔도 좋습니다!", type: "lucky" },
    { text: "주변의 명당을 찾아보세요. 발길 닿는 곳마다 당첨의 기운이 가득합니다. 📍", type: "lucky" },
    { text: "오늘은 운이 좀 부족하네요. 😅 복권보다는 맛있는 저녁 한 끼로 힐링하세요.", type: "unlucky" },
    { text: "재물운이 구름에 가려져 있습니다. 오늘은 소액으로 즐기거나 다음을 기약하세요.", type: "unlucky" },
    { text: "욕심이 화를 부를 수 있습니다. 무리한 구매보다는 가벼운 마음이 중요합니다.", type: "unlucky" },
    { text: "오늘은 번호가 자꾸 빗나가네요. 잠시 쉬어가는 것도 전략입니다! 🛌", type: "unlucky" },
    { text: "주변에 운을 나눠주는 날입니다. 본인의 당첨운은 조금 뒤로 미뤄졌네요. 🕯️", type: "unlucky" }
  ];

  fortuneBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * fortunes.length);
    const fortune = fortunes[randomIndex];
    fortuneDisplay.textContent = fortune.text;
    fortuneDisplay.style.color = fortune.type === 'lucky' ? 'var(--primary-color)' : 'var(--placeholder-color)';
    fortuneDisplay.style.animation = 'none';
    fortuneDisplay.offsetHeight; 
    fortuneDisplay.style.animation = 'pop-in 0.5s ease-out';
  });

  // --- Latest Lotto Results Logic ---
  async function fetchLatestLotto() {
    const infoDisplay = document.getElementById('latest-draw-info');
    const container = document.getElementById('latest-ball-container');
    const startDate = new Date('2002-12-07');
    const now = new Date();
    const diffWeeks = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1;

    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${diffWeeks}`)}`);
      const data = await response.json();
      const lottoData = JSON.parse(data.contents);
      if (lottoData.returnValue === 'fail') {
          const prevRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${diffWeeks-1}`)}`);
          const prevData = await prevRes.json();
          renderLatestResults(JSON.parse(prevData.contents), diffWeeks - 1);
      } else {
          renderLatestResults(lottoData, diffWeeks);
      }
    } catch (e) {
      infoDisplay.textContent = '당첨 정보를 불러올 수 없습니다.';
      renderLatestResults({drwtNo1:1, drwtNo2:10, drwtNo3:20, drwtNo4:30, drwtNo5:40, drwtNo6:45, bnusNo:7, drwNoDate:'2026-04-04'}, 1218);
    }
  }

  function renderLatestResults(data, drawNum) {
    const infoDisplay = document.getElementById('latest-draw-info');
    const container = document.getElementById('latest-ball-container');
    container.innerHTML = '';
    infoDisplay.textContent = `${drawNum}회차 (${data.drwNoDate})`;
    [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6].forEach(num => {
      container.appendChild(createBallElement(num));
    });
    const plus = document.createElement('span');
    plus.className = 'ball-plus';
    plus.textContent = '+';
    container.appendChild(plus);
    container.appendChild(createBallElement(data.bnusNo, true));
  }

  // --- Lotto Generator Logic ---
  function getLottoNumbers() {
    const numbers = [];
    while (numbers.length < 7) {
      const num = Math.floor(Math.random() * 45) + 1;
      if (!numbers.includes(num)) numbers.push(num);
    }
    return { main: numbers.slice(0, 6).sort((a,b)=>a-b), bonus: numbers[6] };
  }

  function getBallColorClass(num) {
    if (num <= 10) return 'ball-yellow';
    if (num <= 20) return 'ball-blue';
    if (num <= 30) return 'ball-red';
    if (num <= 40) return 'ball-gray';
    return 'ball-green';
  }

  function createBallElement(num, isBonus = false) {
    const ball = document.createElement('div');
    ball.className = `ball ${isBonus ? 'ball-bonus' : getBallColorClass(num)}`;
    ball.textContent = num;
    return ball;
  }

  function renderNumbers() {
    ballContainer.innerHTML = '';
    const sets = parseInt(setCountSelect.value);
    const includeBonus = bonusCheckbox.checked;

    for (let i = 0; i < sets; i++) {
      const { main, bonus } = getLottoNumbers();
      const row = document.createElement('div');
      row.className = 'ball-row';
      main.forEach((num, idx) => {
        const ball = createBallElement(num);
        ball.style.animationDelay = `${(i * 0.3) + (idx * 0.05)}s`;
        row.appendChild(ball);
      });
      if (includeBonus) {
        const plus = document.createElement('span');
        plus.className = 'ball-plus';
        plus.textContent = '+';
        row.appendChild(plus);
        const bonusBall = createBallElement(bonus, true);
        bonusBall.style.animationDelay = `${(i * 0.3) + 0.4}s`;
        row.appendChild(bonusBall);
      }
      ballContainer.appendChild(row);
    }
  }

  // --- Speetto Map Logic ---
  const winningStores = [
    { name: "복권명당", type: "2000", lat: 37.5665, lng: 126.9780, addr: "서울시 중구", round: "66회", date: "2024-03-20" },
    { name: "행운의집", type: "1000", lat: 35.1796, lng: 129.0756, addr: "부산시 연제구", round: "104회", date: "2024-03-15" },
    { name: "대박상회", type: "500", lat: 35.8714, lng: 128.6014, addr: "대구시 중구", round: "48회", date: "2024-03-10" },
    { name: "희망로또", type: "2000", lat: 37.4563, lng: 126.7052, addr: "인천시 남동구", round: "66회", date: "2024-03-05" },
    { name: "금빛복권", type: "1000", lat: 35.1595, lng: 126.8526, addr: "광주시 서구", round: "104회", date: "2024-02-28" },
    { name: "중앙복권", type: "2000", lat: 36.3504, lng: 127.3845, addr: "대전시 서구", round: "66회", date: "2024-02-20" },
    { name: "울산행운", type: "500", lat: 35.5384, lng: 129.3114, addr: "울산시 남구", round: "48회", date: "2024-02-15" },
    { name: "수원대박", type: "2000", lat: 37.2636, lng: 127.0286, addr: "경기도 수원시", round: "66회", date: "2024-02-01" }
  ];

  function initMap() {
    map = L.map('map').setView([36.2, 127.8], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    renderMarkers('all');
  }

  function renderMarkers(filterType) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    winningStores.forEach(store => {
      if (filterType === 'all' || store.type === filterType) {
        const marker = L.marker([store.lat, store.lng])
          .bindPopup(`<b>${store.name}</b><br>스피또${store.type} (${store.round})<br>당첨일: ${store.date}<br>${store.addr}`);
        marker.addTo(map);
        markers.push(marker);
      }
    });
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.target.id === 'fortune-btn') return;
      document.querySelectorAll('.filter-btn').forEach(b => {
        if (b.id !== 'fortune-btn') b.classList.remove('active');
      });
      e.target.classList.add('active');
      renderMarkers(e.target.dataset.type);
    });
  });

  generateBtn.addEventListener('click', renderNumbers);
  fetchLatestLotto();
  initMap();
});
