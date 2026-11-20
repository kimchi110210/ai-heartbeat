/* =====================================================================
   게임 내용은 이 파일에서만 작성하세요.

   [장면(SCENES) 한 칸 작성법]
   장면이름: {
     bg:    'classroom',          // 배경 (BACKGROUNDS 의 이름). 안 적으면 이전 배경 유지
     show:  'M',                  // 화면에 띄울 캐릭터 (CHARACTERS 의 이름). null 이면 숨김, 안 적으면 유지
     steps: [                     // 대사를 위에서 아래로 한 줄씩 보여줌
       { text: '해설 문장' },                          // 말하는 사람 없음(해설)
       { who: 'M', text: '대사' },                     // 이름표가 붙는 대사
       { who: 'player', text: '주인공 대사' },          // 이름표에 입력한 닉네임이 나옴
       { who: 'J', show: 'J', text: '..' },            // 이 줄부터 지혜 그림으로 교체 (show: null 이면 그림 숨김)
       { who: 'M', face: 'smile', text: '..' },        // 표정 바꾸기 (CHARACTERS.faces 에 등록 필요)
       { bg: 'park', text: '..' },                     // 이 줄부터 배경 바꾸기
     ],
     // 대사가 끝난 뒤 이어지는 것: 아래 중 하나
     choices: [ { text: '선택지', next: '다음장면' } ],     // 선택지
     next: '다음장면',             // 선택지 없이 바로 이동
     ending: '엔딩 제목',          // 게임 종료 화면
     battle: { enemy: 'M', win: '이긴뒤장면' },           // 대사 후 전투 (지면 게임 오버)
   }

   [선택지 옵션]
   text(필수) / next 또는 battle(필수) / flags: { 이름: true }
   battle: { enemy: 'M' } → 이기면 직전 선택지로 복귀(이긴 선택지는 사라짐), 지면 게임 오버
   [대사 글자]    {name} 주인공 이름 / {name:아} {name:은} {name:이} {name:을} {name:과} {name:이랑} {name:이라고} 는 받침에 맞는 조사까지 붙음
                  줄바꿈은 \n
   ===================================================================== */

var START_SCENE = 'intro';       // 새 게임을 누르면 처음 시작하는 장면

var BACKGROUNDS = {              // 이름: '이미지 경로'  (파일이 없으면 기본 배경색으로 보입니다)
  classroom: 'assets/backgrounds/classroom.png',
  park:      'assets/backgrounds/park.png',
  cafeteria: 'assets/backgrounds/cafeteria.png',
  hallway:   'assets/backgrounds/hall.png',
  wedding:      'assets/backgrounds/wedding.png'
};

var CHARACTERS = {
  M: {
    name: '미나',
    image: 'assets/m_normal.png',
    battleImage: 'assets/m_SD.png',    // ← 추가 (전투 화면에서만 이 그림이 나와요)
    faces: {
       happy : 'assets/m_happy.png'
           }
  },
  J: {
    name: '지혜',
    image: 'assets/j_normal.png',
    battleImage: 'assets/j_SD.png'     // ← 추가 (윗줄 끝에 쉼표 잊지 마세요)
  },
  A: {
    name: '학생 A',
    image: null
  }
};

