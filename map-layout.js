(()=>{
  const style=document.createElement('style');
  style.textContent=`
    .map-wrap,#map{width:100%!important;height:100%!important;min-width:0!important}
    #map{background:#e8eee7!important}
    #map .leaflet-tile-pane{opacity:.78;filter:saturate(.42) contrast(.82) brightness(1.06)}
    .roman-city-label{background:transparent!important;border:0!important}
    .roman-city-label span{display:block;transform:translate(7px,-7px);white-space:nowrap;color:#465247;font:600 10px/1 Arial,sans-serif;text-shadow:0 1px 0 #fff,1px 0 0 #fff,-1px 0 0 #fff,0 -1px 0 #fff;opacity:.84}
    .roman-city-label.secondary span{font-size:9px;font-weight:500;opacity:.68}
  `;
  document.head.appendChild(style);

  if(typeof map==='undefined'||!map)return;
  map.options.worldCopyJump=false;
  map.options.maxBoundsViscosity=1.0;
  const WORLD_BOUNDS=L.latLngBounds(L.latLng(-85.05112878,-180),L.latLng(85.05112878,180));
  map.setMaxBounds(WORLD_BOUNDS);

  map.eachLayer(layer=>{
    if(layer instanceof L.TileLayer && !(layer instanceof L.TileLayer.WMS)) map.removeLayer(layer);
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',{
    attribution:'&copy; OpenStreetMap contributors &copy; CARTO',subdomains:'abcd',maxZoom:19,noWrap:true,bounds:WORLD_BOUNDS
  }).addTo(map);

  if(!map.getPane('romanLabels')){
    const pane=map.createPane('romanLabels');
    pane.style.zIndex='435';
    pane.style.pointerEvents='none';
  }
  const primary=new Set(['seoul','tokyo','beijing','shanghai','hongkong','singapore','bangkok','delhi','dubai','istanbul','london','paris','berlin','rome','madrid','amsterdam','cairo','newyork','losangeles','mexicocity','toronto','saopaulo','buenosaires','sydney','melbourne']);
  const secondary=new Set(['osaka','taipei','hanoi','hochiminh','kualalumpur','jakarta','manila','mumbai','doha','vienna','prague','budapest','warsaw','stockholm','oslo','lisbon','athens','dublin','zurich','chicago','miami','sanfrancisco','vancouver','lima','santiago','riodejaneiro','capetown','nairobi','brisbane','auckland']);
  const labelLayer=L.layerGroup().addTo(map);
  function romanName(key,city){return (typeof providerNames!=='undefined'&&providerNames[key])||city.provider||key;}
  function renderRomanLabels(){
    if(typeof cities==='undefined')return;
    labelLayer.clearLayers();
    const allowed=map.getZoom()<=3?primary:new Set([...primary,...secondary]);
    Object.entries(cities).forEach(([key,city])=>{
      if(!allowed.has(key)||!city.pos)return;
      const icon=L.divIcon({className:'roman-city-label'+(primary.has(key)?'':' secondary'),html:'<span>'+romanName(key,city)+'</span>',iconSize:[1,1],iconAnchor:[0,0]});
      L.marker(city.pos,{icon,pane:'romanLabels',interactive:false,keyboard:false}).addTo(labelLayer);
    });
  }
  renderRomanLabels();
  map.on('zoomend',renderRomanLabels);

  function minimumCoverZoom(){
    const size=map.getSize();
    const needed=Math.max(size.x,size.y);
    return Math.max(2,Math.ceil(Math.log2(Math.max(256,needed)/256)));
  }
  function enforceSingleWorld(){
    map.invalidateSize(false);
    const min=minimumCoverZoom();
    map.setMinZoom(min);
    if(map.getZoom()<min) map.setZoom(min,{animate:false});
    const c=map.getCenter();
    const lat=Math.max(-75,Math.min(75,c.lat));
    const lng=Math.max(-180,Math.min(180,c.lng));
    if(lat!==c.lat||lng!==c.lng) map.panTo([lat,lng],{animate:false});
  }
  enforceSingleWorld();
  window.addEventListener('resize',()=>requestAnimationFrame(enforceSingleWorld));
  window.addEventListener('orientationchange',()=>setTimeout(enforceSingleWorld,100));
  const version=document.querySelector('.version');
  if(version)version.textContent='songdo · v0.0.9';
})();