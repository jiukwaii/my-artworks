document.addEventListener('DOMContentLoaded', function() {
    // 移动端菜单切换
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
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
                hamburger.classList.remove('toggle');
            }
        });
    });

    // 加载艺术作品
    loadArtworks();
    
    // 加载3D打印视频
    load3DPrintVideos();
    
    // 恢复滚动位置
    restoreScrollPosition();
});

// 动态加载艺术作品
function loadArtworks() {
    const artworkGrid = document.querySelector('.artwork-grid');
    if (!artworkGrid) return;

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
        viewAllBtn.querySelector('a').addEventListener('click', function(e) {
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
            lightbox.remove();
        });

        // 点击背景关闭lightbox
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox || e.target === imgContainer) {
                lightbox.remove();
            }
        });

        // 键盘导航
        function handleKeydown(e) {
            if (e.key === 'Escape') {
                lightbox.remove();
                document.removeEventListener('keydown', handleKeydown);
            } else if (e.key === 'ArrowLeft') {
                showPrev(e);
            } else if (e.key === 'ArrowRight') {
                showNext(e);
            }
        }
        document.addEventListener('keydown', handleKeydown);
    }
}

// 动态加载3D打印视频
function load3DPrintVideos() {
    const videoContainer = document.querySelector('.video-container');
    if (!videoContainer) return;

    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    videoItem.innerHTML = `
        <video controls poster="webphoto/modelcover.webp" style="aspect-ratio: 16/9; object-fit: cover;">
            <source src="3dmodel.mp4" type="video/mp4">
            您的浏览器不支持视频标签。
        </video>
    `;
    videoContainer.appendChild(videoItem);
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