var SCENES = {

  /* ---------- 1. 교실 ---------- */
  intro: {
    bg: 'classroom',
    show: null,
    steps: [
      { who: 'player', text: '드디어 고등학교에 입학하게 되었어.. 어떤 인연들을 만나게 될까?' }
    ],
    next: 'school'
  },

  school: {
    show: 'M',
    steps: [
      { who: 'M', text: '어? {name:아}~ 오랜만이야~ 우리 같은 반이었구나~!' },
      { text: '(이 아이의 이름은 유미나. 어릴 때부터 같이 논 소꿉친구다.)' },
      { who: 'M', text: '그나저나 나 할 말이 있는데...' },
      { who: 'A', text: '{name}! 밖에서 누가 너 불러.' }
    ],
    next: 'hallway'
  },

  /* ---------- 2. 복도 ---------- */
  hallway: {
    bg: 'hallway',
    show: 'J',
    steps: [
      { who: 'J', text: '{name}....맞지....?' },
      { who: 'player', text: '어, 맞는데?' },
      { who: 'J', text: '(혼잣말) 역시.. 이 학교가 맞았어..!' },
      { who: 'player', text: '? 방금 뭐라고..' },
      { who: 'J', text: '반가워.. 나랑 친하게 지내자..' },
      { text: '(지혜가 손을 건네었다.)' },
      { who: 'player', text: '어.. 그래.. 난 {name:이라고} 해! 잘 부탁해!' },
      { who: 'J', text: '응..! 그나저나 물어볼 게 있는데...' },
      { who: 'player', text: '응?' },
      { who: 'J', text: '아까 너랑 얘기한 애.. 누구야..?' }
    ],
    choices: [
      { text: '미나? 걔는 나랑 소꿉친구야~', next: 'hall_friend' },
      { text: '미나? 걔 내가 놀아주는 애야~', battle: { enemy: 'M' } },   // 미나와 전투 (이기면 이 선택지로 복귀)
      { text: '나 걔랑 사귀는데?',            battle: { enemy: 'J' } }    // 지혜와 전투 (이기면 이 선택지로 복귀)
    ]
  },

  hall_friend: {
    steps: [
      { who: 'J', text: '아~ 그냥 소꿉친구였구나... 알았어..! 있다가 보자' },
      { who: 'player', text: '희한한 애네..' }
    ],
    next: 'lunch'
  },

  /* ---------- 3. 점심시간 ---------- */
  lunch: {
    bg: 'cafeteria',
    show: null,
    steps: [
      { text: '(시간은 흘러 어느새 점심시간이 되었다.)' },
      { who: 'player', text: '아.. 배고파.' },
      { text: '(그때 말을 걸어오는 지혜)' },
      { who: 'J', show: 'J', text: '{name}.. 같이...밥먹을래..?' },
      { who: 'player', text: '어? 그ㄹ...' },
      { text: '(미나가 갑자기 말을 걸어온다)' },
      { who: 'M', show: 'M', text: '{name}~! 나랑 같이.. 어?' },
      { who: 'J', show: 'J', text: '넌... {name}의 소꿉친구..?' },
      { who: 'M', show: 'M', text: '안녕~ 난 미나라고 해. 너 {name:이랑} 친해?' },
      { who: 'J', show: 'J', text: '너보단 덜 만났겠지만.. 아는 건 내가 더 많을걸?\n아무튼 난 {name:이랑} 같이 밥 먹을 거니까.. 가줄래?' },
      { who: 'M', show: 'M', text: '뭐? 야 {name}, 너 나랑 먹을 거지?' }
    ],
    choices: [
      { text: '지혜야..미안. 나 미나랑 먹을게.', next: 'lunch_mina' },
      { text: '미나야..미안. 나 지혜랑 먹을게.', next: 'lunch_jihye' },
      { text: '둘 다 꺼져.',                      next: 'both_1' }
    ]
  },

  /* 3번 "둘 다 꺼져": 미나 → 지혜 순서로 연속 전투. 둘 다 이기면 lunch_back 으로 */
  both_1: {
    steps: [ { text: '(둘과 싸우게 되었다.)' } ],       // ← 임시 문구, 자유롭게 수정
    battle: { enemy: 'M', win: 'both_2' }
  },
  both_2: {
    steps: [ { text: '(다음은 지혜와의 싸움이다.)' } ],  // ← 임시 문구, 자유롭게 수정
    battle: { enemy: 'J', win: 'lunch_back' }
  },
  lunch_back: {
    steps: [ { text: '(싸움이 끝났다. 어쨌든 점심은 먹어야 한다.)' } ],   // ← 임시 문구, 자유롭게 수정
    choices: [
      { text: '지혜야..미안. 나 미나랑 먹을게.', next: 'lunch_mina' },
      { text: '미나야..미안. 나 지혜랑 먹을게.', next: 'lunch_jihye' }
    ]
  },

  /* ---------- 점심 이후 (아직 대본이 없어 임시로 비워둠) ---------- */
    /* ---------- 점심 이후: 미나를 선택한 루트 ---------- */
  lunch_mina: {
    show: 'M',
    steps: [
      { who: 'M', face: 'happy', text: '역시! 넌 날 선택할 줄 알았어!' },
      { who: 'J', show: 'J', text: '........' },
      { text: '(같이 밥을 먹게 된 둘)' },
      { who: 'M', show: 'M', text: '{name}.. 나 할 말이 있는데..' },
      { who: 'player', text: '응? 뭔데?' },
      { who: 'M', text: '혹시.. 내일 토요일에.. 같이 놀래?' }
    ],
    choices: [
      { text: '응! 좋아. 그러자.', next: 'mina_yes' },
      { text: '아니 꺼져.', battle: { enemy: 'M' } }          // 미나와 전투 (이기면 이 선택지로 복귀, 지면 게임 오버)
    ]
  },

  mina_yes: {
    steps: [
      { who: 'M',  text: '응! (볼 발그레) 좋아...' }
    ],
    next: 'date_park'
  },

  /* ---------- 토요일 데이트 ---------- */
  date_park: {
    bg: 'park',
    show: null,
    steps: [
      { text: '(다음날. 공원)' },
      { who: 'player', text: '언제 오지..?' },
      { who: 'M', face: 'happy', show: 'M', text: '(사복 모습) 많이.. 기다렸어?' },
      { who: 'player', text: '아, 아니야! 너.. 되게 예쁘다..' },
      { who: 'M', face: 'happy', text: '고, 고마워 (볼 발그레)' },
      { text: '(우리는 즐거운 데이트를 하였다.)' },
      { who: 'M', face: 'happy', text: '오늘 진짜 재밌었어.. {name}.. 내일 7시까지 학교에 올 수 있어?' },
      { who: 'player', text: '그렇게 일찍? 할 말이 뭔데?' },
      { who: 'M', face: 'happy', text: '그건.. 그때 알려줄게..' },
      { who: 'player', text: '응, 알았어! 7시까지 갈게!' }
    ],
    next: 'jihye_home'
  },

  /* ---------- 집 앞의 지혜 ---------- */
  jihye_home: {
    // bg: 'home',   ← 집 앞 배경 이미지가 생기면 BACKGROUNDS 에 등록하고 이 줄의 주석을 푸세요
    show: null,
    steps: [
      { text: '(집으로 돌아가던 {name}. 그런데 집 앞에 누군가 서 있었다.)' },
      { text: '(집 앞에서 대기를 타던 지혜)' },
      { who: 'J', show: 'J', text: '{name}... 재밌었어?' },
      { who: 'player', text: '우리 집을 어떻게 안 거야?!' },
      { who: 'J', text: '그런 건 몰라도 돼.. {name}.. 나 너 좋아해.❤️ 나랑 만나줘..' }
    ],
    choices: [
      { text: '뭐래. 내가 너 따위를 만날 거 같아?', battle: { enemy: 'J' } },   // 지혜와 전투
      { text: '(경찰에 신고했다.)', next: 'police' },
      { text: '미안.. 난 너 못 만날 것 같아..', battle: { enemy: 'J' } }        // 지혜와 전투
    ]
  },

  police: {
    steps: [
      { text: '(삐용삐용)' },
      { who: 'J', text: '{name}..! 어떻게 이럴 수 있어!!!' },
      { who: 'player', text: '여태까지 날 스토킹했다니..!' },
      { show: null, text: '(지혜는 잡혀가 버렸다.)' }
    ],
    next: 'morning'
  },

  /* ---------- 다음날 아침, 교실 ---------- */
  morning: {
    bg: 'classroom',
    show: 'M',
    steps: [
      { text: '(다음날 아침)' },
      { text: '(아무도 없는 교실 안. 미나가 기다리고 있다.)' },
      { who: 'player', text: '미나야.. 그래서 할 말이 뭐야?' },
      { who: 'M', text: '{name}.. 사실 나 AI야.. 그리고 나 너 좋아해....AI가 이런 말 하는 거.. 웃기지?' }
    ],
    choices: [
      { text: '응 웃겨.ㅋㅋ', next: 'confess' },
      { text: '무슨 소리야..나도 너 좋아해', next: 'confess' }
    ]
  },

  
  confess: {
    steps: [
      { who: 'player', text: '무슨 소리야.. 나도 너 좋아해. 너가 어떤 존재든.. 그게 AI든.. 난 널 좋아해.' },
      { who: 'M', face: 'happy', text: '진짜야..? 진짜.. 진짜 고마워..!' },
      { text: '(시간이 흘러)' }
    ],
    next: 'wedding'
  },

  /* ---------- 결혼식장 ---------- */
  wedding: {
    bg: 'wedding',
    show: 'M',
    steps: [
      { text: '(결혼식장)' },
      { who: 'M', face: 'happy', text: '{name}.. 너 덕분에 내 감정이 생겼어.. 진짜 고마워!' },
      { who: 'player', text: '무슨 소리야! 서로 용기를 냈기에 이렇게 된 건데..!' },
      { who: 'M', face: 'happy', text: '하핫! 그럼 지금 내가 어떤 감정을 느끼고 있게~!' },
      { who: 'player', text: '어떤 감정인데?' },
      { who: 'M', face: 'happy', text: '진정한 사랑과 행복!' }
    ],
    ending: '해피 엔딩'
  }}
