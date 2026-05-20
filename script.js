document.addEventListener('DOMContentLoaded', function() {
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

    // 加载艺术作品
    loadArtworks();
    
    // 加载3D打印视频
    load3DPrintVideos();
    
    // 恢复滚动位置
    restoreScrollPosition();

    // 初始化返回顶部按钮
    initBackToTop();

    // 初始化固定导航栏滚动显示/隐藏
    initNavbarAutoHide(hamburger, navLinks);

    // 自动更新页脚年份
    updateFooterYear();
});


// 自动更新页脚年份
function updateFooterYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();

    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

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

// 动态加载艺术作品
function loadArtworks() {
    const artworkGrid = document.querySelector('.artwork-grid');
    if (!artworkGrid) return;
    let activeLightboxKeyHandler = null;

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
    
    // 确定当前页面要使用的作品顺序
    // 首页保留前 6 张原顺序；All Works 调整最后几张为 1,2,3,4,5,6,7,8,9,11,10,12。
    const displayedArtworks = isAllArtworksPage
        ? [...artworks.slice(0, 9), artworks[10], artworks[9], artworks[11]]
        : artworks.slice(0, 6);

    // 确定要显示的作品数量
    const displayCount = displayedArtworks.length;

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
            <img src="${imageSrc}"${srcsetAttr} alt="${artwork.title}" data-index="${index}" loading="${loadingMode}" decoding="async"${widthAttr}${heightAttr}${fetchPriority}>
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

            const index = parseInt(img.dataset.index, 10);
            openLightbox(index);
        });
    });

    // 非全部作品页面时添加查看全部按钮
    if (!isAllArtworksPage) {
        const viewAllBtn = document.createElement('div');
        viewAllBtn.innerHTML = `<a href="all-artworks.html" class="btn view-more">查看更多作品</a>`;
        artworkGrid.parentNode.appendChild(viewAllBtn);
        
        // 记录当前滚动位置
        viewAllBtn.querySelector('a').addEventListener('click', function() {
            localStorage.setItem('artworksScrollPosition', window.scrollY);
        });
    }

    // 创建 Lightbox / Carousel Viewer
    function openLightbox(startIndex) {
        const lightboxItems = displayedArtworks;
        if (!lightboxItems.length) return;

        let currentIndex = ((startIndex % lightboxItems.length) + lightboxItems.length) % lightboxItems.length;
        const isMobileViewer = window.matchMedia('(max-width: 768px)').matches;

        const existingLightbox = document.getElementById('lightbox');
        if (existingLightbox) existingLightbox.remove();
        if (activeLightboxKeyHandler) {
            document.removeEventListener('keydown', activeLightboxKeyHandler);
            activeLightboxKeyHandler = null;
        }

        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = isMobileViewer ? 'is-mobile-carousel' : 'is-desktop-lightbox';
        lightbox.style.cssText = `
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.92);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            overflow: hidden;
        `;

        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = `
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            overflow: hidden;
            touch-action: pan-y;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', '关闭图片浏览');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            position: absolute;
            top: ${isMobileViewer ? '14px' : '20px'};
            right: ${isMobileViewer ? '18px' : '40px'};
            color: white;
            background: transparent;
            border: 0;
            font-size: ${isMobileViewer ? '2.3rem' : '3rem'};
            line-height: 1;
            cursor: pointer;
            z-index: 2003;
            padding: 0.35rem;
        `;

        function getLoopIndex(index) {
            return (index + lightboxItems.length) % lightboxItems.length;
        }

        function getFullImage(index) {
            const artwork = lightboxItems[getLoopIndex(index)];
            const meta = imageMeta[artwork.image] || {};
            const img = document.createElement('img');
            img.src = artwork.image;
            img.alt = artwork.title;
            img.decoding = 'async';
            if (meta.width) img.width = meta.width;
            if (meta.height) img.height = meta.height;
            img.draggable = false;
            img.style.cssText = `
                max-width: ${isMobileViewer ? '94vw' : '80vw'};
                max-height: ${isMobileViewer ? '86svh' : '80vh'};
                width: auto;
                height: auto;
                object-fit: contain;
                user-select: none;
                -webkit-user-drag: none;
            `;
            return img;
        }

        function closeLightbox() {
            lightbox.remove();
            document.body.style.overflow = '';
            if (activeLightboxKeyHandler) {
                document.removeEventListener('keydown', activeLightboxKeyHandler);
                activeLightboxKeyHandler = null;
            }
        }

        function showDesktopImage() {
            imgContainer.querySelectorAll('img.lightbox-desktop-img').forEach(node => node.remove());
            const img = getFullImage(currentIndex);
            img.className = 'lightbox-desktop-img';
            imgContainer.insertBefore(img, imgContainer.firstChild);
        }

        function goPrev() {
            currentIndex = getLoopIndex(currentIndex - 1);
            if (isMobileViewer) {
                renderMobileSlides(false);
            } else {
                showDesktopImage();
            }
        }

        function goNext() {
            currentIndex = getLoopIndex(currentIndex + 1);
            if (isMobileViewer) {
                renderMobileSlides(false);
            } else {
                showDesktopImage();
            }
        }

        if (isMobileViewer) {
            const track = document.createElement('div');
            track.className = 'lightbox-track';
            track.style.cssText = `
                display: flex;
                width: 100%;
                height: 100%;
                transform: translate3d(-100%, 0, 0);
                transition: none;
                will-change: transform;
            `;

            function createSlide(index) {
                const slide = document.createElement('div');
                slide.className = 'lightbox-slide';
                slide.style.cssText = `
                    flex: 0 0 100%;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3.5rem 1rem 2.5rem;
                    box-sizing: border-box;
                `;
                slide.appendChild(getFullImage(index));
                return slide;
            }

            function renderMobileSlides(animateReset = false) {
                track.innerHTML = '';
                track.appendChild(createSlide(currentIndex - 1));
                track.appendChild(createSlide(currentIndex));
                track.appendChild(createSlide(currentIndex + 1));
                track.style.transition = animateReset ? 'transform 240ms ease' : 'none';
                track.style.transform = 'translate3d(-100%, 0, 0)';
            }

            function snapTo(position, afterTransition) {
                track.style.transition = 'transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1)';
                track.style.transform = `translate3d(${position}px, 0, 0)`;
                if (afterTransition) {
                    const handleTransitionEnd = () => {
                        track.removeEventListener('transitionend', handleTransitionEnd);
                        afterTransition();
                    };
                    track.addEventListener('transitionend', handleTransitionEnd);
                }
            }

            let startX = 0;
            let startY = 0;
            let deltaX = 0;
            let isDragging = false;
            let isHorizontalSwipe = false;
            let containerWidth = 0;

            track.addEventListener('touchstart', (event) => {
                if (!event.touches.length) return;
                startX = event.touches[0].clientX;
                startY = event.touches[0].clientY;
                deltaX = 0;
                isDragging = true;
                isHorizontalSwipe = false;
                containerWidth = imgContainer.clientWidth || window.innerWidth;
                track.style.transition = 'none';
            }, { passive: true });

            track.addEventListener('touchmove', (event) => {
                if (!isDragging || !event.touches.length) return;
                const currentX = event.touches[0].clientX;
                const currentY = event.touches[0].clientY;
                deltaX = currentX - startX;
                const deltaY = currentY - startY;

                if (!isHorizontalSwipe) {
                    isHorizontalSwipe = Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY);
                }

                if (isHorizontalSwipe) {
                    event.preventDefault();
                    track.style.transform = `translate3d(${-containerWidth + deltaX}px, 0, 0)`;
                }
            }, { passive: false });

            track.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                containerWidth = imgContainer.clientWidth || window.innerWidth;
                const threshold = Math.min(90, containerWidth * 0.22);

                if (Math.abs(deltaX) > threshold) {
                    if (deltaX < 0) {
                        snapTo(-containerWidth * 2, () => {
                            currentIndex = getLoopIndex(currentIndex + 1);
                            renderMobileSlides(false);
                        });
                    } else {
                        snapTo(0, () => {
                            currentIndex = getLoopIndex(currentIndex - 1);
                            renderMobileSlides(false);
                        });
                    }
                } else {
                    snapTo(-containerWidth, null);
                }
                deltaX = 0;
            });

            imgContainer.appendChild(track);
            renderMobileSlides(false);
        } else {
            const prevBtn = document.createElement('button');
            prevBtn.type = 'button';
            prevBtn.setAttribute('aria-label', '上一张作品');
            prevBtn.innerHTML = '&#10094;';
            prevBtn.style.cssText = `
                position: absolute;
                left: 20px;
                top: 50%;
                transform: translateY(-50%);
                color: white;
                background: transparent;
                border: 0;
                font-size: 3rem;
                cursor: pointer;
                padding: 20px;
                user-select: none;
                z-index: 2002;
            `;

            const nextBtn = document.createElement('button');
            nextBtn.type = 'button';
            nextBtn.setAttribute('aria-label', '下一张作品');
            nextBtn.innerHTML = '&#10095;';
            nextBtn.style.cssText = `
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                color: white;
                background: transparent;
                border: 0;
                font-size: 3rem;
                cursor: pointer;
                padding: 20px;
                user-select: none;
                z-index: 2002;
            `;

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
        }

        closeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            closeLightbox();
        });

        lightbox.addEventListener('click', (event) => {
            if (event.target === lightbox || event.target === imgContainer) {
                closeLightbox();
            }
        });

        function handleKeydown(event) {
            if (event.key === 'Escape') {
                closeLightbox();
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                goPrev();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                goNext();
            }
        }

        activeLightboxKeyHandler = handleKeydown;
        document.addEventListener('keydown', handleKeydown);
        document.body.style.overflow = 'hidden';
        imgContainer.appendChild(closeBtn);
        lightbox.appendChild(imgContainer);
        document.body.appendChild(lightbox);
    }

}


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

