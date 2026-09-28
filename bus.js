// [수정] 서울시 공공데이터포털 일반 인증키 (Decoding Key)
const API_KEY = '34db26780fd8bc7e84db2713f0a61a9ce4b77da820d107f0929b57a874f30bcd';

// [수정] 요청하신 5개 정류소 목록 (ARS-ID 기준)
const STATIONS = {
  seoul_station: { name: '서울역버스환승센터(중)', arsId: '02006' },
  sehyun_church: { name: '시립서북병원.세현교회앞', arsId: '12217' },
  yeonsinnae_4: { name: '연신내역 4번출구', arsId: '12119' },
  yeonsinnae_3: { name: '연신내역 3번출구', arsId: '12106' },
  yeonso_market: { name: '연신내역.연서시장(중)', arsId: '12018' }
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
  const stationKey = document.getElementById('citySelect').value;
  const target = STATIONS[stationKey];

  // 서울시 정류소별 도착예정정보 목록 조회 API URL (ARS-ID 및 JSON 포맷 적용)
  const url = `https://ws.bus.go.kr/api/rest/arrive/getArrInfoByUid?serviceKey=${API_KEY}&arsId=${target.arsId}&resultType=json`;

  log(`1. fetch() 주문서 발송: ${target.name} (정류소번호: ${target.arsId})`);
  resultCard.classList.add('d-none');

  fetch(url)
    .then((response) => {
      log(`2. 서버 응답 도착 (HTTP 상태 코드: ${response.status})`);
      if (!response.ok) {
        throw new Error(`HTTP 에러 발생: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // 서울시 API 응답 데이터 체크
      const itemList = data.msgBody?.itemList;

      if (!itemList || itemList.length === 0) {
        log(`⚠️ 도착 예정인 버스 정보가 없거나 정류소 번호를 확인해주세요.`);
        cityNameEl.textContent = target.name;
        cityTempEl.textContent = `도착 정보 없음`;
        cityExtraEl.textContent = `현재 운행 중인 버스가 없거나 정보를 불러올 수 없습니다.`;
        resultCard.classList.remove('d-none');
        return;
      }

      // 가장 첫 번째로 들어오는 버스 정보 추출
      const firstBus = itemList[0];
      const busName = firstBus.rtNm; // 노선명 (예: 7720, 701)
      const arrmsg1 = firstBus.arrmsg1; // 첫 번째 도착예정 메세지 (예: "3분후[2개 전]")
      const arrmsg2 = firstBus.arrmsg2; // 두 번째 도착예정 메세지

      log(`3. JSON 번역 완료! [${busName}번] ${arrmsg1}`);

      // 화면(DOM) 업데이트
      cityNameEl.textContent = `${target.name} (${target.arsId})`;
      cityTempEl.textContent = `[${busName}번] ${arrmsg1}`;
      cityExtraEl.textContent = `다음 버스: ${arrmsg2 || '정보 없음'} (총 ${itemList.length}개 노선 운행 중)`;
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