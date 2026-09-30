const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

// 국토교통부 일반 인증키
const RAW_KEY = '34db26780fd8bc7e84db2713f0a61a9ce4b77da820d107f0929b57a874f30bcd';

app.get('/api/bus', async (req, res) => {
  const { cityCode, nodeId } = req.query;

  try {
    // 키 이중 인코딩 방지를 위해 decode 후 encodeURIComponent 적용
    const serviceKey = encodeURIComponent(decodeURIComponent(RAW_KEY));
    const targetUrl = `http://apis.data.go.kr/1613000/ArvlInfoInqireService/getSttnAcctoArvlPreLst?serviceKey=${serviceKey}&cityCode=${cityCode}&nodeId=${nodeId}&_type=json`;

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
  console.log(`🚀 백엔드 서버 실행 중: http://localhost:${PORT}`);
});