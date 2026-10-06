# 🚌 서울시 실시간 버스 도착 정보 조회

서울시 버스 정류장의 **실시간 버스 도착 정보**를 조회하는 Node.js 기반 웹 프로젝트입니다.

사용자가 화면에서 정류소를 선택하면 프론트엔드가 Express 백엔드의 `/api/bus` API로 요청을 보내고, 백엔드는 서울 버스 API에서 XML 데이터를 받아 JSON 형태로 변환하여 화면에 표시합니다.

---

## 1. 프로젝트 주요 기능

- 서울시 버스 정류소 선택
- 정류소의 ARS-ID를 이용한 실시간 도착 정보 조회
- 첫 번째 버스 도착 예정 정보 표시
- 다음 버스 도착 예정 정보 표시
- 조회 과정 및 오류 메시지 로그 출력
- XML API 응답을 JavaScript 객체로 변환
- API 인증키를 `.env` 환경변수로 관리

---

## 2. 사용 기술

### Frontend

- HTML5
- JavaScript
- Bootstrap 5.3

### Backend

- Node.js
- Express
- Axios
- xml2js
- cors
- dotenv

### Open API

- 서울시 버스 정류소별 실시간 도착정보 API
- 요청 주소: `http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid`

---

## 3. 프로젝트 구조

```text
bus_/
├── public/
│   ├── index.html       # 메인 화면
│   └── bus.js           # 버스 조회 및 화면 출력
│
├── server.js            # Express 서버 및 서울 버스 API 호출
├── package.json         # 프로젝트 정보 및 패키지 목록
├── package-lock.json
├── .env                 # API 인증키 저장
├── .gitignore           # Git 제외 파일 설정
└── README.md
```

> `node_modules/` 폴더는 `npm install` 명령으로 다시 생성할 수 있으므로 GitHub에 업로드하지 않습니다.

---

## 4. 설치 방법

### ① Node.js 설치

먼저 Node.js가 설치되어 있어야 합니다.

터미널에서 다음 명령으로 확인할 수 있습니다.

```bash
node -v
npm -v
```

### ② 프로젝트 폴더 열기

VSCode에서 프로젝트의 `bus_` 폴더를 **Open Folder**로 엽니다.

### ③ 필요한 패키지 설치

VSCode 터미널에서 다음 명령을 실행합니다.

```bash
npm install
```

현재 프로젝트에서 사용하는 주요 패키지는 다음과 같습니다.

```text
axios
cors
dotenv
express
xml2js
```

---

## 5. 환경변수 설정

프로젝트 최상위 폴더에 `.env` 파일을 만들고 서울 버스 API 인증키를 입력합니다.

```env
SEOUL_BUS_API_KEY=본인의_공공데이터포털_인증키
```

`server.js`에서는 다음 코드로 인증키를 불러옵니다.

```javascript
const SERVICE_KEY = process.env.SEOUL_BUS_API_KEY;
```

### 주의

`.env` 파일에는 실제 인증키가 들어 있으므로 GitHub 등에 공개하면 안 됩니다.

현재 `.gitignore`에는 다음 항목이 설정되어 있습니다.

```gitignore
node_modules/
.env
```

따라서 `.env`와 `node_modules`는 Git에 포함되지 않습니다.

---

## 6. 서버 실행 방법

현재 프로젝트는 `server.js`를 직접 실행하는 방식입니다.

VSCode 터미널에서 다음 명령을 실행합니다.

```bash
node server.js
```

정상적으로 실행되면 터미널에 다음과 비슷한 메시지가 표시됩니다.

```text
🔑 SERVICE_KEY 로드: 성공
🚀 서버 실행 중: http://localhost:3000
```

브라우저에서 다음 주소로 접속합니다.

```text
http://localhost:3000
```

---

## 7. 사용 방법

1. 서버를 실행합니다.
2. 브라우저에서 `http://localhost:3000`에 접속합니다.
3. 조회할 버스 정류소를 선택합니다.
4. **실시간 버스 도착 정보 조회하기** 버튼을 누릅니다.
5. 해당 정류소의 버스 번호와 도착 예정 정보를 확인합니다.
6. 화면 아래의 실행 로그에서 요청 및 응답 상태를 확인할 수 있습니다.

---

## 8. 등록된 정류소

현재 `public/index.html`에는 다음 정류소가 등록되어 있습니다.

| ARS-ID | 정류소 |
|---|---|
| `02006` | 서울역버스환승센터(중) |
| `12217` | 시립서북병원.세현교회앞 |
| `12119` | 연신내역 4번출구 |
| `12106` | 연신내역 3번출구 |
| `12018` | 연신내역.연서시장(중) |

정류소를 추가하려면 `public/index.html`의 `<select>` 영역에 새로운 `<option>`을 추가하면 됩니다.

