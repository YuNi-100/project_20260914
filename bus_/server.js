const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 서울시 버스 API용 일반 인증키
const API_KEY = '34db26780fd8bc7e84db2713f0a61a9ce4b77da820d107f0929b57a874f30bcd';

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서울시 버스 도착 정보 API (arsId 또는 stId 지원)
app.get('/api/bus', async (req, res) => {
  const { stId, arsId } = req.query;

  const targetId = arsId || stId;

  if (!targetId) {
    return res.status(400).json({ error: 'stId 또는 arsId 파라미터가 필요합니다.' });
  }

  try {
    // serviceKey를 encodeURIComponent로 인코딩 처리
    const serviceKey = encodeURIComponent(API_KEY);
    const baseUrl = 'http://ws.bus.go.kr/api/rest/arrive/getArrInfoByStId';
    const targetUrl = `${baseUrl}?serviceKey=${serviceKey}&stId=${targetId}&resultType=json`;

    console.log(`📡 [서울시 API 요청]: ${targetUrl}`);

    const response = await axios.get(targetUrl);
    console.log('✅ [서울시 API 응답 데이터]:', JSON.stringify(response.data, null, 2));

    res.json(response.data);
  } catch (error) {
    console.error('❌ 백엔드 에러 발생:');
    if (error.response) {
      console.error('응답 상태 코드:', error.response.status);
      console.error('응답 데이터:\n', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('에러 메시지:', error.message);
    }

    res.status(500).json({ error: '서울시 버스 정보를 불러오는 중 서버 에러가 발생했습니다.' });
  }
}
)

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Node 기반 서버가 성공적으로 실행되었습니다! (http://localhost:${PORT})`);
});