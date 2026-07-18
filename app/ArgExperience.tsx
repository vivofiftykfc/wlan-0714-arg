"use client";

import { useEffect, useMemo, useState } from "react";

type AppId = "inbox" | "chat" | "drive" | "archive" | "notes" | "board" | "system";
type Ending = "erase" | "expose" | "inherit" | null;

const APPS: { id: AppId; mark: string; label: string }[] = [
  { id: "inbox", mark: "邮", label: "收件箱" },
  { id: "chat", mark: "话", label: "通讯" },
  { id: "drive", mark: "盘", label: "云盘" },
  { id: "archive", mark: "检", label: "检索" },
  { id: "notes", mark: "笺", label: "便笺" },
  { id: "board", mark: "证", label: "证据板" },
  { id: "system", mark: "核", label: "系统" },
];

const EVIDENCE = [
  { id: "brief", title: "异常委托", desc: "温岚的死亡证明已通过，但她的账号仍在每日 03:17 登录。" },
  { id: "death", title: "注销日期", desc: "温岚于 2025 年 7 月 14 日死亡，注销申请却在次日被本人撤回。" },
  { id: "habit", title: "三种书写习惯", desc: "同一账号同时存在三种稳定的标点、称呼与作息习惯。" },
  { id: "photo", title: "白榆路照片", desc: "死亡两周后，该账号上传了白榆路 17 号的厨房照片。" },
  { id: "access", title: "重复的门禁", desc: "WLAN-01、02、03 使用同一凭据，却来自不同设备和行动轨迹。" },
  { id: "qiao", title: "乔乔的证词", desc: "“温岚”是白榆互助屋为无可用身份者保留的一把公共钥匙。" },
  { id: "voice", title: "第四把椅子", desc: "录音里提到：只有上一位保管者消失，系统才会寻找下一位。" },
  { id: "you", title: "WLAN-04", desc: "本次协查不是随机委托。你的调查行为已被登记为第四位候选保管者。" },
];

const initialLogs = [
  "00:00:00  恢复终端 WLAN-0714",
  "00:00:02  挂载只读证据分区",
  "00:00:04  等待协查员确认",
];

const hintFor = (count: number, driveOpen: boolean, archiveHit: boolean) => {
  if (count < 2) return "先查看收件箱里的《异常账户协查》与《死亡确认回执》。日期可能不只是日期。";
  if (!driveOpen) return "云盘恢复口令是四位数字。温岚被正式注销的月日是什么？";
  if (!archiveHit) return "照片详情里出现了一个具体地址。把完整地址输入“检索”应用。";
  if (count < 6) return "用门禁记录里反复出现的编号 WLAN-02，在通讯录中寻找被隐藏的联系人。";
  if (count < 8) return "听完共享文件中的录音，再查看系统审计。你也许不是旁观者。";
  return "所有证据都已齐全。打开证据板，提交你对这个账号的最终处理意见。";
};

