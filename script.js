// 导航栏响应式功能
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');

// 切换移动端菜单
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    links.forEach(link => {
        link.classList.toggle('fade');
    });
    // 切换汉堡菜单图标
    hamburger.classList.toggle('toggle');
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
            // 关闭移动端菜单
            navLinks.classList.remove('open');
            links.forEach(link => {
                link.classList.remove('fade');
            });
            hamburger.classList.remove('toggle');
        }
    });
});

// 动态加载艺术作品
function loadArtworks() {
    const artworkGrid = document.querySelector('.artwork-grid');
    if (!artworkGrid) return;

    // 艺术作品数据
    const artworks = [
        {
            image: '0f12e295770ae362c53ffe7601f4bad0.jpg',
            title: '生日派對'
        },
        {
            image: '301ed367d7e2b3b5d4d5146eae5423cd.jpg',
            title: '抱貓少女'
        },
        {
            image: '9dec5c5f28b2e89a744260e78242945f.jpg',
            title: '向日葵少女'
        },
        {
            image: '614e62d84900b8eb7dca8202349345f2.jpg',
            title: 'Penguin King'
        },
        {
            image: 'Image_20250805153619_70.jpg',
            title: 'Dora King'
        },
        {
            image: '7ebb92e5ed9a54e786dcb8e2b47b818a.jpg',
            title: '畢業紀念'
        },
        {
            image: 'Image_20250805153619_68.jpg',
            title: '漢堡少女'
        },
        {
            image: 'Image_20250805153619_69.jpg',
            title: 'Makima'
        },
        {
            image: 'a45dd89d0ebdb4f53fbf3ac99c8e019d.jpg',
            title: '殺手女僕'
        },
        {
            image: 'Image_20250805153619_67.jpg',
            title: '一月壽星'
        },
        {
            image: 'Image_20250805153619_71.jpg',
            title: '墨鏡少女'
        },
        {
            image: '7830aaa70eb63159111e59d17e318d23.jpg',
            title: '牛角少女'
        }
    ];

    // 生成艺术作品HTML
    artworks.forEach((artwork, index) => {
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
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        // 创建lightbox内容
        const lightboxContent = document.createElement('div');
        lightboxContent.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
        `;

        // 创建图片元素
        const lightboxImg = document.createElement('img');
        lightboxImg.src = artworks[index].image;
        lightboxImg.alt = artworks[index].title;
        lightboxImg.style.cssText = `
            max-width: 100%;
            max-height: 80vh;
            object-fit: contain;
        `;

        // 创建标题
        const lightboxTitle = document.createElement('div');
        lightboxTitle.textContent = artworks[index].title;
        lightboxTitle.style.cssText = `
            color: white;
            text-align: center;
            margin-top: 10px;
            font-size: 1.2rem;
        `;

        // 创建关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: -40px;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
        `;
        closeBtn.addEventListener('click', function() {
            lightbox.remove();
        });

        // 创建上一张按钮
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '‹';
        prevBtn.style.cssText = `
            position: absolute;
            top: 50%;
            left: -50px;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
        `;
        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const newIndex = (index - 1 + artworks.length) % artworks.length;
            openLightbox(newIndex);
        });

        // 创建下一张按钮
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '›';
        nextBtn.style.cssText = `
            position: absolute;
            top: 50%;
            right: -50px;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
        `;
        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const newIndex = (index + 1) % artworks.length;
            openLightbox(newIndex);
        });

        // 组装lightbox
        lightboxContent.appendChild(lightboxImg);
        lightboxContent.appendChild(lightboxTitle);
        lightboxContent.appendChild(closeBtn);
        lightboxContent.appendChild(prevBtn);
        lightboxContent.appendChild(nextBtn);
        lightbox.appendChild(lightboxContent);

        // 点击lightbox背景关闭
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.remove();
            }
        });

        // 添加到页面
        document.body.appendChild(lightbox);
    }
}

// 动态加载视频
function loadVideos() {
    const videoContainer = document.querySelector('.video-container');
    if (!videoContainer) return;

    // 视频数据
    const videos = [
        {
            video: '3dmodel.mp4',
            title: '角色模型展示'
        }
    ];

    // 生成视频HTML
    videos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.innerHTML = `
            <video controls muted width="100%" height="auto" poster="modelcover.jpg">
                <source src="${video.video}" type="video/mp4">
                您的浏览器不支持视频播放
            </video>
        `;
        videoContainer.appendChild(videoItem);
    });
}

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', () => {
    // 加载艺术作品
    loadArtworks();
    // 加载视频
    loadVideos();
});

// 添加移动端菜单样式
const style = document.createElement('style');
style.textContent = `
.nav-links.open {
    display: flex;
}

.nav-links {
    position: absolute;
    right: 0;
    top: 80px;
    height: calc(100vh - 80px);
    background-color: #fff;
    flex-direction: column;
    align-items: center;
    width: 50%;
    transform: translateX(100%);
    transition: transform 0.5s ease-in;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.05);
}

.nav-links.open {
    transform: translateX(0%);
}

.nav-links li {
    opacity: 0;
    margin: 1.5rem 0;
}

.nav-links li.fade {
    opacity: 1;
    transition: opacity 0.5s ease-in;
}

.hamburger.toggle .line:nth-child(2) {
    opacity: 0;
}

.hamburger.toggle .line:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.toggle .line:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
}

@media screen and (min-width: 769px) {
    .nav-links {
        position: relative;
        top: 0;
        height: auto;
        flex-direction: row;
        width: auto;
        transform: translateX(0);
        box-shadow: none;
    }
    .nav-links li {
        opacity: 1;
        margin: 0 0 0 2.5rem;
    }
}
`;

document.head.appendChild(style);
