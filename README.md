# troncamp-web

`limx-troncamp/troncamp` · **hanging_mug 鲁棒泛化 VLA 黑客松** 官网(静态站,GitHub Pages)。

双臂 Tron2 机器人把杯子挂上架(RoboTwin 官方语义:左臂抓杯 → 放中间 → 右臂抓 → 挂上架);
统一用 3 路图像 π0.5(LoRA)做策略,竞争轴是**对域随机化的鲁棒泛化**——从弱随机化跑通到全域 OOD。

## 页面

| 文件 | 内容 |
|---|---|
| `index.html` | 题面:任务说明 + 关键帧 filmstrip + 3 路图像 π0.5 + 参赛主线 |
| `tracks.html` | 赛制 T1–T4(四个放开层级)+ 计分口径 + 弱随机化/全域 OOD 评测档 + 数据政策 |
| `flow.html` | 参赛流程:clone → 装环境 → 数据 → 训练 → 自评/看 rollout → 提交 + 演示视频要求 |
| `leaderboard.html` | 匿名排行榜(Dev):只显示 token 尾号,主榜按 T4 纯成功率降序 |
| `final.html` | Final 榜:赛末公布(解锁前显示「赛末公布」) |

## 资源

- `style.css` — 朴素商务风(白底、表格为主、可离线/打印)。
- `board.js` / `config.js` — 排行榜渲染(读 `data/leaderboard.json`,60s 刷新)。
- `data/leaderboard.json` — **占位示例**,主办方 boardpub 发布真实榜单覆盖。
- `assets/hanging_mug_seed0_kf*.png` — 任务关键帧示意图(全景:整机器人 + 桌面 + 杯/架)。

## 部署

纯静态,无构建步骤。GitHub Pages 直接由根目录 `index.html` 提供;`.nojekyll` 关闭 Jekyll 处理以正常服务 `assets/`、`data/`。

排行榜数据契约:`leaderboard.json` = `{ generated_at, deadline, final_unlocked, dev:[...], final:[...] }`,
每行 `{ token_suffix, t1/t2/t3:{pass, success_rate}, t4:{success_rate, submitted_at}|null }`。
