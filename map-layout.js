(()=>{
  const style=document.createElement('style');
  style.textContent=`
    .map-wrap,#map{width:100%!important;height:100%!important;min-width:0!important}
    #map{background:#dfe9ef!important}
  `;
  document.head.appendChild(style);

  if(typeof map==='undefined'||!map)return;

  // Prevent Leaflet from ever showing repeated copies of the world.
  map.options.worldCopyJump=false;
  map.options.maxBoundsViscosity=1.0;
  const WORLD_BOUNDS=L.latLngBounds(L.latLng(-85.05112878,-180),L.latLng(85.05112878,180));
  map.setMaxBounds(WORLD_BOUNDS);

  // Replace the base OSM tile layer with a non-wrapping one.
  map.eachLayer(layer=>{
    if(layer instanceof L.TileLayer && !(layer instanceof L.TileLayer.WMS)) map.removeLayer(layer);
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'&copy; OpenStreetMap contributors',
    noWrap:true,
    bounds:WORLD_BOUNDS
  }).addTo(map);

  function minimumCoverZoom(){
    const size=map.getSize();
    // At zoom z, one Mercator world is 256*2^z CSS pixels.
    // Make the single world at least as wide and tall as the map viewport,
    // so no empty strip can appear around it on large screens.
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
  if(version)version.textContent='songdo · v0.0.8';
})();