const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());

// 1. public 폴더 내 정적 파일(index.html, bus.js 등) 제공
app.use(express.static(path.join(__dirname, 'public')));

// 국토교통부 일반 인증키
const API_KEY = '34db26780fd8bc7e84db2713f0a61a9ce4b77da820d107f0929b57a874f30bcd';

// 2. http://localhost:3000 접속 시 public/index.html 파일 전송
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 3. 버스 정보 API
app.get('/api/bus', async (req, res) => {
  const { cityCode, nodeId } = req.query;

  if (!cityCode || !nodeId) {
    return res.status(400).json({ error: 'cityCode와 nodeId 파라미터가 필요합니다.' });
  }

  try {
    const serviceKey = encodeURIComponent(API_KEY);
    const baseUrl = 'http://apis.data.go.kr/1613000/ArvlInfoInqireService/getSttnAcctoArvlPrearngeInfoList';
    const targetUrl = `${baseUrl}?serviceKey=${serviceKey}&cityCode=${cityCode}&nodeId=${nodeId}&_type=json`;

    console.log(`📡 [API 요청]: ${targetUrl}`);

    const response = await axios.get(targetUrl);
    res.json(response.data);
  } catch (error) {
    console.error('❌ 백엔드 API 호출 에러:');
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('에러 메시지:', error.message);
    }

    res.status(500).json({ error: '버스 정보를 불러오는 중 서버 에러가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Node 기반 서버 실행 중: http://localhost:${PORT}`);
});