require('dotenv').config();
const express = require('express');
const path = require('path');

/* =========================================================================
   [MySQL 연동 추가 1] mysql2 모듈 불러오기 및 데이터베이스 커넥션 풀 설정
   ========================================================================= */
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',          // 본인 MySQL 계정명
  password: process.env.DB_PASSWORD || '1234',   // 본인 MySQL 비밀번호
  database: process.env.DB_NAME || 'weather_db', // 1단계에서 생성한 DB 이름
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 서울, 부산, 제주, 광주 좌표 및 쿼리 매핑
const TARGET_CITIES = {
  seoul: { query: 'Seoul,KR', name: '서울' },
  busan: { query: 'Busan,KR', name: '부산' },
  jeju: { query: 'Jeju,KR', name: '제주' },
  gwangju: { query: 'Gwangju,KR', name: '광주' }
};

// 공통 날씨 데이터 포맷터
function formatWeatherData(cityNameKorean, data) {
  return {
    regionName: cityNameKorean,
    cityName: data.name,
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    description: data.weather[0]?.description || '정보 없음',
    icon: data.weather[0]?.icon || '01d'
  };
}

/* =========================================================================
   [방식 1] 순수 Promise (.then / .catch) 기반 단일 조회 라우트
   ========================================================================= */
app.get('/api/weather/promise', (req, res) => {
  const cityKey = (req.query.city || 'seoul').toLowerCase();
  const cityInfo = TARGET_CITIES[cityKey] || TARGET_CITIES.seoul;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return res.status(500).json({
      success: false,
      error: '.env 파일에 올바른 OPENWEATHER_API_KEY를 설정하세요.'
    });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityInfo.query}&appid=${apiKey}&units=metric&lang=kr`;

  // fetch()가 반환하는 Promise 객체에 .then()을 체이닝
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`OpenWeather 응답 에러 (HTTP 상태: ${response.status})`);
      }
      return response.json(); // 본문 파싱 Promise 반환
    })
    .then((data) => {
      const formatted = formatWeatherData(cityInfo.name, data);

      /* =========================================================================
         [MySQL 연동 추가 2] Promise 방식에서 날씨 조회 내역 DB(INSERT) 저장
         ========================================================================= */
      const userId = req.query.userId || 1; // 기본 사용자 ID 1
      const insertQuery = `INSERT INTO weather_logs (user_id, city, temp, humidity) VALUES (?, ?, ?, ?)`;
      
      pool.execute(insertQuery, [userId, formatted.regionName, formatted.temperature, formatted.humidity])
        .then(() => {
          console.log(`✅ [DB 저장 완료 - Promise] 도시: ${formatted.regionName}, 기온: ${formatted.temperature}℃`);
        })
        .catch((dbErr) => {
          console.error(`❌ [DB 저장 실패 - Promise]:`, dbErr.message);
        });

      res.json({
        success: true,
        pattern: 'Promise (.then)',
        data: formatted
      });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        error: error.message
      });
    });
});

/* =========================================================================
   [방식 2] async / await 기반 단일 조회 라우트
   ========================================================================= */
app.get('/api/weather/async', async (req, res) => {
  const cityKey = (req.query.city || 'seoul').toLowerCase();
  const cityInfo = TARGET_CITIES[cityKey] || TARGET_CITIES.seoul;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return res.status(500).json({
      success: false,
      error: '.env 파일에 올바른 OPENWEATHER_API_KEY를 설정하세요.'
    });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityInfo.query}&appid=${apiKey}&units=metric&lang=kr`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenWeather 응답 에러 (HTTP 상태: ${response.status})`);
    }

    const data = await response.json();
    const formatted = formatWeatherData(cityInfo.name, data);

    /* =========================================================================
       [MySQL 연동 추가 3] async/await 방식에서 날씨 조회 내역 DB(INSERT) 저장
       ========================================================================= */
    const userId = req.query.userId || 1;
    const insertQuery = `INSERT INTO weather_logs (user_id, city, temp, humidity) VALUES (?, ?, ?, ?)`;
    await pool.execute(insertQuery, [userId, formatted.regionName, formatted.temperature, formatted.humidity]);
    console.log(`✅ [DB 저장 완료 - async/await] 도시: ${formatted.regionName}, 기온: ${formatted.temperature}℃`);

    return res.json({
      success: true,
      pattern: 'async / await',
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* =========================================================================
   [방식 3] Promise.all 기반 4개 도시 일괄 병렬 조회 라우트
   ========================================================================= */
app.get('/api/weather/all', async (req, res) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return res.status(500).json({
      success: false,
      error: '.env 파일에 올바른 OPENWEATHER_API_KEY를 설정하세요.'
    });
  }

  const startTime = Date.now();
  const cityKeys = Object.keys(TARGET_CITIES);

  try {
    // 4개 도시의 fetch 요청 Promise 배열 생성
    const fetchPromises = cityKeys.map((key) => {
      const city = TARGET_CITIES[key];
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city.query}&appid=${apiKey}&units=metric&lang=kr`;
      return fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error(`${city.name} 요청 실패 (${r.status})`);
          return r.json();
        })
        .then((data) => formatWeatherData(city.name, data));
    });

    // 4개 요청을 병렬로 동시에 대기
    const results = await Promise.all(fetchPromises);
    const duration = Date.now() - startTime;

    /* =========================================================================
       [MySQL 연동 추가 4] Promise.all 방식에서 4개 도시 결과 일괄 DB(INSERT) 저장
       ========================================================================= */
    const userId = req.query.userId || 1;
    const insertQuery = `INSERT INTO weather_logs (user_id, city, temp, humidity) VALUES (?, ?, ?, ?)`;
    
    for (const item of results) {
      await pool.execute(insertQuery, [userId, item.regionName, item.temperature, item.humidity]);
    }
    console.log(`✅ [DB 저장 완료 - Promise.all] 4개 도시 일괄 저장 성공`);

    return res.json({
      success: true,
      durationMs: duration,
      data: results
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* =========================================================================
   [MySQL 연동 추가 5] JOIN 활용 API: 사용자 정보와 날씨 조회 기록 함께 가져오기
   ========================================================================= */
app.get('/api/users/history', async (req, res) => {
  try {
    const joinQuery = `
      SELECT 
        u.id AS user_id,
        u.name AS user_name,
        w.city,
        w.temp,
        w.humidity,
        w.created_at AS searched_at
      FROM users u
      JOIN weather_logs w ON u.id = w.user_id
      ORDER BY w.created_at DESC;
    `;
    const [rows] = await pool.query(joinQuery);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ JOIN 쿼리 에러:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================================================================
   [MySQL 연동 추가 6] GROUP BY 활용 API: 도시별 평균 기온 및 조회 횟수 집계
   ========================================================================= */
app.get('/api/weather/stats', async (req, res) => {
  try {
    const groupByQuery = `
      SELECT 
        city,
        COUNT(id) AS total_searches,
        ROUND(AVG(temp), 1) AS avg_temperature,
        ROUND(AVG(humidity), 1) AS avg_humidity
      FROM weather_logs
      GROUP BY city;
    `;
    const [rows] = await pool.query(groupByQuery);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ GROUP BY 쿼리 에러:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  OpenWeather + MySQL Node.js 서버 실행 완료`);
  console.log(`  주소: http://localhost:${PORT}`);
  console.log(`====================================================`);
});