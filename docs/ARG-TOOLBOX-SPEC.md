# 开箱即用 ARG 工具箱：产品与技术规格

## 1. 产品定义

目标用户只需要准备：

1. 世界的上帝视角文本；
2. 每个角色所知道、相信、误解或隐瞒的文本；
3. 玩家开始时知道的信息，以及允许最终知道的信息。

工具箱将其编译为一套可编辑的调查体验：推荐表现媒介、生成证据分布、安排谜题门槛、检查逻辑、预览流程，并导出可部署网页。作者可以自由替换皮肤、文本、资源和谜题。

工具箱不是“输入小说，一键生成完美 ARG”。它的承诺是把最耗机械劳动的结构化、装配、校验和发布自动化，让作者把时间花在命题、角色和证据质量上。

## 2. 核心对象

```ts
type Proposition = {
  id: string;
  statement: string;
  truth: "true" | "false" | "uncertain";
  validFrom?: string;
  validUntil?: string;
  causes: string[];
};

type Knowledge = {
  characterId: string;
  propositionId: string;
  stance: "knows" | "believes" | "doubts" | "denies" | "lies-about";
  learnedAt?: string;
  confidence: number;
};

type Evidence = {
  id: string;
  propositionIds: string[];
  createdBy: string;
  intendedAudience: string[];
  reliability: number;
  medium: RendererId;
  unlock: Condition;
};

type SceneState = {
  id: string;
  visibleEvidence: string[];
  availableActions: string[];
  transitions: Transition[];
};
```

必须把“事实”“某人相信的事实”和“玩家已经证明的事实”分开。否则生成器会让角色提前知道真相，或者在第一封邮件里泄底。

## 3. 中间表示 Story IR

导入文本后生成六个相互连接的模型：

- `truth.timeline`：绝对真相时间线和因果边；
- `knowledge.matrix`：角色 × 命题 × 时间；
- `evidence.graph`：材料支持/反驳的命题与可靠性；
- `unlock.graph`：证据之间的前置条件；
- `runtime.machine`：玩家状态、动作、分支和结局；
- `media.plan`：每份证据的表现模块与待制作资源。

作者界面应允许逐条确认模型提取结果。任何未确认的模型生成内容都标为草稿。

## 4. 编译流水线

```text
文本导入
  → 事实/角色/地点/时间/物件抽取
  → 指代消解和冲突标注
  → 作者确认绝对真相
  → 计算角色知识差
  → 选择玩家必须证明的命题
  → 为命题分配证据与反证
  → 推荐媒介
  → 安排谜题和提示
  → 生成状态机
  → 自动 lint
  → 预览、试玩、导出
```

### 媒介推荐评分

每个证据对每个渲染器计算：

```text
score =
  privacy_fit
  + temporality_fit
  + voice_fit
  + authority_fit
  + interaction_fit
  + production_budget_fit
  - redundancy_penalty
  - accessibility_penalty
  - external_dependency_risk
```

系统给出理由，如：“这条信息来自两位角色的即时冲突，聊天比正式公告更合适”；而不是只显示一个推荐图标。

## 5. 渲染器注册表

每个表现模块遵循统一协议：

```ts
interface ArgRenderer {
  id: string;
  accepts: EvidenceKind[];
  requiredAssets: AssetRequirement[];
  capabilities: Capability[];
  render(data: Evidence[], theme: Theme): UIArtifact;
  validate(data: Evidence[]): Diagnostic[];
  collectEvents(): ArgEvent[];
}
```

### P0：首版必做

- `shell.desktop`：桌面或手机总壳、通知、时钟、应用入口；
- `mail.inbox`：邮件、附件、草稿、抄送、已读；
- `chat.im`：联系人、对话、删除、正在输入、选项回复；
- `drive.files`：文件夹、权限、损坏、密码、版本；
- `archive.search`：关键词、结果排序、权限与零结果；
- `media.viewer`：图片详情、音频、转写、视频；
- `evidence.board`：命题、材料、连线、提交推论；
- `ending.choice`：条件结案、多结局与重玩。

### P1：扩展

- `forum.board`
- `social.feed`
- `news.portal`
- `terminal.console`
- `map.geo`
- `qr.bridge`
- `document.pdf`
- `phone.voicemail`

### P2：Live / 现实插件

- `npc.live-chat`
- `scheduler.realtime`
- `email.delivery`
- `sms.voice`
- `geo.geofence`
- `nfc.beacon`
- `webar.marker`
- `community.shared-board`

## 6. 谜题原语注册表

谜题也必须数据化：

```ts
interface PuzzlePrimitive {
  id: string;
  inputKinds: string[];
  output: "value" | "event" | "evidence" | "branch";
  difficultyEstimate: number;
  accessibilityAlternatives: string[];
  generate(context: StoryContext): PuzzleDraft;
  verify(answer: unknown): VerificationResult;
}
```

首版原语：

