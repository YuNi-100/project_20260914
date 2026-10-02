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
// 공공데이터포털 인증키
// ========================================

const SERVICE_KEY = process.env.SEOUL_BUS_API_KEY;

console.log(
  '🔑 SERVICE_KEY 로드:',
  SERVICE_KEY ? '성공' : '실패'
);


// ========================================
// 메인 페이지
// ========================================

app.get('/', (req, res) => {

  res.sendFile(
    path.join(__dirname, 'public', 'index.html')
  );

});


// ========================================
// 정류소별 실시간 버스 도착정보
//
// 사용 예:
// /api/bus?arsId=12121
// ========================================

app.get('/api/bus', async (req, res) => {

  const { arsId } = req.query;


  if (!arsId) {

    return res.status(400).json({
      success: false,
      items: [],
      error: 'arsId가 필요합니다.'
    });

  }


  if (!SERVICE_KEY) {

    return res.status(500).json({
      success: false,
      items: [],
      error: '.env에서 인증키를 불러오지 못했습니다.'
    });

  }


  try {

    console.log('');
    console.log('================================');
    console.log('🚌 정류소 실시간 버스 도착정보');
    console.log('================================');
    console.log('ARS-ID:', arsId);


    // ========================================
    // 서울 버스 정류소정보 API
    // ========================================

    const targetUrl =
      'http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid';


    // ========================================
    // API 요청
    // ========================================

    const response = await axios.get(targetUrl, {

      params: {

        serviceKey: SERVICE_KEY,

        arsId: arsId

      },

      responseType: 'text',

      timeout: 10000

    });


    console.log('✅ 서울 버스 API 응답 수신');


    // ========================================
    // XML → JavaScript Object
    // ========================================

    const parsed =
      await xml2js.parseStringPromise(
        response.data,
        {
          explicitArray: false,
          trim: true
        }
      );


    // ========================================
    // ServiceResult
    // ========================================

    const serviceResult =
      parsed?.ServiceResult;


    if (!serviceResult) {

      console.log('❌ ServiceResult 없음');

      return res.status(502).json({

        success: false,

        items: [],

        error:
          '서울 버스 API 응답 형식을 확인할 수 없습니다.'

      });

    }


    // ========================================
    // API 상태 확인
    // ========================================

    const header =
      serviceResult.msgHeader;


    const headerCd =
      String(header?.headerCd ?? '');


    const headerMsg =
      header?.headerMsg ||
      '응답 메시지 없음';


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
    // 버스 도착정보
    // ========================================

    let items =
      serviceResult?.msgBody?.itemList;


    if (!items) {

      console.log(
        '⚠️ 현재 버스 도착정보 없음'
      );

      return res.json({

        success: true,

        count: 0,

        items: [],

        message:
          '현재 도착 예정인 버스가 없습니다.'

      });

    }


    // 버스 한 대만 있을 경우에도
    // 항상 배열로 통일
    if (!Array.isArray(items)) {

      items = [items];

    }


    console.log(
      `📦 도착정보: ${items.length}건`
    );


    // ========================================
    // 프론트에서 필요한 데이터만 정리
    // ========================================

    const result = items.map(bus => ({

      // 버스 번호
      rtNm:
        bus.rtNm ||
        bus.busRouteAbrv ||
        '버스',

      // 노선 ID
      busRouteId:
        bus.busRouteId || '',

      // 정류소
      arsId:
        bus.arsId || '',

      stId:
        bus.stId || '',

      stNm:
        bus.stNm || '',


      // 운행 방향
      direction:
        bus.adirection || '',


      // 첫 번째 버스
      arrmsg1:
        bus.arrmsg1 ||
        '도착 정보 없음',


      // 두 번째 버스
      arrmsg2:
        bus.arrmsg2 ||
        '다음 버스 정보 없음',


      // 현재 첫 번째 버스 위치
      stationNm1:
        bus.stationNm1 || '',


      // 현재 두 번째 버스 위치
      stationNm2:
        bus.stationNm2 || '',


      // 예상 소요시간(초)
      traTime1:
        bus.traTime1 || '',

      traTime2:
        bus.traTime2 || '',


      // 첫차 / 막차
      firstTm:
        bus.firstTm || '',

      lastTm:
        bus.lastTm || ''

    }));


    console.log(
      `✅ 프론트엔드 전달: ${result.length}건`
    );


    // ========================================
    // JSON 응답
    // ========================================

    return res.json({

      success: true,

      count: result.length,

      station: result[0]?.stNm || '',

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