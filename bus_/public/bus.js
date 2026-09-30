// 국토교통부 API 전용 정류소 정보 (nodeId)
const STATIONS = {
  seoul_station: { name: '서울역버스환승센터(중)', cityCode: '11', nodeId: 'BSB101000003' },
  sehyun_church: { name: '시립서북병원.세현교회앞', cityCode: '11', nodeId: 'BSB111000133' },
  yeonsinnae_4: { name: '연신내역 4번출구', cityCode: '11', nodeId: 'BSB111000035' },
  yeonsinnae_3: { name: '연신내역 3번출구', cityCode: '11', nodeId: 'BSB111000022' },
  yeonso_market: { name: '연신내역.연서시장(중)', cityCode: '11', nodeId: 'BSB111000108' }
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

document.getElementById('btnFetch').addEventListener('click', () => {
  const stationKey = document.getElementById('citySelect').value;
  const target = STATIONS[stationKey];

  const url = `http://localhost:3000/api/bus?cityCode=${target.cityCode}&nodeId=${target.nodeId}`;

  log(`1. fetch() 주문서 발송: ${target.name}`);
  resultCard.classList.add('d-none');

  fetch(url)
    .then((response) => {
      log(`2. 서버 응답 도착 (HTTP 상태 코드: ${response.status})`);
      if (!response.ok) throw new Error(`HTTP 에러 발생: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const items = data.response?.body?.items?.item;

      if (!items) {
        log(`⚠️ 도착 예정인 버스 정보가 없거나 정류소 정보를 확인해주세요.`);
        cityNameEl.textContent = target.name;
        cityTempEl.textContent = `도착 정보 없음`;
        cityExtraEl.textContent = `현재 운행 중인 버스가 없거나 정보를 불러올 수 없습니다.`;
        resultCard.classList.remove('d-none');
        return;
      }

      const firstBus = Array.isArray(items) ? items[0] : items;
      const busName = firstBus.routeno;
      const arrtime = Math.round(firstBus.arrtime / 60);
      const arrprevstationcnt = firstBus.arrprevstationcnt;

      log(`3. JSON 분석 완료! [${busName}번] ${arrtime}분 후 도착 예정`);

      cityNameEl.textContent = `${target.name}`;
      cityTempEl.textContent = `[${busName}번] ${arrtime}분 후 (${arrprevstationcnt}개 전)`;
      cityExtraEl.textContent = `버스종류: ${firstBus.routetp || '시내버스'}`;
      resultCard.classList.remove('d-none');
    })
    .catch((error) => {
      log(`❌ 에러 발생: ${error.message}`);
      alert(`버스 정보를 가져오지 못했습니다: ${error.message}`);
    })
    .finally(() => {
      log(`4. fetch 요청 사이클 완료`);
    });
});