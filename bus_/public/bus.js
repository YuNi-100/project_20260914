document.getElementById('btnFetch').addEventListener('click', async () => {
  const select = document.getElementById('busSelect');
  const arsId = select.value;
  const stationName = select.options[select.selectedIndex].text;

  appendLog(`📡 [열린데이터광장] 백엔드 요청 전송중... (ARS-ID: ${arsId})`);

  try {
    const response = await fetch(`/api/bus?arsId=${arsId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '버스 정보를 불러올 수 없습니다.');
    }

    appendLog(`✅ 응답 수신 완료`);
    displayResult(data, stationName);
  } catch (error) {
    appendLog(`❌ 에러 발생: ${error.message}`);
  }
});

function appendLog(message) {
  const logBox = document.getElementById('logBox');
  logBox.textContent += `\n> ${message}`;
  logBox.scrollTop = logBox.scrollHeight;
}

function clearLog() {
  document.getElementById('logBox').textContent = '> 로그가 초기화되었습니다.';
}

function displayResult(data, stationName) {
  const resultCard = document.getElementById('resultCard');
  const busList = document.getElementById('busList');
  const stopName = document.getElementById('stopName');

  resultCard.classList.remove('d-none');
  stopName.textContent = `📍 ${stationName}`;

  // 1. 서울 열린데이터광장 응답 객체에서 row 배열 안전하게 추출
  const root = data?.CardBusArrivalInfo || data?.CardBusArrivalService || data?.msgBody;
  const items = root?.row || root?.itemList;

  if (!items || items.length === 0) {
    busList.innerHTML = '<p class="text-secondary small mb-0">현재 운행 중이거나 도착 예정인 버스 정보가 없습니다.</p>';
    return;
  }

  const itemList = Array.isArray(items) ? items : [items];

  // 2. 필드 매핑 및 버스 목록HTML 생성
  busList.innerHTML = itemList.map(bus => {
    // 노선 번호 (BUS_ROUTE_ABRNM, BUS_ROUTE_NM, RTE_NM, rtNm 호환)
    const routeNo = bus.BUS_ROUTE_ABRNM || bus.BUS_ROUTE_NM || bus.RTE_NM || bus.rtNm || '버스';
    
    // 첫 번째 도착 메시지 (ARRV_MSG1, arrmsg1 호환)
    const msg1 = bus.ARRV_MSG1 || bus.EXPRESS_BUS_MSG1 || bus.arrmsg1 || '도착 예정';
    
    // 두 번째 도착 메시지 (ARRV_MSG2, arrmsg2 호환)
    const msg2 = bus.ARRV_MSG2 || bus.EXPRESS_BUS_MSG2 || bus.arrmsg2 || '다음 버스 정보 없음';

    return `
      <div class="border-bottom py-2 text-start px-2">
        <div class="d-flex justify-content-between align-items-center">
          <strong>🚌 ${routeNo}번 버스</strong>
          <span class="badge bg-primary">${msg1}</span>
        </div>
        <div class="text-muted small mt-1">
          다음 버스: ${msg2}
        </div>
      </div>
    `;
  }).join('');
}