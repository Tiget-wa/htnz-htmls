function lockScroll(on) { document.documentElement.style.overflow = on ? 'hidden' : ''; document.body.style.overflow = on ? 'hidden' : ''; }
function fitLightboxImage(imgEl) {
  if (!imgEl) return;
  var vw = Math.floor(window.innerWidth * 0.96);
  var iw = imgEl.naturalWidth || 0;
  var target = iw ? Math.min(iw, vw) : vw;
  imgEl.style.width = target + 'px';
  imgEl.style.height = 'auto';
}
var LB_LIST = [];
var LB_INDEX = 0;
function setLightboxList(list, startIndex) {
  LB_LIST = Array.isArray(list) ? list : [];
  LB_INDEX = Math.max(0, Math.min(startIndex || 0, LB_LIST.length - 1));
}
function showLightboxAt(index) {
  var box = document.getElementById('lightbox');
  var img = box ? box.querySelector('.lightbox-image') : null;
  if (!box || !img || LB_LIST.length === 0) return;
  LB_INDEX = Math.max(0, Math.min(index, LB_LIST.length - 1));
  var it = LB_LIST[LB_INDEX];
  img.src = it.src;
  img.alt = it.alt || '';
  box.hidden = false; box.classList.add('show'); lockScroll(true);
  if (img.complete) fitLightboxImage(img); else img.addEventListener('load', function(){ fitLightboxImage(img); });
}
function prevLightbox() {
  if (!LB_LIST.length) return;
  var i = LB_INDEX - 1; if (i < 0) i = LB_LIST.length - 1;
  showLightboxAt(i);
}
function nextLightbox() {
  if (!LB_LIST.length) return;
  var i = LB_INDEX + 1; if (i >= LB_LIST.length) i = 0;
  showLightboxAt(i);
}
document.addEventListener('DOMContentLoaded', function () {
  var lb = document.getElementById('lightbox');
  var prevBtn = lb ? lb.querySelector('.lightbox-prev') : null;
  var nextBtn = lb ? lb.querySelector('.lightbox-next') : null;
  if (prevBtn) prevBtn.addEventListener('click', function(e){ e.stopPropagation(); prevLightbox(); });
  if (nextBtn) nextBtn.addEventListener('click', function(e){ e.stopPropagation(); nextLightbox(); });
});
document.addEventListener('DOMContentLoaded', function () {
  var links = document.querySelectorAll('a[href^="#"], .link.more');
  links.forEach(function (el) {
    el.addEventListener('click', function (e) {
      var target = el.getAttribute('href');
      if (target && target.startsWith('#')) {
        e.preventDefault();
        var node = document.querySelector(target);
        if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });

  document.querySelectorAll('[data-toggle="dish"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.dish-card');
      if (card) card.classList.toggle('open');
    });
  });
  document.querySelectorAll('[data-toggle="exp"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.exp-item');
      if (item) item.classList.toggle('open');
    });
  });

  var map = document.getElementById('maplinks');
  var openAmap = document.getElementById('open-amap');
  var openBaidu = document.getElementById('open-baidu');
  function openAmapRoute() {
    var name = map ? (map.dataset.name || '花田农庄') : '花田农庄';
    var via = map ? (map.dataset.via || '') : '';
    var latRaw = map ? parseFloat(map.dataset.lat || '') : NaN;
    var lngRaw = map ? parseFloat(map.dataset.lng || '') : NaN;
    var lat = latRaw, lng = lngRaw;
    if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) > 90 && Math.abs(lng) <= 180) { var t = lat; lat = lng; lng = t; }
    var hasCoord = !isNaN(lat) && !isNaN(lng);
    var url = '';
    if (hasCoord) {
      url = 'https://uri.amap.com/navigation?to=' + lng + ',' + lat + ',' + encodeURIComponent(name) + '&mode=car&src=weixin&coordinate=gaode&callnative=1';
      if (via) url += '&via=' + encodeURIComponent(via);
    } else {
      url = 'https://uri.amap.com/search?keyword=' + encodeURIComponent(name) + '&src=weixin&coordinate=gaode&callnative=1';
    }
    window.location.href = url;
  }
  function openBaiduRoute() {
    var name = map ? (map.dataset.name || '花田农庄') : '花田农庄';
    var via = map ? (map.dataset.via || '') : '';
    var latRaw = map ? parseFloat(map.dataset.lat || '') : NaN;
    var lngRaw = map ? parseFloat(map.dataset.lng || '') : NaN;
    var lat = latRaw, lng = lngRaw;
    if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) > 90 && Math.abs(lng) <= 180) { var t = lat; lat = lng; lng = t; }
    var hasCoord = !isNaN(lat) && !isNaN(lng);
    var url = '';
    if (hasCoord) {
      url = 'baidumap://map/direction?origin=%E6%88%91%E7%9A%84%E4%BD%8D%E7%BD%AE&destination=' + lat + ',' + lng + '&coord_type=wgs84&mode=driving&src=htnz_htmls';
      if (via) url += '&waypoints=' + encodeURIComponent(via);
    } else {
      url = 'baidumap://map/direction?origin=%E6%88%91%E7%9A%84%E4%BD%8D%E7%BD%AE&destination=' + encodeURIComponent(name) + '&mode=driving&src=htnz_htmls';
      if (via) url += '&waypoints=' + encodeURIComponent(via);
    }
    window.location.href = url;
  }
  if (openAmap) openAmap.addEventListener('click', openAmapRoute);
  if (openBaidu) openBaidu.addEventListener('click', openBaiduRoute);

  var sections = ['environment', 'cuisine', 'experiences', 'contact'];
  var quickItems = document.querySelectorAll('.quick-item');
  var sectionEls = sections.map(function(id){ return document.getElementById(id); }).filter(Boolean);
  var ioActiveId = null;
  var secObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) ioActiveId = entry.target.id;
    });
    if (ioActiveId) {
      quickItems.forEach(function(a){ a.classList.toggle('active', a.dataset.id === ioActiveId); });
    }
  }, { root: null, rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  sectionEls.forEach(function(el){ secObserver.observe(el); });
  function getActiveSectionId() {
    var y = Math.floor(window.innerHeight * 0.38);
    for (var i = 0; i < sectionEls.length; i++) {
      var r2 = sectionEls[i].getBoundingClientRect();
      if (r2.top <= y && r2.bottom >= y) return sectionEls[i].id;
    }
    var x = Math.floor(window.innerWidth * 0.5);
    var node = document.elementFromPoint(x, y);
    while (node && node !== document.body) {
      if (node.id && sections.indexOf(node.id) !== -1) return node.id;
      node = node.parentElement;
    }
    var bestId = null; var bestDist = Infinity;
    sectionEls.forEach(function(el){
      var r = el.getBoundingClientRect();
      var d = Math.abs(r.top - y);
      if (d < bestDist) { bestDist = d; bestId = el.id; }
    });
    return bestId;
  }
  function updateQuickActive() {
    var id = ioActiveId || getActiveSectionId();
    if (!id) return;
    quickItems.forEach(function(a){ a.classList.toggle('active', a.dataset.id === id); });
  }
  var ticking = false;
  window.addEventListener('scroll', function(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){ updateQuickActive(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', function(){ updateQuickActive(); });
  window.addEventListener('load', function(){ updateQuickActive(); });
  updateQuickActive();
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = lightbox ? lightbox.querySelector('.lightbox-image') : null;
  var closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  document.querySelectorAll('.open-gallery').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.target;
      var parent = document.getElementById(id);
    var imgs = parent ? parent.querySelectorAll('.detail .thumbs img') : [];
    var list = [];
    imgs.forEach(function (im) {
      var s = im.getAttribute('src') || '';
      if (s) list.push({ src: s, alt: im.getAttribute('alt') || '' });
    });
    if (list.length) { setLightboxList(list, 0); showLightboxAt(0); }
    });
  });
  if (closeBtn) closeBtn.addEventListener('click', function () { if (!lightbox) return; lightbox.classList.remove('show'); setTimeout(function(){ lightbox.hidden = true; lockScroll(false); }, 240); });
  if (lightbox) lightbox.addEventListener('click', function (e) { if (e.target === lightbox) { lightbox.classList.remove('show'); setTimeout(function(){ lightbox.hidden = true; lockScroll(false); }, 240); } });
});

