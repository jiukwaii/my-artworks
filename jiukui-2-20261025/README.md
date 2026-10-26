# Jiukui — Personal Website 2.0

已于2026-10-25按用户授权部署到 **https://jiukui.vercel.app/**。运行代码提交fbf1bfb（含iPhone Safari预览修复），生产与核验记录见DEPLOYMENT.md。基线为同一正式站此前版本，不是更早的本地cottage/hero版本。

## 运行与维护

不需要 Node 构建工具、npm 安装或前端框架。

```powershell
python tools/build.py
python -m http.server 4192 --bind 127.0.0.1 --directory src/site
```

打开 http://127.0.0.1:4192/ 。按用户最新纠正，本轮只做繁体中文，不提供语言切换或英文版本。

- `src/site/`：可独立托管的静态输出，包含繁体中文首页、全部素材和两款小游戏。
- `templates/live.html`：修改前正式站 HTML，保留用于追溯；生成器只读取，不覆盖。
- `content.json`：项目名、摘要与公开源码入口。实际预览构图、较新的正文与试玩入口从正式站模板保留。
- `cases.json`：此前案例的历史草稿，本轮已撤下，不生成公开页面。
- `tools/build.py`：生成首页、canonical、结构化数据、sitemap 及资源内容哈希。
- `src/site/assets/brand.css`：本轮内容层级布局，沿用纸面、墨绿、陶红、原始人像、装帧细节。
- `tools/check-browser.cjs`：本机现有 Chrome/Playwright 回归脚本；其中运行时绝对路径可按设备调整。网站本身没有该依赖。
- `tools/check-static.py`：标准库静态完整性检查。
- `AUDIT_AND_STRATEGY.md`：审计、精选取舍与专家来源及适用边界。
- `REVIEW.md`：实际测试和剩余限制。
- `evidence/`：正式站基线 SHA-256 清单、前后截图和实际检查结果。

## 编辑规则

正文使用繁体中文，不做英文版本或语言切换。按最新反馈移除全部创作笔记、GitHub源码入口及精选下方的其他作品捷径；卡片仅保留体验入口，Pouch/Puff状态只写“僅展示”。保留 9 件项目、12 幅插画、真实桌宠与模型影片、About 翻书交互、键盘原图查看与手机导航。

只公开已确认的事实和既有素材。游戏/语音/AI API 的网络可用性、浏览器能打开、已真实完成端到端体验是不同的验证层次。桌宠只展示，不提供私有领取、安装包或源码。原始图片、旧站与历史提案保留。

GitHub 保存到独立 `codex/jiukui-2-brand-20261025` 分支。没有合并 main、设置新的生产入口或主动部署。

最新修正：已对照修改前正式站，移除全部新增作品状态小注释（包括“僅展示”）及About额外背景介绍，作品原有介绍与体验入口保留。

2026-10-25 最新：Hero恢复任务开始时正式站原有简介、身份标签与印章；首屏不再使用本轮新定位句覆盖。当前顺序为精选→其他作品→插画→关于→联系，其他作品导航高亮归“作品”。桌面首件精选预览略收紧，手机布局保持。状态小字/GitHub/案例/语言切换继续撤下。

2026-10-26：体验入口为右上斜箭头；三段影片自动静音循环纯展示、无点击播放暂停；手机三条线到X为300ms过渡。对应回归工具tools/check-showcase-interactions.cjs。
