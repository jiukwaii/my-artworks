document.addEventListener('DOMContentLoaded', function() {
    // =========================================================
    // 00 page setup
    // =========================================================
    // 自己控制返回首页后的滚动位置，避免浏览器自动恢复 + smooth scroll 造成滑动感。
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }


    // =========================================================
    // 02 navbar
    // =========================================================
    // 移动端菜单切换
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('toggle');
        });
    }

    // 点击导航链接后关闭菜单
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks) {
                navLinks.classList.remove('active');
                if (hamburger) {
                    hamburger.classList.remove('toggle');
                }
            }
        });
    });


    // =========================================================
    // 03 artwork gallery
    // =========================================================
    // 加载艺术作品
    loadArtworks();
    

    // =========================================================
    // 06 video preview
    // =========================================================
    // 加载3D打印视频
    load3DPrintVideos();
    

    // =========================================================
    // 07 scroll restore / 08 back to top / footer utility
    // =========================================================
    // 恢复滚动位置
    restoreScrollPosition();

    // 初始化返回顶部按钮
    initBackToTop();

    // 初始化固定导航栏滚动显示/隐藏
    initNavbarAutoHide(hamburger, navLinks);

    // 自动更新页脚年份
    updateFooterYear();
});



/* =========================================================
   07 scroll restore
   ========================================================= */
// 即时滚动辅助：用于“返回首页原位置 / 页面初始化 / Lightbox 关闭”等场景。
// 全局 CSS 有 scroll-behavior: smooth；如果直接 window.scrollTo，浏览器可能会用动画滚回去，
// 造成“从上往下滑回来”的感觉。这里会临时关闭 smooth scroll，再恢复。
function scrollToInstantly(top = 0, left = 0) {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlBehavior = html.style.scrollBehavior;
    const previousBodyBehavior = body.style.scrollBehavior;

    html.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';

    window.scrollTo({ top, left, behavior: 'auto' });
    html.scrollTop = top;
    body.scrollTop = top;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            html.style.scrollBehavior = previousHtmlBehavior;
            body.style.scrollBehavior = previousBodyBehavior;
        });
    });
}



/* =========================================================
   Footer utility
   ========================================================= */
// 自动更新页脚年份
function updateFooterYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();

    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}


/* =========================================================
   02 navbar
   ========================================================= */
// 固定导航栏：向下滚动隐藏，向上滚动显示
function initNavbarAutoHide(hamburger, navLinks) {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    let ticking = false;
    let anchorScrollLockUntil = 0;
    const directionThreshold = 14;
    const hideStartOffset = 120;

    function showNavbar() {
        navbar.classList.remove('navbar-hidden');
    }

    function hideNavbar() {
        navbar.classList.add('navbar-hidden');
    }

    function handleNavbarScroll() {
        const currentScrollY = window.scrollY;
        const scrollDifference = currentScrollY - lastScrollY;
        const menuIsOpen = navLinks && navLinks.classList.contains('active');
        const anchorScrollIsActive = Date.now() < anchorScrollLockUntil;

        if (currentScrollY <= 8 || menuIsOpen || anchorScrollIsActive) {
            showNavbar();
            lastScrollY = currentScrollY;
            ticking = false;
            return;
        }

        if (Math.abs(scrollDifference) < directionThreshold) {
            ticking = false;
            return;
        }

        if (scrollDifference > 0 && currentScrollY > hideStartOffset) {
            hideNavbar();
        } else if (scrollDifference < 0) {
            showNavbar();
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(handleNavbarScroll);
            ticking = true;
        }
    });

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            showNavbar();
        });
    }

    document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
        link.addEventListener('click', function() {
            anchorScrollLockUntil = Date.now() + 1000;
            showNavbar();
        });
    });

    showNavbar();
}


/* =========================================================
   01 constants / data + 03 artwork gallery
   ========================================================= */
