/* 전투 모듈: game.html 안에서 Battle.start({ image, duration, onEnd }) 로 실행합니다.
   - image    : 상대 캐릭터 그림 경로
   - duration : 버텨야 하는 시간(초, 기본 40)
   - onEnd    : 전투가 끝나고 Enter 를 눌렀을 때 호출 → { won, hp, maxHp, time }
   난이도(속도/피해량/패턴 등)는 아래 상단 상수와 spawn 함수에서 조절하세요. */
(function(){
  var cv=null,ctx=null,opts={},raf=0,running=false,last=0,resultAt=0;
  var W=960,H=540,FONT="'DotGothic16','Malgun Gothic',sans-serif";
  var BOX={x:330,y:200,w:300,h:200,b:5};
  var MAXHP=25,DURATION=40,SPEED=175,HIT=4.5,DMG=4,INVULN=0.9;

  // 제공해주신 하트 이미지를 16x16 픽셀 격자로 옮긴 것
  var HEART=[
    '..XX........XX..',
    '.XXXXX....XXXXX.',
    'XXXXXX....XXXXXX',
    'XXXXXXX..XXXXXXX',
    'XXXXXXX..XXXXXXX',
    'XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXX',
    '..XXXXXXXXXXXX..',
    '..XXXXXXXXXXXX..',
    '....XXXXXXXX....',
    '....XXXXXXXX....',
    '......XXXX......',
    '......XXXX......'
  ];

  var keys={};
  var SPR=new Image();
  var state='intro',t,hp,hx,hy,inv,bullets,lasers,acc,pulse,resultSent;

  function reset(){
    t=0;hp=MAXHP;hx=BOX.x+BOX.w/2;hy=BOX.y+BOX.h/2;inv=0;bullets=[];
    acc={rain:0,bar:0,aim:0,laser:0};lasers=[];resultSent=false;
  }
  reset();

  function rnd(a,b){return a+Math.random()*(b-a);}
  var L=BOX.x+BOX.b,R=BOX.x+BOX.w-BOX.b,T=BOX.y+BOX.b,B=BOX.y+BOX.h-BOX.b;

  // 쉬는 구간 [시작초, 끝초]: 레이저를 멈추고 공도 거의 안 나옴
  var RESTS=[[17,19],[24,26],[32,34]];
  function inRest(){for(var i=0;i<RESTS.length;i++)if(t>=RESTS[i][0]&&t<RESTS[i][1])return true;return false;}

  function spawn(dt){
    if(inRest()){spawnAim(dt,2.2,130);return;}
    if(t>=20){spawnLasers(dt);spawnAim(dt,0.95);return;}
    if(t>=14)spawnLasers(dt);
    if(t<6){
      acc.rain+=dt;
      while(acc.rain>0.3){acc.rain-=0.3;
        for(var i=0;i<1;i++)bullets.push({k:'c',x:rnd(L,R),y:T-12,vx:0,vy:rnd(160,230),r:6});
      }
      spawnAim(dt,1.0,130);
    }else if(t<12){
      acc.bar+=dt;
      while(acc.bar>0.85){acc.bar-=0.85;
        var gap=54,gx=rnd(L+10,R-gap-10);
        bullets.push({k:'r',x:L,y:T-14,w:gx-L,h:10,vy:150});
        bullets.push({k:'r',x:gx+gap,y:T-14,w:R-(gx+gap),h:10,vy:150});
      }
    }else if(t>=14){
      var late=t>=15;               // 15초부터 개수 소폭 감소
      var aimIv=late?0.95:0.8,rainIv=late?1.3:1.1;
      acc.aim+=dt;
      while(acc.aim>aimIv){acc.aim-=aimIv;
        var sx=Math.random()<0.5?L-10:R+10,sy=rnd(T,B);
        var dx=hx-sx,dy=hy-sy,d=Math.hypot(dx,dy)||1;
        bullets.push({k:'c',x:sx,y:sy,vx:dx/d*215,vy:dy/d*215,r:7});
      }
      acc.rain+=dt;
      while(acc.rain>rainIv){acc.rain-=rainIv;
        bullets.push({k:'c',x:rnd(L,R),y:T-12,vx:0,vy:200,r:6});
      }
    }
  }

  function spawnAim(dt,iv,spd){
    iv=iv||0.55;spd=spd||215;
    acc.aim+=dt;
    while(acc.aim>iv){acc.aim-=iv;
      var sx=Math.random()<0.5?L-10:R+10,sy=rnd(T,B);
      var dx=hx-sx,dy=hy-sy,d=Math.hypot(dx,dy)||1;
      bullets.push({k:'c',x:sx,y:sy,vx:dx/d*spd,vy:dy/d*spd,r:7});
    }
  }

  // 레이저: 0.8초 동안 테두리로 구역을 미리 표시한 뒤 발사
  function spawnLasers(dt){
    var late=t>=28;
    acc.laser+=dt;
    if(acc.laser>(late?1.1:1.6)){
      acc.laser=0;
      var n=late?3:2;
      for(var i=0;i<n;i++){
        var horiz=Math.random()<(late?0.5:0.7),size=46;
        var ctr=Math.random()<0.8?(horiz?hy:hx):rnd(horiz?T:L,horiz?B:R);
        var side=Math.random()<0.5?-1:1;
        if(horiz){
          var y=Math.min(B-size,Math.max(T,ctr-size/2));
          lasers.push({o:'h',x:L,y:y,w:R-L,h:size,age:0,warn:0.6,fire:0.45,side:side});
        }else{
          var x=Math.min(R-size,Math.max(L,ctr-size/2));
          lasers.push({o:'v',x:x,y:T,w:size,h:B-T,age:0,warn:0.6,fire:0.45,side:side});
        }
      }
    }
    if(t>=14)return;
    acc.rain+=dt;
    while(acc.rain>0.9){acc.rain-=0.9;
      bullets.push({k:'c',x:rnd(L,R),y:T-12,vx:0,vy:140,r:6});
    }
  }

  function hits(b){
    if(b.k==='c'){
      var dx=Math.abs(hx-b.x),dy=Math.abs(hy-b.y);
      if(dx>HIT+b.r||dy>HIT+b.r)return false;
      if(dx<=HIT||dy<=HIT)return true;
      return Math.hypot(dx-HIT,dy-HIT)<=b.r;
    }
    return hx+HIT>b.x&&hx-HIT<b.x+b.w&&hy+HIT>b.y&&hy-HIT<b.y+b.h;
  }

  function finish(won){state=won?'won':'lost';resultAt=performance.now();}

  function update(dt){
    if(state!=='play')return;
    t+=dt;
    var vx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
    var vy=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);
    if(vx&&vy){vx*=Math.SQRT1_2;vy*=Math.SQRT1_2;}
    hx=Math.min(R-8,Math.max(L+8,hx+vx*SPEED*dt));
    hy=Math.min(B-8,Math.max(T+8,hy+vy*SPEED*dt));
    spawn(dt);
    if(inv>0)inv-=dt;
    for(var i=bullets.length-1;i>=0;i--){
      var b=bullets[i];
      if(b.k==='c'){b.x+=b.vx*dt;b.y+=b.vy*dt;}else b.y+=b.vy*dt;
      if(b.y>B+30||b.x<L-40||b.x>R+40){bullets.splice(i,1);continue;}
      if(inv<=0&&hits(b)){hp=Math.max(0,hp-DMG);inv=INVULN;bullets.splice(i,1);}
    }
    for(var j=lasers.length-1;j>=0;j--){
      var z=lasers[j];z.age+=dt;
      if(z.age>=z.warn+z.fire){lasers.splice(j,1);continue;}
      if(inv<=0&&z.age>=z.warn&&z.age<z.warn+z.fire*0.7&&hx+HIT>z.x&&hx-HIT<z.x+z.w&&hy+HIT>z.y&&hy-HIT<z.y+z.h){hp=Math.max(0,hp-DMG);inv=INVULN;}
    }
    if(hp<=0)finish(false);
    else if(t>=DURATION)finish(true);
  }

  function drawHeart(cx,cy,color){
    ctx.fillStyle=color;
    for(var r=0;r<16;r++)for(var c=0;c<16;c++)
      if(HEART[r][c]==='X')ctx.fillRect(cx-8+c,cy-8+r,1,1);
  }
  function text(s,x,y,size,color,align){
    ctx.font=size+'px '+FONT;ctx.fillStyle=color||'#fff';ctx.textAlign=align||'left';ctx.textBaseline='top';
    ctx.fillText(s,x,y);
  }

  function draw(){
    ctx.setTransform(2,0,0,2,0,0);
    ctx.imageSmoothingEnabled=false;
    ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);

    // 상대 캐릭터 (살짝 위아래로 떠다니는 연출)
    if(SPR.complete&&SPR.naturalWidth){
      var sh=176,sw=Math.round(sh*SPR.naturalWidth/SPR.naturalHeight);
      ctx.drawImage(SPR,Math.round(W/2-sw/2),Math.round(14+Math.sin(performance.now()/450)*3),sw,sh);
    }

    // 전투 박스
    ctx.fillStyle='#fff';ctx.fillRect(BOX.x,BOX.y,BOX.w,BOX.h);
    ctx.fillStyle='#000';ctx.fillRect(L,T,R-L,B-T);

    if(state==='intro'){
      text('* 상대가 공격해온다!',L+14,T+16,20);
      text('* WASD 로 하트를 움직여 피하세요.',L+14,T+52,16,'#ddd');
      text('아무 키나 눌러 시작',BOX.x+BOX.w/2,B-40,16,'#ff0','center');
    }else{
      ctx.save();ctx.beginPath();ctx.rect(L,T,R-L,B-T);ctx.clip();
      ctx.fillStyle='#fff';
      bullets.forEach(function(b){
        if(b.k==='c'){ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,6.2832);ctx.fill();}
        else ctx.fillRect(b.x,b.y,b.w,b.h);
      });
      ctx.restore();
      ctx.save();ctx.beginPath();ctx.rect(L,T,R-L,B-T);ctx.clip();
      lasers.forEach(function(z){
        if(z.age<z.warn){
          ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.setLineDash([8,6]);
          ctx.globalAlpha=Math.floor(z.age*10)%2===0?1:0.45;
          ctx.strokeRect(z.x+1.5,z.y+1.5,z.w-3,z.h-3);
          ctx.setLineDash([]);ctx.globalAlpha=1;
        }else{
          var p=(z.age-z.warn)/z.fire,k=p<0.7?1:1-(p-0.7)/0.3;
          ctx.fillStyle='#fff';
          if(z.o==='h')ctx.fillRect(z.x,z.y+z.h*(1-k)/2,z.w,z.h*k);
          else ctx.fillRect(z.x+z.w*(1-k)/2,z.y,z.w*k,z.h);
        }
      });
      ctx.restore();
      ctx.fillStyle='#fff';
      lasers.forEach(function(z){
        if(z.o==='h')ctx.fillRect(z.side<0?BOX.x-16:BOX.x+BOX.w+4,z.y,12,z.h);
        else ctx.fillRect(z.x,z.side<0?BOX.y-16:BOX.y+BOX.h+4,z.w,12);
      });
      var blink=inv>0&&Math.floor(inv*14)%2===0;
      if(!blink)drawHeart(Math.round(hx),Math.round(hy),'#ff0000');
    }

    // HP 표시
    text('HP',BOX.x,BOX.y+BOX.h+26,16);
    var bw=MAXHP*5;
    ctx.fillStyle='#c00000';ctx.fillRect(BOX.x+36,BOX.y+BOX.h+26,bw,18);
    ctx.fillStyle='#ffe100';ctx.fillRect(BOX.x+36,BOX.y+BOX.h+26,bw*hp/MAXHP,18);
    text(hp+' / '+MAXHP,BOX.x+36+bw+12,BOX.y+BOX.h+26,16);

    if(state==='play'){
      var left=Math.max(0,Math.ceil(DURATION-t));
      text('남은 시간 '+left+'초',BOX.x+BOX.w,BOX.y+BOX.h+26,16,'#aaa','right');
    }

    if(state==='won'||state==='lost'){
      ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(0,0,W,H);
      text(state==='won'?'전투 승리!':'전투 패배...',W/2,210,44,state==='won'?'#ffe100':'#ff3030','center');
      text('남은 HP '+hp+' / '+MAXHP,W/2,280,20,'#ddd','center');
      text('Enter 키를 눌러 계속',W/2,330,18,'#aaa','center');
    }
  }

  function loop(now){
    if(!running)return;
    var dt=Math.min(0.05,(now-last)/1000);last=now;
    update(dt);draw();raf=requestAnimationFrame(loop);
  }

  function onKeyDown(e){
    if(e.code.indexOf('Arrow')===0||e.code==='Space')e.preventDefault();
    keys[e.code]=true;
    if(state==='intro'&&!e.repeat){state='play';}
    else if((state==='won'||state==='lost')&&!e.repeat&&performance.now()-resultAt>800&&
            (e.code==='Enter'||e.code==='Space'||e.code==='KeyZ')){
      var r={won:state==='won',hp:hp,maxHp:MAXHP,time:t};
      stop();
      if(typeof opts.onEnd==='function')opts.onEnd(r);
    }
  }
  function onKeyUp(e){keys[e.code]=false;}
  function onBlur(){keys={};}

  function start(o){
    opts=o||{};
    cv=document.getElementById('battleCanvas');ctx=cv.getContext('2d');
    DURATION=opts.duration||40;
    SPR=new Image();SPR.src=opts.image||'';
    reset();state='intro';keys={};
    cv.hidden=false;running=true;last=performance.now();
    // 선택지를 고른 그 키 입력이 전투 시작으로 이어지지 않도록 한 틱 뒤에 키 입력을 받기 시작
    setTimeout(function(){
      if(!running)return;
      window.addEventListener('keydown',onKeyDown);
      window.addEventListener('keyup',onKeyUp);
      window.addEventListener('blur',onBlur);
    },0);
    raf=requestAnimationFrame(loop);
  }
  function stop(){
    running=false;cancelAnimationFrame(raf);
    window.removeEventListener('keydown',onKeyDown);
    window.removeEventListener('keyup',onKeyUp);
    window.removeEventListener('blur',onBlur);
    if(cv)cv.hidden=true;
  }

  window.Battle={start:start};
})();
