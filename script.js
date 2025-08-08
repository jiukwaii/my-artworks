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
            title: '艺术作品 1'
        },
        {
            image: '301ed367d7e2b3b5d4d5146eae5423cd.jpg',
            title: '艺术作品 2'
        },
        {
            image: '614e62d84900b8eb7dca8202349345f2.jpg',
            title: '艺术作品 3'
        },
        {
            image: '7830aaa70eb63159111e59d17e318d23.jpg',
            title: '艺术作品 4'
        },
        {
            image: '7ebb92e5ed9a54e786dcb8e2b47b818a.jpg',
            title: '艺术作品 5'
        },
        {
            image: '9dec5c5f28b2e89a744260e78242945f.jpg',
            title: '艺术作品 6'
        }
    ];

    // 生成艺术作品HTML
    artworks.forEach(artwork => {
        const artworkItem = document.createElement('div');
        artworkItem.className = 'artwork-item';
        artworkItem.innerHTML = `
            <img src="${artwork.image}" alt="${artwork.title}">
            <div class="artwork-overlay">
                <div class="artwork-title">${artwork.title}</div>
            </div>
        `;
        artworkGrid.appendChild(artworkItem);
    });
}

// 动态加载游戏作品
function loadGames() {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;

    // 游戏数据
    const games = [
        {
            title: '小鸟跳跃',
            url: 'game/小鸟跳跃.html',
            image: 'gamecover/小鸟跳跃.png'
        },
        {
            title: '小鸡过马路',
            url: 'game/小鸡过马路.html',
            image: 'gamecover/小鸡过马路.jpg'
        }
    ];

    // 生成游戏HTML
    games.forEach(game => {
        const gameItem = document.createElement('div');
        gameItem.className = 'game-item';
        gameItem.innerHTML = `
            <div class="game-image">
                <img src="${game.image}" alt="${game.title}游戏封面" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="game-content">
                <div class="game-title">${game.title}</div>
                <a href="${game.url}" class="game-link" target="_blank">开始游戏</a>
            </div>
        `;
        gameContainer.appendChild(gameItem);
    });
}

// 动态加载视频
function loadVideos() {
    const videoContainer = document.querySelector('.video-container');
    if (!videoContainer) return;

    // 视频数据
        const videos = [
            {
                video: 'V/腾讯混元3D and 3 more pages - Personal - Microsoft​ Edge 2025-08-04 10-21-16.mp4',
                title: '3D模型设计'
            },
            {
                video: 'V/3D design Exquisite Blad - Tinkercad and 3 more pages - Personal - Microsoft​ Edge 2025-08-04 18-54-42.mp4',
                title: '3D名牌设计'
            }
        ];

    // 生成视频HTML
    videos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.innerHTML = `
            <video controls muted width="100%" height="auto">
                <source src="${video.video}" type="video/mp4">
                您的浏览器不支持视频播放
            </video>
            <div style="padding: 1rem; text-align: center;">${video.title}</div>
        `;
        videoContainer.appendChild(videoItem);
    });
}