export default function ArgExperience() {
  const [started, setStarted] = useState(false);
  const [active, setActive] = useState<AppId>("inbox");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [logs, setLogs] = useState(initialLogs);
  const [driveCode, setDriveCode] = useState("");
  const [driveOpen, setDriveOpen] = useState(false);
  const [archiveQuery, setArchiveQuery] = useState("");
  const [archiveHit, setArchiveHit] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const [qiaoOpen, setQiaoOpen] = useState(false);
  const [selectedMail, setSelectedMail] = useState("brief");
  const [selectedChat, setSelectedChat] = useState("mother");
  const [selectedFile, setSelectedFile] = useState("readme");
  const [hintOpen, setHintOpen] = useState(false);
  const [ending, setEnding] = useState<Ending>(null);
  const [clock, setClock] = useState("00:00");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("wlan0714-save");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setStarted(Boolean(data.started));
        setEvidence(data.evidence || []);
        setDriveOpen(Boolean(data.driveOpen));
        setArchiveHit(Boolean(data.archiveHit));
        setQiaoOpen(Boolean(data.qiaoOpen));
        setEnding(data.ending || null);
        setLogs(data.logs || initialLogs);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "wlan0714-save",
      JSON.stringify({ started, evidence, driveOpen, archiveHit, qiaoOpen, ending, logs }),
    );
  }, [started, evidence, driveOpen, archiveHit, qiaoOpen, ending, logs]);

  useEffect(() => {
    const update = () =>
      setClock(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
    update();
    const timer = setInterval(update, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const count = evidence.length;
  const complete = count === EVIDENCE.length;
  const evidenceSet = useMemo(() => new Set(evidence), [evidence]);

  const appendLog = (message: string) =>
    setLogs((current) => [...current, `${clock}:17  ${message}`].slice(-18));

  const collect = (id: string) => {
    if (evidenceSet.has(id)) return;
    const item = EVIDENCE.find((entry) => entry.id === id);
    setEvidence((current) => [...current, id]);
    appendLog(`证据写入：${item?.title || id}`);
    setToast(`已记录证据：${item?.title}`);
  };

  const openApp = (id: AppId) => {
    setActive(id);
    appendLog(`打开应用：${APPS.find((app) => app.id === id)?.label}`);
  };

  const unlockDrive = () => {
    if (driveCode.trim() === "0714") {
      setDriveOpen(true);
      setSelectedFile("photo");
      appendLog("恢复分区解密成功");
      setToast("恢复分区已解锁");
    } else {
      appendLog(`恢复口令失败：${driveCode || "空"}`);
      setToast("口令不正确");
    }
  };

  const runArchiveSearch = () => {
    const normalized = archiveQuery.replace(/\s/g, "");
    if (normalized.includes("白榆路17号") || normalized.includes("WLAN")) {
      setArchiveHit(true);
      appendLog(`检索命中：${archiveQuery}`);
      setToast("找到 3 条被合并的门禁记录");
    } else {
      appendLog(`检索无结果：${archiveQuery || "空"}`);
      setToast("没有匹配记录");
    }
  };

  const findContact = () => {
    if (contactQuery.trim().toUpperCase() === "WLAN-02") {
      setQiaoOpen(true);
      setSelectedChat("qiao");
      appendLog("恢复隐藏联系人：乔乔 / WLAN-02");
      setToast("隐藏联系人已恢复");
    } else {
      setToast("没有找到该联系人");
    }
  };

  const reset = () => {
    localStorage.removeItem("wlan0714-save");
    setStarted(false);
    setActive("inbox");
    setEvidence([]);
    setLogs(initialLogs);
    setDriveCode("");
    setDriveOpen(false);
    setArchiveQuery("");
    setArchiveHit(false);
    setContactQuery("");
    setQiaoOpen(false);
    setSelectedMail("brief");
    setSelectedChat("mother");
    setSelectedFile("readme");
    setHintOpen(false);
    setToast("");
    setEnding(null);
  };

  const chooseEnding = (choice: Exclude<Ending, null>) => {
    setEnding(choice);
    appendLog(`最终指令：${choice.toUpperCase()}`);
  };

  return (
    <main className="experience">
      <div className="noise" />
      {!started && (
        <section className="boot-screen">
          <div className="boot-mark">W</div>
          <p className="eyebrow">RECOVERED SESSION / 0714</p>
          <h1>待注销用户</h1>
          <p className="boot-lead">一个已经死亡的用户，为什么仍在每天登录？</p>
          <div className="case-slip">
            <div><span>对象</span><strong>温岚 / WLAN-01</strong></div>
            <div><span>状态</span><strong className="live">已死亡 · 在线</strong></div>
            <div><span>权限</span><strong>临时协查员</strong></div>
          </div>
          <p className="boot-note">
            本体验约 20–35 分钟。请像调查真实电脑一样阅读、检索并记录证据。
            进度只保存在当前设备。
          </p>
          <button
            className="primary large"
            onClick={() => {
              setStarted(true);
              collect("brief");
              appendLog("协查员接受委托");
            }}
          >
            接受协查
          </button>
          <p className="fiction">本作品为虚构互动叙事，不对应任何真实人物或机构。</p>
        </section>
      )}

      {started && !ending && (
        <section className="workspace">
          <header className="topbar">
            <div className="brand">
              <span className="brand-dot" />
              <strong>白榆数字遗产中心</strong>
              <small>隔离终端 WLAN-0714</small>
            </div>
            <div className="case-progress">
              <span>证据完整度</span>
              <div className="progress-track"><i style={{ width: `${(count / EVIDENCE.length) * 100}%` }} /></div>
              <b>{count}/{EVIDENCE.length}</b>
            </div>
            <div className="top-actions">
              <button onClick={() => setHintOpen(true)}>提示</button>
              <time>{clock}</time>
            </div>
          </header>

          <aside className="dock" aria-label="应用列表">
            <div className="profile-orb">温</div>
            <nav>
              {APPS.map((app) => (
                <button
                  key={app.id}
                  className={active === app.id ? "active" : ""}
                  onClick={() => openApp(app.id)}
                  aria-label={app.label}
                >
                  <span>{app.mark}</span>
                  <em>{app.label}</em>
                  {app.id === "board" && count > 0 && <b>{count}</b>}
                </button>
              ))}
            </nav>
            <div className="signal"><i /><span>隔离网络</span></div>
          </aside>

          <section className="app-window">
            {active === "inbox" && (
              <div className="split-app">
                <div className="list-pane">
                  <div className="pane-title"><p>收件箱</p><span>4 封邮件</span></div>
                  {[
                    ["brief", "账户处置中心", "异常账户协查", "今天 00:01"],
                    ["death", "民政数据交换站", "死亡确认回执 / 温岚", "2025/07/15"],
                    ["mother", "温岚妈妈", "你们是不是弄错了", "2025/08/02"],
                    ["late", "系统自动投递", "如果有人终于看到这里", "解锁后可读"],
                  ].map(([id, from, title, date]) => {
                    const locked = id === "late" && count < 6;
                    return (
                      <button
                        key={id}
                        className={`mail-row ${selectedMail === id ? "selected" : ""}`}
                        disabled={locked}
                        onClick={() => {
                          setSelectedMail(id);
                          if (id === "brief") collect("brief");
                          if (id === "death") collect("death");
                        }}
                      >
                        <span className="avatar">{from[0]}</span>
                        <span><strong>{from}</strong><b>{title}</b><small>{locked ? "加密邮件" : date}</small></span>
                      </button>
                    );
                  })}
                </div>
                <article className="content-pane mail-content">
                  {selectedMail === "brief" && (
                    <>
                      <p className="eyebrow">CASE / AUTO-ASSIGNED</p>
                      <h2>异常账户协查</h2>
                      <div className="mail-meta">账户处置中心 → 临时协查员</div>
                      <p>用户 <mark>温岚（WLAN-01）</mark>的死亡证明已于 2025 年 7 月 14 日核验。</p>
                      <p>但系统拒绝执行注销：该账号在死亡后仍保持每日活跃，并固定于凌晨 03:17 完成一次登录。</p>
                      <div className="notice">请确认活动来源，并给出最终处置建议：注销、上报，或转移。</div>
                      <button className="evidence-button done" onClick={() => collect("brief")}>✓ 记录为证据</button>
                    </>
                  )}
                  {selectedMail === "death" && (
                    <>
                      <p className="eyebrow">CIVIL DATA EXCHANGE</p>
                      <h2>死亡确认回执</h2>
                      <div className="document-card">
                        <span>公民姓名</span><b>温岚</b>
                        <span>确认日期</span><b>2025-07-14 23:41</b>
                        <span>注销申请</span><b>2025-07-15 03:17</b>
                        <span>处理结果</span><b className="red">由本人撤回</b>
                      </div>
                      <p>备注：撤回操作通过原账户密钥完成，设备签名与历史设备不一致。</p>
                      <button className="evidence-button" onClick={() => collect("death")}>记录日期与异常撤回</button>
                    </>
                  )}
                  {selectedMail === "mother" && (
                    <>
                      <p className="eyebrow">FORWARDED MESSAGE</p>
                      <h2>你们是不是弄错了</h2>
                      <div className="quote-mail">
                        <p>我女儿不爱用句号，她说句号像在生气。</p>
                        <p>可你们发来的聊天备份里，有的人每句话都带句号；有的人管我叫阿姨；还有一个人只在半夜回复。</p>
                        <p>我不知道哪个才是她。</p>
                      </div>
                      <button className="evidence-button" onClick={() => collect("habit")}>记录三种书写习惯</button>
                    </>
                  )}
                  {selectedMail === "late" && (
                    <>
                      <p className="eyebrow">DEAD LETTER / 03:17</p>
                      <h2>如果有人终于看到这里</h2>
                      <p>别急着问“谁盗用了温岚”。先问：为什么一个人需要借用另一个人的名字，才能租房、就医和领取工资？</p>
                      <p>白榆路的门一直为没有名字的人留着。钥匙只有一把，所以我们轮流保管。</p>
                      <div className="notice">附件：四把椅子.m4a（已同步至云盘）</div>
                    </>
                  )}
                </article>
              </div>
            )}

            {active === "chat" && (
              <div className="split-app">
                <div className="list-pane chat-list">
                  <div className="search-box">
                    <input value={contactQuery} onChange={(e) => setContactQuery(e.target.value)} placeholder="搜索联系人编号" />
                    <button onClick={findContact}>查找</button>
                  </div>
                  {[
                    ["mother", "妈", "你今晚回来吃饭吗"],
                    ["landlord", "周经理", "17号的水费记得分摊。"],
                    ...(qiaoOpen ? [["qiao", "乔乔", "你不是第一个打开这台电脑的人"]] : []),
                  ].map(([id, name, preview]) => (
                    <button key={id} className={`contact-row ${selectedChat === id ? "selected" : ""}`} onClick={() => setSelectedChat(id)}>
                      <span className="avatar">{name[0]}</span><span><strong>{name}</strong><small>{preview}</small></span>
                    </button>
                  ))}
                </div>
                <article className="content-pane chat-content">
                  <div className="chat-head">
                    <div><strong>{selectedChat === "mother" ? "妈" : selectedChat === "landlord" ? "周经理" : "乔乔 / WLAN-02"}</strong><small>{selectedChat === "qiao" ? "最后在线：正在输入…" : "离线"}</small></div>
                  </div>
                  {selectedChat === "mother" && (
                    <div className="messages">
                      <div className="msg other">今晚回来吃饭吗</div>
                      <div className="msg mine">加班 不回来啦</div>
                      <div className="msg other">你最近怎么开始用句号了</div>
                      <div className="msg mine alt">不是她。阿姨，您早点休息。</div>
                      <div className="system-msg">以上消息发送于温岚死亡后 9 天</div>
                    </div>
                  )}
                  {selectedChat === "landlord" && (
                    <div className="messages">
                      <div className="msg other">白榆路17号这个月还是三个人住？</div>
                      <div className="msg mine">三个人，一个名字。</div>
                      <div className="msg other">我不管你们叫什么，1703 柜里的备用钥匙别再丢了。</div>
                      <div className="msg mine alt">知道了。</div>
                    </div>
                  )}
                  {selectedChat === "qiao" && (
                    <div className="messages">
                      <div className="msg other">你用 WLAN-02 找到我，说明已经看过门禁。</div>
                      <div className="msg other">温岚不是假名。她活过，也确实死了。</div>
                      <div className="msg mine alt">那为什么你们还在用她的账号？</div>
                      <div className="msg other">因为我们有人没有能用的身份证，有人逃出来时什么都没带。她把自己的名字借给了白榆屋。</div>
                      <div className="msg other">她死后，我们没有立刻交还钥匙。这个答案不高尚，但是真的。</div>
                      <button className="evidence-button in-chat" onClick={() => collect("qiao")}>记录乔乔的证词</button>
                    </div>
                  )}
                </article>
              </div>
            )}

            {active === "drive" && (
              <div className="single-app drive-app">
                <div className="app-heading"><div><p className="eyebrow">RECOVERED CLOUD</p><h2>温岚的云盘</h2></div><span>{driveOpen ? "恢复分区已挂载" : "恢复分区已加密"}</span></div>
                {!driveOpen ? (
                  <div className="vault">
                    <div className="vault-icon">╳</div>
                    <h3>请输入恢复口令</h3>
                    <p>提示：她被系统正式注销的月与日。</p>
                    <div><input maxLength={4} value={driveCode} onChange={(e) => setDriveCode(e.target.value.replace(/\D/g, ""))} placeholder="••••" onKeyDown={(e) => e.key === "Enter" && unlockDrive()} /><button onClick={unlockDrive}>解锁</button></div>
                  </div>
                ) : (
                  <div className="drive-grid">
                    <div className="file-sidebar">
                      {[
                        ["readme", "交接说明.txt", "TXT"],
                        ["photo", "WYL17_1703.jpg", "JPG"],
                        ["voice", "四把椅子.m4a", "M4A"],
                        ["list", "不要删除.csv", "CSV"],
                      ].map(([id, name, kind]) => (
                        <button key={id} className={selectedFile === id ? "selected" : ""} onClick={() => setSelectedFile(id)}>
                          <span>{kind}</span><strong>{name}</strong>
                        </button>
                      ))}
                    </div>
                    <article className="file-preview">
                      {selectedFile === "readme" && <>
                        <p className="eyebrow">PLAIN TEXT</p><h2>交接说明</h2>
                        <pre>钥匙不是人的名字。{"\n"}名字也不是人的全部。{"\n\n"}先去看照片，再查照片里的地址。{"\n"}如果乔乔还愿意说话，她的编号是 WLAN-02。</pre>
                      </>}
                      {selectedFile === "photo" && <>
                        <div className="photo-scene" aria-label="白榆路厨房的模拟照片">
                          <div className="window-light" /><div className="table-shape"><i /><i /><i /><i /></div>
                          <span className="photo-stamp">2025.07.29 17:03</span>
                        </div>
                        <div className="photo-meta"><span>拍摄地点</span><b>白榆路 17 号</b><span>上传账号</span><b>温岚</b><span>上传时间</span><b>死亡后第 15 天</b></div>
                        <button className="evidence-button" onClick={() => collect("photo")}>记录照片矛盾</button>
                      </>}
                      {selectedFile === "voice" && <>
                        <p className="eyebrow">AUDIO RECOVERY / 01:14</p><h2>四把椅子</h2>
                        <div className="waveform">{Array.from({ length: 48 }).map((_, i) => <i key={i} style={{ height: `${18 + ((i * 17) % 55)}%` }} />)}</div>
                        <div className="transcript">
                          <b>自动转写</b>
                          <p>“桌边原来有三把椅子。温岚说，再放一把吧。”</p>
                          <p>“第四把给谁？”</p>
                          <p>“给下一个找到这里、又愿意听完的人。”</p>
                          <p className="redacted">[03:17 后的内容已由当前访问者触发]</p>
                        </div>
                        <button className="evidence-button" onClick={() => collect("voice")}>记录第四把椅子</button>
                      </>}
                      {selectedFile === "list" && <>
                        <p className="eyebrow">CSV / PARTIALLY CORRUPTED</p><h2>不要删除</h2>
                        <table className="data-table"><tbody>
                          <tr><th>编号</th><th>状态</th><th>最后活动</th></tr>
                          <tr><td>WLAN-01</td><td>死亡</td><td>2025-07-14</td></tr>
                          <tr><td>WLAN-02</td><td>安全</td><td>2025-08-03</td></tr>
                          <tr><td>WLAN-03</td><td>失联</td><td>2026-07-14</td></tr>
                          <tr className="glitch-row"><td>WLAN-04</td><td>协查中</td><td>现在</td></tr>
                        </tbody></table>
                      </>}
                    </article>
                  </div>
                )}
              </div>
            )}

            {active === "archive" && (
              <div className="single-app archive-app">
                <div className="archive-hero">
                  <p className="eyebrow">CROSS-SYSTEM ARCHIVE</p>
                  <h2>记录检索</h2>
                  <p>可检索地址、设备签名或内部编号。空格不影响结果。</p>
                  <div className="archive-search"><input value={archiveQuery} onChange={(e) => setArchiveQuery(e.target.value)} placeholder="输入待核查的关键词…" onKeyDown={(e) => e.key === "Enter" && runArchiveSearch()} /><button onClick={runArchiveSearch}>检索</button></div>
                </div>
                {archiveHit ? (
                  <div className="results">
                    <div className="result-head"><span>共找到 3 条关联记录</span><small>来源已匿名化</small></div>
                    <table className="access-table"><thead><tr><th>时间</th><th>凭据</th><th>设备</th><th>事件</th></tr></thead><tbody>
                      <tr><td>07-15 03:17</td><td>WLAN-01</td><td>Owl-A2</td><td>撤回注销</td></tr>
                      <tr><td>07-29 17:03</td><td>WLAN-02</td><td>Mint-7</td><td>白榆路17号门禁</td></tr>
                      <tr><td>08-03 03:17</td><td>WLAN-03</td><td>Redmi-9</td><td>更新共享密钥</td></tr>
                    </tbody></table>
                    <div className="result-note">分析：三个设备从未在同一地点同时出现。系统却将其合并为同一自然人。</div>
                    <button className="evidence-button" onClick={() => collect("access")}>记录重复门禁与设备差异</button>
                  </div>
                ) : (
                  <div className="empty-state"><span>⌕</span><p>等待检索条件</p><small>真正有用的搜索，通常来自另一份证据里的具体细节。</small></div>
                )}
              </div>
            )}

            {active === "notes" && (
              <div className="single-app notes-app">
                <div className="app-heading"><div><p className="eyebrow">LOCAL NOTES</p><h2>便笺</h2></div><span>3 条</span></div>
                <div className="notes-grid">
                  <article className="sticky yellow"><time>7月13日</time><p>妈妈的药放在第二层。不要用句号，她会以为你生气。</p><small>— 岚</small></article>
                  <article className="sticky blue"><time>7月18日</time><p>周经理说 1703 柜里有备用钥匙。乔乔下夜班后去拿。</p><small>— 02</small></article>
                  <article className="sticky red"><time>无日期</time><p>如果 WLAN-03 七天没有上线，启动下一位保管者的协查流程。</p><small>— 系统生成</small></article>
                </div>
                <button className="evidence-button" onClick={() => collect("habit")}>记录不同书写者的习惯</button>
              </div>
            )}

            {active === "board" && (
              <div className="single-app board-app">
                <div className="app-heading"><div><p className="eyebrow">EVIDENCE WALL</p><h2>证据与推论</h2></div><span>{complete ? "可以结案" : `尚缺 ${EVIDENCE.length - count} 项`}</span></div>
                <div className="evidence-grid">
                  {EVIDENCE.map((item, index) => (
                    <article key={item.id} className={evidenceSet.has(item.id) ? "found" : "missing"}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div><h3>{evidenceSet.has(item.id) ? item.title : "未确认命题"}</h3><p>{evidenceSet.has(item.id) ? item.desc : "继续调查其他应用，找到能够支持这一命题的材料。"}</p></div>
                    </article>
                  ))}
                </div>
                {count >= 7 && !evidenceSet.has("you") && (
                  <div className="reveal-card">
                    <p>你以为自己在整理别人的痕迹。但审计系统显示，本次协查链接只发送给了一个人：</p>
                    <strong>最近一次主动搜索“温岚”的访问者。</strong>
                    <button className="evidence-button danger" onClick={() => collect("you")}>确认：访问者已登记为 WLAN-04</button>
                  </div>
                )}
                {complete && (
                  <div className="final-actions">
                    <p className="eyebrow">FINAL DISPOSITION</p>
                    <h2>你准备怎样处理“温岚”？</h2>
                    <p>每个选择都会保护一些东西，也会毁掉另一些东西。</p>
                    <div>
                      <button onClick={() => chooseEnding("erase")}><b>执行注销</b><span>保护幸存者，彻底删除公共身份与全部证据。</span></button>
                      <button onClick={() => chooseEnding("expose")}><b>公开上报</b><span>让事件被看见，同时暴露仍在使用身份的人。</span></button>
                      <button onClick={() => chooseEnding("inherit")}><b>接受交接</b><span>保留名字，成为下一位只负责开门的保管者。</span></button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {active === "system" && (
              <div className="single-app system-app">
                <div className="app-heading"><div><p className="eyebrow">AUDIT CONSOLE</p><h2>系统审计</h2></div><span className="live">实时写入</span></div>
                <div className="terminal">
                  {logs.map((log, index) => <p key={`${log}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{log}</p>)}
                  {count >= 6 && <p className="alert-line"><span>!!</span>{clock}:17  候选身份已分配：WLAN-04 / 当前访问者</p>}
                  <i className="cursor" />
                </div>
                <div className="system-cards">
                  <div><span>当前身份</span><b>{count >= 6 ? "WLAN-04" : "临时协查员"}</b></div>
                  <div><span>终端权限</span><b>{count >= 7 ? "可接收交接" : "只读"}</b></div>
                  <div><span>上次心跳</span><b>{clock}:17</b></div>
                </div>
                <button className="text-button" onClick={reset}>清除本机进度并重新开始</button>
              </div>
            )}
          </section>

          <footer className="statusbar">
            <span><i /> 只读隔离环境</span>
            <p>当前任务：{complete ? "在证据板提交最终处置" : hintFor(count, driveOpen, archiveHit).split("。")[0]}</p>
            <span>CASE 0714 / {count > 5 ? "IDENTITY DRIFT" : "RECOVERY"}</span>
          </footer>

          {hintOpen && (
            <div className="modal-backdrop" onClick={() => setHintOpen(false)}>
              <div className="hint-card" onClick={(e) => e.stopPropagation()}>
                <span className="hint-mark">?</span>
                <p className="eyebrow">CONTEXTUAL HINT</p>
                <h2>下一步可以这样做</h2>
                <p>{hintFor(count, driveOpen, archiveHit)}</p>
                <button className="primary" onClick={() => setHintOpen(false)}>我知道了</button>
              </div>
            </div>
          )}
          {toast && <div className="toast">{toast}</div>}
        </section>
      )}

      {ending && (
        <EndingScreen ending={ending} onReset={reset} evidenceCount={count} />
      )}
    </main>
  );
}

function EndingScreen({ ending, onReset, evidenceCount }: { ending: Exclude<Ending, null>; onReset: () => void; evidenceCount: number }) {
  const copy = {
    erase: {
      code: "ENDING 01 / CLEAN",
      title: "没有人再使用她的名字",
      text: "注销在 03:17 完成。温岚的聊天、照片、门禁与共享密钥一并消失。白榆屋的住户没有被追查，但从此也无法证明她们曾经帮助过彼此。",
      last: "第二天，你搜索“温岚”。零条结果。搜索框却自动补全：WLAN-04。",
    },
    expose: {
      code: "ENDING 02 / DAYLIGHT",
      title: "所有人都看见了她",
      text: "材料被公开，新闻将它称作“死亡账号黑产”。白榆屋受到调查，乔乔失去联系。成千上万的人转发温岚的照片，却没有人再问照片里的另外三把椅子属于谁。",
      last: "三天后，账号再次上线。它只发布了一句话：看见，不等于理解。",
    },
    inherit: {
      code: "ENDING 03 / FOURTH CHAIR",
      title: "桌边终于坐满四个人",
      text: "你没有冒用温岚，也没有替任何人撒谎。你只是保管那把钥匙：有人需要留下求救信息时开门，有人安全离开后关门。",
      last: "03:17，终端弹出第一条新消息：“你好。我没有可以使用的名字。这里还收留人吗？”",
    },
  }[ending];

  return (
    <section className={`ending-screen ending-${ending}`}>
      <div className="ending-symbol">{ending === "erase" ? "○" : ending === "expose" ? "◉" : "04"}</div>
      <p className="eyebrow">{copy.code}</p>
      <h1>{copy.title}</h1>
      <p>{copy.text}</p>
      <blockquote>{copy.last}</blockquote>
      <div className="ending-meta"><span>已确认 {evidenceCount} 项证据</span><span>终端关闭于 03:17</span></div>
      <button className="primary" onClick={onReset}>重新调查，选择另一条路</button>
      <small>《待注销用户》 · 完</small>
    </section>
  );
}
