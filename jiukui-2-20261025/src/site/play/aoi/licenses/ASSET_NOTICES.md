# 游戏资产来源

0.4.0更新：当前运行的N01至N05已替换为用户提供的五位居民FBX，分别接入其Idle和Walking。原始文件、SHA256和转换后的Blender源文件保留在source_assets/npc_mixamo；旧居民模型另存previous_models。下文旧版占位居民与花房资产的说明是保留的历史来源记录，当前全区域环境使用source_assets/full_world中的Blender模型库。详见Full-World-Art-and-Provided-NPCs.txt。

- 引擎：Godot 4.7.2 Standard。实际引擎许可及第三方声明分别见 Godot-MIT.txt 和 Godot-third-party.txt。
- 字体：Noto Sans CJK TC Regular，来自 notofonts/noto-cjk 官方仓库；SIL OFL 1.1，原文随包提供。
- 当前主角 Aoi（0.2.1 起）：用户提供的 FBX 模型及通过 Mixamo 绑定、下载的 Idle、Dwarf Walk、Running。项目制作工作副本的蒙皮修正、握带姿势、AnimationTree 分层、IK、裙摆修正与邮包摆动。源文件哈希记录在 `reports/aoi_rig/delivery_manifest.json`，未从其他账号获取模型或动画。
- 旧版 AOI 占位资产及 N01、N02、N03：本项目使用 Blender 脚本建立的网格、骨架及动作。
- 场景建筑、道具、纸路、界面与图标：本项目原创几何、代码或矢量图；0.3.0 晾衣院使用代码辅助 Blender 制作的独立模块，其本身不是 AI 图生3D模型。
- 材质：原有确定性程序生成的纸粒与木纹保留。0.3.0 展示区灰墙、木、石、褪绿布材质来自本次内置 imagegen 生成的材质母图，经裁切、调色及周期处理；其余小材质由项目制作。弱法线由亮度近似推导，不是扫描PBR。
- 0.3.0 花房与修补陶盆植物：腾讯混元官网 V3.1，以项目生成多视图作为输入，实际下载带材质GLB；Blender清理、统一尺寸与减面。两个模型分别约28k和4k三角面。原始文件、输入哈希和生成记录随源码保留。使用官网免费生成，没有付费API。
- AI 概念、多视图及外部模型来源，分别见源码 `source_assets/courtyard/provenance.json`、`pipeline_status.json`；只有真实生成并导入的外部 GLB 才能登记为 AI 3D，未成功项不以示例或备用模型替代声明。
- 声音：本项目脚本合成的效果、环境底声与稀疏短旋律；没有采样商业音乐或他人的录音。
- 原始参考图和概念板保留在前期包，未用作游戏场景贴图或冒充实机画面。

原创内容为梁嘉伟的PROJECT AOI项目制作，使用Codex辅助；此声明不额外授予第三方使用这些原创内容的权利。

- 2026-10-16 新主角替换：梁嘉伟本次提供的 Standing Idle (1).fbx、Walking.fbx、Running (1).fbx，包含同一新角色及三套动作；原始57骨骼与颜色贴图保留。项目在工作副本制作跑步肩带握持层、手腕IK、包与裙摆蒙皮／形变修正。输入文件及哈希位于 source_assets/aoi_replacement/，不是继续使用旧角色网格。


## 0.4.0 全 Demo 环境

邮局、修理铺：腾讯混元 V3.1 官网免费生成的外部 AI 网格，经 Blender 归一化、简化、材质校准；原始 GLB、输入图和记录位于 source_assets/street/ai。修理铺和既有花房包含局部 Blender 灰墙/木板修整；不声称整栋为人工原创。服务条款参见 https://rule.tencent.com/rule/202501080004 。本地测试交付未公开发布，不据此推断任意商业用途的许可。

街道、道路、栏杆、邮筒、长椅、灯具、普通植物、背景建筑：PROJECT AOI 代码辅助 Blender 制作；部分表面复用内置 imagegen 生成并校色的平铺纹理，其余为程序材质。逐文件来源见 source_assets/street/provenance.json。SEASON 只作美术方向参考，未提取或重用其游戏资产。

## 分批内容扩展

N04 阿澄：PROJECT AOI 使用既有原创居民骨架与 Blender 脚本制作，短发、蓝绿工作服、随身录音机；没有借用其他角色模型或外部下载模型。源文件 source_assets/blender/N04.blend，生成脚本 build_continuation_residents.py。后巷新建筑与道路为项目程序几何，复用已有原创材质与声音，不称为混元生成模型。


## 1.0.0 完整内容

N05 小满：PROJECT AOI 原创 Blender 居民模型，矮身形、宽檐帽与纸机关配件；源文件 source_assets/blender/N05.blend，与 N04 共同由 build_continuation_residents.py 制作。五居民均为项目源资产，不含临时下载人物。

L03–L06、LS01–LS03、分信室与聚会布置：content_world.gd / world.gd / art.gd 生成的项目原创几何，采用已有纸、木、褪绿材质与 Golden Hour 光照。新区域没有借用概念图作实机，也没有宣称经过外部 AI 3D 服务生成。

取信、递信、铺收纸路、坐下：interaction_pose.gd 和 seat_pose.gd 在原始动画之后叠加的运行时骨骼姿态，保留用户模型和原始57骨骼 Rest，不额外下载动画。聚会短旋律为 build_final_audio.py 合成的原创48kHz单声道 WAV；其余声音沿用现有原创合成资产。
