# 生产发布记录

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
