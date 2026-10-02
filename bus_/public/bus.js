document.getElementById('btnFetch').addEventListener('click', async () => {

  const select = document.getElementById('busSelect');
  const arsId = select.value;
  const stationName = select.options[select.selectedIndex].text;

  appendLog(
    `📡 [열린데이터광장] 백엔드 요청 전송중... (ARS-ID: ${arsId})`
  );

  try {

  
    const response = await fetch(
  `/api/bus?busRouteId=100100118&arsId=${encodeURIComponent(arsId)}`
);
    const data = await response.json();

    console.log('===== 프론트엔드 수신 데이터 =====');
    console.log(data);

    if (!response.ok) {
      throw new Error(
        data.error || '버스 정보를 불러올 수 없습니다.'
      );
    }

    appendLog('✅ 응답 수신 완료');

    // server.js에서 보내준 items 전달
    displayResult(data.items, stationName);

  } catch (error) {

    console.error(error);

    appendLog(`❌ 에러 발생: ${error.message}`);

  }
});


function appendLog(message) {

  const logBox = document.getElementById('logBox');

  logBox.textContent += `\n> ${message}`;

  logBox.scrollTop = logBox.scrollHeight;

}


function clearLog() {

  document.getElementById('logBox').textContent =
    '> 로그가 초기화되었습니다.';

}


function displayResult(items, stationName) {

  const resultCard = document.getElementById('resultCard');
  const busList = document.getElementById('busList');
  const stopName = document.getElementById('stopName');

  resultCard.classList.remove('d-none');

  stopName.textContent = `📍 ${stationName}`;

  // ========================================
  // 버스 도착 정보가 없는 경우
  // ========================================

  if (!items || items.length === 0) {

    busList.innerHTML = `
      <p class="text-secondary small mb-0">
        현재 운행 중이거나 도착 예정인 버스 정보가 없습니다.
      </p>
    `;

    return;
  }


  // 배열이 아닌 경우 배열로 변환
  const itemList = Array.isArray(items)
    ? items
    : [items];


  // ========================================
  // 버스 도착 정보 화면 출력
  // ========================================

  busList.innerHTML = itemList.map(bus => {

    // 버스 번호
    const busName =
      bus.BUS_ROUTE_ABRNM ||
      bus.BUS_ROUTE_NM ||
      bus.rtNm ||
      bus.RTE_NM ||
      bus.BUS_ROUTE_ID ||
      '버스';


    // 첫 번째 버스
    const msg1 =
      bus.EXPRESS_BUS_MSG1 ||
      bus.ARRV_MSG1 ||
      bus.arrmsg1 ||
      bus.BUS_ARRV_MSG ||
      '도착 예정';


    // 두 번째 버스
    const msg2 =
      bus.EXPRESS_BUS_MSG2 ||
      bus.ARRV_MSG2 ||
      bus.arrmsg2 ||
      '정보 없음';


    return `

      <div class="border-bottom py-2 text-start px-2">

        <div
          class="d-flex justify-content-between align-items-center"
        >

          <strong>
            🚌 ${busName}번 버스
          </strong>

          <span class="badge bg-primary">
            ${msg1}
          </span>

        </div>

        <div class="text-muted small mt-1">
          다음 버스: ${msg2}
        </div>

      </div>

    `;

  }).join('');

}