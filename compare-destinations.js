(()=>{
  const STYLE_ID='songdo-destination-compare-style';
  if(document.getElementById(STYLE_ID)) return;

  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
  .compare-btn{height:38px;border-radius:10px;border:1px solid #86b94f;padding:0 14px;background:#fff;color:#2c431d;font-weight:700;cursor:pointer}
  .compare-btn:hover{background:#f4fbe9}
  .compare-backdrop{position:fixed;inset:0;background:#24371999;z-index:3600;display:none;align-items:center;justify-content:center;padding:20px}
  .compare-backdrop.open{display:flex}
  .compare-panel{width:min(920px,100%);max-height:min(820px,92vh);overflow:auto;background:#fbfff4;border:1px solid #dcebbf;border-radius:18px;padding:22px;box-shadow:0 24px 70px rgba(23,45,13,.28)}
  .compare-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}.compare-head h2{margin:0;color:#365c22;font-size:22px}.compare-head p{margin:5px 0 0;color:#718160;font-size:12px}
  .compare-close{border:0;background:transparent;font-size:28px;line-height:1;color:#4f6d31;cursor:pointer}
  .compare-pickers{display:grid;grid-template-columns:1fr 50px 1fr;gap:12px;align-items:end}.compare-picker label{display:block;font-size:11px;font-weight:800;color:#66765a;margin-bottom:5px}.compare-picker select{width:100%;height:44px;border:1px solid #cfdfb4;border-radius:10px;padding:0 10px;background:#fff;font-weight:800;color:#243719}.compare-vs{text-align:center;font-size:12px;font-weight:900;color:#79935f;padding-bottom:14px}
  .compare-result{margin:18px 0;padding:17px;border:1px solid #d7e8bd;border-radius:14px;background:#f2f9e8;text-align:center}.compare-result small{display:block;color:#718160;margin-bottom:5px}.compare-result strong{display:block;font-size:20px;color:#365c22}.compare-scoreline{display:flex;justify-content:center;align-items:center;gap:12px;margin-top:9px;font-size:13px}.compare-scoreline b{font-size:22px;color:#243719}.compare-scoreline span{color:#869477}
  .compare-presets{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 16px}.compare-preset{border:1px solid #cfdfb4;border-radius:999px;background:#fff;color:#526642;padding:8px 11px;font-size:11px;font-weight:800;cursor:pointer}.compare-preset.active{background:#9bd85b;border-color:#82b94a;color:#203315}
  .compare-section-title{font-size:12px;font-weight:900;color:#365c22;margin:15px 0 9px}.compare-weights{display:grid;grid-template-columns:1fr 1fr;gap:9px 16px}.compare-weight{padding:10px 12px;background:#fff;border:1px solid #e0eccb;border-radius:11px}.compare-weight-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.compare-weight label{font-size:11px;font-weight:800}.compare-weight output{font-size:11px;font-weight:900;color:#659b32}.compare-weight input{width:100%;accent-color:#7db640}
  .compare-table{margin-top:15px;border:1px solid #dcebbf;border-radius:13px;overflow:hidden;background:#fff}.compare-row{display:grid;grid-template-columns:1.25fr 1fr 1fr;align-items:center;min-height:47px;border-bottom:1px solid #edf3e3}.compare-row:last-child{border-bottom:0}.compare-row>div{padding:9px 11px}.compare-row .metric{font-size:11px;color:#647458;font-weight:800}.compare-row .citymetric{text-align:center}.compare-row .raw{display:block;font-size:10px;color:#8a9680;margin-top:2px}.compare-row .points{font-size:14px;font-weight:900;color:#2c431d}.compare-row.winner-left>div:nth-child(2),.compare-row.winner-right>div:nth-child(3){background:#f0f9e2}
  .compare-note{margin:12px 2px 0;color:#7b8871;font-size:10px;line-height:1.5}
  @media(max-width:680px){.compare-panel{padding:16px}.compare-pickers{grid-template-columns:1fr}.compare-vs{padding:0}.compare-weights{grid-template-columns:1fr}.compare-row{grid-template-columns:1.05fr 1fr 1fr}.compare-btn{padding:0 10px}}
  `;
  document.head.appendChild(style);

  const data=()=>{
    const base=(typeof cities!=='undefined'&&cities)?cities:{};
    return {...base,...(window.extraCities||{})};
  };
  const cityLabel=(c)=>c.provider||c.name;
  const totalDaily=(c)=>(c.daily||[]).reduce((a,b)=>a+(Number(b)||0),0);
  const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,n));
  const affordability=(c)=>clamp(100-((totalDaily(c)-70)/(365-70))*100);
  const weather=(c)=>clamp(100-Math.abs((Number(c.temp)||22)-22)*5.5);
  const metrics={
    cost:{label:'물가',score:affordability,raw:c=>`하루 약 $${totalDaily(c)}`},
    weather:{label:'날씨',score:weather,raw:c=>`약 ${Number(c.temp)||'-'}°C`},
    sports:{label:'스포츠',score:c=>clamp(Number(c.sports)||0),raw:c=>`${Math.round(clamp(Number(c.sports)||0))}/100`},
    festival:{label:'이벤트 · 축제',score:c=>clamp(Number(c.festival)||0),raw:c=>`${Math.round(clamp(Number(c.festival)||0))}/100`}
  };
  const presets={
    balanced:{label:'균형',weights:{cost:50,weather:50,sports:50,festival:50}},
    budget:{label:'가성비',weights:{cost:100,weather:35,sports:20,festival:25}},
    weather:{label:'좋은 날씨',weights:{cost:25,weather:100,sports:20,festival:35}},
    sports:{label:'스포츠',weights:{cost:20,weather:25,sports:100,festival:35}},
    fun:{label:'즐길거리',weights:{cost:20,weather:35,sports:50,festival:100}}
  };

  const backdrop=document.createElement('div');
  backdrop.className='compare-backdrop';
  backdrop.id='destinationCompare';
  backdrop.innerHTML=`<div class="compare-panel" role="dialog" aria-modal="true" aria-labelledby="compareTitle">
    <div class="compare-head"><div><h2 id="compareTitle">여행지 비교</h2><p>내가 중요하게 보는 조건에 따라 더 잘 맞는 여행지가 달라집니다.</p></div><button class="compare-close" aria-label="닫기">×</button></div>
    <div class="compare-pickers"><div class="compare-picker"><label>여행지 A</label><select id="compareCityA"></select></div><div class="compare-vs">VS</div><div class="compare-picker"><label>여행지 B</label><select id="compareCityB"></select></div></div>
    <div class="compare-result"><small id="compareVerdictLabel">현재 설정에서 더 잘 맞는 여행지</small><strong id="compareWinner"></strong><div class="compare-scoreline"><b id="compareScoreA"></b><span>vs</span><b id="compareScoreB"></b></div></div>
    <div class="compare-section-title">무엇을 가장 중요하게 보시나요?</div><div class="compare-presets" id="comparePresets"></div>
    <div class="compare-weights" id="compareWeights"></div>
    <div class="compare-table" id="compareTable"></div>
    <p class="compare-note">점수는 Songdo가 현재 보유한 도시 데이터에 선택한 중요도를 가중해 계산합니다. 물가 점수는 예상 일일비용이 낮을수록 높고, 날씨 점수는 약 22°C에 가까울수록 높게 계산됩니다.</p>
  </div>`;
  document.body.appendChild(backdrop);

  const headerActions=document.querySelector('.header-actions');
  if(headerActions){
    const btn=document.createElement('button');btn.className='compare-btn';btn.id='openCompare';btn.textContent='여행지 비교';
    headerActions.insertBefore(btn,headerActions.firstChild);
    btn.addEventListener('click',()=>{refreshCities();backdrop.classList.add('open');render();});
  }

  const aSel=backdrop.querySelector('#compareCityA'),bSel=backdrop.querySelector('#compareCityB');
  const weightsWrap=backdrop.querySelector('#compareWeights'),presetsWrap=backdrop.querySelector('#comparePresets');
  const weightState={...presets.balanced.weights};
  let activePreset='balanced';

  Object.entries(presets).forEach(([key,p])=>{
    const b=document.createElement('button');b.className='compare-preset'+(key==='balanced'?' active':'');b.dataset.preset=key;b.textContent=p.label;
    b.onclick=()=>{Object.assign(weightState,p.weights);activePreset=key;syncControls();render();};presetsWrap.appendChild(b);
  });
  Object.entries(metrics).forEach(([key,m])=>{
    const box=document.createElement('div');box.className='compare-weight';box.innerHTML=`<div class="compare-weight-top"><label>${m.label}</label><output id="weightOut-${key}">${weightState[key]}</output></div><input id="weight-${key}" type="range" min="0" max="100" step="5" value="${weightState[key]}">`;
    const input=box.querySelector('input');input.addEventListener('input',()=>{weightState[key]=Number(input.value);activePreset='';syncControls(false);render();});weightsWrap.appendChild(box);
  });

  function syncControls(updateRanges=true){
    if(updateRanges) Object.keys(metrics).forEach(k=>{const i=backdrop.querySelector(`#weight-${k}`);if(i)i.value=weightState[k];});
    Object.keys(metrics).forEach(k=>{const o=backdrop.querySelector(`#weightOut-${k}`);if(o)o.textContent=weightState[k];});
    presetsWrap.querySelectorAll('.compare-preset').forEach(b=>b.classList.toggle('active',b.dataset.preset===activePreset));
  }
  function refreshCities(){
    const d=data();const keys=Object.keys(d).sort((x,y)=>cityLabel(d[x]).localeCompare(cityLabel(d[y]),'en'));
    const oldA=aSel.value,oldB=bSel.value;
    const options=keys.map(k=>`<option value="${k}">${cityLabel(d[k])}</option>`).join('');aSel.innerHTML=options;bSel.innerHTML=options;
    aSel.value=(oldA&&d[oldA])?oldA:(d.melbourne?'melbourne':(d.sydney2?'sydney2':(d.seoul?'seoul':keys[0])));
    bSel.value=(oldB&&d[oldB])?oldB:(d.goldcoast?'goldcoast':(d.tokyo?'tokyo':keys[1]||keys[0]));
    if(aSel.value===bSel.value&&keys.length>1)bSel.value=keys.find(k=>k!==aSel.value)||keys[0];
  }
  function weighted(c){
    let sum=0,w=0;for(const [k,m] of Object.entries(metrics)){const weight=weightState[k]||0;sum+=m.score(c)*weight;w+=weight;}return w?sum/w:0;
  }
  function render(){
    const d=data(),a=d[aSel.value],b=d[bSel.value];if(!a||!b)return;
    const sa=weighted(a),sb=weighted(b);const diff=Math.abs(sa-sb);
    backdrop.querySelector('#compareScoreA').textContent=sa.toFixed(1);
    backdrop.querySelector('#compareScoreB').textContent=sb.toFixed(1);
    const winner=backdrop.querySelector('#compareWinner');const label=backdrop.querySelector('#compareVerdictLabel');
    if(diff<0.5){winner.textContent='거의 동점';label.textContent=`${cityLabel(a)}와 ${cityLabel(b)}의 적합도가 비슷합니다.`;}
    else{const win=sa>sb?a:b;winner.textContent=cityLabel(win);label.textContent=`현재 중요도 기준 · ${diff.toFixed(1)}점 차이`;}
    backdrop.querySelector('#compareTable').innerHTML=Object.entries(metrics).map(([k,m])=>{
      const av=m.score(a),bv=m.score(b),cls=Math.abs(av-bv)<.5?'':(av>bv?' winner-left':' winner-right');
      return `<div class="compare-row${cls}"><div class="metric">${m.label}<span class="raw">중요도 ${weightState[k]}</span></div><div class="citymetric"><span class="points">${av.toFixed(0)}</span><span class="raw">${m.raw(a)}</span></div><div class="citymetric"><span class="points">${bv.toFixed(0)}</span><span class="raw">${m.raw(b)}</span></div></div>`;
    }).join('');
  }

  aSel.addEventListener('change',()=>{if(aSel.value===bSel.value){const keys=Object.keys(data());bSel.value=keys.find(k=>k!==aSel.value)||bSel.value;}render();});
  bSel.addEventListener('change',()=>{if(aSel.value===bSel.value){const keys=Object.keys(data());aSel.value=keys.find(k=>k!==bSel.value)||aSel.value;}render();});
  backdrop.querySelector('.compare-close').onclick=()=>backdrop.classList.remove('open');
  backdrop.addEventListener('click',e=>{if(e.target===backdrop)backdrop.classList.remove('open');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')backdrop.classList.remove('open');});

  refreshCities();syncControls();render();
  const version=document.querySelector('.version');if(version)version.textContent='songdo · v0.0.4';
})();