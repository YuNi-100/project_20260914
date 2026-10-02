const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const xml2js = require('xml2js');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));


// ========================================
// 공공데이터포털 서울 버스 API 인증키
// ========================================

const SERVICE_KEY = process.env.SEOUL_BUS_API_KEY;


// ========================================
// 메인 페이지
// ========================================

app.get('/', (req, res) => {

  res.sendFile(
    path.join(__dirname, 'public', 'index.html')
  );

});


// ========================================
// 서울 버스 실시간 도착정보
//
// 사용:
// /api/bus?busRouteId=100100118
// ========================================

app.get('/api/bus', async (req, res) => {

  const { busRouteId, arsId, stId } = req.query;


  // --------------------------------------
  // busRouteId 검사
  // --------------------------------------

  if (!busRouteId) {

    return res.status(400).json({

      success: false,

      error:
        'busRouteId가 필요합니다.'

    });

  }


  try {

    console.log('');
    console.log('=================================');
    console.log('🚌 서울 버스 도착정보 조회');
    console.log('=================================');

    console.log('busRouteId:', busRouteId);

    if (arsId) {
      console.log('ARS-ID:', arsId);
    }

    if (stId) {
      console.log('정류소 ID:', stId);
    }


    // ========================================
    // 서울 버스 도착정보 API
    // ========================================

    const targetUrl =
      'http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRouteAll';


    // --------------------------------------
    // API 요청
    // --------------------------------------

    const response = await axios.get(targetUrl, {

      params: {

        serviceKey: SERVICE_KEY,

        busRouteId: busRouteId

      },

      responseType: 'text',

      timeout: 10000

    });


    console.log('✅ 서울 버스 API 응답 수신');


    // ========================================
    // XML → JavaScript Object
    // ========================================

    const parsed = await xml2js.parseStringPromise(
      response.data,
      {
        explicitArray: false,
        trim: true
      }
    );


    // 디버깅용
    console.log(
      JSON.stringify(parsed, null, 2)
    );


    // ========================================
    // ServiceResult 확인
    // ========================================

    const serviceResult =
      parsed?.ServiceResult;


    if (!serviceResult) {

      console.log(
        '❌ ServiceResult가 없습니다.'
      );

      return res.status(502).json({

        success: false,

        items: [],

        error:
          '서울 버스 API 응답 형식을 확인할 수 없습니다.'

      });

    }


    // ========================================
    // API 결과 코드 확인
    // ========================================

    const header =
      serviceResult.msgHeader;


    const headerCd =
      String(header?.headerCd ?? '');


    const headerMsg =
      header?.headerMsg ||
      '응답 메시지가 없습니다.';


    console.log(
      'API 결과:',
      headerCd,
      headerMsg
    );


    if (headerCd !== '0') {

      return res.status(502).json({

        success: false,

        items: [],

        error: headerMsg

      });

    }


    // ========================================
    // 실제 버스 데이터
    // ========================================

    let items =
      serviceResult?.msgBody?.itemList;


    if (!items) {

      console.log(
        '⚠️ 도착정보가 없습니다.'
      );

      return res.json({

        success: true,

        items: [],

        message:
          '현재 도착 예정 버스가 없습니다.'

      });

    }


    // itemList가 하나면 객체,
    // 여러 개면 배열로 들어오기 때문에 통일
    if (!Array.isArray(items)) {

      items = [items];

    }


    console.log(
      `📦 API 데이터: ${items.length}건`
    );


    // ========================================
    // 정류소 필터링
    // ========================================

    if (arsId) {

      items = items.filter(bus =>

        String(bus.arsId) ===
        String(arsId)

      );

    }


    if (stId) {

      items = items.filter(bus =>

        String(bus.stId) ===
        String(stId)

      );

    }


    console.log(
      `📍 정류소 필터 후: ${items.length}건`
    );


    // ========================================
    // 필요한 데이터만 정리
    // ========================================

    const result = items.map(bus => ({

      rtNm:
        bus.rtNm ||
        bus.busRouteAbrv ||
        '',

      busRouteId:
        bus.busRouteId || '',

      arsId:
        bus.arsId || '',

      stId:
        bus.stId || '',

      stNm:
        bus.stNm || '',

      arrmsg1:
        bus.arrmsg1 ||
        '도착 정보 없음',

      arrmsg2:
        bus.arrmsg2 ||
        '다음 버스 정보 없음',

      stationNm1:
        bus.stationNm1 || '',

      stationNm2:
        bus.stationNm2 || '',

      traTime1:
        bus.traTime1 || '',

      traTime2:
        bus.traTime2 || ''

    }));


    // ========================================
    // JSON으로 프론트에 전달
    // ========================================

    return res.json({

      success: true,

      count: result.length,

      items: result

    });


  } catch (error) {

    console.error('');
    console.error(
      '❌ 서울 버스 API 호출 실패'
    );

    console.error(
      error.response?.data ||
      error.message
    );


    return res.status(500).json({

      success: false,

      items: [],

      error:
        '서울시 버스 도착정보를 불러오지 못했습니다.'

    });

  }

});


// ========================================
// 서버 시작
// ========================================

app.listen(PORT, () => {

  console.log('');
  console.log(
    `🚀 서버 실행 중: http://localhost:${PORT}`
  );
  console.log('');

});