// 创建艺术作品页面
function createArtworksPage() {
    const artworksPage = document.createElement('html');
    artworksPage.innerHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>艺术作品 | 个人艺术作品集</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@300;400;500&display=swap" rel="stylesheet">
    <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
</head>
<body>
    <!-- 导航栏 -->
    <nav class="navbar">
        <div class="logo">
            <img src="logo.jpg" alt="Logo">
        </div>
        <ul class="nav-links">
            <li><a href="index.html#home">首页</a></li>
            <li><a href="index.html#about">关于我</a></li>
            <li><a href="#artworks">艺术作品</a></li>
            <li><a href="videos.html">3D 打印</a></li>
            <li><a href="index.html#contact">联系方式</a></li>
        </ul>
        <div class="hamburger">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
        </div>
    </nav>

    <!-- 艺术作品部分 -->
    <section id="artworks" class="artworks-page">
        <h2>绘画作品</h2>
        <div class="artwork-grid">
            <!-- 艺术作品将通过JavaScript动态加载 -->
        </div>
    </section>

    <!-- 页脚 -->
    <footer>
        <div class="footer-content">
            <p>&copy; 2025 艺术作品集. 保留所有权利.</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>
    `;
    return artworksPage.outerHTML;
}

// 创建视频页面
function createVideosPage() {
    const videosPage = document.createElement('html');
    videosPage.innerHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D 打印 | 个人作品集</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@300;400;500&display=swap" rel="stylesheet">
    <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
</head>
<body>
    <!-- 导航栏 -->
    <nav class="navbar">
        <div class="logo">
            <img src="logo.jpg" alt="Logo">
        </div>
        <ul class="nav-links">
            <li><a href="index.html#home">首页</a></li>
            <li><a href="index.html#about">关于我</a></li>
            <li><a href="artworks.html">艺术作品</a></li>
            <li><a href="videos.html">视频展示</a></li>
            <li><a href="games.html">游戏作品</a></li>
            <li><a href="index.html#contact">联系方式</a></li>
        </ul>
        <div class="hamburger">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
        </div>
    </nav>

    <!-- 视频部分 -->
    <section id="videos" class="videos-page">
        <h2>3D 打印</h2>
        <div class="video-container">
            <!-- 视频将通过JavaScript动态加载 -->
        </div>
    </section>

    <!-- 页脚 -->
    <footer>
        <div class="footer-content">
            <p>&copy; 2025 艺术作品集. 保留所有权利.</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>
    `;
    return videosPage.outerHTML;
}

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', () => {
    // 加载艺术作品
    loadArtworks();
    // 加载视频
    loadVideos();
    // 加载游戏作品
    loadGames();

    // 如果是艺术作品页面，加载所有艺术作品
    if (document.body.classList.contains('artworks-page')) {
        const artworkGrid = document.querySelector('.artwork-grid');
        artworkGrid.innerHTML = '';
        // 艺术作品数据
        const artworks = [
            {
                image: '0f12e295770ae362c53ffe7601f4bad0.jpg',
                title: '艺术作品 1'
            },
            {
                image: '301ed367d7e2b3b5d4d5146eae5423cd.jpg',
                title: '艺术作品 2'
            },
            {
                image: '614e62d84900b8eb7dca8202349345f2.jpg',
                title: '艺术作品 3'
            },
            {
                image: '7830aaa70eb63159111e59d17e318d23.jpg',
                title: '艺术作品 4'
            },
            {
                image: '7ebb92e5ed9a54e786dcb8e2b47b818a.jpg',
                title: '艺术作品 5'
            },
            {
                image: '9dec5c5f28b2e89a744260e78242945f.jpg',
                title: '艺术作品 6'
            },
            {
                image: 'Image_20250805153619_67.jpg',
                title: '艺术作品 7'
            },
            {
                image: 'Image_20250805153619_68.jpg',
                title: '艺术作品 8'
            },
            {
                image: 'Image_20250805153619_69.jpg',
                title: '艺术作品 9'
            },
            {
                image: 'Image_20250805153619_70.jpg',
                title: '艺术作品 10'
            },
            {
                image: 'Image_20250805153619_71.jpg',
                title: '艺术作品 11'
            },
            {
                image: 'a45dd89d0ebdb4f53fbf3ac99c8e019d.jpg',
                title: '艺术作品 12'
            },
            {
                image: 'logo.jpg',
                title: 'Logo'
            },
            {
                image: 'profilepicture.jpg',
                title: '个人头像'
            }
        ];

        // 生成艺术作品HTML
        artworks.forEach(artwork => {
            const artworkItem = document.createElement('div');
            artworkItem.className = 'artwork-item';
            artworkItem.innerHTML = `
                <img src="${artwork.image}" alt="${artwork.title}">
                <div class="artwork-overlay">
                    <div class="artwork-title">${artwork.title}</div>
                </div>
            `;
            artworkGrid.appendChild(artworkItem);
        });
    }
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

// 创建艺术作品页面和视频页面
if (window.location.pathname.endsWith('artworks.html')) {
    document.write(createArtworksPage());
} else if (window.location.pathname.endsWith('videos.html')) {
    document.write(createVideosPage());
}