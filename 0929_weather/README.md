# 🌤️ OpenWeather 날씨 조회 + MySQL 연동 프로젝트

OpenWeather API를 이용하여 현재 날씨 정보를 조회하고,  
Node.js + Express 서버를 통해 MySQL 데이터베이스에 날씨 조회 기록을 저장하는 프로젝트입니다.

---

## 📌 프로젝트 주요 기능

- OpenWeather API를 이용한 현재 날씨 조회
- Node.js + Express 기반 백엔드 서버
- MySQL 데이터베이스 연동
- 날씨 조회 기록 자동 저장
- 사용자별 날씨 조회 기록 확인
- `.env`를 이용한 API Key 및 DB 접속정보 관리

---

## 🛠 사용 기술

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express

### Database
- MySQL

### API
- OpenWeather API

### Node.js Packages
- express
- mysql2
- dotenv

---

## 📁 프로젝트 구조

```text
0929_weather/
│
├── node_modules/
│
├── public/
│   └── 웹페이지 관련 파일
│
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── requirements.txt
└── server.js
└── README.md
```

---

# 1. MySQL 데이터베이스 생성

MySQL Workbench를 실행하고 새로운 SQL 탭에서 아래 SQL을 실행합니다.

```sql
CREATE DATABASE weather_db;

USE weather_db;
```

데이터베이스가 생성되었는지 확인합니다.

```sql
SHOW DATABASES;
```

목록에 아래 데이터베이스가 나타나면 정상입니다.

```text
weather_db
```

---

# 2. users 테이블 생성

사용자 정보를 저장하기 위한 `users` 테이블을 생성합니다.

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);
```

테스트 사용자를 추가합니다.

```sql
INSERT INTO users (name)
VALUES ('사용자1');
```

사용자 데이터를 확인합니다.

```sql
SELECT * FROM users;
```

예상 결과:

```text
id | name
---|--------
1  | 사용자1
```

---

# 3. weather_logs 테이블 생성

날씨 조회 기록을 저장하는 테이블입니다.

```sql
CREATE TABLE weather_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    city VARCHAR(50) NOT NULL,
    temp DECIMAL(5,2),
    humidity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
);
```

테이블이 정상적으로 생성되었는지 확인합니다.

```sql
SHOW TABLES;
```

정상적으로 생성되었다면 다음 두 테이블이 표시됩니다.

```text
users
weather_logs
```

---

# 4. 테이블 구조 확인

```sql
DESC users;
```

```sql
DESC weather_logs;
```

---

# 5. 환경변수 설정

프로젝트 최상위 폴더에 `.env` 파일을 생성합니다.

```text
0929_weather/
│
├── public/
├── server.js
├── package.json
└── .env
```

`.env` 파일에 OpenWeather API와 MySQL 접속정보를 작성합니다.

```env
OPENWEATHER_API_KEY=본인의_OpenWeather_API_KEY

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=본인의_MySQL_비밀번호
DB_NAME=weather_db
DB_PORT=3306
```

> ⚠️ `.env` 파일에는 API Key와 데이터베이스 비밀번호가 들어 있으므로 GitHub 등에 공개하지 않는 것이 좋습니다.

---

# 6. Node.js 패키지 설치

VSCode 터미널에서 프로젝트 폴더로 이동한 후 필요한 패키지를 설치합니다.

```bash
npm install
```

필요한 패키지를 개별적으로 설치할 경우:

```bash
npm install express mysql2 dotenv
```

---

# 7. MySQL 연결 설정

`server.js`에서 `mysql2/promise`를 사용하여 MySQL Connection Pool을 생성합니다.

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'weather_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10
});
```

---

# 8. 날씨 데이터 저장

OpenWeather API에서 날씨 정보를 조회하면 일부 데이터를 `weather_logs` 테이블에 저장합니다.

```javascript
INSERT INTO weather_logs
(user_id, city, temp, humidity)
VALUES (?, ?, ?, ?)
```

저장되는 정보는 다음과 같습니다.

| 컬럼 | 내용 |
|---|---|
| id | 조회 기록 번호 |
| user_id | 사용자 번호 |
| city | 조회 지역 |
| temp | 현재 기온 |
| humidity | 습도 |
| created_at | 조회 시간 |

예를 들어 서울 날씨를 조회하면 다음과 같은 데이터가 저장될 수 있습니다.

```text
1 | 1 | 서울 | 19.76 | 42 | 2026-10-03 17:00:00
```

---

# 9. 서버 실행

VSCode 터미널에서 다음 명령어를 실행합니다.

```bash
node server.js
```

정상적으로 실행되면 서버 실행 메시지가 나타납니다.

예:

```text
서버 실행 중: http://localhost:3000
```

브라우저에서 다음 주소로 접속합니다.

```text
http://localhost:3000
```

---

# 10. MySQL 데이터 저장 확인

웹페이지에서 날씨를 조회한 후 MySQL Workbench에서 다음 SQL을 실행합니다.

```sql
USE weather_db;

SELECT * FROM weather_logs;
```

날씨 조회 기록이 표시되면

```text
OpenWeather
      ↓
Node.js / Express
      ↓
MySQL
```

연동이 정상적으로 완료된 것입니다.

---

# 🔄 전체 데이터 흐름

```text
사용자
  ↓
웹페이지
  ↓
JavaScript
  ↓
Node.js / Express
  ↓
OpenWeather API
  ↓
날씨 데이터 반환
  ↓
Node.js
  ├── 웹페이지에 날씨 전달
  │
  └── MySQL에 조회 기록 저장
            ↓
       weather_logs
```

---

# 📊 데이터베이스 구조

```text
users
────────────────
id (PK)
name
      │
      │ 1 : N
      ▼
weather_logs
────────────────
id (PK)
user_id (FK)
city
temp
humidity
created_at
```

`users.id`와 `weather_logs.user_id`가 Foreign Key로 연결되어 있습니다.

한 명의 사용자가 여러 번 날씨를 조회할 수 있으므로 **1:N 관계**입니다.

---

# ⚠️ 주의사항

### MySQL 서버 실행

프로젝트를 실행하기 전에 로컬 MySQL Server가 실행 중이어야 합니다.

### API Key

OpenWeather API Key는 `.env`에서 관리합니다.

### DB 비밀번호

`.env`의 `DB_PASSWORD`는 본인이 MySQL 설치 시 설정한 `root` 비밀번호와 일치해야 합니다.

### .gitignore

GitHub에 프로젝트를 올릴 경우 `.gitignore` 파일을 만들고 다음 내용을 추가하는 것을 권장합니다.

```gitignore
node_modules/
.env
```

API Key와 MySQL 비밀번호가 GitHub에 공개되는 것을 방지할 수 있습니다.

---

# ✅ 실행 순서 요약

```text
1. MySQL Server 실행

        ↓

2. weather_db 생성

        ↓

3. users 테이블 생성

        ↓

4. weather_logs 테이블 생성

        ↓

5. .env 설정

        ↓

6. VSCode 터미널 실행

        ↓

7. npm install

        ↓

8. node server.js

        ↓

9. 웹페이지에서 날씨 조회

        ↓

10. SELECT * FROM weather_logs;

        ↓

11. MySQL 저장 확인
```

## 프로젝트 목적

OpenWeather API를 활용하여 외부 API 데이터를 가져오는 방법을 학습하고, Node.js와 Express를 통해 API 데이터를 처리한 뒤 MySQL 데이터베이스에 저장하는 전체적인 웹 애플리케이션 데이터 처리 과정을 구현하는 것을 목적으로 합니다.