- `keyword-search`
- `password-from-date`
- `cross-source-contradiction`
- `timeline-order`
- `identity-alias-match`
- `document-extraction`
- `metadata-inspection`
- `contact-discovery`
- `choice-response`
- `evidence-threshold`

每个关键门槛必须配置：

- 正确答案及可接受变体；
- 玩家在此前能获得的全部线索；
- 四级提示；
- 错误输入的叙事反馈；
- 无障碍替代；
- 外部依赖失败时的备用路径。

## 7. 作者工作台

工作台分成六个视图：

1. **真相室**：绝对时间线、因果链和不可改事实。
2. **角色室**：角色知识矩阵、误解、谎言、语体样本。
3. **证据室**：每个命题由什么支持/反驳，是否过度直白。
4. **流程室**：状态图、并行线、门槛、假结局和真结局。
5. **布景室**：选择渲染器、主题、资源和响应式预览。
6. **运营室**：发布、版本、玩家卡点、定时事件与紧急停止。

## 8. 自动校验器

发布前至少检查：

- `LEAK_EARLY`：真相在预定节点前被直接说出；
- `KNOWLEDGE_VIOLATION`：角色引用尚未知信息；
- `NO_SOURCE`：证据没有合理创建者或保存理由；
- `DEAD_END`：状态无法继续且不是结局；
- `UNREACHABLE_ENDING`：结局条件永远不可满足；
- `SINGLE_POINT_OF_FAILURE`：关键证据只有一条脆弱路径；
- `ANSWER_NOT_DERIVABLE`：答案不能由已给线索推得；
- `FORMAT_TRAP`：只因空格、大小写或同义词判错；
- `MEDIA_REDUNDANCY`：多个模块重复同一句信息；
- `DEVICE_LOCKOUT`：移动端或桌面端无法完成关键动作；
- `ACCESSIBILITY_BLOCK`：只能靠颜色、听觉或精细点击推进；
- `REAL_WORLD_RISK`：地点、身份、联系方式或行动可能伤害真人。

校验器输出问题、证据链和可执行修复建议，但不自动篡改已确认真相。

## 9. 运行时

### Static Runtime

- 纯前端导出；
- localStorage / IndexedDB 存档；
- 可离线；
- 预写 NPC 响应；
- 可任意重玩；
- 适合 GitHub Pages、Cloudflare Pages、Netlify。

### Live Runtime

- 服务器事件日志为真相源；
- 现实时间调度；
- PM 手动/半自动发消息；
- 角色身份和口径锁；
- 多玩家共享状态；
- 备用剧情与事件撤回；
- 数据最小化和审计记录；
- 一键暂停/澄清/结束。

同一项目可先用 Static 做封闭测试，再切换到 Live；但切换时必须重新做伦理与容量审查。

## 10. 输入体验

作者可以只填三个大文本框，但系统内部会引导补足最少字段：

- 命题/主题；
- 绝对真相；
- 角色清单及其知识；
- 玩家初始知识；
- 玩家最终应理解什么；
- 内容边界；
- 预算、时长、设备和是否使用现实地点。

示例见 [`story-input.example.yaml`](story-input.example.yaml)。

## 11. 导出物

每次构建产生：

- 可部署站点；
- `story-ir.json`；
- 真相时间线；
- 角色知识矩阵；
- 证据依赖图；
- 状态机图；
- 谜题答案与提示手册；
- 美术/音视频资源缺口清单；
- PM 运营手册（Live 模式）；
- 安全与外链检查报告；
- 版本化存档迁移说明。

答案手册和 PM 手册默认不打入公开静态资源。

## 12. 实施路线

### Milestone 1：可验证的 Story IR

- YAML/JSON 输入；
- 文本提取后人工确认；
- 真相、知识和证据图；
- 逻辑 lint；
- 用《待注销用户》反向编码为基准测试。

### Milestone 2：静态作品生成器

- P0 八个渲染器；
- 主题系统；
- 谜题原语；
- 本地预览和存档；
- 一键导出静态站点。

### Milestone 3：可视化作者工作台

- 六个编辑视图；
- 拖拽但不依赖拖拽；
- 试玩遥测；
- 自动提示层级和难度复盘。

### Milestone 4：跨媒介插件

- 论坛、社交、地图、QR、电话与邮件；
- 插件 SDK；
- 外链健康检查和镜像策略。

### Milestone 5：Live ARG 控制台

- 调度、演员协作、共享状态；
- 应急停服；
- 同意、隐私、数据保留；
- 规模与成本防护。

## 13. 成功指标

- 新作者从文本到首个可玩版本少于 60 分钟；
- 所有结局在自动遍历中可达；
- 关键命题不存在单点失效；
- 移动端和桌面端都能完成主线；
- 试玩者无需作者私聊即可完成；
- 试玩数据能区分“推理难”与“交互不知道怎么用”；
- 替换一种表现媒介不需要重写故事逻辑。

