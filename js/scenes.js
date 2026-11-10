/* =====================================================================
   게임 내용은 이 파일에서만 작성하세요. (아래는 예시이니 자유롭게 지우고 바꾸세요)

   [장면(SCENES) 한 칸 작성법]
   장면이름: {
     bg:    'classroom',          // 배경 (BACKGROUNDS 의 이름). 안 적으면 이전 배경 유지
     show:  'heroine',            // 화면에 띄울 캐릭터 (CHARACTERS 의 이름). null 이면 숨김, 안 적으면 유지
     steps: [                     // 대사를 위에서 아래로 한 줄씩 보여줌
       { text: '해설 문장' },                          // 말하는 사람 없음(해설)
       { who: 'heroine', text: '대사' },               // 이름표가 붙는 대사
       { who: 'heroine', face: 'smile', text: '..' },  // 표정 바꾸기 (CHARACTERS.faces 에 등록 필요)
       { bg: 'rooftop', text: '..' },                  // 이 줄부터 배경 바꾸기
     ],
     // 대사가 끝난 뒤 이어지는 것: 아래 셋 중 하나
     choices: [ { text: '선택지', affection: +5, next: '다음장면' } ],  // 선택지 (affection: 호감도 증감)
     next: '다음장면',             // 선택지 없이 바로 이동. 함수도 가능: function (s) { return s.affection >= 5 ? 'a' : 'b'; }
     ending: '엔딩 제목',          // 게임 종료 화면
   }

   [선택지 옵션]  text(필수) / next(필수) / affection / flags: { 이름: true } / if: function (s) { return s.affection >= 3; }
   [상태 s]       s.affection(호감도), s.flags(체크해둔 값들)
   ===================================================================== */

var START_SCENE = 'intro';       // 새 게임을 누르면 처음 시작하는 장면

var BACKGROUNDS = {              // 이름: '이미지 경로'  (파일이 없으면 기본 배경색으로 보입니다)
  classroom: 'assets/backgrounds/classroom.png',
  park:   'assets/backgrounds/park.png',
  cafeteria:    'assets/backgrounds/street.jpg',
  cafe:      'assets/backgrounds/cafe.jpg',
  room:      'assets/backgrounds/room.jpg'
};

var CHARACTERS = {
  M: {
    name: '미나',                 // 이름표에 표시될 이름
    image: 'assets/m_normal.png',
    faces: {}                    // 표정 추가 예: smile: 'assets/character_smile.png'
  } ,
    J: {
      name: '지혜',
      image: 'assets/j_normal.png'
    },
    
    A: {
        name: '학생 A',                 // 이름표에 표시될 이름
            image: null,
                faces: { }                    // 표정 추가 예: smile: 'assets/character_smile.png'
    } ,
};
var SCENES = {
  intro: {
    bg: 'classroom',
    show: null,
    steps: [
      { text: '드디어 고등학교에 입학하게 되었어.. 어떤 인연들을 만나게 될까?' }
    ],
    next: 'school'
  },

  school: {
    show: 'M',
    steps: [
      { who: 'M', text: '어? {name:아}~ 오랜만이야~ 우리 같은 반이었구나~!' },
      { who: 'M', text: '그나저나 나 할 말이 있는데...' },
      { who: 'A', text: '{name}! 밖에서 누가 너 불러.' }
    ],
    next: 'talk'
  },

  talk: {
    bg: 'park',
    show: 'J',
    steps: [
      { who: 'J', text: '...그래, 인사는 받아줄게.' }
    ],
    next: 'ending_normal'
  },

  silence: {
    bg: 'park',
    steps: [
      { who: 'J', text: '...용건 없으면 가볼게.' }
    ],
    next: 'ending_normal'
  },

  ending_good:   { bg: 'cafe', steps: [{ who: 'J', text: '(좋은 엔딩 대사)' }], ending: '좋은 엔딩' },
  ending_normal: { bg: 'room', steps: [{ who: 'J', text: '(보통 엔딩 대사)' }], ending: '보통 엔딩' }
};
