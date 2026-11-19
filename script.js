(function(){
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id){return document.getElementById(id);}
  function pad(n){return n<10?'0'+n:''+n;}

  /* ---------- Thanksgiving date + countdown ---------- */
  function fourthThursday(y){
    var d=new Date(y,10,1), off=(4-d.getDay()+7)%7;
    return new Date(y,10,1+off+21);
  }
  function nextThanksgiving(){
    var now=new Date(), t=fourthThursday(now.getFullYear());
    var endOfDay=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1);
    if(now>=endOfDay) t=fourthThursday(now.getFullYear()+1);
    return t;
  }
  var TG=nextThanksgiving();
  var fmtDate=TG.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  $('dateEyebrow').textContent='Thanksgiving, '+fmtDate;
  function tickCountdown(){
    var now=new Date(), diff=TG-now;
    var sameDay=now.toDateString()===TG.toDateString();
    if(sameDay){
      ['cd-d','cd-h','cd-m','cd-s'].forEach(function(i){$(i).textContent='0';});
      $('cdNote').textContent='It is today. Happy Thanksgiving.';
      return;
    }
    var s=Math.floor(diff/1000);
    var d=Math.floor(s/86400); s-=d*86400;
    var h=Math.floor(s/3600); s-=h*3600;
    var m=Math.floor(s/60); s-=m*60;
    $('cd-d').textContent=d; $('cd-h').textContent=pad(h); $('cd-m').textContent=pad(m); $('cd-s').textContent=pad(s);
    $('cdNote').textContent=d===0?'Dinner is tomorrow. Check the turkey.':(d<=7?'Under a week. Time to confirm the guest list.':'Until the first slice.');
  }
  tickCountdown(); setInterval(tickCountdown,1000);

  /* ---------- Falling leaves ---------- */
  (function leaves(){
    if(reduce) return;
    var c=$('leaves'), ctx=c.getContext('2d'), W=0,H=0, dpr=Math.min(window.devicePixelRatio||1,2);
    var cols=['#f28a3c','#d13b58','#f6cd62','#c86a2a','#a3bb7f','#e0613c'];
    var L=[];
    function size(){
      var r=c.parentElement.getBoundingClientRect();
      W=r.width;H=r.height;c.width=W*dpr;c.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    function mk(initial){
      return {x:Math.random()*W,y:initial?Math.random()*H:-30,s:8+Math.random()*12,vy:.3+Math.random()*.6,
        sw:Math.random()*Math.PI*2,sa:.4+Math.random()*.8,r:Math.random()*6.28,vr:(Math.random()-.5)*.025,
        c:cols[(Math.random()*cols.length)|0],a:.25+Math.random()*.4};
    }
    size();
    for(var i=0;i<26;i++) L.push(mk(true));
    window.addEventListener('resize',size);
    function leaf(l){
      ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.r);ctx.globalAlpha=l.a;ctx.fillStyle=l.c;
      var s=l.s;ctx.beginPath();ctx.moveTo(0,-s);
      ctx.bezierCurveTo(s*.9,-s*.5,s*.8,s*.5,0,s);
      ctx.bezierCurveTo(-s*.8,s*.5,-s*.9,-s*.5,0,-s);ctx.fill();
      ctx.strokeStyle='rgba(28,15,39,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(0,s);ctx.stroke();
      ctx.restore();
    }
    function frame(){
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<L.length;i++){
        var l=L[i];l.sw+=.012;l.y+=l.vy;l.x+=Math.sin(l.sw)*l.sa;l.r+=l.vr;
        if(l.y>H+30){L[i]=mk(false);}
        leaf(l);
      }
      requestAnimationFrame(frame);
    }
    frame();
  })();

  /* ---------- Gratitude pie ---------- */
  var COLORS=['#f28a3c','#d13b58','#f6cd62','#a3bb7f','#9a5aa8','#c8793a','#e8604e','#5fa39d','#d996b8','#7d8fd6','#b8c24a','#e9a63f'];
  var SEED=['Everyone around one table','The dog, who asked for nothing','Friday off','Grandma\'s stuffing recipe','Leftover pie for breakfast'];
  var IDEAS=['A text that arrived right on time','Coffee that was still hot','Neighbors who water the plants','A bed with the good pillow','The song that plays on repeat','Someone who laughs at my jokes','Soup on a cold day','A friend who answers at midnight','Clean socks','The first snow','A kitchen that smells like home','Second chances'];
  var slices=[], nextId=1, colorIdx=0, hoverId=null, running=false;
  var svg=$('pieSvg'), hub=$('hub'), hubN=$('hubN'), hubT=$('hubT');
  var R=158;

  function save(){
    try{localStorage.setItem('thanks-sliced',JSON.stringify(slices.filter(function(s){return s.target>0;}).map(function(s){return {t:s.text,c:s.color};})));}catch(e){}
  }
  function load(){
    try{
      var raw=localStorage.getItem('thanks-sliced');
      if(raw){var a=JSON.parse(raw);if(Array.isArray(a)&&a.length){a.slice(0,12).forEach(function(o){if(o&&typeof o.t==='string')push(String(o.t).slice(0,60),o.c,true);});return true;}}
    }catch(e){}
    return false;
  }
  function push(text,color,instant){
    var s={id:nextId++,text:text,color:color||COLORS[colorIdx++%COLORS.length],w:instant?1:0,target:1};
    slices.push(s);return s;
  }
  function live(){return slices.filter(function(s){return s.target>0;});}
  function pt(a,r){return (r*Math.cos(a)).toFixed(2)+' '+(r*Math.sin(a)).toFixed(2);}

  function renderPie(){
    var total=0;slices.forEach(function(s){total+=s.w;});
    var out='';
    out+='<circle r="204" fill="#120a1a" opacity=".55" cy="10"/>';
    out+='<circle r="198" fill="#3d2750"/>';
    out+='<circle r="196" fill="none" stroke="#e8b46e" stroke-width="22" stroke-dasharray="14 7" stroke-linecap="round"/>';
    out+='<circle r="184" fill="#d6934f"/>';
    out+='<circle r="170" fill="#b9722f"/>';
    if(total<.001){
      out+='<circle r="'+R+'" fill="#2a1838" stroke="#f7ecdc" stroke-opacity=".3" stroke-dasharray="6 8" stroke-width="2"/>';
    } else {
      var a0=-Math.PI/2;
      slices.forEach(function(s){
        var ang=s.w/total*Math.PI*2;
        var rr=R*(.72+.28*Math.min(1,s.w));
        var mid=a0+ang/2;
        var off=(hoverId===s.id)?12:0;
        var tf='translate('+(Math.cos(mid)*off).toFixed(2)+' '+(Math.sin(mid)*off).toFixed(2)+')';
        var d;
        if(ang>=Math.PI*2-.001){d='M0 -'+rr+' A '+rr+' '+rr+' 0 1 1 0 '+rr+' A '+rr+' '+rr+' 0 1 1 0 -'+rr+' Z';}
        else{d='M0 0 L'+pt(a0,rr)+' A '+rr+' '+rr+' 0 '+(ang>Math.PI?1:0)+' 1 '+pt(a0+ang,rr)+' Z';}
        out+='<g class="slice" data-id="'+s.id+'" style="transform:'+tf+'"><path d="'+d+'" fill="'+s.color+'" stroke="#1c0f27" stroke-width="3" stroke-linejoin="round"/>';
        /* tiny crumbs for texture */
        if(ang>.35){var m1=a0+ang*.5,rr2=rr*.62;out+='<circle cx="'+(rr2*Math.cos(m1)).toFixed(1)+'" cy="'+(rr2*Math.sin(m1)).toFixed(1)+'" r="3" fill="#fff" opacity=".35"/>';
          var m2=a0+ang*.5+.08;out+='<circle cx="'+((rr*.82)*Math.cos(m2)).toFixed(1)+'" cy="'+((rr*.82)*Math.sin(m2)).toFixed(1)+'" r="2" fill="#fff" opacity=".28"/>';}
        out+='</g>';
        a0+=ang;
      });
    }
    svg.innerHTML=out;
  }

  function renderList(){
    var ul=$('list');ul.textContent='';
    live().forEach(function(s){
      var li=document.createElement('li');li.dataset.id=s.id;if(hoverId===s.id)li.className='on';
      var dot=document.createElement('span');dot.className='dot';dot.style.background=s.color;
      var t=document.createElement('span');t.className='t';t.textContent=s.text;
      var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Eat the slice: '+s.text);b.textContent='×';
      b.addEventListener('click',function(){eat(s.id);});
      li.appendChild(dot);li.appendChild(t);li.appendChild(b);
      li.addEventListener('mouseenter',function(){setHover(s.id);});
      li.addEventListener('mouseleave',function(){setHover(null);});
      ul.appendChild(li);
    });
    updateHub();
  }
  function updateHub(){
    var n=live().length;
    var s=slices.filter(function(x){return x.id===hoverId;})[0];
    if(s&&s.target>0){hub.className='hub talk';hubT.textContent=s.text;}
    else{hub.className='hub';hubN.textContent=n;hubT.textContent=n===0?'Nothing yet. Add the first slice.':(n===1?'thing to be thankful for':'things to be thankful for');}
  }
  function setHover(id){
    if(hoverId===id) return;
    hoverId=id;renderPie();
    var lis=$('list').children;
    for(var i=0;i<lis.length;i++){lis[i].className=(String(id)===lis[i].dataset.id)?'on':'';}
    updateHub();
  }
  function loop(){
    var moving=false;
    slices.forEach(function(s){
      var d=s.target-s.w;
      if(Math.abs(d)>.004){s.w+=d*(reduce?1:.16);moving=true;}else s.w=s.target;
    });
    slices=slices.filter(function(s){return !(s.target===0&&s.w<=.004);});
    renderPie();
    if(moving) requestAnimationFrame(loop); else running=false;
  }
  function kick(){if(!running){running=true;requestAnimationFrame(loop);}}
  function burst(color){
    if(reduce) return;
    var st=$('stage');
    for(var i=0;i<10;i++){
      var sp=document.createElement('span');sp.className='spark';
      var a=Math.random()*Math.PI*2,dist=110+Math.random()*90;
      sp.style.background=i%2?color:COLORS[(Math.random()*COLORS.length)|0];
      sp.style.setProperty('--dx',(Math.cos(a)*dist)+'px');sp.style.setProperty('--dy',(Math.sin(a)*dist)+'px');
      sp.style.setProperty('--rot',((Math.random()-.5)*360)+'deg');
      st.appendChild(sp);setTimeout((function(el){return function(){el.remove();};})(sp),1000);
    }
  }
  function add(text){
    text=text.replace(/\s+/g,' ').trim();
    if(!text) return false;
    if(live().length>=12){$('pieHint').textContent='The pie is full at 12 slices. Eat one with the x to make room.';return false;}
    var s=push(text);burst(s.color);save();renderList();kick();
    $('pieHint').textContent='Hover a slice to read it. Select the x to eat one. Up to 12 slices.';
    return true;
  }
  function eat(id){
    slices.forEach(function(s){if(s.id===id)s.target=0;});
    if(hoverId===id)hoverId=null;
    save();renderList();kick();
  }
  svg.addEventListener('mouseover',function(e){var g=e.target.closest&&e.target.closest('.slice');setHover(g?+g.dataset.id:null);});
  svg.addEventListener('mouseleave',function(){setHover(null);});
  svg.addEventListener('click',function(e){var g=e.target.closest&&e.target.closest('.slice');if(g){var id=+g.dataset.id;setHover(id);}});

  $('addForm').addEventListener('submit',function(e){
    e.preventDefault();var inp=$('thing');
    if(add(inp.value)){inp.value='';}
    inp.focus();
  });
  var ideaI=Math.floor(Math.random()*IDEAS.length);
  $('inspire').addEventListener('click',function(){
    var inp=$('thing');inp.value=IDEAS[ideaI++%IDEAS.length];inp.focus();inp.select();
  });
  $('clearPie').addEventListener('click',function(){
    slices.forEach(function(s){s.target=0;});hoverId=null;save();renderList();kick();$('thing').focus();
  });
  $('copyList').addEventListener('click',function(){
    var txt='I am thankful for:\n'+live().map(function(s,i){return (i+1)+'. '+s.text;}).join('\n');
    var h=$('pieHint');
    try{
      navigator.clipboard.writeText(txt).then(function(){h.textContent='Copied. Paste it into a text to the family group chat.';},function(){h.textContent='Your browser blocked copying. Select the list and copy it by hand.';});
    }catch(e){h.textContent='Your browser blocked copying. Select the list and copy it by hand.';}
  });
  if(!load()){SEED.forEach(function(t){push(t,null,true);});}
  renderList();renderPie();

  /* ---------- Plate builder ---------- */
  var FOODS=[
    {id:'turkey',name:'Turkey',c:'#c98a52',h:'#e2b184'},
    {id:'stuffing',name:'Stuffing',c:'#d3a458',h:'#ecc983'},
    {id:'mash',name:'Mashed potatoes',c:'#f1e3b8',h:'#fff6d8'},
    {id:'cran',name:'Cranberry sauce',c:'#b4213f',h:'#d9506b'},
    {id:'beans',name:'Green beans',c:'#5f8f3c',h:'#8bbb62'},
    {id:'sweet',name:'Sweet potatoes',c:'#e0782a',h:'#f4a25d'},
    {id:'mac',name:'Mac and cheese',c:'#f0b93a',h:'#ffd979'},
    {id:'roll',name:'Dinner roll',c:'#b9783c',h:'#dfa56a'},
    {id:'gravy',name:'Gravy',c:'#6b3a1d',h:'#8c5530',center:true}
  ];
  var counts={},blobs={};
  var NS='http://www.w3.org/2000/svg';
  var pf=$('plateFood');
  FOODS.forEach(function(f,i){
    counts[f.id]=0;
    var cx=180,cy=180;
    if(!f.center){var a=(-90+i*45)*Math.PI/180;cx=180+82*Math.cos(a);cy=180+82*Math.sin(a);}
    var g=document.createElementNS(NS,'g');
    var b=document.createElementNS(NS,'circle');b.setAttribute('cx',cx);b.setAttribute('cy',cy);b.setAttribute('class','blob');b.setAttribute('fill',f.c);b.style.r='0px';
    b.setAttribute('stroke','rgba(0,0,0,.18)');b.setAttribute('stroke-width','2');
    var hi=document.createElementNS(NS,'circle');hi.setAttribute('cx',cx-4);hi.setAttribute('cy',cy-5);hi.setAttribute('class','blob-hi');hi.setAttribute('fill',f.h);hi.style.r='0px';hi.setAttribute('opacity','.55');
    g.appendChild(b);g.appendChild(hi);
    if(f.center){g.setAttribute('opacity','.88');}
    blobs[f.id]={b:b,hi:hi};
    pf.appendChild(g);
  });
  /* gravy drawn last so it pours over everything */
  pf.appendChild(blobs.gravy.b.parentNode);

  var MAXC=3,CAP=14,STATUS=[
    [0,'Empty plate. A bold opening move.'],
    [1,'Light start. You are pacing yourself.'],
    [25,'A respectable first pass.'],
    [50,'Now we are talking.'],
    [75,'Peak plate. Do not sneeze.'],
    [101,'Structural failure. Please bring a second plate.']
  ];
  var foodsEl=$('foods'),outs={};
  FOODS.forEach(function(f){
    var row=document.createElement('div');row.className='food';
    var sw=document.createElement('span');sw.className='sw';sw.style.background=f.c;
    var nm=document.createElement('span');nm.textContent=f.name;
    var st=document.createElement('div');st.className='stepper';
    var m=document.createElement('button');m.type='button';m.textContent='−';m.setAttribute('aria-label','Less '+f.name);
    var o=document.createElement('output');o.textContent='0';outs[f.id]=o;
    var p=document.createElement('button');p.type='button';p.textContent='+';p.setAttribute('aria-label','More '+f.name);
    m.addEventListener('click',function(){setCount(f.id,counts[f.id]-1);});
    p.addEventListener('click',function(){setCount(f.id,counts[f.id]+1);});
    st.appendChild(m);st.appendChild(o);st.appendChild(p);
    row.appendChild(sw);row.appendChild(nm);row.appendChild(st);foodsEl.appendChild(row);
  });
  function setCount(id,n){counts[id]=Math.max(0,Math.min(MAXC,n));paintPlate();}
  function paintPlate(){
    var total=0;
    FOODS.forEach(function(f){
      var n=counts[f.id];outs[f.id].textContent=n;
      total+=n*(f.id==='gravy'?.5:1);
      var r=f.center?(n?14+9*n:0):(n?12+6.5*n:0);
      blobs[f.id].b.style.r=r+'px';blobs[f.id].hi.style.r=(r*.55)+'px';
    });
    var pct=Math.round(total/CAP*100);
    $('pct').textContent=pct+'%';
    $('meterFill').style.width=Math.min(100,pct)+'%';
    $('meterBar').setAttribute('aria-valuenow',Math.min(100,pct));
    var msg=STATUS[0][1];STATUS.forEach(function(s){if(pct>=s[0]&&(s[0]>0||pct===0)){msg=s[1];}});
    if(pct>0&&pct<25)msg=STATUS[1][1];
    $('status').textContent=msg;
    $('plateStage').className='plate-stage'+(pct>100?' shake':'');
  }
  function setPlate(map){FOODS.forEach(function(f){counts[f.id]=map[f.id]||0;});paintPlate();}
  $('classic').addEventListener('click',function(){setPlate({turkey:2,stuffing:2,mash:2,cran:1,beans:1,sweet:1,roll:1,gravy:2});});
  $('surprise').addEventListener('click',function(){
    var m={};FOODS.forEach(function(f){m[f.id]=Math.floor(Math.random()*4);});setPlate(m);
  });
  $('clearPlate').addEventListener('click',function(){setPlate({});});
  setPlate({turkey:2,stuffing:1,mash:2,cran:1,gravy:1});

  /* ---------- Timeline ---------- */
  function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
  $('ddate').value=iso(TG);
  var doneKeys={};
  function hm(min){var h=Math.floor(min/60),m=Math.round(min%60);return h+' h '+pad(m)+' min';}
  function plan(weight,dinner,frozen,stuffed){
    var MIN=60000,roast=Math.round(weight*(stuffed?15:13));
    var D=dinner.getTime();
    var turkeyOut=D-45*MIN, ovenIn=turkeyOut-roast*MIN;
    var salt=ovenIn-24*60*MIN;
    var thawDays=Math.ceil(weight/4);
    var steps=[];
    function S(k,t,title,note,key){steps.push({k:k,t:t,title:title,note:note,key:!!key});}
    if(frozen) S('thaw',salt-thawDays*24*60*MIN,'Move the turkey to the fridge','Thaw about 1 day per 4 lb ('+thawDays+' day'+(thawDays>1?'s':'')+' for this bird). Keep it on a tray on the bottom shelf.',true);
    S('salt',salt,'Salt the bird','Rub it all over with kosher salt and leave it uncovered in the fridge for a crisp skin. Skip if you are short on time.');
    S('table',D-150*MIN,'Set the table','Plates, glasses, a serving spoon for everything. Do it now, before the kitchen gets busy.');
    S('out',ovenIn-60*MIN,'Take the turkey out of the fridge','An hour on the counter helps it cook evenly. Pat it dry.');
    S('heat',ovenIn-20*MIN,'Heat the oven to 325°F','Rack in the lower third.');
    S('in',ovenIn,'Turkey goes in','Roast about '+hm(roast)+'. Start checking the thigh temperature 30 minutes early.',true);
    S('pot',D-80*MIN,'Peel and boil the potatoes','Start in cold, salted water. Drain well, then mash with butter and warm milk.');
    S('veg',D-60*MIN,'Prep the green beans and rolls','Trim, blanch and hold. Put the rolls on a tray, covered.');
    S('pull',turkeyOut,'Turkey comes out at 165°F','Tent loosely with foil. It needs about 30 minutes to rest.',true);
    S('sides',turkeyOut,'Sides go into the oven','The oven is free now. Casseroles and sweet potatoes, about 25 minutes.');
    S('gravy',D-40*MIN,'Make the gravy','Whisk flour into the pan drippings, add stock, simmer until it coats a spoon.');
    S('rolls',D-20*MIN,'Warm the rolls','Last thing into the oven.');
    S('carve',D-15*MIN,'Carve the turkey','Legs first, then the breast against the grain.');
    S('eat',D,'Everyone sits down','Say a thing you are thankful for before the first bite.',true);
    steps.sort(function(a,b){return a.t-b.t;});
    return {steps:steps,roast:roast,ovenIn:ovenIn};
  }
  function fmtT(ms){return new Date(ms).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});}
  function fmtD(ms){return new Date(ms).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});}
  function renderPlan(){
    var w=parseFloat($('weight').value);
    var dv=$('ddate').value,tv=$('dtime').value;
    var ol=$('steps');
    if(!(w>=4&&w<=40)||!dv||!tv){ol.textContent='';$('summary').textContent='Enter a turkey weight between 4 and 40 lb, plus a dinner date and time.';return;}
    var dp=dv.split('-'),tp=tv.split(':');
    var dinner=new Date(+dp[0],+dp[1]-1,+dp[2],+tp[0],+tp[1]);
    var p=plan(w,dinner,$('frozen').checked,$('stuffed').checked);
    var sm=$('summary');sm.textContent='';
    [['Roast time',hm(p.roast)],['Oven in at',fmtT(p.ovenIn)],['Rest','30 min'],['Steps',p.steps.length]].forEach(function(x){
      var c=document.createElement('span');c.className='chip';c.appendChild(document.createTextNode(x[0]+' '));
      var b=document.createElement('b');b.textContent=x[1];c.appendChild(b);sm.appendChild(c);
    });
    ol.textContent='';
    var lastDay='';
    p.steps.forEach(function(s,i){
      var li=document.createElement('li');li.style.animationDelay=(Math.min(i,10)*35)+'ms';
      if(s.key)li.className='key';
      if(doneKeys[s.k])li.className+=' done';
      var when=document.createElement('div');when.className='when';
      when.textContent=fmtT(s.t);var sm2=document.createElement('small');sm2.textContent=fmtD(s.t);when.appendChild(sm2);
      var node=document.createElement('button');node.type='button';node.className='node';node.setAttribute('aria-label','Mark done: '+s.title);node.setAttribute('aria-pressed',doneKeys[s.k]?'true':'false');
      node.addEventListener('click',function(){doneKeys[s.k]=!doneKeys[s.k];renderPlan();});
      var what=document.createElement('div');what.className='what';
      var b=document.createElement('b');b.textContent=s.title;var sp=document.createElement('span');sp.textContent=s.note;
      what.appendChild(b);what.appendChild(sp);
      li.appendChild(when);li.appendChild(node);li.appendChild(what);ol.appendChild(li);
    });
    var done=p.steps.filter(function(s){return doneKeys[s.k];}).length;
    $('prog').style.width=(done/p.steps.length*100)+'%';
    $('progText').textContent=done+' of '+p.steps.length+' steps done. Select a circle to tick a step.';
  }
  ['weight','ddate','dtime','frozen','stuffed'].forEach(function(id){$(id).addEventListener('input',renderPlan);$(id).addEventListener('change',renderPlan);});
  renderPlan();

  /* ---------- Table talk cards ---------- */
  var QS=[
    ['Gratitude','What is one small thing from this year you are glad happened?'],
    ['Gratitude','Who at this table taught you something you still use?'],
    ['Gratitude','What is something you own that you would grab first and why?'],
    ['Memory','What is your earliest Thanksgiving memory?'],
    ['Memory','Which dish at this table has the best story behind it?'],
    ['Memory','Describe the best meal you ever had in thirty seconds.'],
    ['Memory','What did you want to be when you were ten?'],
    ['Would you rather','Would you rather cook the whole dinner or do every dish afterwards?'],
    ['Would you rather','Would you rather have Thanksgiving dinner every week or pie every day?'],
    ['Would you rather','Would you rather eat leftovers cold for a month or reheated for a week?'],
    ['Silly','If the turkey could give one speech, what would it say?'],
    ['Silly','Rank the pies: pumpkin, pecan, apple. Defend your order.'],
    ['Silly','Invent a new side dish in one sentence.'],
    ['Silly','What would the family dog order if it could talk?'],
    ['Look ahead','What are you hoping to do before next Thanksgiving?'],
    ['Look ahead','What is one thing you want to learn this year?'],
    ['Look ahead','Where should we all eat together next time?'],
    ['Pass it on','Say one thing you appreciate about the person on your left.'],
    ['Pass it on','Share a piece of advice you would give your younger self.'],
    ['Pass it on','Tell us about a person who is not here but is on your mind.'],
    ['Gratitude','What is something ordinary you would miss if it vanished tomorrow?'],
    ['Memory','What song makes you think of home?'],
    ['Silly','What is the most useless talent you have?'],
    ['Look ahead','What tradition should we start this year?']
  ];
  var deck=[],shown=0,flipped=false,rot=0,cls=['f0','f1','f2','f3'],ci=0;
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  deck=shuffle(QS.slice());
  $('card').addEventListener('click',function(){
    if(shown>=deck.length){deck=shuffle(QS.slice());shown=0;}
    var q=deck[shown++];
    var target=flipped?$('faceA'):$('faceB');
    ci=(ci+1)%cls.length;
    target.className='face'+(flipped?'':' back')+' '+cls[ci];
    target.querySelector('small').textContent=q[0];
    target.querySelector('.q').textContent=q[1];
    rot+=180;flipped=!flipped;
    $('cardIn').style.transform='rotateY('+rot+'deg)';
    $('deckMeta').textContent='Card '+shown+' of '+deck.length+'. Tap for the next one.';
  });
})();