document.addEventListener('DOMContentLoaded', function () {
  var ns = 'http://www.w3.org/2000/svg';
  function makeSVG(tag) { return document.createElementNS(ns, tag); }
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function randFloat(min, max) { return min + Math.random() * (max - min); }
  var palettes = {
    flower: [['#fff3e0', '#ffb74d', '#fb8c00'], ['#fce4ec', '#f48fb1', '#f06292'], ['#e3f2fd', '#64b5f6', '#1e88e5']],
    leaf: [['#c5e1a5', '#388e3c'], ['#a5d6a7', '#2e7d32'], ['#b2dfdb', '#00695c']],
    bamboo: [['#c8e6c9', '#43a047'], ['#b2dfdb', '#00796b']],
    sheep: [['#ffffff', '#cfd8dc'], ['#f5f5f5', '#b0bec5']],
    grass: [['#c5e1a5', '#7cb342']]
  };

  function flowerEl() {
    var petals = rand(5, 8);
    var colors = palettes.flower[rand(0, palettes.flower.length - 1)];
    var size = rand(28, 48);
    var svg = makeSVG('svg'); svg.setAttribute('viewBox', '0 0 50 50');
    var g = makeSVG('g');
    for (var i = 0; i < petals; i++) {
      var angle = (360 / petals) * i;
      var c = colors[i % colors.length];
      var petal = makeSVG('ellipse');
      petal.setAttribute('cx', '25'); petal.setAttribute('cy', '14');
      petal.setAttribute('rx', '8'); petal.setAttribute('ry', '14');
      petal.setAttribute('fill', c);
      petal.setAttribute('transform', 'rotate(' + angle + ' 25 25)');
      g.appendChild(petal);
    }
    var center = makeSVG('circle'); center.setAttribute('cx', '25'); center.setAttribute('cy', '25'); center.setAttribute('r', '6'); center.setAttribute('fill', '#ffd54f');
    svg.appendChild(g); svg.appendChild(center);
    var wrap = document.createElement('span'); wrap.className = 'shape flower';
    wrap.style.width = size + 'px'; wrap.style.height = size + 'px';
    wrap.appendChild(svg);
    return wrap;
  }

  function leafEl() {
    var colors = palettes.leaf[rand(0, palettes.leaf.length - 1)];
    var sizeW = rand(42, 64); var sizeH = rand(20, 34);
    var svg = makeSVG('svg'); svg.setAttribute('viewBox', '0 0 60 30');
    var defs = makeSVG('defs'); var grad = makeSVG('linearGradient');
    var gid = 'g' + Date.now() + rand(0, 9999);
    grad.setAttribute('id', gid); grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0'); grad.setAttribute('x2', '1'); grad.setAttribute('y2', '0');
    var s1 = makeSVG('stop'); s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', colors[0]);
    var s2 = makeSVG('stop'); s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', colors[1]);
    grad.appendChild(s1); grad.appendChild(s2); defs.appendChild(grad); svg.appendChild(defs);
    var path = makeSVG('path'); path.setAttribute('d', 'M5 15 C 15 -5, 45 -5, 55 15 C 45 35, 15 35, 5 15 Z'); path.setAttribute('fill', 'url(#' + gid + ')');
    var vein = makeSVG('line'); vein.setAttribute('x1', '5'); vein.setAttribute('y1', '15'); vein.setAttribute('x2', '55'); vein.setAttribute('y2', '15'); vein.setAttribute('stroke', 'rgba(255,255,255,0.7)'); vein.setAttribute('stroke-width', '1.5');
    svg.appendChild(path); svg.appendChild(vein);
    var wrap = document.createElement('span'); wrap.className = 'shape leaf2';
    wrap.style.width = sizeW + 'px'; wrap.style.height = sizeH + 'px';
    wrap.appendChild(svg);
    return wrap;
  }

  function bambooEl() {
    var colors = palettes.bamboo[rand(0, palettes.bamboo.length - 1)];
    var height = rand(60, 100), width = rand(8, 12), segments = rand(3, 5);
    var svg = makeSVG('svg'); svg.setAttribute('viewBox', '0 0 24 ' + height);
    var stalk = makeSVG('rect'); stalk.setAttribute('x', '9'); stalk.setAttribute('y', '0'); stalk.setAttribute('width', width); stalk.setAttribute('height', height); stalk.setAttribute('rx', '6'); stalk.setAttribute('fill', colors[1]);
    svg.appendChild(stalk);
    for (var i = 1; i < segments; i++) {
      var y = Math.floor(height / segments) * i;
      var node = makeSVG('rect'); node.setAttribute('x', '7'); node.setAttribute('y', String(y - 2)); node.setAttribute('width', String(width + 4)); node.setAttribute('height', '4'); node.setAttribute('fill', colors[0]);
      svg.appendChild(node);
    }
    var wrap = document.createElement('span'); wrap.className = 'shape bamboo2';
    wrap.style.width = (width + 8) + 'px'; wrap.style.height = height + 'px';
    wrap.appendChild(svg);
    return wrap;
  }

  function grassEl() {
    var colors = palettes.grass[0];
    var w = rand(32, 60), h = rand(20, 32);
    var svg = makeSVG('svg'); svg.setAttribute('viewBox', '0 0 60 32');
    var base = makeSVG('rect'); base.setAttribute('x', '0'); base.setAttribute('y', '28'); base.setAttribute('width', '60'); base.setAttribute('height', '4'); base.setAttribute('fill', colors[0]); svg.appendChild(base);
    var g = makeSVG('g');
    for (var i = 0; i < 6; i++) {
      var x = 5 + i * 9; var blade = makeSVG('path'); blade.setAttribute('d', 'M' + x + ' 28 Q ' + (x + 3) + ' ' + rand(18, 24) + ', ' + (x + 6) + ' 28'); blade.setAttribute('stroke', colors[1]); blade.setAttribute('fill', 'none'); blade.setAttribute('stroke-width', '2'); g.appendChild(blade);
    }
    svg.appendChild(g);
    var wrap = document.createElement('span'); wrap.className = 'shape grass'; wrap.style.width = w + 'px'; wrap.style.height = h + 'px'; wrap.appendChild(svg); return wrap;
  }

  function sheepEl() {
    var colors = palettes.sheep[rand(0, palettes.sheep.length - 1)];
    var w = rand(44, 64), h = rand(28, 40);
    var svg = makeSVG('svg'); svg.setAttribute('viewBox', '0 0 80 50');
    var body = makeSVG('ellipse'); body.setAttribute('cx', '40'); body.setAttribute('cy', '26'); body.setAttribute('rx', '22'); body.setAttribute('ry', '14'); body.setAttribute('fill', colors[0]); svg.appendChild(body);
    var head = makeSVG('circle'); head.setAttribute('cx', '20'); head.setAttribute('cy', '22'); head.setAttribute('r', '8'); head.setAttribute('fill', colors[1]); svg.appendChild(head);
    var ear = makeSVG('ellipse'); ear.setAttribute('cx', '15'); ear.setAttribute('cy', '18'); ear.setAttribute('rx', '3'); ear.setAttribute('ry', '5'); ear.setAttribute('fill', colors[1]); svg.appendChild(ear);
    var leg1 = makeSVG('rect'); leg1.setAttribute('x', '34'); leg1.setAttribute('y', '36'); leg1.setAttribute('width', '3'); leg1.setAttribute('height', '10'); leg1.setAttribute('fill', '#8d6e63'); svg.appendChild(leg1);
    var leg2 = makeSVG('rect'); leg2.setAttribute('x', '44'); leg2.setAttribute('y', '36'); leg2.setAttribute('width', '3'); leg2.setAttribute('height', '10'); leg2.setAttribute('fill', '#8d6e63'); svg.appendChild(leg2);
    var wrap = document.createElement('span'); wrap.className = 'shape sheep'; wrap.style.width = w + 'px'; wrap.style.height = h + 'px'; wrap.appendChild(svg); return wrap;
  }

  function place(container, el, opts) {
    var left = randFloat(opts.left[0], opts.left[1]);
    var top = randFloat(opts.top[0], opts.top[1]);
    var rot = rand(-18, 18);
    el.style.left = left + '%';
    el.style.top = top + '%';
    el.style.transform = 'rotate(' + rot + 'deg)';
    container.appendChild(el);
  }

  function populateOne(container, shapes) {
    var type = shapes[rand(0, shapes.length - 1)];
    var el = null;
    if (type === 'flower') el = flowerEl();
    else if (type === 'leaf') el = leafEl();
    else if (type === 'bamboo') el = bambooEl();
    else if (type === 'grass') el = grassEl();
    else if (type === 'sheep') el = sheepEl();
    if (!el) return;
    var opts = { left: [4, 96], top: [6, 92] };
    place(container, el, opts);
  }

  var heroDecor = document.querySelector('.decor-hero');
  if (heroDecor) for (var i = 0; i < rand(2, 4); i++) populateOne(heroDecor, ['flower', 'leaf', 'bamboo', 'grass']);
  document.querySelectorAll('.decor-section').forEach(function (sec) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          if (!sec.dataset.generated) {
            sec.dataset.generated = '1';
            for (var i = 0; i < rand(1, 2); i++) populateOne(sec, ['flower', 'leaf', 'bamboo', 'grass', 'sheep']);
          }
        }
      });
    }, { threshold: 0.1 });
    obs.observe(sec);
  });

  var global = document.querySelector('.global-decor');
  function populateGlobal() {
    if (!global) return;
    var docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    global.style.height = docH + 'px';
    if (global.dataset.generated) return;
    global.dataset.generated = '1';
    var count = Math.max(6, Math.floor(docH / 1400) * 4);
    for (var i = 0; i < count; i++) {
      var typeSet = ['flower', 'leaf', 'bamboo', 'grass'];
      if (rand(0, 9) === 5) typeSet.push('sheep');
      var el = null; var type = typeSet[rand(0, typeSet.length - 1)];
      if (type === 'flower') el = flowerEl();
      else if (type === 'leaf') el = leafEl();
      else if (type === 'bamboo') el = bambooEl();
      else if (type === 'grass') el = grassEl();
      else if (type === 'sheep') el = sheepEl();
      if (!el) continue;
      var left = randFloat(3, 97);
      var topPx = rand(40, docH - 200);
      el.style.left = left + '%';
      el.style.top = topPx + 'px';
      el.style.transform = 'rotate(' + rand(-18, 18) + 'deg)';
      global.appendChild(el);
    }
  }
  populateGlobal();
  window.addEventListener('load', populateGlobal);
  function applyFitOnLoad(img, ar) {
    function run() {
      var iw = img.naturalWidth || img.width;
      var ih = img.naturalHeight || img.height;
      if (!iw || !ih) return;
      var iar = iw / ih;
      var delta = Math.abs(iar - ar) / ar;
      var container = img.closest('.aspect-16x9, .aspect-4x3, .aspect-3x2');
      if (!container) return;
      if (delta > 0.35) container.classList.add('fit-contain'); else container.classList.remove('fit-contain');
    }
    if (img.complete) run(); else img.addEventListener('load', run);
  }
  document.querySelectorAll('.aspect-16x9 img').forEach(function (img) { applyFitOnLoad(img, 16/9); });
  document.querySelectorAll('.aspect-4x3 img').forEach(function (img) { applyFitOnLoad(img, 4/3); });
  document.querySelectorAll('.aspect-3x2 img').forEach(function (img) { applyFitOnLoad(img, 3/2); });
  document.querySelectorAll('.detail .thumbs img').forEach(function (img) {
    function run() {
      var iw = img.naturalWidth || img.width;
      var ih = img.naturalHeight || img.height;
      if (!iw || !ih) return;
      var iar = iw / ih;
      var delta = Math.abs(iar - 1);
      if (delta > 0.35) img.classList.add('img-contain'); else img.classList.remove('img-contain');
    }
    if (img.complete) run(); else img.addEventListener('load', run);
  });
  var galleryEl = document.getElementById('gallery-masonry');
  var filterBar = document.querySelector('.gallery-filter');
  var loadMoreBtn = document.getElementById('gallery-loadmore');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg2 = lightbox ? lightbox.querySelector('.lightbox-image') : null;
  var data = [];
  function pushImg(img, group) {
    var src = img.getAttribute('src') || img.getAttribute('data-src');
    var alt = img.getAttribute('alt') || '';
    if (!src || src.trim() === '') return;
    data.push({ src: src, alt: alt, group: group });
  }
  document.querySelectorAll('.scroll-gallery .card img').forEach(function (img) { pushImg(img, 'env'); });
  document.querySelectorAll('.dish-card .media img').forEach(function (img) { pushImg(img, 'food'); });
  document.querySelectorAll('.dish-card .detail .thumbs img').forEach(function (img) { pushImg(img, 'food'); });
  document.querySelectorAll('.exp-item .exp-cover img').forEach(function (img) { pushImg(img, 'exp'); });
  document.querySelectorAll('.exp-item .detail .thumbs img').forEach(function (img) { pushImg(img, 'exp'); });
  var extra = Array.isArray(window.EXTRA_GALLERY) ? window.EXTRA_GALLERY : [];
  extra.forEach(function (it) {
    if (!it || !it.src || it.src.trim() === '') return;
    data.push({ src: it.src, alt: it.alt || '', group: 'extra' });
  });
  var page = 0, pageSize = 20, current = 'all';
  function resizeMasonryItem(item) {
    var grid = galleryEl;
    if (!grid || !item) return;
    var row = parseInt(getComputedStyle(grid).getPropertyValue('grid-auto-rows')) || 8;
    var gap = parseInt(getComputedStyle(grid).getPropertyValue('gap')) || 12;
    var img = item.querySelector('img');
    var cap = item.querySelector('figcaption');
    var hImg = img ? img.getBoundingClientRect().height : 0;
    var hCap = cap ? cap.getBoundingClientRect().height : 0;
    var rowSpan = Math.ceil((hImg + hCap + gap) / (row + gap));
    item.style.gridRowEnd = 'span ' + (rowSpan || 1);
  }
  function bindMasonry(img, item) {
    function run() { resizeMasonryItem(item); }
    if (img.complete) run(); else img.addEventListener('load', run);
  }
  function render(items, append) {
    if (!galleryEl) return;
    if (!append) galleryEl.innerHTML = '';
    items.forEach(function (it, idx) {
      var fig = document.createElement('figure'); fig.className = 'm-item';
      var im = document.createElement('img'); im.loading = 'lazy'; im.src = it.src; im.alt = it.alt;
      fig.appendChild(im);
      bindMasonry(im, fig);
      fig.addEventListener('click', function () { setLightboxList(items, idx); showLightboxAt(idx); });
      galleryEl.appendChild(fig);
    });
    requestAnimationFrame(function(){ document.querySelectorAll('#gallery-masonry .m-item').forEach(resizeMasonryItem); });
  }
  function applyFilter(key) {
    current = key;
    page = 0;
    var list = data.filter(function (d) { return key === 'all' ? true : d.group === key; });
    var slice = list.slice(page * pageSize, (page + 1) * pageSize);
    render(slice, false);
  }
  function loadMore() {
    var list = data.filter(function (d) { return current === 'all' ? true : d.group === current; });
    page += 1;
    var slice = list.slice(page * pageSize, (page + 1) * pageSize);
    render(slice, true);
  }
  if (filterBar) filterBar.addEventListener('click', function (e) {
    var btn = e.target.closest('.chip');
    if (!btn) return;
    filterBar.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-selected', 'false'); });
    btn.setAttribute('aria-selected', 'true');
    var key = btn.dataset.filter || 'all';
    applyFilter(key);
  });
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMore);
  applyFilter('all');
  window.addEventListener('resize', function(){ if (lightbox && !lightbox.hidden) { fitLightboxImage(lightboxImg2); } });
});