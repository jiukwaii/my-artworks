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
});

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

    // 检查当前页面是否为全部作品页面
    const isAllArtworksPage = window.location.pathname.includes('all-artworks');
    
    // 确定要显示的作品数量
    const displayCount = isAllArtworksPage ? artworks.length : 9;
    
    // 生成艺术作品HTML
    artworks.slice(0, displayCount).forEach((artwork, index) => {
        const artworkItem = document.createElement('div');
        artworkItem.className = 'artwork-item';
        artworkItem.innerHTML = `
            <img src="${artwork.image}" alt="${artwork.title}" data-index="${index}">
            <div class="artwork-overlay">
                <div class="artwork-title">${artwork.title}</div>
            </div>
        `;
        artworkGrid.appendChild(artworkItem);
    });

    // 添加点击事件，打开lightbox
    document.querySelectorAll('.artwork-item').forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            const index = parseInt(img.dataset.index);
            openLightbox(index);
        });
    });

    // 非全部作品页面时添加查看全部按钮
    if (!isAllArtworksPage) {
        const viewAllBtn = document.createElement('div');
        viewAllBtn.innerHTML = `<a href="all-artworks.html" class="btn view-more">查看全部作品</a>`;
        artworkGrid.parentNode.appendChild(viewAllBtn);
        
        // 记录当前滚动位置
        viewAllBtn.querySelector('a').addEventListener('click', function() {
            localStorage.setItem('artworksScrollPosition', window.scrollY);
        });
    }

    // 创建lightbox
    function openLightbox(index) {
        // 移除已存在的lightbox
        const existingLightbox = document.getElementById('lightbox');
        if (existingLightbox) {
            existingLightbox.remove();
        }
        if (activeLightboxKeyHandler) {
            document.removeEventListener('keydown', activeLightboxKeyHandler);
            activeLightboxKeyHandler = null;
        }

        // 创建lightbox元素
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        // 创建图片容器
        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = `
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
        `;

        const img = document.createElement('img');
        img.src = artworks[index].image;
        img.alt = artworks[index].title;
        const isMobile = window.innerWidth <= 768;
        img.style.cssText = `
            max-width: ${isMobile ? '70%' : '80%'};
            max-height: ${isMobile ? '60%' : '80%'};
            object-fit: contain;
        `;

        // 左箭头
        const prevBtn = document.createElement('div');
        prevBtn.innerHTML = '&#10094;';
        prevBtn.style.cssText = `
            position: absolute;
            left: ${isMobile ? '5px' : '20px'};
            top: 50%;
            transform: translateY(-50%);
            color: white;
            font-size: ${isMobile ? '2rem' : '3rem'};
            cursor: pointer;
            padding: ${isMobile ? '10px' : '20px'};
            user-select: none;
            z-index: 2001;
        `;

        // 右箭头
        const nextBtn = document.createElement('div');
        nextBtn.innerHTML = '&#10095;';
        nextBtn.style.cssText = `
            position: absolute;
            right: ${isMobile ? '5px' : '20px'};
            top: 50%;
            transform: translateY(-50%);
            color: white;
            font-size: ${isMobile ? '2rem' : '3rem'};
            cursor: pointer;
            padding: ${isMobile ? '10px' : '20px'};
            user-select: none;
            z-index: 2001;
        `;

        // 关闭按钮
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 40px;
            color: white;
            font-size: 3rem;
            cursor: pointer;
            z-index: 2001;
        `;

        imgContainer.appendChild(img);
        imgContainer.appendChild(prevBtn);
        imgContainer.appendChild(nextBtn);
        imgContainer.appendChild(closeBtn);
        lightbox.appendChild(imgContainer);
        document.body.appendChild(lightbox);

        function closeLightbox() {
            lightbox.remove();
            if (activeLightboxKeyHandler) {
                document.removeEventListener('keydown', activeLightboxKeyHandler);
                activeLightboxKeyHandler = null;
            }
        }

        // 切换到上一个作品
        function showPrev(e) {
            e.stopPropagation();
            const newIndex = index === 0 ? artworks.length - 1 : index - 1;
            openLightbox(newIndex);
        }

        // 切换到下一个作品
        function showNext(e) {
            e.stopPropagation();
            const newIndex = index === artworks.length - 1 ? 0 : index + 1;
            openLightbox(newIndex);
        }

        prevBtn.addEventListener('click', showPrev);
        nextBtn.addEventListener('click', showNext);
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeLightbox();
        });

        // 点击背景关闭lightbox
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox || e.target === imgContainer) {
                closeLightbox();
            }
        });

        // 键盘导航
        function handleKeydown(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                showPrev(e);
            } else if (e.key === 'ArrowRight') {
                showNext(e);
            }
        }
        activeLightboxKeyHandler = handleKeydown;
        document.addEventListener('keydown', handleKeydown);
    }
}

// 动态加载3D渲染展示视频
function load3DPrintVideos() {
    const videoContainer = document.querySelector('.video-container');
    if (!videoContainer) return;

    const videoItem = document.createElement('div');
    videoItem.className = 'video-item model-video-shell';
    videoItem.innerHTML = `
        <video
            class="model-preview-video"
            autoplay
            muted
            loop
            playsinline
            webkit-playsinline
            preload="metadata"
            poster="webphoto/modelcover.webp"
            aria-label="3D rendered model preview"
            controlslist="nodownload noplaybackrate"
            disablepictureinpicture
        >
            <source src="3dmodel-mobile-safe.mp4" type="video/mp4">
            您的浏览器不支持视频标签。
        </video>
        <button class="model-video-play-fallback" type="button" aria-label="Play 3D rendered model preview">
            <span>Play</span>
        </button>
    `;
    videoContainer.appendChild(videoItem);

    const previewVideo = videoItem.querySelector('video');
    const fallbackButton = videoItem.querySelector('.model-video-play-fallback');
    if (!previewVideo || !fallbackButton) return;

    const isMobileLike = window.matchMedia('(hover: none), (pointer: coarse), (max-width: 768px)').matches;

    const ensureSilentInlineVideo = () => {
        previewVideo.muted = true;
        previewVideo.defaultMuted = true;
        previewVideo.volume = 0;
        previewVideo.playsInline = true;
        previewVideo.setAttribute('muted', '');
        previewVideo.setAttribute('playsinline', '');
        previewVideo.setAttribute('webkit-playsinline', '');
    };

    const showFallback = () => {
        videoItem.classList.add('is-autoplay-blocked');
    };

    const hideFallback = () => {
        videoItem.classList.remove('is-autoplay-blocked');
        videoItem.classList.remove('is-native-fallback');
    };

    const exposeNativeControls = () => {
        previewVideo.controls = true;
        videoItem.classList.add('is-native-fallback');
    };

    const playPreview = async (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        ensureSilentInlineVideo();

        // 手机 Safari 如果不接受自定义按钮触发播放，就先打开原生 controls 作为兜底。
        if (isMobileLike) {
            previewVideo.controls = true;
        }

        try {
            await previewVideo.play();
            hideFallback();

            // 播放成功后，桌面保持无控件；手机播放成功也尽量保持干净。
            if (!isMobileLike) {
                previewVideo.controls = false;
            }
        } catch (error) {
            exposeNativeControls();
            showFallback();
        }
    };

    const handleUserStart = (event) => {
        playPreview(event);
    };

    fallbackButton.addEventListener('click', handleUserStart);
    fallbackButton.addEventListener('touchend', handleUserStart, { passive: false });

    videoItem.addEventListener('click', (event) => {
        if (event.target === fallbackButton || fallbackButton.contains(event.target)) return;
        if (previewVideo.paused) {
            playPreview(event);
        }
    });

    previewVideo.addEventListener('playing', hideFallback);
    previewVideo.addEventListener('canplay', () => {
        if (!previewVideo.paused) hideFallback();
    });
    previewVideo.addEventListener('error', () => {
        exposeNativeControls();
        showFallback();
    });

    ensureSilentInlineVideo();

    if (isMobileLike) {
        // 手机端优先保证可播放：先显示 Play，不强求 autoplay。
        previewVideo.removeAttribute('autoplay');
        previewVideo.autoplay = false;
        showFallback();
    } else {
        playPreview();
        window.setTimeout(() => {
            if (previewVideo.paused || previewVideo.readyState < 2) {
                showFallback();
            }
        }, 1400);
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
