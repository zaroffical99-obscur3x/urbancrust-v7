(function(){
  // Food typing animation
  const words=[['Crown Crust Pizza','fa-pizza-slice'],['Zinger Burgers','fa-burger'],['Crispy Broast','fa-drumstick-bite'],['Chowmein & Rice','fa-bowl-rice'],['Oreo Shakes','fa-blender'],['Karak Chai','fa-mug-hot'],['Ice Cream','fa-ice-cream']];
  const tico=document.getElementById('typedIco');
  const el=document.getElementById('typed');let w=0,c=0,del=false;
  function type(){
    const cur=words[w][0];if(tico&&c<=1)tico.className='fas '+words[w][1]+' type-ico';el.textContent=del?cur.slice(0,--c):cur.slice(0,++c);
    let t=del?45:95;
    if(!del&&c===cur.length){t=1500;del=true}else if(del&&c===0){del=false;w=(w+1)%words.length;t=350}
    setTimeout(type,t);
  }
  if(el)type();

  // Falling food
  const rain=document.getElementById('rain');
  if(rain){const f=['fa-pizza-slice','fa-burger','fa-drumstick-bite','fa-ice-cream','fa-bowl-rice','fa-mug-hot','fa-cheese','fa-pepper-hot'];
    for(let i=0;i<14;i++){const s=document.createElement('span');s.innerHTML='<i class="fas '+f[i%f.length]+'"></i>';
      s.style.cssText=`left:${Math.random()*100}%;font-size:${28+Math.random()*44}px;animation-duration:${14+Math.random()*16}s;animation-delay:${-Math.random()*20}s`;rain.appendChild(s)}}

  // Open-now badge (Pakistan time, 11am-11pm)
  const b=document.getElementById('openBadge');
  if(b){const h=+new Intl.DateTimeFormat('en-GB',{hour:'numeric',hour12:false,timeZone:'Asia/Karachi'}).format(new Date());
    const open=h>=13||h<2;b.classList.toggle('closed',!open);
    b.querySelector('.txt').textContent=open?'Open Now · Closes 2:00 AM':'Closed · Opens 1:00 PM';}

  // Parallax hero
  const vis=document.querySelector('.hero-visual');
  if(vis&&matchMedia('(pointer:fine)').matches){
    document.addEventListener('mousemove',e=>{const x=(e.clientX/innerWidth-.5)*20,y=(e.clientY/innerHeight-.5)*20;
      vis.style.transform=`translate(${x}px,${y}px)`;});}

  // Slider buttons
  const sl=document.getElementById('slider');
  document.querySelectorAll('[data-slide]').forEach(btn=>btn.addEventListener('click',()=>{
    sl.scrollBy({left:+btn.dataset.slide*300,behavior:'smooth'})}));
  if(sl){let auto=setInterval(()=>{sl.scrollLeft+sl.clientWidth>=sl.scrollWidth-10?sl.scrollTo({left:0,behavior:'smooth'}):sl.scrollBy({left:300,behavior:'smooth'})},4200);
    sl.addEventListener('pointerdown',()=>clearInterval(auto));sl.addEventListener('mouseenter',()=>clearInterval(auto));}

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(it=>it.querySelector('.faq-q').addEventListener('click',()=>{
    const open=it.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(x=>{x.classList.remove('open');x.querySelector('.faq-a').style.maxHeight=0});
    if(!open){it.classList.add('open');const a=it.querySelector('.faq-a');a.style.maxHeight=a.scrollHeight+'px'}}));

  // Day / night switch
  const sw=document.getElementById('dnSwitch');
  if(sw){const wrap=document.querySelector('.late-wrap'),note=document.getElementById('dnNote');
    const set=n=>{wrap.classList.toggle('is-night',n);wrap.classList.toggle('night-on',n);sw.setAttribute('aria-checked',n);
      sw.querySelector('.dn-knob i').className='fas '+(n?'fa-moon':'fa-sun');
      note.innerHTML=n?'<i class="fas fa-moon"></i> Midnight cravings? Hot food and free delivery until 2 AM.':'<i class="fas fa-sun"></i> Lunch rush from 1 PM — burgers, pizzas and broasts.'};
    sw.addEventListener('click',()=>set(!wrap.classList.contains('night-on')));sw.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();sw.click()}});
    let auto=setInterval(()=>sw.click(),5000);sw.addEventListener('click',e=>{if(e.isTrusted)clearInterval(auto)});}

  // Seamless reels: duplicate tracks
  document.querySelectorAll('.reel-track').forEach(t=>{[...t.children].forEach(c=>{const k=c.cloneNode(true);k.setAttribute('aria-hidden','true');t.appendChild(k)})});

  // Welcome popup with popular picks (once per session)
  try{if(!sessionStorage.getItem('ucPromo')){setTimeout(()=>{if(!document.querySelector('.pop-ov.show')&&window.ucPopup){sessionStorage.setItem('ucPromo','1');
    const G='images/gallery/';
    const picks=[['zinger-burger','Zinger Burger','fa-fire','Best Seller','zinger'],['cheezy-pizza','Cheezy Pizza','fa-pizza-slice','Fan Fave','pizza'],['chowmein','Chowmein','fa-bowl-rice','Wok Fresh','chowmein'],['pizza-roll','Pizza Roll','fa-crown','Must Try','roll']];
    const tiles=picks.map((p,i)=>'<a class="pp-tile" style="--i:'+i+'" href="urban-menu.html?q='+p[4]+'"><img src="'+G+p[0]+'.jpg" alt="'+p[1]+'"><span class="pp-tag"><i class="fas '+p[2]+'"></i> '+p[3]+'</span><span class="pp-name">'+p[1]+'</span></a>').join('');
    const extra='<div class="pp-grid">'+tiles+'</div><div class="pp-chips"><span><i class="fas fa-clock"></i> 1 PM – 2 AM</span><span><i class="fas fa-motorcycle"></i> Free delivery</span><span><i class="fas fa-tags"></i> Family Deal Rs. 3,300</span></div>';
    ucPopup({kick:'Popular Right Now',title:'Hungry? Pick a favourite',desc:'',wide:true,extra:extra,
      actions:'<a class="btn btn-primary shine" href="urban-menu.html"><i class="fas fa-utensils"></i> Order Now</a><a class="btn btn-sipcta" href="sweets.html"><i class="fas fa-mug-hot"></i> Urban Sip</a>'});
    if(window.ucTrack)ucTrack('welcome_popup',{});
  }},5500)}}catch(e){}
})();
