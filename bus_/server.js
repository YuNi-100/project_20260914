const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 서울 열린데이터광장 발급 인증키
const SEOUL_KEY = '774967424874706439324948737871';

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 버스 도착 정보 API (ARS-ID 5자리 전용)
app.get('/api/bus', async (req, res) => {
  const { arsId, stId } = req.query;
  const targetArsId = arsId || stId;

  if (!targetArsId) {
    return res.status(400).json({ error: 'arsId 파라미터가 필요합니다.' });
  }

  try {
    // 5자리 ARS-ID로 요청 엔드포인트 조립
    const targetUrl = `http://openAPI.seoul.go.kr:8088/${SEOUL_KEY}/json/CardBusArrivalInfo/1/5/${targetArsId}`;

    console.log(`📡 [서울 열린데이터광장 API 요청]: ${targetUrl}`);

    const response = await axios.get(targetUrl);
    
    console.log('✅ [응답 성공]');
    res.json(response.data);
  } catch (error) {
    console.error('❌ 백엔드 API 호출 에러:', error.message);
    res.status(500).json({ error: '서울시 버스 정보를 불러오는 중 서버 에러가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버 실행 중: http://localhost:${PORT}`);
});