# 葵・夏日送信 首页接入

2026-10-28，按用户最后纠正：精选采用一张通栏、两张并排、再一张通栏。新增3D游戏为第四件；原2D送信游戏仍为第一件。Pouch Pet与葵的开口信仍并排。原9项目及12插画全部保留。

仅新增首页实机画面与「免費下載 Windows 版」入口，直接连接公开的2.2.0安装包（479370641 bytes）。不新增游戏介绍页、账号、追踪或其他服务。先前介绍页草稿保留在游戏工作区 reports/portfolio-aoi-integration/unpublished-introduction，不在发布目录内。/games/aoi/保持404，不在sitemap或导航中出现。

维护：content.json的aoi_game独立保存发布元数据；tools/aoi_card.py生成新增卡片，不改变原9件项目的数据与旧模板位置映射。tools/build.py将其放在精选第四件。执行python tools/build.py与python tools/check-static.py即可重建、核验。

本地Chrome 1440/768/390/320四种宽度通过，原9卡片HTML与Hero内容相同，12幅插画保留。桌面检验通栏/双列/通栏位置；手机单列、菜单、插画原图查看与焦点返回通过。实机图片已等待解码并检查实际可见；真实点击启动公开安装包下载，测试在确认文件名后取消，没有冒充完整安装测试。已发布游戏包本身的完整下载、安装、图形启动及SHA256证据见游戏工程 reports/public-release-2.2.0。

原126个二进制素材哈希未变，旧站根HTML/CSS/JS哈希未变。只改当前jiukui-2-20261025目录，未修改Godot游戏或存档。证据位于游戏工作区 reports/portfolio-aoi-integration。浏览器检查是桌面Chrome与手机尺寸模拟，不是物理手机验收。
