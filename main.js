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

  // --- Visitor Counter Logic ---
  function updateVisitors() {
    const today = new Date().toISOString().split('T')[0];
    const visitorData = JSON.parse(localStorage.getItem('visitorData') || '{"lastVisit":"","today":0,"total":0}');
    
    if (visitorData.lastVisit !== today) {
      visitorData.today = 1;
      visitorData.lastVisit = today;
    } else {
      visitorData.today += 1;
    }
    visitorData.total += 1;
    
    localStorage.setItem('visitorData', JSON.stringify(visitorData));
    document.getElementById('today-visitors').textContent = visitorData.today.toLocaleString();
    document.getElementById('total-visitors').textContent = visitorData.total.toLocaleString();
  }

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

  // --- Today's Fortune Logic ---
  const fortunes = [
    { text: "금전운 대폭발! 💰 오늘은 복권을 사도 좋은 날입니다. 104회차를 노려보세요!", type: "lucky" },
    { text: "직관을 믿으세요. 당신이 고른 그 번호가 1등 번호가 될지도 모릅니다! ✨", type: "lucky" },
    { text: "행운의 여신이 미소 짓고 있습니다. 스피또 1000에서 예상치 못한 기쁨이? 🎁", type: "lucky" },
    { text: "오늘은 번호가 자꾸 빗나가네요. 😅 잠시 쉬어가는 것도 전략입니다!", type: "unlucky" },
    { text: "재물운이 구름에 가려져 있습니다. 오늘은 소액으로 즐기세요.", type: "unlucky" }
  ];

  fortuneBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * fortunes.length);
    const fortune = fortunes[randomIndex];
    fortuneDisplay.textContent = fortune.text;
    fortuneDisplay.className = `fortune-text ${fortune.type}`;
    fortuneDisplay.style.animation = 'none';
    fortuneDisplay.offsetHeight; 
    fortuneDisplay.style.animation = 'pop-in 0.5s ease-out';
  });

  // --- Latest Lotto Results Logic ---
  async function fetchLatestLotto() {
    const infoDisplay = document.getElementById('latest-draw-info');
    const container = document.getElementById('latest-ball-container');
    const storesDisplay = document.getElementById('latest-stores-info');
    const startDate = new Date('2002-12-07');
    const now = new Date();
    const diffWeeks = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1;

    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${diffWeeks}`)}`);
      const data = await response.json();
      const lottoData = JSON.parse(data.contents);
      renderLatestResults(lottoData, diffWeeks);
    } catch (e) {
      renderLatestResults({drwtNo1:3, drwtNo2:28, drwtNo3:31, drwtNo4:32, drwtNo5:42, drwtNo6:45, bnusNo:25, drwNoDate:'2026-04-04'}, 1218);
    }
  }

  function renderLatestResults(data, drawNum) {
    const infoDisplay = document.getElementById('latest-draw-info');
    const container = document.getElementById('latest-ball-container');
    const storesDisplay = document.getElementById('latest-stores-info');
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

    if (drawNum === 1218) {
      storesDisplay.innerHTML = `<strong>1218회 명당:</strong> 꿈이있는로또점(서울), 돈벼락맞는곳(부산), 복권맛집(경기 포천) 등 18곳`;
    }
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

  function createBallElement(num, isBonus = false) {
    const ball = document.createElement('div');
    const colorClass = num <= 10 ? 'ball-yellow' : num <= 20 ? 'ball-blue' : num <= 30 ? 'ball-red' : num <= 40 ? 'ball-gray' : 'ball-green';
    ball.className = `ball ${isBonus ? 'ball-bonus' : colorClass}`;
    ball.textContent = num;
    return ball;
  }

  function renderNumbers() {
    ballContainer.innerHTML = '';
    const sets = parseInt(setCountSelect.value);
    for (let i = 0; i < sets; i++) {
      const { main, bonus } = getLottoNumbers();
      const row = document.createElement('div');
      row.className = 'ball-row';
      main.forEach((num, idx) => {
        const ball = createBallElement(num);
        ball.style.animationDelay = `${(i * 0.2) + (idx * 0.05)}s`;
        row.appendChild(ball);
      });
      if (bonusCheckbox.checked) {
        const plus = document.createElement('span');
        plus.className = 'ball-plus';
        plus.textContent = '+';
        row.appendChild(plus);
        const bonusBall = createBallElement(bonus, true);
        bonusBall.style.animationDelay = `${(i * 0.2) + 0.3}s`;
        row.appendChild(bonusBall);
      }
      ballContainer.appendChild(row);
    }
  }

  // --- Map Logic ---
  const winningStores = [
    { name: "꿈이있는 로또점", type: "6/45", lat: 37.604, lng: 126.924, addr: "서울 은평구", desc: "1218회 자동 1등" },
    { name: "돈벼락맞는곳", type: "6/45", lat: 35.156, lng: 129.059, addr: "부산 부산진구", desc: "1218회 자동 1등" },
    { name: "복권맛집", type: "6/45", lat: 37.886, lng: 127.168, addr: "경기 포천시", desc: "1218회 자동 1등" },
    { name: "복권명당", type: "2000", lat: 37.566, lng: 126.978, addr: "서울 중구", desc: "스피또2000 66회 1등" },
    { name: "행운의집", type: "1000", lat: 35.179, lng: 129.075, addr: "부산 연제구", desc: "스피또1000 104회 1등" }
  ];

  function initMap() {
    map = L.map('map', {
      scrollWheelZoom: false, // Prevent accidental zooming
      touchZoom: false
    }).setView([36.2, 127.8], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    renderMarkers('all');
  }

  function renderMarkers(filterType) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    winningStores.forEach(store => {
      if (filterType === 'all' || store.type === filterType) {
        const marker = L.marker([store.lat, store.lng])
          .bindPopup(`<b>${store.name}</b><br>${store.desc}<br>${store.addr}`);
        marker.addTo(map);
        markers.push(marker);
      }
    });
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderMarkers(e.target.dataset.type);
    });
  });

  generateBtn.addEventListener('click', renderNumbers);
  updateVisitors();
  fetchLatestLotto();
  initMap();
});