예시:

```html
<option value="ARS-ID">정류소 이름</option>
```

---

## 9. API 동작 구조

전체 데이터 흐름은 다음과 같습니다.

```text
사용자
  ↓
index.html
  ↓
bus.js
  ↓
GET /api/bus?arsId=정류소ID
  ↓
server.js
  ↓
서울 버스 API
  ↓
XML 응답
  ↓
xml2js로 JavaScript Object 변환
  ↓
필요한 데이터만 JSON으로 정리
  ↓
bus.js
  ↓
브라우저 화면에 버스 도착 정보 출력
```

---

## 10. 백엔드 API

### 버스 도착 정보 조회

```http
GET /api/bus?arsId=12121
```

`arsId`는 서울 버스 정류장의 ARS-ID입니다.

성공 시 응답 예시는 다음과 같습니다.

```json
{
  "success": true,
  "count": 2,
  "station": "정류소명",
  "items": [
    {
      "rtNm": "7211",
      "busRouteId": "100100344",
      "arsId": "12121",
      "stId": "",
      "stNm": "정류소명",
      "direction": "신설동",
      "arrmsg1": "10분후[3번째 전]",
      "arrmsg2": "21분후[10번째 전]",
      "stationNm1": "",
      "stationNm2": "",
      "traTime1": "",
      "traTime2": "",
      "firstTm": "",
      "lastTm": ""
    }
  ]
}
```

---

## 11. 주요 파일 설명

### `server.js`

프로젝트의 백엔드 서버입니다.

주요 역할:

- Express 서버 실행
- `public` 폴더 정적 파일 제공
- `.env`에서 API 인증키 로드
- `/api/bus` 엔드포인트 제공
- 서울 버스 API 호출
- XML 응답 파싱
- 필요한 버스 정보만 JSON으로 프론트엔드에 전달

### `public/index.html`

사용자가 보는 메인 화면입니다.

주요 역할:

- 정류소 선택
- 조회 버튼 제공
- 버스 도착 결과 영역 제공
- 실행 로그 영역 제공
- Bootstrap을 이용한 화면 디자인

### `public/bus.js`

프론트엔드 JavaScript 파일입니다.

주요 역할:

- 선택한 정류소의 ARS-ID 확인
- `/api/bus`로 요청 전송
- 서버에서 받은 JSON 데이터 처리
- 버스 번호 및 도착 예정 정보 출력
- 오류 및 실행 로그 표시

---

## 12. 오류 확인

### `.env에서 인증키를 불러오지 못했습니다.`

`.env` 파일에 다음 값이 있는지 확인합니다.

```env
SEOUL_BUS_API_KEY=본인의_API_KEY
```

변수명이 `server.js`의 아래 코드와 정확하게 같아야 합니다.

```javascript
process.env.SEOUL_BUS_API_KEY
```

`.env`를 수정했다면 실행 중인 서버를 종료한 뒤 다시 실행합니다.

```bash
Ctrl + C
node server.js
```

### `arsId가 필요합니다.`

API 요청 주소에 `arsId`가 없는 경우입니다.

올바른 예:

```text
/api/bus?arsId=12121
```

### 버스 정보가 표시되지 않는 경우

해당 시간에 도착 예정 버스가 없거나 API에서 도착 데이터를 제공하지 않는 경우 빈 목록이 반환될 수 있습니다.

---

## 13. 배포 시 주의사항

로컬에서는 `.env` 파일을 사용하지만, Vercel 등의 배포 서비스에서는 `.env` 파일을 직접 업로드하는 대신 배포 서비스의 **Environment Variables** 설정에 인증키를 등록해야 합니다.

환경변수 이름은 다음과 같이 동일하게 설정합니다.

```text
SEOUL_BUS_API_KEY
```

값에는 실제 서울 버스 API 인증키를 입력합니다.

> 현재 `server.js`는 일반적인 Express 서버에서 `app.listen()`으로 실행하도록 작성되어 있습니다. 서버리스 플랫폼에 배포할 경우 플랫폼 환경에 맞는 추가 설정이나 코드 구조 변경이 필요할 수 있습니다.

---

## 14. 실행 요약

```bash
# 1. 프로젝트 폴더 이동
cd bus_

# 2. 패키지 설치
npm install

# 3. .env 설정
SEOUL_BUS_API_KEY=본인의_API_KEY

# 4. 서버 실행
node server.js

# 5. 브라우저 접속
http://localhost:3000
```

---

## 프로젝트 목적

서울시 실시간 버스 도착정보 Open API를 활용하여 **외부 API 호출 → XML 데이터 변환 → Express 백엔드 처리 → JSON 응답 → 프론트엔드 화면 출력**의 전체 흐름을 학습하기 위한 프로젝트입니다.
