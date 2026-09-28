const API_KEY = '4ba5792e3732e4d1c2322853855e9119';

const CITIES = {
  seoul: { name: '서울 (Seoul)', lat: 37.5665, lon: 126.9780 },
  daejeon: { name: '대전 (Daejeon)', lat: 36.3510, lon: 127.3850 },
  daegu: { name: '대구 (Daegu)', lat: 35.8714, lon: 128.6014 },
  busan: { name: '부산 (Busan)', lat: 35.1796, lon: 129.0756 }
  };
  
const logBox = document.getElementById('logBox');
const resultCard = document.getElementById('resultCard');
const cityNameEl = document.getElementById('cityName');
const cityTempEl = document.getElementById('cityTemp');
const cityExtraEl = document.getElementById('cityExtra');

function log(msg) {
  const time = new Date().toLocaleTimeString();
  logBox.textContent += `\n[${time}] ${msg}`;
  logBox.scrollTop = logBox.scrollHeight;
}

function clearLog() {
  logBox.textContent = '> 콘솔이 초기화되었습니다.';
}

// 버튼 클릭 이벤트
document.getElementById('btnFetch').addEventListener('click', () => {
  const cityKey = document.getElementById('citySelect').value;
  const target = CITIES[cityKey];

  // ==========================================================
  // [수정 1] OpenWeatherMap API 엔드포인트 및 파라미터로 변경
  // (units=metric: 섭씨온도 / lang=kr: 한국어 상태 설명 / appid: API키)
  // ==========================================================
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${target.lat}&lon=${target.lon}&units=metric&lang=kr&appid=${API_KEY}`;

  log(`1. fetch() 주문서 발송: ${target.name}`);
  resultCard.classList.add('d-none');

  // ==========================================================
  // [핵심] 오직 fetch와 .then() 체인만 사용하는 기본 문법
  // ==========================================================
  fetch(url)
    .then((response) => {
      log(`2. 서버 응답 도착 (HTTP 상태 코드: ${response.status})`);
      if (!response.ok) {
        throw new Error(`HTTP 에러 발생: ${response.status}`);
      }
      // 응답 본문을 JSON 객체로 파싱하여 다음 then으로 전달
      return response.json();
    })
    .then((data) => {
      // ==========================================================
      // [수정 2] OpenWeatherMap의 응답 JSON 구조에 맞게 데이터 추출
      // Open-Meteo(data.current) -> OpenWeatherMap(data.main, data.wind 등)
      // ==========================================================
      const temp = data.main.temp;             // 현재 기온 (℃)
      const humidity = data.main.humidity;     // 습도 (%)
      const windSpeed = data.wind.speed;       // 풍속 (m/s)
      const weatherDesc = data.weather[0].description; // 날씨 상태 (예: 맑음, 구름조금)

      log(`3. JSON 번역 완료! 기온: ${temp}℃ / 습도: ${humidity}% / 상태: ${weatherDesc}`);

      // ==========================================================
      // [수정 3] 추출한 데이터 값으로 화면(DOM) 업데이트
      // ==========================================================
      cityNameEl.textContent = `${target.name} (${weatherDesc})`;
      cityTempEl.textContent = `${temp} ℃`;
      cityExtraEl.textContent = `습도: ${humidity}% | 풍속: ${windSpeed} m/s`;
      resultCard.classList.remove('d-none');
    })
    .catch((error) => {
      log(`❌ 에러 발생: ${error.message}`);
      alert(`날씨 정보를 가져오지 못했습니다: ${error.message}`);
    })
    .finally(() => {
      log(`4. fetch 요청 사이클 완료`);
    });
});