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
    faces: {}
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
  lunch_mina: {
    show: 'M',
    steps: [ { text: '(여기에 미나와 점심을 먹는 이야기를 이어서 작성하세요)' } ],
    next: 'ending_normal'
  },
  lunch_jihye: {
    show: 'J',
    steps: [ { text: '(여기에 지혜와 점심을 먹는 이야기를 이어서 작성하세요)' } ],
    next: 'ending_normal'
  },

  ending_normal: { bg: 'room', show: null, steps: [{ text: '(준비중)' }], ending: '준비중' }
};
