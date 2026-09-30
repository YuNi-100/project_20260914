document.getElementById('btnFetch').addEventListener('click', async () => {
  const select = document.getElementById('busSelect');
  const selectedOption = select.options[select.selectedIndex];
  
  const cityCode = selectedOption.getAttribute('data-citycode');
  const nodeId = selectedOption.getAttribute('data-nodeid');

  appendLog(`📡 백엔드로 API 요청 전송... (cityCode: ${cityCode}, nodeId: ${nodeId})`);

  try {
    const response = await fetch(`/api/bus?cityCode=${cityCode}&nodeId=${nodeId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '버스 정보를 불러오지 못했습니다.');
    }

    appendLog(`✅ 응답 성공: 데이터 수신 완료`);
    displayResult(data);
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

function displayResult(data) {
  const resultCard = document.getElementById('resultCard');
  const busList = document.getElementById('busList');
  resultCard.classList.remove('d-none');

  const items = data?.response?.body?.items?.item;
  if (!items) {
    busList.innerHTML = '<p class="text-secondary small mb-0">현재 도착 예정인 버스가 없습니다.</p>';
    return;
  }

  const itemList = Array.isArray(items) ? items : [items];
  busList.innerHTML = itemList.map(bus => `
    <div class="border-bottom py-2 text-start px-2">
      <div class="d-flex justify-content-between align-items-center">
        <strong>🚌 ${bus.routeno}번 버스</strong>
        <span class="badge bg-primary">${Math.floor(bus.arrtime / 60)}분 후 도착</span>
      </div>
      <div class="text-muted small mt-1">
        남은 정류장: ${bus.arrprevstationcnt}개 | 차종: ${bus.vehicletp || '일반'}
      </div>
    </div>
  `).join('');
}