// 恢复滚动位置
function restoreScrollPosition() {
    // 只有在首页才恢复滚动位置，all-artworks页面强制在顶部
    if (!window.location.pathname.includes('all-artworks')) {
        const savedPosition = localStorage.getItem('artworksScrollPosition');
        if (savedPosition) {
            window.scrollTo(0, parseInt(savedPosition));
            localStorage.removeItem('artworksScrollPosition');
        }
    } else {
        // 在all-artworks页面强制滚动到顶部
        window.scrollTo(0, 0);
    }
}

// 返回顶部按钮：手机端显示，电脑端隐藏
function initBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');
    const logo = document.querySelector('.logo');

    if (!backToTopBtn) return;

    let lastScrollY = window.scrollY;
    let hideTimer = null;

    function isMobileView() {
        return window.innerWidth <= 768;
    }

    function showBackToTopButton() {
        backToTopBtn.classList.add('show');

        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            backToTopBtn.classList.remove('show');
        }, 1800);
    }

    function hideBackToTopButton() {
        backToTopBtn.classList.remove('show');
        clearTimeout(hideTimer);
    }

    function toggleBackToTopButton() {
        const currentScrollY = window.scrollY;
        const triggerPoint = Math.max(window.innerHeight * 0.3, 300);
        const scrollDifference = currentScrollY - lastScrollY;

        // 电脑端隐藏；页面顶部附近隐藏
        if (!isMobileView() || currentScrollY <= triggerPoint) {
            hideBackToTopButton();
            lastScrollY = currentScrollY;
            return;
        }

        // 避免手机滚动惯性或轻微抖动造成按钮闪烁
        if (Math.abs(scrollDifference) < 8) {
            return;
        }

        if (scrollDifference < 0) {
            // 往上滑：显示按钮
            showBackToTopButton();
        } else {
            // 往下滑：隐藏按钮
            hideBackToTopButton();
        }

        lastScrollY = currentScrollY;
    }

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Logo 点击返回顶部；电脑端和手机端都可用
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

    window.addEventListener('scroll', toggleBackToTopButton);
    window.addEventListener('resize', toggleBackToTopButton);
    toggleBackToTopButton();
}
