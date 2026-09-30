document.getElementById('btnFetch').addEventListener('click', async () => {
  const select = document.getElementById('busSelect');
  const selectedOption = select.options[select.selectedIndex];
  
  const stId = selectedOption.getAttribute('data-stid');
  const stationName = selectedOption.textContent;

  appendLog(`📡 백엔드로 서울시 API 요청 전송... (정류소: ${stationName}, stId: ${stId})`);

  try {
    const response = await fetch(`/api/bus?stId=${stId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '버스 정보를 불러오지 못했습니다.');
    }

    appendLog(`✅ 응답 성공: 서울시 데이터 수신 완료`);
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
  stopName.textContent = `📍 ${stationName} 도착 예정 목록`;

  // 서울시 API 응답 경로
  const items = data?.msgBody?.itemList;

  if (!items || items.length === 0) {
    busList.innerHTML = '<p class="text-secondary small mb-0">현재 도착 예정인 버스가 없거나 정보를 불러올 수 없습니다.</p>';
    return;
  }

  const itemList = Array.isArray(items) ? items : [items];
  busList.innerHTML = itemList.map(bus => `
    <div class="border-bottom py-2 text-start px-2">
      <div class="d-flex justify-content-between align-items-center">
        <strong>🚌 ${bus.rtNm}번 버스</strong>
        <span class="badge bg-primary">${bus.arrmsg1 || '정보 없음'}</span>
      </div>
      <div class="text-muted small mt-1">
        다음 버스: ${bus.arrmsg2 || '도착 정보 없음'} | 종점 방향: ${bus.adirection || '미지정'}
      </div>
    </div>
  `).join('');
}