// 动态加载艺术作品
function loadArtworks() {
    const artworkGrid = document.querySelector('.artwork-grid');
    if (!artworkGrid) return;
    let activeLightboxKeyHandler = null;

    // ---------------------------------------------------------
    // 01 constants / data
    // ---------------------------------------------------------
    // 艺术作品数据
    const artworks = [
        {
            image: 'webphoto/Image_20250806171201_168.webp',
            title: '海邊少女'
        },
        {
            image: 'webphoto/Image_20250805153619_70.webp',
            title: 'Dora King'
        },
        {
            image: 'webphoto/d2795fb66ab3a4cb868b15915f0822e0.webp',
            title: '飛鳥與少女'
        },
        {
            image: 'webphoto/614e62d84900b8eb7dca8202349345f2.webp',
            title: 'Penguin King'
        },
        {
            image: 'webphoto/Image_20250805153619_69.webp',
            title: 'Makima'
        },
        {
            image: 'webphoto/Image_20250805153619_68.webp',
            title: '漢堡少女'
        },
        {
            image: 'webphoto/7ebb92e5ed9a54e786dcb8e2b47b818a.webp',
            title: '畢業紀念'
        },
        {
            image: 'webphoto/301ed367d7e2b3b5d4d5146eae5423cd.webp',
            title: '抱貓少女'
        },
        {
            image: 'webphoto/a45dd89d0ebdb4f53fbf3ac99c8e019d.webp',
            title: '殺手女僕'
        },
        {
            image: 'webphoto/9dec5c5f28b2e89a744260e78242945f.webp',
            title: '向日葵少女'
        },
        {
            image: 'webphoto/0f12e295770ae362c53ffe7601f4bad0.webp',
            title: '生日派對'
        },
        {
            image: 'webphoto/7830aaa70eb63159111e59d17e318d23.webp',
            title: '牛角少女'
        }
    ];

    const imageMeta = {
            "webphoto/Image_20250806171201_168.webp": {
                    "src": "webphoto/Image_20250806171201_168-800.webp",
                    "srcset": "webphoto/Image_20250806171201_168-480.webp 480w, webphoto/Image_20250806171201_168-800.webp 800w, webphoto/Image_20250806171201_168-1200.webp 1200w",
                    "width": 800,
                    "height": 663
            },
            "webphoto/Image_20250805153619_70.webp": {
                    "src": "webphoto/Image_20250805153619_70-800.webp",
                    "srcset": "webphoto/Image_20250805153619_70-480.webp 480w, webphoto/Image_20250805153619_70-800.webp 800w",
                    "width": 800,
                    "height": 1001
            },
            "webphoto/d2795fb66ab3a4cb868b15915f0822e0.webp": {
                    "src": "webphoto/d2795fb66ab3a4cb868b15915f0822e0-800.webp",
                    "srcset": "webphoto/d2795fb66ab3a4cb868b15915f0822e0-480.webp 480w, webphoto/d2795fb66ab3a4cb868b15915f0822e0-800.webp 800w",
                    "width": 800,
                    "height": 600
            },
            "webphoto/614e62d84900b8eb7dca8202349345f2.webp": {
                    "src": "webphoto/614e62d84900b8eb7dca8202349345f2-800.webp",
                    "srcset": "webphoto/614e62d84900b8eb7dca8202349345f2-480.webp 480w, webphoto/614e62d84900b8eb7dca8202349345f2-800.webp 800w, webphoto/614e62d84900b8eb7dca8202349345f2-1200.webp 1200w",
                    "width": 800,
                    "height": 999
            },
            "webphoto/Image_20250805153619_69.webp": {
                    "src": "webphoto/Image_20250805153619_69-800.webp",
                    "srcset": "webphoto/Image_20250805153619_69-480.webp 480w, webphoto/Image_20250805153619_69-800.webp 800w",
                    "width": 800,
                    "height": 999
            },
            "webphoto/Image_20250805153619_68.webp": {
                    "src": "webphoto/Image_20250805153619_68-800.webp",
                    "srcset": "webphoto/Image_20250805153619_68-480.webp 480w, webphoto/Image_20250805153619_68-800.webp 800w",
                    "width": 800,
                    "height": 1000
            },
            "webphoto/7ebb92e5ed9a54e786dcb8e2b47b818a.webp": {
                    "src": "webphoto/7ebb92e5ed9a54e786dcb8e2b47b818a-800.webp",
                    "srcset": "webphoto/7ebb92e5ed9a54e786dcb8e2b47b818a-480.webp 480w, webphoto/7ebb92e5ed9a54e786dcb8e2b47b818a-800.webp 800w, webphoto/7ebb92e5ed9a54e786dcb8e2b47b818a-1200.webp 1200w",
                    "width": 800,
                    "height": 537
            },
            "webphoto/301ed367d7e2b3b5d4d5146eae5423cd.webp": {
                    "src": "webphoto/301ed367d7e2b3b5d4d5146eae5423cd-800.webp",
                    "srcset": "webphoto/301ed367d7e2b3b5d4d5146eae5423cd-480.webp 480w, webphoto/301ed367d7e2b3b5d4d5146eae5423cd-800.webp 800w, webphoto/301ed367d7e2b3b5d4d5146eae5423cd-1200.webp 1200w",
                    "width": 800,
                    "height": 1041
            },
            "webphoto/a45dd89d0ebdb4f53fbf3ac99c8e019d.webp": {
                    "src": "webphoto/a45dd89d0ebdb4f53fbf3ac99c8e019d-800.webp",
                    "srcset": "webphoto/a45dd89d0ebdb4f53fbf3ac99c8e019d-480.webp 480w, webphoto/a45dd89d0ebdb4f53fbf3ac99c8e019d-800.webp 800w",
                    "width": 800,
                    "height": 1068
            },
            "webphoto/9dec5c5f28b2e89a744260e78242945f.webp": {
                    "src": "webphoto/9dec5c5f28b2e89a744260e78242945f-800.webp",
                    "srcset": "webphoto/9dec5c5f28b2e89a744260e78242945f-480.webp 480w, webphoto/9dec5c5f28b2e89a744260e78242945f-800.webp 800w, webphoto/9dec5c5f28b2e89a744260e78242945f-1200.webp 1200w",
                    "width": 800,
                    "height": 986
            },
            "webphoto/0f12e295770ae362c53ffe7601f4bad0.webp": {
                    "src": "webphoto/0f12e295770ae362c53ffe7601f4bad0-800.webp",
                    "srcset": "webphoto/0f12e295770ae362c53ffe7601f4bad0-480.webp 480w, webphoto/0f12e295770ae362c53ffe7601f4bad0-800.webp 800w, webphoto/0f12e295770ae362c53ffe7601f4bad0-1200.webp 1200w",
                    "width": 800,
                    "height": 488
            },
            "webphoto/7830aaa70eb63159111e59d17e318d23.webp": {
                    "src": "webphoto/7830aaa70eb63159111e59d17e318d23-480.webp",
                    "srcset": "webphoto/7830aaa70eb63159111e59d17e318d23-480.webp 480w",
                    "width": 480,
                    "height": 709
            }
    };


    // 检查当前页面是否为全部作品页面
    const isAllArtworksPage = window.location.pathname.includes('all-artworks');
    
    // 全局 Lightbox / Carousel 顺序：永远跟 All Works 页面显示顺序一致。
    // 首页外层仍只展示前 6 张精选；Lightbox 内层使用完整作品集。
    const galleryItems = [...artworks.slice(0, 9), artworks[10], artworks[9], artworks[11]];
    const displayedArtworks = isAllArtworksPage ? galleryItems : galleryItems.slice(0, 6);

    // 确定要显示的作品数量
    const displayCount = displayedArtworks.length;

    function getGalleryIndex(artwork) {
        return galleryItems.findIndex(item => item.image === artwork.image);
    }

    // 手机端大图比例：小图统一 4:5；大图根据作品原比例做轻裁切。
    // 这些 class 只影响手机端页面内展示，Lightbox / Carousel 仍然显示完整原比例。
    function getMobileRatioClass(artwork) {
        const mobileFeatureRatioMap = {
            'webphoto/Image_20250806171201_168.webp': ' mobile-feature mobile-feature-soft-wide',
            'webphoto/614e62d84900b8eb7dca8202349345f2.webp': ' mobile-feature mobile-feature-portrait',
            'webphoto/7ebb92e5ed9a54e786dcb8e2b47b818a.webp': ' mobile-feature mobile-feature-landscape',
            'webphoto/0f12e295770ae362c53ffe7601f4bad0.webp': ' mobile-feature mobile-feature-wide'
        };

        return mobileFeatureRatioMap[artwork.image] || '';
    }
    
    // ---------------------------------------------------------
    // 03 artwork gallery: render cards
    // ---------------------------------------------------------
    // 生成艺术作品HTML
    // Loading strategy:
    // - 首頁與全部作品頁只讓前 4 張作品 eager，避免首屏與作品區等待太久。
    // - 後面的作品保留 lazy，並由 warmUpLazyArtworkImages() 提前約 1200px 觸發。
    // - 只有全部作品頁第一張作品加 high priority，避免首頁主視覺被作品圖搶資源。
    displayedArtworks.slice(0, displayCount).forEach((artwork, index) => {
        const artworkItem = document.createElement('div');
        artworkItem.className = `artwork-item${getMobileRatioClass(artwork)}`;

        const meta = imageMeta[artwork.image] || {};
        const imageSrc = meta.src || artwork.image;
        const srcsetAttr = meta.srcset ? ` srcset="${meta.srcset}" sizes="(max-width: 768px) 90vw, 33vw"` : '';
        const widthAttr = meta.width ? ` width="${meta.width}"` : '';
        const heightAttr = meta.height ? ` height="${meta.height}"` : '';
        const loadingMode = index < 4 ? 'eager' : 'lazy';
        const fetchPriority = isAllArtworksPage && index === 0 ? ' fetchpriority="high"' : '';

        artworkItem.innerHTML = `
            <img src="${imageSrc}"${srcsetAttr} alt="${artwork.title}" data-index="${index}" data-gallery-index="${getGalleryIndex(artwork)}" loading="${loadingMode}" decoding="async"${widthAttr}${heightAttr}${fetchPriority}>
            <div class="artwork-overlay">
                <div class="artwork-title">${artwork.title}</div>
            </div>
        `;
        artworkGrid.appendChild(artworkItem);
    });

    warmUpLazyArtworkImages(artworkGrid);


    // 只让插画作品打开 Lightbox；3D 视频、video 元素和带 data-no-lightbox 的元素全部排除。
    artworkGrid.querySelectorAll('.artwork-item').forEach(item => {
        item.addEventListener('click', function(event) {
            if (event.target.closest('video, .video-item, [data-no-lightbox="true"]')) return;

            const img = this.querySelector('img');
            if (!img || !img.dataset.index) return;

            const index = parseInt(img.dataset.galleryIndex || img.dataset.index, 10);
            openLightbox(index);
        });
    });

    // 非全部作品页面时添加查看全部按钮
    if (!isAllArtworksPage) {
        const viewAllBtn = document.createElement('div');
        viewAllBtn.innerHTML = `<a href="all-artworks.html" class="btn view-more">查看更多作品</a>`;
        artworkGrid.parentNode.appendChild(viewAllBtn);
        
        // 记录当前滚动位置，返回首页时可以瞬间回到原本位置。
        viewAllBtn.querySelector('a').addEventListener('click', function() {
            localStorage.setItem('artworksScrollPosition', window.scrollY);
        });
    }

    // 进入「创作探索」前记录当前首页位置。
    // 这样从 explore.html 按返回箭头回到 index.html 时，不会回到首页最上方。
    document.querySelectorAll('a[href="explore.html"]').forEach(link => {
        link.addEventListener('click', function() {
            if (isHomePage()) {
                localStorage.setItem('exploreScrollPosition', window.scrollY);
            }
        });
    });

    // =========================================================
    // 04 lightbox desktop / 05 lightbox mobile
    // =========================================================
    // Unified global gallery.
    // Mobile uses a three-slide transform carousel so it can drag, snap, and loop continuously.
    function openLightbox(startIndex) {
        const lightboxItems = galleryItems;
        if (!lightboxItems.length) return;

        let currentIndex = ((startIndex % lightboxItems.length) + lightboxItems.length) % lightboxItems.length;
        const isMobileViewer = window.matchMedia('(max-width: 768px)').matches;

        const existingLightbox = document.getElementById('lightbox');
        if (existingLightbox) existingLightbox.remove();
        if (activeLightboxKeyHandler) {
            document.removeEventListener('keydown', activeLightboxKeyHandler);
            activeLightboxKeyHandler = null;
        }

        const savedScrollY = window.scrollY || window.pageYOffset || 0;

        function lockBodyScroll() {
            document.documentElement.classList.add('lightbox-open');
            document.body.classList.add('lightbox-open');
            document.body.dataset.lightboxScrollY = String(savedScrollY);
            document.body.style.position = 'fixed';
            document.body.style.top = `-${savedScrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        }

        function restoreScrollInstantly(restoreY) {
            scrollToInstantly(restoreY, 0);
        }

        function unlockBodyScroll() {
            const restoreY = parseInt(document.body.dataset.lightboxScrollY || '0', 10);
            const html = document.documentElement;
            const body = document.body;
            const previousHtmlBehavior = html.style.scrollBehavior;
            const previousBodyBehavior = body.style.scrollBehavior;

            // Prevent the global `html { scroll-behavior: smooth; }` from animating
            // the return position when the desktop Lightbox is closed.
            html.style.scrollBehavior = 'auto';
            body.style.scrollBehavior = 'auto';

            document.documentElement.classList.remove('lightbox-open');
            document.body.classList.remove('lightbox-open');
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            delete document.body.dataset.lightboxScrollY;

            // Restore immediately, then repeat on the next frame to neutralize
            // browser scroll restoration quirks after releasing fixed body lock.
            window.scrollTo(0, restoreY);
            html.scrollTop = restoreY;
            body.scrollTop = restoreY;
            requestAnimationFrame(() => {
                window.scrollTo(0, restoreY);
                html.scrollTop = restoreY;
                body.scrollTop = restoreY;
                requestAnimationFrame(() => {
                    html.style.scrollBehavior = previousHtmlBehavior;
                    body.style.scrollBehavior = previousBodyBehavior;
                });
            });
        }

        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = isMobileViewer ? 'is-mobile-gallery' : 'is-desktop-lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', '作品图片浏览');

        const imgContainer = document.createElement('div');
        imgContainer.className = 'lightbox-container';

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'lightbox-close';
        closeBtn.setAttribute('aria-label', '关闭图片浏览');
        closeBtn.innerHTML = '&times;';

        function getLoopIndex(index) {
            return (index + lightboxItems.length) % lightboxItems.length;
        }

        function getImageSrc(index) {
            const artwork = lightboxItems[getLoopIndex(index)];
            const meta = imageMeta[artwork.image] || {};
            return {
                artwork,
                src: artwork.image,
                previewSrc: meta.src || artwork.image,
                srcset: meta.srcset || '',
                width: meta.width || '',
                height: meta.height || ''
            };
        }

        function getFullImage(index) {
            const info = getImageSrc(index);
            const img = document.createElement('img');
            img.src = info.src;
            img.alt = info.artwork.title;
            img.decoding = 'async';
            img.loading = 'eager';
            if (info.width) img.width = info.width;
            if (info.height) img.height = info.height;
            img.draggable = false;
            img.className = 'lightbox-image';
            return img;
        }


        const zoomLimits = isMobileViewer ? { max: 3, doubleTap: 2 } : { max: 2.5, doubleTap: 2 };

        function clamp(value, min, max) {
            return Math.min(max, Math.max(min, value));
        }

        function getPointerDistance(a, b) {
            const dx = a.clientX - b.clientX;
            const dy = a.clientY - b.clientY;
            return Math.hypot(dx, dy);
        }

        function createZoomState() {
            return {
                scale: 1,
                x: 0,
                y: 0,
                lastTapTime: 0,
                dragStartX: 0,
                dragStartY: 0,
                startX: 0,
                startY: 0,
                pinchStartDistance: 0,
                pinchStartScale: 1
            };
        }

        function resetZoomState(state, img) {
            state.scale = 1;
            state.x = 0;
            state.y = 0;
            if (img) {
                img.style.transform = 'translate3d(0, 0, 0) scale(1)';
                img.classList.remove('is-zoomed', 'is-zoom-transitioning', 'is-zooming-in', 'is-zooming-out');
            }
        }

        function applyZoomState(state, img) {
            if (!img) return;
            if (state.scale <= 1.01) {
                resetZoomState(state, img);
                return;
            }

            state.scale = clamp(state.scale, 1, zoomLimits.max);
            state.x = clamp(state.x, -window.innerWidth * (state.scale - 1), window.innerWidth * (state.scale - 1));
            state.y = clamp(state.y, -window.innerHeight * (state.scale - 1), window.innerHeight * (state.scale - 1));
            img.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
            img.classList.add('is-zoomed');
        }

        function closeLightbox() {
            // Keep the Lightbox covering the viewport until the scroll position is restored.
            // This removes the visible “scrolling back down” feeling on desktop.
            lightbox.classList.add('is-closing');
            unlockBodyScroll();
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (lightbox.isConnected) lightbox.remove();
                });
            });
            if (activeLightboxKeyHandler) {
                document.removeEventListener('keydown', activeLightboxKeyHandler);
                activeLightboxKeyHandler = null;
            }
        }

        let desktopZoomState = createZoomState();
        let desktopZoomImg = null;
        let desktopIsPanning = false;
        let desktopDidPan = false;
        let desktopSuppressBackdropClick = false;
        let desktopZoomCursorTimer = null;

        // ---------------------------------------------------------
        // 04 lightbox desktop
        // ---------------------------------------------------------
        function showDesktopImage() {
            imgContainer.querySelectorAll('img.lightbox-desktop-img').forEach(node => node.remove());
            const img = getFullImage(currentIndex);
            img.classList.add('lightbox-desktop-img');
            resetZoomState(desktopZoomState, img);
            desktopZoomImg = img;
            imgContainer.insertBefore(img, imgContainer.firstChild);
        }

        function goPrev() {
            currentIndex = getLoopIndex(currentIndex - 1);
            showDesktopImage();
        }

        function goNext() {
            currentIndex = getLoopIndex(currentIndex + 1);
            showDesktopImage();
        }

        function setDesktopZoomCursor(deltaY) {
            if (!desktopZoomImg) return;
            desktopZoomImg.classList.remove('is-zooming-in', 'is-zooming-out');
            desktopZoomImg.classList.add(deltaY < 0 ? 'is-zooming-in' : 'is-zooming-out');
            window.clearTimeout(desktopZoomCursorTimer);
            desktopZoomCursorTimer = window.setTimeout(() => {
                desktopZoomImg?.classList.remove('is-zooming-in', 'is-zooming-out');
            }, 260);
        }

        function initDesktopZoomControls() {
            imgContainer.addEventListener('wheel', (event) => {
                if (!desktopZoomImg || event.target !== desktopZoomImg) return;
                event.preventDefault();
                setDesktopZoomCursor(event.deltaY);
                const nextScale = desktopZoomState.scale + (event.deltaY < 0 ? 0.18 : -0.18);
                desktopZoomState.scale = clamp(nextScale, 1, zoomLimits.max);
                applyZoomState(desktopZoomState, desktopZoomImg);
            }, { passive: false });

            imgContainer.addEventListener('pointerdown', (event) => {
                if (!desktopZoomImg || event.target !== desktopZoomImg || event.button !== 0 || desktopZoomState.scale <= 1) return;
                event.preventDefault();
                desktopIsPanning = true;
                desktopDidPan = false;
                desktopZoomState.dragStartX = event.clientX;
                desktopZoomState.dragStartY = event.clientY;
                desktopZoomState.startX = desktopZoomState.x;
                desktopZoomState.startY = desktopZoomState.y;
                imgContainer.classList.add('is-panning');
                desktopZoomImg.setPointerCapture?.(event.pointerId);
            });

            imgContainer.addEventListener('pointermove', (event) => {
                if (!desktopIsPanning || !desktopZoomImg) return;
                event.preventDefault();
                const panDx = event.clientX - desktopZoomState.dragStartX;
                const panDy = event.clientY - desktopZoomState.dragStartY;
                if (Math.hypot(panDx, panDy) > 4) {
                    desktopDidPan = true;
                    desktopSuppressBackdropClick = true;
                }
                desktopZoomState.x = desktopZoomState.startX + panDx;
                desktopZoomState.y = desktopZoomState.startY + panDy;
                applyZoomState(desktopZoomState, desktopZoomImg);
            });

            function endDesktopPan(event) {
                if (!desktopIsPanning) return;
                desktopIsPanning = false;
                imgContainer.classList.remove('is-panning');
                desktopZoomImg?.releasePointerCapture?.(event.pointerId);
                if (desktopDidPan) {
                    window.setTimeout(() => {
                        desktopSuppressBackdropClick = false;
                        desktopDidPan = false;
                    }, 0);
                }
            }

            imgContainer.addEventListener('pointerup', endDesktopPan);
            imgContainer.addEventListener('pointercancel', endDesktopPan);
        }

        // ---------------------------------------------------------
        // 05 lightbox mobile
        // ---------------------------------------------------------
        if (isMobileViewer) {
            const gallery = document.createElement('div');
            gallery.className = 'mobile-lightbox-gallery';

            const track = document.createElement('div');
            track.className = 'mobile-lightbox-track';
            gallery.appendChild(track);
            imgContainer.appendChild(gallery);

            let pointerStartX = 0;
            let pointerStartY = 0;
            let dragX = 0;
            let isDragging = false;
            let didSwipe = false;
            let isAnimating = false;
            let isPanningZoom = false;
            let isPinching = false;
            let mobileZoomTransitionTimer = null;
            const activePointers = new Map();
            const mobileZoomState = createZoomState();

            function getCurrentMobileImage() {
                const currentSlide = track.children[1];
                return currentSlide ? currentSlide.querySelector('.lightbox-image') : null;
            }

            function updateMobileZoom(options = {}) {
                const img = getCurrentMobileImage();
                const useSmoothTransition = Boolean(options.smooth && img);

                if (mobileZoomTransitionTimer) {
                    window.clearTimeout(mobileZoomTransitionTimer);
                    mobileZoomTransitionTimer = null;
                }

                if (useSmoothTransition) {
                    img.classList.add('is-zoom-transitioning');
                }

                applyZoomState(mobileZoomState, img);
                gallery.classList.toggle('is-zoomed', mobileZoomState.scale > 1);

                if (useSmoothTransition) {
                    mobileZoomTransitionTimer = window.setTimeout(() => {
                        img.classList.remove('is-zoom-transitioning');
                        mobileZoomTransitionTimer = null;
                    }, 190);
                }
            }

            function resetMobileZoom() {
                if (mobileZoomTransitionTimer) {
                    window.clearTimeout(mobileZoomTransitionTimer);
                    mobileZoomTransitionTimer = null;
                }
                resetZoomState(mobileZoomState, getCurrentMobileImage());
                gallery.classList.remove('is-zoomed');
                activePointers.clear();
                isPanningZoom = false;
                isPinching = false;
            }

            function buildMobileSlides() {
                track.innerHTML = '';
                [currentIndex - 1, currentIndex, currentIndex + 1].forEach((itemIndex) => {
                    const slide = document.createElement('figure');
                    slide.className = 'mobile-lightbox-slide';
                    slide.appendChild(getFullImage(itemIndex));
                    track.appendChild(slide);
                });
                track.style.transition = 'none';
                track.style.transform = 'translate3d(-100%, 0, 0)';
                resetMobileZoom();
            }

            function setMobileTrackOffset(offsetX, withTransition = false) {
                track.style.transition = withTransition ? 'transform 260ms ease' : 'none';
                track.style.transform = `translate3d(calc(-100% + ${offsetX}px), 0, 0)`;
            }

            function finishMobileMove(direction) {
                if (isAnimating) return;
                resetMobileZoom();
                isAnimating = true;
                currentIndex = getLoopIndex(currentIndex + direction);
                setMobileTrackOffset(direction > 0 ? -gallery.clientWidth : gallery.clientWidth, true);

                window.setTimeout(() => {
                    buildMobileSlides();
                    isAnimating = false;
                }, 270);
            }

            function reboundMobileSlide() {
                if (isAnimating) return;
                isAnimating = true;
                setMobileTrackOffset(0, true);
                window.setTimeout(() => {
                    setMobileTrackOffset(0, false);
                    isAnimating = false;
                }, 270);
            }

            buildMobileSlides();

            gallery.addEventListener('pointerdown', (event) => {
                if (isAnimating) return;
                activePointers.set(event.pointerId, event);
                gallery.setPointerCapture?.(event.pointerId);
                didSwipe = false;

                if (activePointers.size === 2) {
                    const points = Array.from(activePointers.values());
                    isPinching = true;
                    isDragging = false;
                    isPanningZoom = false;
                    mobileZoomState.pinchStartDistance = getPointerDistance(points[0], points[1]);
                    mobileZoomState.pinchStartScale = mobileZoomState.scale;
                    return;
                }

                pointerStartX = event.clientX;
                pointerStartY = event.clientY;
                dragX = 0;

                if (mobileZoomState.scale > 1) {
                    isPanningZoom = true;
                    isDragging = false;
                    mobileZoomState.dragStartX = event.clientX;
                    mobileZoomState.dragStartY = event.clientY;
                    mobileZoomState.startX = mobileZoomState.x;
                    mobileZoomState.startY = mobileZoomState.y;
                    return;
                }

                isDragging = true;
                isPanningZoom = false;
                setMobileTrackOffset(0, false);
            });

            gallery.addEventListener('pointermove', (event) => {
                if (isAnimating || !activePointers.has(event.pointerId)) return;
                activePointers.set(event.pointerId, event);

                if (isPinching && activePointers.size >= 2) {
                    event.preventDefault();
                    const points = Array.from(activePointers.values());
                    const distance = getPointerDistance(points[0], points[1]);
                    if (mobileZoomState.pinchStartDistance > 0) {
                        mobileZoomState.scale = clamp(
                            mobileZoomState.pinchStartScale * (distance / mobileZoomState.pinchStartDistance),
                            1,
                            zoomLimits.max
                        );
                        updateMobileZoom();
                    }
                    return;
                }

                if (mobileZoomState.scale > 1 || isPanningZoom) {
                    event.preventDefault();
                    isPanningZoom = true;
                    mobileZoomState.x = mobileZoomState.startX + event.clientX - mobileZoomState.dragStartX;
                    mobileZoomState.y = mobileZoomState.startY + event.clientY - mobileZoomState.dragStartY;
                    updateMobileZoom();
                    return;
                }

                if (!isDragging) return;
                const dx = event.clientX - pointerStartX;
                const dy = event.clientY - pointerStartY;
                if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) return;

                event.preventDefault();
                dragX = dx;
                didSwipe = Math.abs(dx) > 10;
                setMobileTrackOffset(dragX, false);
            }, { passive: false });

            function endMobilePointer(event) {
                activePointers.delete(event.pointerId);
                gallery.releasePointerCapture?.(event.pointerId);

                if (isPinching) {
                    if (activePointers.size < 2) {
                        isPinching = false;
                        if (mobileZoomState.scale <= 1.01) {
                            resetMobileZoom();
                        } else {
                            updateMobileZoom();
                        }
                    }
                    return;
                }

                if (isPanningZoom) {
                    isPanningZoom = false;
                    return;
                }

                if (!isDragging || isAnimating) return;
                isDragging = false;

                const threshold = Math.min(96, (gallery.clientWidth || window.innerWidth) * 0.22);
                if (dragX <= -threshold) {
                    finishMobileMove(1);
                } else if (dragX >= threshold) {
                    finishMobileMove(-1);
                } else {
                    reboundMobileSlide();
                }
            }

            gallery.addEventListener('pointerup', endMobilePointer);
            gallery.addEventListener('pointercancel', endMobilePointer);

            gallery.addEventListener('click', (event) => {
                if (didSwipe || isPinching) return;
                if (!event.target.classList.contains('lightbox-image')) return;

                const now = Date.now();
                if (now - mobileZoomState.lastTapTime < 280) {
                    event.preventDefault();
                    event.stopPropagation();
                    mobileZoomState.scale = mobileZoomState.scale > 1 ? 1 : zoomLimits.doubleTap;
                    mobileZoomState.x = 0;
                    mobileZoomState.y = 0;
                    updateMobileZoom({ smooth: true });
                }
                mobileZoomState.lastTapTime = now;
            });

            imgContainer.addEventListener('click', (event) => {
                if (didSwipe || mobileZoomState.scale > 1 || event.target.classList.contains('lightbox-image')) return;
                if (event.target === imgContainer || event.target.classList.contains('mobile-lightbox-slide')) {
                    closeLightbox();
                }
            });
        } else {
            const prevBtn = document.createElement('button');
            prevBtn.type = 'button';
            prevBtn.className = 'lightbox-arrow lightbox-prev';
            prevBtn.setAttribute('aria-label', '上一张作品');
            prevBtn.innerHTML = '&#10094;';

            const nextBtn = document.createElement('button');
            nextBtn.type = 'button';
            nextBtn.className = 'lightbox-arrow lightbox-next';
            nextBtn.setAttribute('aria-label', '下一张作品');
            nextBtn.innerHTML = '&#10095;';

            prevBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                goPrev();
            });

            nextBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                goNext();
            });

            imgContainer.appendChild(prevBtn);
            imgContainer.appendChild(nextBtn);
            showDesktopImage();
            initDesktopZoomControls();

            lightbox.addEventListener('click', (event) => {
                if (desktopSuppressBackdropClick) {
                    event.preventDefault();
                    event.stopPropagation();
                    desktopSuppressBackdropClick = false;
                    desktopDidPan = false;
                    return;
                }

                if (event.target === lightbox || event.target === imgContainer) {
                    closeLightbox();
                }
            });
        }

        closeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            closeLightbox();
        });

        function handleKeydown(event) {
            if (event.key === 'Escape') {
                closeLightbox();
            } else if (!isMobileViewer && event.key === 'ArrowLeft') {
                event.preventDefault();
                goPrev();
            } else if (!isMobileViewer && event.key === 'ArrowRight') {
                event.preventDefault();
                goNext();
            }
        }

        activeLightboxKeyHandler = handleKeydown;
        document.addEventListener('keydown', handleKeydown);

        imgContainer.appendChild(closeBtn);
        lightbox.appendChild(imgContainer);
        document.body.appendChild(lightbox);
        lockBodyScroll();
    }

}



/* ---------------------------------------------------------
   03 artwork gallery: lazy image warm-up
   --------------------------------------------------------- */
// 提前唤醒后段 lazy 图片，解决手机端滑到图片区域后才开始加载的问题。
// 这不会新增压缩图，也不会改变图片路径；只是让 lazy 图片更早进入浏览器下载队列。
function warmUpLazyArtworkImages(artworkGrid) {
    const lazyImages = artworkGrid.querySelectorAll('img[loading="lazy"]');
    if (!lazyImages.length) return;

    function makeEager(img) {
        if (!img || img.dataset.lazyWarmed === 'true') return;
        img.dataset.lazyWarmed = 'true';
        img.loading = 'eager';
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const img = entry.target.querySelector('img[loading="lazy"]');
                makeEager(img);
                observer.unobserve(entry.target);
            });
        }, {
            rootMargin: '1200px 0px',
            threshold: 0.01
        });

        lazyImages.forEach((img) => {
            const item = img.closest('.artwork-item');
            if (item) observer.observe(item);
        });
        return;
    }

    // 旧浏览器 fallback：没有 IntersectionObserver 时，直接取消作品图 lazy，优先保证图片会出现。
    lazyImages.forEach(makeEager);
}

/* =========================================================
   06 video preview
   ========================================================= */
// 动态加载3D渲染展示视频
function load3DPrintVideos() {
    const videoContainer = document.querySelector('.video-container');
    if (!videoContainer) return;

    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    videoItem.setAttribute('data-no-lightbox', 'true');
    videoItem.innerHTML = `
        <video
            class="model-preview-video"
            data-no-lightbox="true"
            autoplay
            muted
            loop
            playsinline
            webkit-playsinline
            preload="metadata"
            poster="webphoto/modelcover-800.webp"
            data-poster-mobile="webphoto/modelcover-480.webp"
            data-poster-tablet="webphoto/modelcover-800.webp"
            data-poster-desktop="webphoto/modelcover-1200.webp"
            aria-label="3D rendered model preview"
        >
            <source src="3dmodel-mobile-safe.mp4" type="video/mp4">
            您的浏览器不支持视频标签。
        </video>
    `;
    videoContainer.appendChild(videoItem);

    const previewVideo = videoItem.querySelector('video');
    if (!previewVideo) return;

    const posterMobile = previewVideo.dataset.posterMobile;
    const posterTablet = previewVideo.dataset.posterTablet;
    const posterDesktop = previewVideo.dataset.posterDesktop;
    if (posterMobile && posterTablet && posterDesktop) {
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
        const preferredPoster = viewportWidth <= 600 ? posterMobile : (viewportWidth <= 1024 ? posterTablet : posterDesktop);
        previewVideo.setAttribute('poster', preferredPoster);
    }

    // 让视频保持“网页里的动态展示模块”，不要触发 Lightbox，也不要打开原生 controls。
    previewVideo.controls = false;
    previewVideo.muted = true;
    previewVideo.defaultMuted = true;
    previewVideo.loop = true;
    previewVideo.playsInline = true;
    previewVideo.disablePictureInPicture = true;
    previewVideo.setAttribute('muted', '');
    previewVideo.setAttribute('playsinline', '');
    previewVideo.setAttribute('webkit-playsinline', '');
    previewVideo.setAttribute('x-webkit-airplay', 'deny');
    previewVideo.setAttribute('controlslist', 'nofullscreen nodownload noremoteplayback');

    function stopVideoEvent(event) {
        event.stopPropagation();
    }

    function playInlineVideo(event) {
        event.preventDefault();
        event.stopPropagation();

        previewVideo.controls = false;
        previewVideo.muted = true;
        previewVideo.playsInline = true;
        previewVideo.setAttribute('playsinline', '');
        previewVideo.setAttribute('webkit-playsinline', '');

        const playPromise = previewVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Safari 若阻止 autoplay，就保留 poster，等待下一次用户点击；不要 fallback 到 controls。
                previewVideo.controls = false;
            });
        }
    }

    videoItem.addEventListener('click', playInlineVideo);
    videoItem.addEventListener('touchend', playInlineVideo, { passive: false });
    previewVideo.addEventListener('click', playInlineVideo);
    previewVideo.addEventListener('touchend', playInlineVideo, { passive: false });
    previewVideo.addEventListener('webkitbeginfullscreen', function(event) {
        event.preventDefault();
        previewVideo.pause();
        previewVideo.controls = false;
    });
    previewVideo.addEventListener('contextmenu', stopVideoEvent);

    // 电脑端与允许静音 autoplay 的手机浏览器会自动循环播放；失败时不显示 controls。
    const autoplayPromise = previewVideo.play();
    if (autoplayPromise !== undefined) {
        autoplayPromise.catch(() => {
            previewVideo.controls = false;
        });
    }
}

/* =========================================================
   07 scroll restore
   ========================================================= */
function isHomePage() {
    const path = window.location.pathname;
    const fileName = path.substring(path.lastIndexOf('/') + 1);
    return fileName === '' || fileName === 'index.html';
}

// 恢复滚动位置
function restoreScrollPosition() {
    // 只有回到首页时，才恢复从子页面离开前记录的位置。
    // 必须用即时滚动，避免全局 smooth scroll 造成页面从上往下滑回去。
    const isAllArtworksPage = window.location.pathname.includes('all-artworks');

    if (isHomePage()) {
        const savedArtworkPosition = localStorage.getItem('artworksScrollPosition');
        const savedExplorePosition = localStorage.getItem('exploreScrollPosition');
        const savedPosition = savedExplorePosition || savedArtworkPosition;

        if (savedPosition) {
            const targetY = parseInt(savedPosition, 10) || 0;
            scrollToInstantly(targetY, 0);
            localStorage.removeItem('artworksScrollPosition');
            localStorage.removeItem('exploreScrollPosition');
        }
    } else if (isAllArtworksPage) {
        // 进入全部作品页时也保持即时到顶部，不要被 html { scroll-behavior: smooth } 影响。
        scrollToInstantly(0, 0);
    }
}


/* =========================================================
   08 back to top
   ========================================================= */
// 返回顶部按钮：手机端显示，电脑端隐藏
function initBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');
    const footerBackToTop = document.querySelector('.footer-back-to-top');
    const logo = document.querySelector('.logo');

    if (!backToTopBtn && !footerBackToTop && !logo) return;

    function isMobileView() {
        return window.innerWidth <= 768;
    }

    function shouldShowBackToTop() {
        if (!isMobileView()) return false;
        if (window.scrollY < window.innerHeight * 0.6) return false;

        const contactSection = document.querySelector('.contact');
        const footer = document.querySelector('footer');

        if (contactSection) {
            const contactTop = contactSection.getBoundingClientRect().top;
            return contactTop <= window.innerHeight * 0.55;
        }

        if (footer) {
            const footerTop = footer.getBoundingClientRect().top;
            return footerTop <= window.innerHeight * 0.9;
        }

        const viewportBottom = window.scrollY + window.innerHeight;
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight
        );

        return viewportBottom >= documentHeight - window.innerHeight * 0.5;
    }

    function updateBackToTopButton() {
        if (!backToTopBtn) return;
        backToTopBtn.classList.toggle('show', shouldShowBackToTop());
    }

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    if (footerBackToTop) {
        footerBackToTop.addEventListener('click', function(event) {
            event.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', function() {
            const isAllArtworksPage = window.location.pathname.includes('all-artworks') || window.location.pathname.includes('artwork');

            if (isAllArtworksPage) {
                window.location.href = 'index.html#home';
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    }

    window.addEventListener('scroll', updateBackToTopButton);
    window.addEventListener('resize', updateBackToTopButton);
    updateBackToTopButton();
}
