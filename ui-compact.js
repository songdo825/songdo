(()=>{
  const style=document.createElement('style');
  style.textContent=`
  .app{grid-template-columns:1fr!important;position:relative}
  .sidebar{position:fixed!important;top:88px;left:14px;width:230px;max-height:46vh;padding:11px 10px!important;border:1px solid rgba(0,0,0,.10)!important;border-radius:15px;box-shadow:0 10px 30px rgba(0,0,0,.16);background:rgba(251,255,244,.95)!important;backdrop-filter:blur(10px);z-index:930!important;overflow:auto}
  .sidebar h2{font-size:14px;margin:0 0 2px!important}.sidebar .sub{font-size:9px;margin:0 0 8px!important}.city-list{gap:4px!important}.city-card{padding:6px 8px!important;border-radius:9px!important}.city-head{margin:0!important}.city-name{font-size:11px}.fav-btn{font-size:16px!important;line-height:1;padding:0 2px}.sidebar .social,.sidebar .ratings{display:none!important}
  .city-detail-ratings{margin-top:15px;padding-top:14px;border-top:1px solid #e3e8df}.city-detail-ratings-title{font-size:12px;font-weight:900;color:#26351e;margin-bottom:8px}.city-detail-rating-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.city-detail-rating{border:1px solid #e0e7da;background:#f8faf6;border-radius:11px;padding:9px 10px;text-align:left;cursor:pointer;color:#26351e}.city-detail-rating:hover{background:#eef6e7}.city-detail-rating-top{display:flex;justify-content:space-between;align-items:center;gap:8px}.city-detail-rating-label{font-size:10px;font-weight:900}.city-detail-rating-score{font-size:11px;font-weight:900}.city-detail-rating-stars{font-size:12px;color:#6da638;letter-spacing:.5px;margin-top:4px}.city-detail-rating-count{font-size:9px;color:#8a9383;margin-top:2px}.city-detail-rate-note{font-size:9px;color:#8d9588;margin-top:8px}
  @media(max-width:760px){.sidebar{top:78px;left:10px;width:190px;max-height:34vh}.city-detail-rating-grid{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(style);

  let selectedCityKey=null;
  const ratingLabels={safety:'치안',cost:'물가',sights:'볼거리',english_difficulty:'영어 소통'};
  const starText=v=>v==null?'☆☆☆☆☆':'★'.repeat(Math.max(0,Math.min(5,Math.round(v))))+'☆'.repeat(Math.max(0,5-Math.round(v)));

  function setSelected(key){if(key&&cities?.[key])selectedCityKey=key}
  document.addEventListener('click',e=>{const n=e.target.closest?.('[data-go]');if(n?.dataset?.go)setSelected(n.dataset.go)},true);

  function bindMarkerSelection(){
    if(typeof cityLayer==='undefined')return;
    const keys=Object.keys(cities);let i=0;
    cityLayer.eachLayer(layer=>{const key=keys[i++];if(key&&!layer.__compactSelectBound){layer.on('click',()=>setSelected(key));layer.__compactSelectBound=true}});
  }
  bindMarkerSelection();
  const oldRenderCompact=render;
  render=function(){oldRenderCompact();setTimeout(bindMarkerSelection,0)};

  function addRatings(){
    const panel=document.getElementById('cityDetail');
    const body=panel?.querySelector('.city-detail-body');
    if(!body||body.querySelector('.city-detail-ratings')||!selectedCityKey||!cities[selectedCityKey])return;
    const wrap=document.createElement('div');wrap.className='city-detail-ratings';
    wrap.innerHTML='<div class="city-detail-ratings-title">여행자 별점</div><div class="city-detail-rating-grid">'+Object.entries(ratingLabels).map(([cat,label])=>{
      const a=typeof avg==='function'?avg(selectedCityKey,cat):null;
      const count=typeof catRows==='function'?catRows(selectedCityKey,cat).length:0;
      return '<button class="city-detail-rating" data-detail-rate="'+cat+'"><div class="city-detail-rating-top"><span class="city-detail-rating-label">'+label+'</span><span class="city-detail-rating-score">'+(a==null?'–':a.toFixed(1))+'</span></div><div class="city-detail-rating-stars">'+starText(a)+'</div><div class="city-detail-rating-count">'+count+'명 평가</div></button>';
    }).join('')+'</div><div class="city-detail-rate-note">항목을 누르면 직접 별점을 남길 수 있습니다.</div>';
    body.appendChild(wrap);
    wrap.querySelectorAll('[data-detail-rate]').forEach(b=>b.onclick=()=>{if(typeof openRating==='function')openRating(selectedCityKey,b.dataset.detailRate)});
  }

  const panel=document.getElementById('cityDetail');
  if(panel){new MutationObserver(()=>setTimeout(addRatings,0)).observe(panel,{childList:true,subtree:true})}
  document.addEventListener('click',()=>setTimeout(addRatings,80));
  const version=document.querySelector('.version');if(version)version.textContent='songdo · v0.0.6';
})();