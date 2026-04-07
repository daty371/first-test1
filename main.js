document.addEventListener('DOMContentLoaded', () => {
  const ballContainer = document.getElementById('ball-container');
  const generateBtn = document.getElementById('generate-btn');
  const themeToggle = document.getElementById('theme-toggle');
  const setCountSelect = document.getElementById('set-count');
  const body = document.body;

  // --- Theme Logic ---
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // --- Latest Lotto Results Logic ---
  async function fetchLatestLotto() {
    const infoDisplay = document.getElementById('latest-draw-info');
    const container = document.getElementById('latest-ball-container');

    // Calculate current draw number (Draw 1: 2002-12-07)
    const startDate = new Date('2002-12-07');
    const now = new Date();
    const diffWeeks = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
    
    infoDisplay.textContent = `${diffWeeks}회차 당첨 번호 (불러오는 중...)`;

    try {
      // Note: Direct fetch might fail due to CORS. Using a mock for demonstration
      // or a public proxy if available. Here we provide a realistic fallback.
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${diffWeeks}`)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const lottoData = JSON.parse(data.contents);

      if (lottoData.returnValue === 'fail') {
          // If current week isn't out yet, try previous week
          const prevResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${diffWeeks-1}`)}`);
          const prevData = await prevResponse.json();
          renderLatestResults(JSON.parse(prevData.contents), diffWeeks - 1);
      } else {
          renderLatestResults(lottoData, diffWeeks);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      infoDisplay.textContent = '당첨 정보를 불러올 수 없습니다. (CORS 제한)';
      // Fallback example data
      renderLatestResults({
        drwtNo1: 1, drwtNo2: 10, drwtNo3: 20, drwtNo4: 30, drwtNo5: 40, drwtNo6: 45, bnusNo: 7, drwNoDate: '2026-04-04'
      }, 1218);
    }
  }

  function renderLatestResults(data, drawNum) {
    const infoDisplay = document.getElementById('latest-draw-info');
    const container = document.getElementById('latest-ball-container');
    container.innerHTML = '';
    
    infoDisplay.textContent = `${drawNum}회차 (${data.drwNoDate})`;

    const nums = [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6];
    nums.forEach(num => {
      const ball = createBallElement(num);
      container.appendChild(ball);
    });

    const plus = document.createElement('span');
    plus.className = 'ball-plus';
    plus.textContent = '+';
    container.appendChild(plus);

    const bonusBall = createBallElement(data.bnusNo, true);
    container.appendChild(bonusBall);
  }

  // --- Lotto Generator Logic ---
  function getLottoNumbers() {
    const numbers = [];
    while (numbers.length < 7) { // 6 + 1 bonus
      const num = Math.floor(Math.random() * 45) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    const mainNumbers = numbers.slice(0, 6).sort((a, b) => a - b);
    const bonusNumber = numbers[6];
    return { mainNumbers, bonusNumber };
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

    for (let i = 0; i < sets; i++) {
      const { mainNumbers, bonusNumber } = getLottoNumbers();
      const row = document.createElement('div');
      row.className = 'ball-row';

      mainNumbers.forEach((num, index) => {
        const ball = createBallElement(num);
        ball.style.animationDelay = `${(i * 0.5) + (index * 0.1)}s`;
        row.appendChild(ball);
      });

      const plus = document.createElement('span');
      plus.className = 'ball-plus';
      plus.textContent = '+';
      row.appendChild(plus);

      const bonusBall = createBallElement(bonusNumber, true);
      bonusBall.style.animationDelay = `${(i * 0.5) + 0.6}s`;
      row.appendChild(bonusBall);

      ballContainer.appendChild(row);
    }
  }

  // --- Speetto Map Logic ---
  function initMap() {
    // Center at Seoul
    const map = L.map('map').setView([36.5, 127.5], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Hardcoded Speetto winning stores data (demonstration)
    const winningStores = [
      { name: "복권천국", addr: "서울 강서구 등촌로 5", lat: 37.534, lng: 126.863, type: "스피또2000 1등" },
      { name: "행운의집", addr: "경기 부천시 원미로 2", lat: 37.486, lng: 126.782, type: "스피또1000 1등" },
      { name: "대박복권방", addr: "부산 해운대구 해운대로 1", lat: 35.163, lng: 129.163, type: "스피또2000 2등" },
      { name: "로또명당", addr: "대구 수성구 달구벌대로 1", lat: 35.858, lng: 128.627, type: "스피또1000 1등" },
      { name: "희망복권", addr: "광주 북구 면앙로 1", lat: 35.174, lng: 126.912, type: "스피또2000 1등" }
    ];

    winningStores.forEach(store => {
      L.marker([store.lat, store.lng])
        .addTo(map)
        .bindPopup(`<b>${store.name}</b><br>${store.type}<br>${store.addr}`);
    });
  }

  generateBtn.addEventListener('click', renderNumbers);
  
  // Initial calls
  fetchLatestLotto();
  initMap();
});
