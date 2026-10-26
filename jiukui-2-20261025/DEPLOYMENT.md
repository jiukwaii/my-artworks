# 生产发布记录

> 最新生产：2026-10-26 网页、分享标题及结构化WebPage名称恢复「玖葵 Jiukui」。部署dpl_iM9FRE87LSxTPYhtTGXgu7P6BCS7，运行代码2b3cb1daca2dd9b8470bb7ada7122624a1f90232。正式域名HTTP200，title/og:title/twitter:title均已核对，线上HTML与本地完全一致；静态检查通过，126份原始素材保持不变。见evidence/name-only-title/live-check.json。

> 最新生产：2026-10-26 统一16px细线作品箭头，部署dpl_763bSqLbWmCvb3Z79dQE1qV2pXvQ，运行代码c7e7d128afef2acd424a2c22a42eda195186998f。六个体验入口右上斜箭头，模型照片横箭头。正式域名Chrome/WebKit的393px与1440px四项样式、悬停、溢出、照片打开及焦点检查通过；HTML/CSS/JS与发布文件一致。本地影片/菜单八项回归通过，126份原始二进制素材保持不变。截图与结果见evidence/arrow-family；本轮没有物理iPhone检查。

> 最新生产：2026-10-26 参考箭头字形纠正，部署dpl_HoN12mxoJo2M2VCiZnAq2Y45Cdnu，运行代码5ec6a6c6f9142bdd306da823becfe2c62f6c2594。正式域名已生效；后续为历史发布记录。

> 最新生产：2026-10-26 右上斜箭头、纯展示自动循环影片与手机菜单过渡。部署dpl_6LTVPgnbHhFzNNYZLgHhdtxp85jf，运行代码a2b2e47f2128876e2b3e8ea34f0ba39c6fe8cf23，正式域名jiukui.vercel.app已生效。较早发布记录保留供追溯。

> 最新生产：2026-10-25 iPhone Safari精选预览修复，部署dpl_6mNaoqSA6iX1s298E9PJXy4sUkuY，运行代码fbf1bfb0597a302fc85d65ae9e00481a5def73c6；jiukui.vercel.app已指向新部署。下文首次发布保留为历史记录。

2026-10-25，用户明确要求“部署”，授权把当前修改版发布到既有正式站。

- 正式地址：https://jiukui.vercel.app/
- 项目：jiukui-personal / prj_0mfwaknjSy4CKCX3TTL0Or18RGnx。
- 最终生产部署：dpl_6YK4RwCDV8axx1ifYFrpRdLHDqbG，状态READY，正式域名已指向该部署。
- 部署地址：https://jiukui-personal-aohp8u6eb-jia-wei-s-projects.vercel.app/
- 运行代码提交：73bea0c7c1f74d56cd6316f3c7f95b3d03bd08b1，来自已批准的 codex/jiukui-2-brand-20261025 分支；没有合并main。
- 发布根目录：jiukui-2-20261025/src/site。仅这个静态目录对外提供文件，不公开维护文档、内容登记与测试截图。
- 保留原正式站的三个index.html永久跳转，以及nosniff和strict-origin-when-cross-origin响应头。静态文件已生成，不执行旧站finalize脚本或迁移框架。
- 本轮前生产基线：dpl_6k6bYKSrM1Cuh63cHAQ277rzGvJa，保留用于追溯。

## 实际线上核验

桌面1440px与手机390px：HTTP200；原Hero介绍、身份标签和印章；精选→其他作品→插画→关于→联络；9项目与12画作；没有被撤回的状态小字/GitHub/创作笔记/语言入口；无横向溢出、缺图、失败资源或脚本错误。其他作品区正确高亮“作品”，原图对话框可打开和关闭，小鸟跳跃可以通过真实点击开始。

线上HTML与本地文件规范化换行后完全一致；Git部署LF与Windows本地CRLF的字节差异已记录，不是内容差异。三个原有index地址返回308，维护文档与内容源文件路径返回404。响应头正确。详见 evidence/production/live-browser.json 与 http.json。

截图为Chrome桌面及手机尺寸模拟，不是物理手机检查。未代用户测试付费AI、语音事务或安装包。

## iPhone Safari修复上线核验

通过WebKit复现原缩窄问题后，修复首件精选的手机对齐和明确宽度，恢复4:3。已发布正式站，READY且正式域名别名生效。WebKit与Chrome在375/393/430/1440共8项线上检查全部通过；线上HTML/CSS与本地修复文件规范化换行后一致。393px视口预览宽度由约221px恢复327px，桌面样式保持。记录位于evidence/mobile-preview-fix/live-checks.json与published-files.json。尚未由用户在其实际iPhone刷新验收。

## 2026-10-26 线上展示交互验证

WebKit/Chrome × 手机393px/桌面1440px × 普通/减少动态偏好，共8组线上检查全部通过。三段真实影片可见即自动静音循环，无播放暂停UI、点击不会暂停，已退出键盘焦点。六个体验入口为右上斜箭头，站内照片入口与Hero入口保留各自方向。菜单300ms旋转/淡出中间状态、X终态、Esc关闭和焦点返回均验证；减少动态时直接切换。未出现脚本错误或横向溢出。正式HTML/CSS/JS与本地文件规范化换行后完全一致，见evidence/showcase-interactions/live-checks.json、published-files.json与截图。不是用户物理iPhone验收，不声称能绕过浏览器系统级媒体限制。

## 同款箭头纠正上线

此次由SVG改成参考站真正使用的Noto Sans SC 800的↗文本字形，只新增单箭头字体1856bytes及许可证，不更换全站字体。六个体验入口为12px/800/8px间距/.08em/260ms向右6px向上3px。WebKit与Chrome手机393/桌面1440共4项本地与4项线上检查分别全通过，截图和计算样式见evidence/arrow-match。影片、菜单和iPhone预览布局未修改。
