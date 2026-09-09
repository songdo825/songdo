(()=>{
  const groups={
    '대한민국':['seoul','busan','incheon','jeju'],
    '일본':['tokyo','osaka','kyoto','sapporo','fukuoka'],
    '중국':['beijing','shanghai','guangzhou','shenzhen','chengdu','xian'],
    '마카오':['macau'],'대만':['taipei','kaohsiung'],'홍콩':['hongkong'],
    '태국':['bangkok','chiangmai','phuket'],'베트남':['hanoi','hochiminh','danang'],
    '말레이시아':['kualalumpur','penang'],'인도네시아':['jakarta','bali'],'필리핀':['manila','cebu'],
    '캄보디아':['phnompenh','siemreap'],'스리랑카':['colombo'],'인도':['delhi','mumbai','jaipur'],'싱가포르':['singapore'],
    '프랑스':['paris'],'영국':['london','edinburgh'],'스페인':['barcelona','madrid','valencia','seville'],
    '이탈리아':['rome','milan','florence','venice','naples'],'네덜란드':['amsterdam'],'독일':['berlin','munich','hamburg','frankfurt'],
    '오스트리아':['vienna'],'체코':['prague'],'튀르키예':['istanbul'],'벨기에':['brussels'],'덴마크':['copenhagen'],
    '스웨덴':['stockholm'],'노르웨이':['oslo','bergen'],'핀란드':['helsinki'],'아이슬란드':['reykjavik'],'아일랜드':['dublin'],
    '포르투갈':['lisbon','porto'],'헝가리':['budapest'],'폴란드':['warsaw','krakow'],'스위스':['zurich','geneva'],
    '그리스':['athens'],'크로아티아':['dubrovnik','split'],'불가리아':['sofia'],'루마니아':['bucharest'],'세르비아':['belgrade'],
    '에스토니아':['tallinn'],'라트비아':['riga'],'리투아니아':['vilnius'],
    '미국':['newyork','losangeles','boston','washington','chicago','miami','orlando','atlanta','neworleans','austin','dallas','houston','denver','lasvegas','sandiego','sanfrancisco','seattle','portland','honolulu'],
    '캐나다':['toronto','montreal','vancouver','calgary'],'멕시코':['mexicocity','cancun'],'쿠바':['havana'],
    '콜롬비아':['bogota','medellin'],'페루':['lima','cusco'],'칠레':['santiago'],'아르헨티나':['buenosaires'],'브라질':['saopaulo','riodejaneiro'],
    '아랍에미리트':['dubai','abudhabi'],'카타르':['doha'],'사우디아라비아':['riyadh','jeddah'],'오만':['muscat'],'요르단':['amman'],'조지아':['tbilisi'],
    '이집트':['cairo'],'모로코':['marrakech'],'남아프리카공화국':['capetown','johannesburg'],'케냐':['nairobi'],
    '호주':['sydney','melbourne','brisbane','goldcoast','perth'],'뉴질랜드':['auckland','wellington','queenstown']
  };
  const countryByCity={};Object.entries(groups).forEach(([country,keys])=>keys.forEach(k=>countryByCity[k]=country));
  Object.entries(cities).forEach(([k,c])=>{c.country=countryByCity[k]||c.country||'국가 정보 확인'});

  const entryPrep={
    '미국':'ESTA 등 사전 입국 절차 확인',
    '캐나다':'eTA 등 사전 입국 절차 확인',
    '영국':'ETA 등 사전 입국 절차 확인',
    '호주':'ETA 등 사전 입국 절차 확인',
    '뉴질랜드':'NZeTA 등 사전 입국 절차 확인',
    '인도':'전자비자 등 사전 절차 확인',
    '스리랑카':'ETA/입국 요건 확인',
    '사우디아라비아':'전자비자 등 사전 절차 확인'
  };
  const caution={
    '필리핀':'일부 지역 여행경보 확인',
    '캄보디아':'일부 지역 여행경보 확인',
    '요르단':'중동 정세 관련 최신 안전정보 확인',
    '이집트':'일부 지역 여행경보·안전정보 확인',
    '조지아':'분쟁지역 인접 구역 최신 안전정보 확인',
    '콜롬비아':'지역별 치안·여행경보 확인',
    '남아프리카공화국':'지역별 치안정보 확인'
  };

  const style=document.createElement('style');style.textContent=`
    .city-search-wrap{position:sticky;top:-11px;z-index:4;background:rgba(251,255,244,.98);padding:2px 0 8px}
    .city-search{width:100%;height:34px;border:1px solid #cfe1bc;border-radius:9px;padding:0 10px;background:#fff;color:#26351e;font-size:11px;outline:none}
    .city-search:focus{border-color:#86b94f;box-shadow:0 0 0 2px #9bd85b22}
    .city-country{font-size:9px;color:#87917f;font-weight:700;margin-left:5px;white-space:nowrap}
    .city-card.entry-prep{background:#fffbed!important;border-color:#eadb9a!important}
    .city-card.travel-caution{background:#fff1ef!important;border-color:#e8b8ae!important}
    .travel-badge{font-size:8px;font-weight:900;padding:2px 5px;border-radius:999px;margin-left:5px;white-space:nowrap}
    .travel-badge.prep{background:#f7e7a0;color:#715b00}.travel-badge.caution{background:#f2c0b8;color:#8a3026}
    .city-search-empty{font-size:10px;color:#8a9383;padding:9px 4px}
  `;document.head.appendChild(style);

  function decorate(){
    const list=document.getElementById('cityList');const sidebar=document.querySelector('.sidebar');if(!list||!sidebar)return;
    let wrap=sidebar.querySelector('.city-search-wrap');
    if(!wrap){wrap=document.createElement('div');wrap.className='city-search-wrap';wrap.innerHTML='<input class="city-search" id="citySearch" type="search" placeholder="도시 또는 국가 검색" autocomplete="off">';list.before(wrap);wrap.querySelector('input').addEventListener('input',applySearch)}
    [...list.children].forEach((card,i)=>{
      const key=Object.keys(cities)[i],c=cities[key];if(!c)return;card.dataset.cityKey=key;card.dataset.search=(c.name+' '+(c.provider||'')+' '+c.country).toLowerCase();
      const name=card.querySelector('.city-name');if(name&&!name.querySelector('.city-country'))name.insertAdjacentHTML('beforeend','<span class="city-country">'+c.country+'</span>');
      if(caution[c.country]){card.classList.add('travel-caution');if(name&&!name.querySelector('.travel-badge'))name.insertAdjacentHTML('beforeend','<span class="travel-badge caution" title="'+caution[c.country]+'">주의</span>')}
      else if(entryPrep[c.country]){card.classList.add('entry-prep');if(name&&!name.querySelector('.travel-badge'))name.insertAdjacentHTML('beforeend','<span class="travel-badge prep" title="'+entryPrep[c.country]+'">준비</span>')}
    });
    applySearch();
  }
  function applySearch(){const q=(document.getElementById('citySearch')?.value||'').trim().toLowerCase();const cards=[...document.querySelectorAll('#cityList .city-card')];let shown=0;cards.forEach(c=>{const ok=!q||c.dataset.search?.includes(q);c.style.display=ok?'':'none';if(ok)shown++});let e=document.querySelector('.city-search-empty');if(!shown&&q){if(!e){e=document.createElement('div');e.className='city-search-empty';e.textContent='검색 결과가 없습니다.';document.getElementById('cityList').appendChild(e)}}else e?.remove()}

  const oldRenderCountry=render;render=function(){oldRenderCountry();setTimeout(decorate,0)};decorate();
  document.addEventListener('click',e=>{const name=e.target.closest?.('.city-name');if(!name)return;const key=name.dataset.go,c=cities[key];if(!c)return;setTimeout(()=>{const body=document.querySelector('#cityDetail .city-detail-body');if(!body||body.querySelector('.country-travel-note'))return;const note=caution[c.country]||entryPrep[c.country];const type=caution[c.country]?'caution':entryPrep[c.country]?'prep':null;if(!note)return;const box=document.createElement('div');box.className='country-travel-note';box.style.cssText='margin-top:12px;padding:10px 11px;border-radius:10px;font-size:10px;line-height:1.5;background:'+(type==='caution'?'#fff1ef':'#fffbed')+';border:1px solid '+(type==='caution'?'#e8b8ae':'#eadb9a');box.innerHTML='<b>'+(type==='caution'?'여행 유의':'출국 전 준비')+'</b><br>'+note+'<br><span style="color:#8b9387">출국 전 외교부 해외안전여행 및 해당 국가 공식 입국 안내를 다시 확인하세요.</span>';body.appendChild(box)},250)},true);
  const v=document.querySelector('.version');if(v)v.textContent='songdo · v0.0.9';
})();