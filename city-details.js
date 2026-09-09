(()=>{
  const style=document.createElement('style');
  style.textContent=`
  .city-detail{position:absolute;top:78px;right:18px;z-index:980;width:min(390px,calc(100% - 36px));max-height:calc(100% - 110px);overflow:auto;background:rgba(255,255,255,.97);border:1px solid rgba(0,0,0,.12);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.22);backdrop-filter:blur(12px);transform:translateX(calc(100% + 40px));opacity:0;pointer-events:none;transition:.25s ease}
  .city-detail.open{transform:translateX(0);opacity:1;pointer-events:auto}
  .city-detail-photo{height:210px;background:linear-gradient(135deg,#cddceb,#eef4f8);position:relative;overflow:hidden;border-radius:17px 17px 0 0}
  .city-detail-photo img{width:100%;height:100%;object-fit:cover;display:block}
  .city-detail-shade{position:absolute;inset:0;background:linear-gradient(180deg,transparent 38%,rgba(0,0,0,.7));pointer-events:none}
  .city-detail-close{position:absolute;right:12px;top:12px;width:36px;height:36px;border:0;border-radius:50%;background:rgba(255,255,255,.92);font-size:23px;cursor:pointer;box-shadow:0 2px 10px #0002;z-index:2}
  .city-detail-title{position:absolute;left:18px;right:55px;bottom:15px;color:#fff;font-size:28px;font-weight:900;text-shadow:0 2px 12px #0008;z-index:2}
  .city-detail-body{padding:17px 18px 19px}.city-detail-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
  .city-stat{padding:11px 12px;border-radius:12px;background:#f3f6f0}.city-stat-label{font-size:10px;color:#77806f;font-weight:800;margin-bottom:4px}.city-stat-value{font-size:15px;font-weight:900;color:#26351e;line-height:1.25}
  .city-detail-desc{font-size:13px;line-height:1.65;color:#4f584b;margin:4px 0 0}.city-detail-source{font-size:9px;color:#929a8e;margin-top:12px;line-height:1.4}.city-detail-loading{padding:25px 18px;color:#687360;font-size:13px}
  @media(max-width:760px){.city-detail{top:68px;right:10px;width:calc(100% - 20px);max-height:calc(100% - 82px)}.city-detail-photo{height:190px}}
  `;
  document.head.appendChild(style);

  const panel=document.createElement('section');
  panel.id='cityDetail';panel.className='city-detail';
  panel.innerHTML='<div class="city-detail-loading">도시 정보를 불러오는 중입니다.</div>';
  document.querySelector('.map-wrap')?.appendChild(panel);

  const weatherNames={0:'맑음',1:'대체로 맑음',2:'부분적으로 흐림',3:'흐림',45:'안개',48:'서리 안개',51:'약한 이슬비',53:'이슬비',55:'강한 이슬비',61:'약한 비',63:'비',65:'강한 비',71:'약한 눈',73:'눈',75:'강한 눈',80:'소나기',81:'소나기',82:'강한 소나기',95:'뇌우',96:'우박 동반 뇌우',99:'강한 우박 동반 뇌우'};
  const fmtPop=n=>!n?'정보 없음':n>=10000000?(n/10000000).toFixed(1)+'천만 명':n>=10000?(n/10000).toFixed(n>=1000000?0:1)+'만 명':Number(n).toLocaleString('ko-KR')+'명';
  const cityTitle=c=>c.provider||providerNames?.[Object.keys(cities).find(k=>cities[k]===c)]||c.name;

  async function fetchWiki(title){
    const safe=encodeURIComponent(title.replaceAll(' ','_'));
    let summary=null,qid=null,pop=null;
    try{const r=await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+safe);if(r.ok)summary=await r.json()}catch(e){}
    try{
      const r=await fetch('https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&titles='+encodeURIComponent(title)+'&format=json&origin=*');
      const j=await r.json(),p=Object.values(j.query?.pages||{})[0];qid=p?.pageprops?.wikibase_item||summary?.wikibase_item||null;
      if(qid){
        const w=await fetch('https://www.wikidata.org/w/api.php?action=wbgetentities&ids='+qid+'&props=claims&format=json&origin=*');const d=await w.json();
        const claims=d.entities?.[qid]?.claims?.P1082||[];
        const ranked=claims.filter(x=>x.mainsnak?.datavalue?.value?.amount).sort((a,b)=>{const ta=a.qualifiers?.P585?.[0]?.datavalue?.value?.time||'';const tb=b.qualifiers?.P585?.[0]?.datavalue?.value?.time||'';return tb.localeCompare(ta)});
        if(ranked[0])pop=Math.round(Number(ranked[0].mainsnak.datavalue.value.amount));
      }
    }catch(e){}
    return {summary,pop};
  }

  async function fetchWeather(c){
    try{
      const [lat,lon]=c.pos;
      const u='https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m,apparent_temperature,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1';
      const r=await fetch(u);if(!r.ok)throw new Error();return await r.json();
    }catch(e){return null}
  }

  async function openCityDetail(key){
    const c=cities[key];if(!c||!panel)return;
    panel.classList.add('open');panel.innerHTML='<div class="city-detail-loading"><b>'+c.name+'</b><br><br>사진·인구·날씨 정보를 불러오는 중입니다.</div>';
    map?.closePopup?.();
    const title=cityTitle(c);
    const [wiki,weather]=await Promise.all([fetchWiki(title),fetchWeather(c)]);
    const s=wiki?.summary||{};
    const image=s.originalimage?.source||s.thumbnail?.source||'';
    const desc=s.extract||((c.name)+'은(는) 세계 주요 여행 도시 중 하나입니다. 스포츠·페스티벌·날씨·물가 필터를 함께 비교해 여행 목적에 맞는 시기를 살펴볼 수 있습니다.');
    const cur=weather?.current,day=weather?.daily;
    const weatherText=cur?Math.round(cur.temperature_2m)+'°C · '+(weatherNames[cur.weather_code]||'날씨 정보'):'불러오기 실패';
    const highLow=day?.temperature_2m_max?.length?Math.round(day.temperature_2m_min[0])+'° / '+Math.round(day.temperature_2m_max[0])+'°':'정보 없음';
    panel.innerHTML=`
      <div class="city-detail-photo">${image?'<img src="'+image+'" alt="'+c.name+'" referrerpolicy="no-referrer">':''}<div class="city-detail-shade"></div><button class="city-detail-close" aria-label="닫기">×</button><div class="city-detail-title">${c.name}</div></div>
      <div class="city-detail-body">
        <div class="city-detail-stats">
          <div class="city-stat"><div class="city-stat-label">인구</div><div class="city-stat-value">${fmtPop(wiki?.pop)}</div></div>
          <div class="city-stat"><div class="city-stat-label">현재 날씨</div><div class="city-stat-value">${weatherText}</div></div>
          <div class="city-stat"><div class="city-stat-label">오늘 최저 / 최고</div><div class="city-stat-value">${highLow}</div></div>
          <div class="city-stat"><div class="city-stat-label">체감 온도</div><div class="city-stat-value">${cur?Math.round(cur.apparent_temperature)+'°C':'정보 없음'}</div></div>
        </div>
        <p class="city-detail-desc">${desc}</p>
        <div class="city-detail-source">도시 설명·사진·인구: Wikipedia/Wikidata · 날씨: Open-Meteo</div>
      </div>`;
    panel.querySelector('.city-detail-close').onclick=()=>panel.classList.remove('open');
  }

  document.addEventListener('click',e=>{const n=e.target.closest?.('[data-go]');if(n?.dataset?.go)openCityDetail(n.dataset.go)});
  function bindMarkerClicks(){
    if(typeof cityLayer==='undefined')return;
    const keys=Object.keys(cities);let i=0;
    cityLayer.eachLayer(layer=>{const key=keys[i++];if(key&&!layer.__cityDetailBound){layer.on('click',()=>openCityDetail(key));layer.__cityDetailBound=true}});
  }
  const oldRender=render;
  render=function(){oldRender();setTimeout(bindMarkerClicks,0)};
  bindMarkerClicks();
  const version=document.querySelector('.version');if(version)version.textContent='songdo · v0.0.5';
})();