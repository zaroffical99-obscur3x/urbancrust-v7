(function(){
  const words=[['Latte','fa-mug-hot'],['Cappuccino','fa-mug-saucer'],['Espresso','fa-mug-saucer'],['Karak Chai','fa-mug-hot'],['Cupcake','fa-cake-candles'],['Corn Soup','fa-bowl-food'],['Ice Cream','fa-ice-cream']];
  const el=document.getElementById('sipTyped'),ico=document.getElementById('sipIco');let w=0,c=0,del=false;
  (function type(){const cur=words[w][0];if(c<=1&&ico)ico.className='fas '+words[w][1];el.textContent=del?cur.slice(0,--c):cur.slice(0,++c);
    let t=del?45:95;if(!del&&c===cur.length){t=1500;del=true}else if(del&&c===0){del=false;w=(w+1)%words.length;t=350}setTimeout(type,t)})();
  const r=document.getElementById('steamRain'),f=['fa-mug-hot','fa-ice-cream','fa-cake-candles','fa-cookie-bite','fa-mug-saucer','fa-leaf'];
  if(r)for(let i=0;i<14;i++){const s=document.createElement('span');s.innerHTML='<i class="fas '+f[i%f.length]+'"></i>';
    s.style.cssText='left:'+Math.random()*100+'%;font-size:'+(26+Math.random()*40)+'px;animation-duration:'+(14+Math.random()*16)+'s;animation-delay:'+(-Math.random()*20)+'s';r.appendChild(s)}
  document.querySelectorAll('.reel-track').forEach(t=>{[...t.children].forEach(c=>{const k=c.cloneNode(true);k.setAttribute('aria-hidden','true');t.appendChild(k)})});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('in'),+e.target.dataset.delay||0);io.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll('.reveal,.reveal-zoom').forEach(x=>io.observe(x));
  // Welcome popup with popular sips (once per session)
  try{if(!sessionStorage.getItem('ucPromoSip')){setTimeout(()=>{if(!document.querySelector('.pop-ov.show')&&window.ucPopup){sessionStorage.setItem('ucPromoSip','1');
    const G='images/gallery/';
    const picks=[['hot-coffee','Hot Coffee','fa-mug-hot','Warm Up'],['karak-chai','Karak Chai','fa-fire','Signature'],['cupcake','Cupcake','fa-cake-candles','Sweet'],['soup','Corn Soup','fa-bowl-food','Cosy']];
    const tiles=picks.map((p,i)=>'<a class="pp-tile" style="--i:'+i+'" href="#menu"><img src="'+G+p[0]+'.jpg" alt="'+p[1]+'"><span class="pp-tag"><i class="fas '+p[2]+'"></i> '+p[3]+'</span><span class="pp-name">'+p[1]+'</span></a>').join('');
    ucPopup({kick:'Popular Right Now',title:'Time for a little sip',desc:'',wide:true,
      extra:'<div class="pp-grid">'+tiles+'</div><div class="pp-chips"><span><i class="fas fa-clock"></i> 1 PM – 2 AM</span><span><i class="fas fa-motorcycle"></i> Free delivery</span></div>',
      actions:'<a class="btn btn-primary shine" href="#menu"><i class="fas fa-mug-hot"></i> See The Menu</a><a class="btn btn-crustcta" href="index.html"><i class="fas fa-pizza-slice"></i> Urban Crust</a>'});
  }},5500)}}catch(e){}
  // popup helper buttons for hash targets
  document.addEventListener('click',e=>{const a=e.target.closest('.pop-acts a[href^="#"],.pp-tile[href^="#"]');if(a)document.querySelector('.pop-x').click()});
})();
