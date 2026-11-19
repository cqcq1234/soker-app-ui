// Local interaction demo from the Soker 盘客 Chat prototype (2026-11-19).
export function mountReviewDemo(root, onSheetChange, onboarding = false) {
  const $ = (id) => root.getElementById(id);
  const app = $("reviewApp");
  const listeners = new AbortController();
  const { signal } = listeners;
  const chat = $("chat");
  const stream = $("stream");
  const sheet = $("sheet");
  const controls = {
    next: '<path d="m9 6 6 6-6 6"/>',
    back: '<path d="m14 6-6 6 6 6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5z"/>',
    scan: '<path d="M8 4H5a1 1 0 0 0-1 1v3m12-4h3a1 1 0 0 1 1 1v3m0 8v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/><circle cx="12" cy="9" r=".5"/>',
    report: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6m-6 4h6m-6 4h4"/>',
    filter: '<path d="M4 6h16M7 12h10m-7 6h4"/><circle cx="8" cy="6" r="2" fill="var(--surface)"/><circle cx="15" cy="12" r="2" fill="var(--surface)"/>',
    star: '<path d="m12 3 2.7 5.6 6.2.9-4.5 4.4 1.1 6.2-5.5-3-5.5 3 1.1-6.2-4.5-4.4 6.2-.9z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    time: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    note: '<path d="M5 5h14v10H9l-4 4z"/><path d="M9 9h6m-6 3h3"/>',
    bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
    many: '<rect x="4" y="4" width="12" height="12" rx="2"/><path d="M20 8v10a2 2 0 0 1-2 2H8m0-12h4m-4 4h4"/>',
    tag: '<path d="M20 11 12 3H4v8l8 9a1.5 1.5 0 0 0 2 0l6-6a2 2 0 0 0 0-3z"/><circle cx="8" cy="7" r="1"/>',
    warn: '<path d="M10.4 4.6a1.8 1.8 0 0 1 3.2 0l7.1 12.7a1.8 1.8 0 0 1-1.6 2.7H4.9a1.8 1.8 0 0 1-1.6-2.7zM12 9v4m0 3.4v.2"/>',
    link: '<path d="m10 13 4-4m-6 6-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0m2 10a3.5 3.5 0 0 0 5 0l4-4a3.5 3.5 0 0 0-5-5l-1 1"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    person: '<circle cx="12" cy="8" r="3.4"/><path d="M5 20v-1a7 7 0 0 1 14 0v1"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3 19v-1a6 6 0 0 1 12 0v1m1-14a3 3 0 0 1 0 6m1 3a5 5 0 0 1 4 5"/>',
    bell: '<path d="M5 16h14l-2-3V9a5 5 0 0 0-10 0v4zm5 4h4"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    loader: '<path d="M21 12a9 9 0 1 1-9-9"/>',
    history: '<path d="M3 12a9 9 0 1 1 2.6 6.4M3 7v5h5m4-5v5l3 2"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    radio: '<circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><path d="M8.5 8.5a5 5 0 0 0 0 7m7-7a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13m13-13a9 9 0 0 1 0 13"/>',
    shield: '<path d="M12 3 4.5 6v5.4c0 4.3 2.9 7.6 7.5 9.6 4.6-2 7.5-5.3 7.5-9.6V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
    hand: '<path d="M7 13V8a1.5 1.5 0 0 1 3 0v3-6a1.5 1.5 0 0 1 3 0v6-4a1.5 1.5 0 0 1 3 0v5-2a1.5 1.5 0 0 1 3 0v5a6 6 0 0 1-12 2l-2.6-3.5a1.6 1.6 0 0 1 2.6-1.7L7 13Z"/>',
  };

  function icon(name, extra = "") {
    return `<svg class="icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${controls[name]}</svg>`;
  }
  const portraits = {
    2: "/chat/review/customer-2.jpg",
    4: "/chat/review/customer-4.jpg",
    5: "/chat/review/customer-5.jpg",
    15: "/chat/review/customer-15.jpg",
  };
  const demoQr = "/chat/review/demo-connection.png";
  const brandImage = '<img class="brand" alt="" src="/chat/soker-app-icon.svg" width="20" height="20">';

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
  const fmt = new Intl.NumberFormat("zh-CN");
  const num = (value) => fmt.format(value);
  const range = (first, last) => Array.from({ length: last - first + 1 }, (_, i) => i + first);
  const tags = [
    { id: "potential", name: "潜在客户", ids: range(1, 428) },
    { id: "visited", name: "到店未成交", ids: range(415, 500) },
    { id: "closed", name: "已成交", ids: range(501, 556) },
    { id: "referred", name: "转介绍", ids: [...range(43, 51), ...range(557, 571)] },
    { id: "expo", name: "车展新客", ids: [...range(260, 265), ...range(572, 599)] },
    { id: "new", name: "刚建的标签", ids: [] },
  ];
  const byTag = Object.fromEntries(tags.map((tag) => [tag.id, tag]));
  const defaultTags = ["potential", "visited"];
  const namedCustomers = {
    1: ["杨总", "滨江 · 企业用车", "临近成交"],
    2: ["林女士", "滨江 · 奥迪 A4L", "已约到店"],
    3: ["林女士", "余杭 · 奥迪 Q5L", "意向沟通"],
    4: ["周先生", "拱墅 · 关注车展", "意向沟通"],
    5: ["陈先生", "城西 · 旧车置换", "临近成交"],
    6: ["许女士", "上城 · 家庭用车", "已约到店"],
    7: ["方先生", "萧山 · 奥迪 A6L", "临近成交"],
    8: ["沈女士", "滨江 · 家庭用车", "意向沟通"],
    9: ["程先生", "富阳 · 旧车置换", "意向沟通"],
    10: ["蒋女士", "拱墅 · 奥迪 Q3", "待确认"],
    11: ["叶先生", "西湖 · 家庭用车", "临近成交"],
    12: ["胡先生", "西湖 · 首购", "已约到店"],
    13: ["郑女士", "上城 · 商务用车", "临近成交"],
    14: ["徐先生", "滨江 · 周末试驾", "已约到店"],
    15: ["王女士", "临平 · 旧车置换", "意向沟通"],
    16: ["何先生", "余杭 · 首购", "待确认"],
    17: ["彭女士", "滨江 · 家庭用车", "已约到店"],
    18: ["孙先生", "上城 · 商务用车", "临近成交"],
    46: ["张经理", "上城 · 二手车资源", "意向沟通"],
    425: ["邵女士", "滨江 · 到店记录", "已约到店"],
    456: ["戴女士", "拱墅 · 到店记录", "临近成交"],
  };
  const customers = new Map(range(1, 599).map((id) => {
    const surnames = "赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张";
    const districts = ["西湖", "余杭", "拱墅", "滨江", "上城", "萧山"];
    const interests = ["家庭用车", "旧车置换", "试驾", "首购", "奥迪 Q5L", "商务用车", "奥迪 A4L"];
    const stages = ["临近成交", "已约到店", "意向沟通", "待确认", "意向沟通", "待确认", "待确认"];
    const fallback = [
      surnames[id % surnames.length] + (id % 2 ? "先生" : "女士"),
      `${districts[id % districts.length]} · ${interests[id % interests.length]} · 尾号 ${String(3100 + id).slice(-4)}`,
      id >= 501 && id <= 556 ? "已成交" : stages[id % stages.length],
    ];
    const [name, context, stage] = namedCustomers[id] || fallback;
    const wechat = id === 2 ? "lin_binjiang_0628" : id === 3 ? "lin_yuhang_0916" : `soker_demo_${String(id).padStart(4, "0")}`;
    return [id, { id, name, context, stage, wechat, labels: tags.filter((tag) => tag.ids.includes(id)).map((tag) => tag.name) }];
  }));

  const scenarios = [
    { id: "daily", title: "已经使用 · 每日总结", subtitle: "每天一段朋友圈概况与跟进判断", icon: "report" },
    { id: "onboard", title: "首次开通", subtitle: "隐私说明、选范围、选重点客户", icon: "link" },
    { id: "priority", title: "重点客户发了朋友圈", subtitle: "生活近况也提醒，附原文和微信号", icon: "bell" },
    { id: "weekly", title: "周总结与名单确认", subtitle: "主动总结一周，只在合适时询问名单", icon: "history" },
    { id: "quiet", title: "有动态，暂无商机", subtitle: "没有跟进建议，近况可以一带而过", icon: "report" },
    { id: "some", title: "有几条可跟进", subtitle: "总结里说清楚哪些变化值得留意", icon: "note" },
    { id: "busy", title: "值得跟进的变化较多", subtitle: "依然汇总为一段话", icon: "many" },
    { id: "partial", title: "部分客户未读到", subtitle: "保留已检查结果，可补查", icon: "warn" },
    { id: "expired", title: "微信连接失效", subtitle: "保留历史，重连后继续", icon: "history" },
  ];
  const additionalScenarios = [
    { id: "no-updates", title: "今天没有新动态", subtitle: "检查完成，今天可以按原计划跟进", icon: "check" },
    { id: "no-tags", title: "没有可选标签", subtitle: "回微信补标签，再返回刷新", icon: "tag" },
    { id: "tag-error", title: "标签暂时读不到", subtitle: "保留已保存的关注范围", icon: "warn" },
  ];
  const allScenarios = [...scenarios, ...additionalScenarios];
  const events = [
    { key: "hangzhou", id: 1, title: "杨总刚到杭州", reason: "他上次说来杭州可以碰面，今天可以先确认他在杭的时间。", source: "落地杭州，晚上见几个老朋友。", time: "08:36", urgency: "重点客户 · 见面窗口", opening: "杨总，来杭州啦？这趟待多久？方便的话，找个时间把上次聊的企业用车方案过一下。", urgent: true },
    { key: "fast", id: 46, title: "张经理临时找置换渠道", reason: "他希望 10 点前收到引荐，你手里有合适的二手车合作联系人。", source: "急找一位靠谱的二手车置换评估，我 10 点前就得把人定下来。", time: "08:48", expiresAt: "10:00", urgency: "限时需求 · 10:00 前", opening: "张经理，我认识做置换评估的，今天 10 点前还能给你介绍。你这次主要是什么车型？", urgent: true },
    { key: "visit", id: 2, title: "林女士周末有空", reason: "她上次到店在对比 A4L，今天提到周末下午腾出来了。可以问是否想顺路试驾。", source: "这个周末终于空下来，周六下午准备出去转转。", time: "08:19", urgency: "试驾时机", opening: "林女士，上次您看的 A4L 这周末可以安排试驾。您周六下午如果顺路，我帮您留个时间？" },
    { key: "swap", id: 5, title: "陈先生在算旧车置换", reason: "他在朋友圈问估价，上次留了车型信息，可以给他一份初估。", source: "旧车开了五年，准备估个价，大家觉得今年换划算吗？", time: "07:53", urgency: "置换意向", opening: "陈先生，上次您说的车型我还记着。您方便发一下当前里程吗？我可以先给您一个置换估价范围。" },
    { key: "family", id: 6, title: "许女士想看看七座车", reason: "她明确问了七座车型，与你手上可试驾的车型匹配。", source: "家里打算换七座，有坐得舒服的推荐吗？", time: "08:04", urgency: "明确需求", opening: "许女士，您考虑哪种坐姿和空间？我手上有一台七座试驾车，可以按您家情况先比较一下。" },
    { key: "quote", id: 7, title: "方先生在对比两款配置", reason: "之前已经谈到预算，可以补一份两款配置的差异。", source: "想了两天还是在纠结买哪套配置。", time: "08:02", urgency: "方案对比", opening: "方先生，上次说的两套配置，我把实际用车区别列了一下，要不要发您参考？" },
    { key: "test", id: 8, title: "沈女士问周末哪家能试驾", reason: "有明确试驾意愿，可以告诉她门店空档。", source: "杭州这周末有没有能预约试车的门店？", time: "08:06", urgency: "试驾意向", opening: "沈女士，我们周末可以约试驾，您更方便周六还是周日？" },
    { key: "price", id: 9, title: "程先生重新看二手行情", reason: "上次计划延后后首次提到行情，可以问是否重启置换。", source: "最近二手行情有变化没？想重新看看。", time: "08:08", urgency: "重新考虑置换", opening: "程先生，最近有几个同年份的成交价可以参考，您还在考虑上次那台吗？" },
    { key: "subsidy", id: 10, title: "蒋女士问换车补贴", reason: "她问到本地换购条件，可以先核对上牌地。", source: "杭州换车现在还有没有补贴？", time: "08:10", urgency: "购车问题", opening: "蒋女士，我可以先帮您核对换购条件。您的旧车和新车打算在哪上牌？" },
    { key: "drive", id: 11, title: "叶先生开始比较通勤成本", reason: "之前谈过两款车，可以补充油耗和通勤场景的比较。", source: "每天来回快 60 公里，最近认真算了下用车成本。", time: "08:13", urgency: "选车考虑", opening: "叶先生，按您每天 60 公里的情况，我可以把上次两款车的通勤支出估一下。" },
    { key: "arrival", id: 12, title: "胡先生在问交付时间", reason: "他提到月底前用车，可以先确认你店里的交付周期。", source: "月底用车，最近订车要等多久？", time: "08:16", urgency: "交付窗口", opening: "胡先生，我可以给您查一下月底前能交付的车型，您现在更偏向哪一个配置？" },
    { key: "display", id: 13, title: "郑女士下周来门店附近", reason: "她上次想看商务车型，可以询问行程是否方便。", source: "下周二去上城开会，下午会在附近。", time: "08:22", urgency: "到店窗口", opening: "郑女士，下周到上城如果顺路，要不要来看看上次提的商务用车？我提前把车准备好。" },
  ];
  const eventByKey = Object.fromEntries(events.map((event) => [event.key, event]));
  const historicalEvents = [
    { key: "lin-life", id: 2, dayCode: 19, title: "林女士分享下班后的生活", summary: "下班后陪家人在西湖边散步", source: "今天下班早，陪家人在西湖边散了会儿步，难得慢下来。", time: "18:12", opening: "林女士，今天湖边天气应该挺舒服吧，和家人一起散散步真不错。" },
    { key: "family17", id: 6, dayCode: 17, title: "许女士开始看七座车", reason: "她想为二胎家庭换车，可以先确认座位和空间需求。", source: "明年家里多一位小朋友，开始认真看七座了。", time: "07:42", urgency: "家庭用车需求", opening: "许女士，恭喜呀！您更在意第三排空间，还是平时停车方便？我可以先按您家情况帮您比较。" },
    { key: "budget17", id: 7, dayCode: 17, title: "方先生重新核算购车预算", reason: "他已比较过 A6L，可以把两款配置的差异说清楚。", source: "购车预算重新算了算，希望把钱花在真用得到的配置上。", time: "08:12", urgency: "方案比较", opening: "方先生，我把两套配置里您常用的功能单独列了出来，发您参考？" },
    { key: "compare18", id: 3, dayCode: 18, title: "林女士还在比较家庭用车", reason: "余杭这位林女士关注 Q5L，夫妻两人还没有一起看过实车。", source: "两个人各有喜欢的车型，打算找个周末一起看看实车。", time: "08:06", urgency: "共同决策", opening: "林女士，您和先生方便一起过来看看 Q5L 吗？我可以按家庭用车场景帮您比较一下。" },
    { key: "arrival18", id: 12, dayCode: 18, title: "胡先生需要月底前提车", reason: "他已明确用车期限，可以先核对车型和可交付时间。", source: "月底准备自驾，最好能在出发前把车落实。", time: "08:31", urgency: "月底用车", opening: "胡先生，您是打算月底自驾出发吗？我先帮您核对一下您看中的配置和交付时间。" },
    { key: "lin-confirm", id: 2, dayCode: 19, title: "林女士确认周六可以看车", summary: "周六下午空出来，准备去看车", reason: "她刚明确了周六的时间，与你之前提过的试驾计划衔接。可以确认具体时段。", source: "周六下午的事情挪开了，终于可以安心去看看车。", time: "18:26", urgency: "重点客户 · 新动态", opening: "林女士，看到您周六下午空出来了。上次看的 A4L 可以安排试驾，14 点左右方便吗？", urgent: true },
    { key: "swap20", id: 5, dayCode: 20, title: "陈先生补充了旧车里程", reason: "他昨天问过置换，今天晒出了仪表盘。可以核对车况，继续给初估。", source: "不知不觉已经开到 8 万公里，认真考虑换车了。", time: "08:09", urgency: "置换信息补全", opening: "陈先生，看到您旧车目前是 8 万公里。方便再确认一下具体年款和最近的保养情况吗？我给您做个初估。" },
    { key: "test20", id: 8, dayCode: 20, title: "沈女士开始安排周末试驾", reason: "她今天明确询问周日是否可试驾，可以先问人数和时间。", source: "周日想带家里人试试车，有能预约的地方吗？", time: "08:23", urgency: "周日试驾", opening: "沈女士，我们周日可以预约试驾。您更方便上午还是下午，大概几位一起过来？" },
    { key: "lin-drive21", id: 2, dayCode: 21, title: "林女士分享试驾感受", reason: "她已经体验了车型，还在和家人讨论，可以等她反馈更具体的考虑。", source: "今天去试了车，转向和停车确实比想象中轻松，回去再跟家里人商量。", time: "16:20", summary: "试驾后的感受，还想和家人商量", opening: "林女士，今天体验之后，您和家人更在意哪一点？有需要比较的地方随时告诉我。" },
  ];
  for (const event of historicalEvents) {
    events.push(event);
    eventByKey[event.key] = event;
  }
  const customerDetails = {
    1: { need: "企业增购 2 台商务接待车，预算尚待确认。", lastContact: "11 月 16 日", history: "上次说到杭州时可以当面聊企业用车方案。", next: "先确认这趟在杭州待多久，再约见面。" },
    2: { need: "首次购车，对比奥迪 A4L，关心停车和日常通勤。", lastContact: "11 月 15 日", history: "滨江到店看过 A4L，还没有试驾，周六下午可能有空。", next: "确认周六试驾时段，提前准备停车引导。" },
    3: { need: "家庭用车，关注 Q5L，夫妻共同决策。", lastContact: "11 月 18 日", history: "昨天已联系过，她希望等家人确定周末安排再回复。", next: "今天 15 点轻量询问，不重复介绍车型。" },
    4: { need: "关注车展和新车资讯，目前没有明确购车计划。", lastContact: "11 月 12 日", history: "聊过今年的车展，客户主要想看新车型。", next: "记录近况，等自然的话题再联系。" },
    5: { need: "旧车置换，现有车开了五年，里程和车况待核对。", lastContact: "11 月 14 日", history: "留过车型信息，之前还没有明确的置换时间。", next: "先核对里程和年款，提供初估范围。" },
    6: { need: "二胎家庭考虑七座车，在意第三排和停车便利。", lastContact: "11 月 17 日", history: "已发过两款七座车的空间对比，客户还在和家人商量。", next: "等她确认家庭成员需求，再安排体验。" },
    7: { need: "关注 A6L，两款配置之间取舍，预算约 35 万。", lastContact: "11 月 17 日", history: "配置差异表已发送，客户说周末和家人讨论。", next: "周末后再问，不重复发报价。" },
    8: { need: "想安排一次全家试驾，车型偏好还待确认。", lastContact: "11 月 13 日", history: "问过门店周末营业时间，尚未预约。", next: "有明确时间时，先确认试驾车型。" },
    11: { need: "每天往返约 60 公里，关注通勤成本。", lastContact: "11 月 16 日", history: "比较过两款车，希望核算长期用车支出。", next: "按实际里程准备比较，不直接判断购买意向。" },
    12: { need: "月底前需要用车，在意交付周期。", lastContact: "11 月 18 日", history: "昨天已确认意向配置，正在等门店核对现车。", next: "拿到准确交付时间后再联系。" },
    15: { need: "已有车辆准备跑长途，近期主要是用车咨询。", lastContact: "11 月 11 日", history: "售后关系良好，还没有新购车意向。", next: "有需要时提供出行检查清单。" },
    46: { need: "二手车业务合作，偶尔需要置换评估渠道。", lastContact: "11 月 16 日", history: "之前一起处理过一单置换，可提供渠道引荐。", next: "限时需求先确认，避免过期后继续提醒。" },
  };
  const mockDays = [
    { code: 16, label: "11 月 16 日", posts: 61, keys: [] },
    { code: 17, label: "11 月 17 日", posts: 82, keys: ["family17", "budget17"] },
    { code: 18, label: "11 月 18 日", posts: 67, keys: ["compare18", "arrival18"] },
    { code: 19, label: "11 月 19 日", posts: 100, keys: ["hangzhou", "visit", "swap"] },
    { code: 20, label: "11 月 20 日", posts: 54, keys: ["swap20", "test20"] },
    { code: 21, label: "11 月 21 日", posts: 38, keys: ["lin-drive21"] },
    { code: 22, label: "11 月 22 日", posts: 26, keys: [] },
  ];
  const casualMoments = [
    "傍晚散了会儿步，天气比想象中舒服。", "今天和老朋友吃了顿饭，好久没聊这么开心。",
    "周末陪家人逛逛，给自己放半天假。", "把积攒的书单整理了一下，慢慢看。",
    "办公室楼下新开的咖啡店，今天终于去试了。", "忙完这一阵，准备去附近走走。",
  ];
  const mockMoments = mockDays.flatMap((day) => {
    const meaningful = day.keys.map((key) => ({ key, ...eventByKey[key], dayCode: day.code }));
    if (day.code === 19) meaningful.push({ key: "expo-note", id: 4, dayCode: 19, source: "下周和朋友去车展逛逛，看看今年有什么新东西。", time: "08:05" });
    const ordinary = Array.from({ length: day.posts - meaningful.length }, (_, index) => ({
      key: `life-${day.code}-${index}`, id: 31 + ((index * 37 + day.code) % 470), dayCode: day.code,
      source: casualMoments[(index + day.code) % casualMoments.length],
      time: `07:${String((index * 7) % 60).padStart(2, "0")}`,
    }));
    return [...meaningful, ...ordinary];
  });
  const stages = ["临近成交", "已约到店", "意向沟通", "待确认", "已成交"];
  const stageRank = new Map(stages.map((stage, index) => [stage, index]));

  function idsFor(tagIds) {
    return new Set(tagIds.flatMap((id) => byTag[id]?.ids || []));
  }
  function sortedCustomers(ids) {
    return Array.from(ids, (id) => customers.get(Number(id))).filter(Boolean)
      .sort((a, b) => stageRank.get(a.stage) - stageRank.get(b.stage) || a.id - b.id);
  }

  function makeState(scenario) {
    const firstRun = scenario === "onboard";
    const overflow = scenario === "overflow";
    const expired = scenario === "expired";
    const focus = Object.fromEntries((firstRun ? [] : range(1, overflow ? 56 : 18))
      .map((id) => [id, "instant"]));
    const model = {
      scenario, tab: "panke", configured: !firstRun, connection: firstRun ? "none" : expired ? "expired" : "connected",
      tags: firstRun ? [] : [...defaultTags], focus, paused: false, turns: { panke: [] },
      reports: [], eventStatus: {}, deliveredInstant: [], draft: { panke: "" },
      scopeDraft: null, focusDraft: null, setupStep: null, noTags: scenario === "no-tags",
      unavailableTags: scenario === "tag-error" ? ["potential"] : [], chosenAccount: "周亦",
      prefs: { briefing: true, urgent: true }, summaryPrefs: { daily: true, weekly: true }, settingsDraft: null,
      weeklyReports: [], weeklyReviewMode: "weekly", lastWeeklyReview: "", nextId: 1,
      dayCode: 19, followups: [], openingDrafts: {}, extras: [], pendingReplies: [],
      activeEvent: "", liveDelivered: false, liveCount: 0, demoTime: firstRun ? "09:00" : "18:05",
      pendingMoment: null, pendingRefresh: null, lastRefresh: "", refreshCount: 0,
    };
    if (firstRun) {
      model.turns.panke.push({ type: "connect" });
      return model;
    }
    if (scenario === "no-tags") {
      model.tags = [];
      model.configured = false;
      model.focus = {};
      model.scopeDraft = [];
      model.turns.panke.push({ type: "date", text: "今天" }, { type: "scope" });
      return model;
    }
    if (["daily", "priority", "weekly"].includes(scenario)) {
      if (scenario === "weekly") { model.dayCode = 22; model.demoTime = "18:00"; }
      model.focus = { 1: "instant", 2: "instant", 3: "instant", 5: "instant", 6: "instant", 7: "instant", 11: "instant", 46: "instant" };
      model.eventStatus = { family17: "contacted", budget17: "contacted", compare18: "later", arrival18: "contacted" };
      model.followups = [
        { key: "family17", status: "contacted", time: "11 月 17 日 10:20", result: "已发两款七座车的空间对比，等家人讨论。" },
        { key: "budget17", status: "contacted", time: "11 月 17 日 11:15", result: "已发 A6L 配置差异表，客户准备周末讨论。" },
        { key: "compare18", status: "later", time: "11 月 18 日 10:10", result: "等客户核对家人行程，11 月 19 日 15:00 再问。", remindAt: "11 月 19 日 15:00" },
        { key: "arrival18", status: "contacted", time: "11 月 18 日 14:30", result: "已确认意向配置，待门店核对交付时间。" },
      ];
      for (const code of scenario === "weekly" ? range(16, 22) : [17, 18, 19]) {
        const report = makeDayReport(model, code);
        model.reports.push(report);
        model.turns.panke.push({ type: "date", text: `${report.day} 18:00`, code },
          { type: code === model.dayCode ? "daily" : "report", id: report.id });
        if (code === 17) model.turns.panke.push(
          { type: "user", text: "许女士和方先生我都联系了，资料也发了，先等他们和家人商量。" },
          { type: "assistant", text: "记下了。我把这两次联系结果放进客户档案，有新的变化再告诉你。" });
        if (code === 18) model.turns.panke.push(
          { type: "user", text: "胡先生的配置确认了。余杭那位林女士，明天下午 3 点再提醒我问一下。" },
          { type: "assistant", text: "已记录胡先生的配置确认结果。11 月 19 日 15:00，我会再提醒你联系余杭的林女士。" });
      }
      if (scenario === "priority") {
        model.extras.push({ ...eventByKey["lin-life"] });
        model.deliveredInstant.push("lin-life");
        model.liveCount = 1;
        model.demoTime = "18:12";
        model.turns.panke.push({ type: "date", text: "11 月 19 日 18:12", code: 19 }, { type: "instant", key: "lin-life" });
      }
      if (scenario === "weekly") {
        const week = makeWeeklyReport(model);
        model.weeklyReports.push(week);
        model.lastWeeklyReview = week.weekKey;
        model.turns.panke.push({ type: "weekly", id: week.id }, { type: "weekly-review", id: week.weekKey });
      }
      return model;
    }
    model.turns.panke.push(
      { type: "date", text: expired ? "前天 18:42" : "昨天 18:42" },
      { type: "user", text: "这几组客户每天帮我看一下，有值得跟进的就叫我。" },
      { type: "date", text: expired ? "昨天 09:00" : "今天" },
    );
    const report = makeReport(model, expired ? "quiet" : scenario, expired ? "11 月 18 日" : "今天");
    model.reports.push(report);
    model.turns.panke.push(...reportTurns(model, report));
    if (expired) model.turns.panke.push({ type: "expired" });
    if (overflow) model.turns.panke.push({ type: "focus" });
    if (scenario === "tag-error") {
      model.scopeDraft = [...defaultTags];
      model.turns.panke.push({ type: "scope" });
    }
    return model;
  }


  function composeDailySummary(report, model) {
    let text;
    if (!report.checked) {
      return "这轮朋友圈还没有读到，暂时没法判断有没有新变化。等连接恢复后我再补看，之前的总结可以继续回看。";
    }
    const keys = reportKeys(report);
    const expired = keys.filter((key) => eventByKey[key].expiresAt && eventByKey[key].expiresAt < report.time);
    const pending = keys.filter((key) => !expired.includes(key) && !model.eventStatus[key]);
    const priority = { hangzhou: 0, swap: 1, swap20: 1, family: 1, family17: 1, arrival: 1, arrival18: 1 };
    pending.sort((a, b) => (priority[a] ?? 2) - (priority[b] ?? 2));
    const contacted = keys.filter((key) => model.eventStatus[key] === "contacted");
    const deferred = keys.filter((key) => model.eventStatus[key] === "later");
    if (!report.posts) {
      text = `今天已看过 ${num(report.checked)} 位监控客户，已查看的范围内没有新的朋友圈，先按原计划跟进就好。`;
    } else {
      text = `今天看了 ${num(report.checked)} 位监控客户，读到 ${num(report.posts)} 条朋友圈，主要是日常生活、家庭和工作近况。`;
      if (pending.length) {
        const changes = pending.slice(0, 3).map((key) => eventByKey[key].title).join("，");
        const first = customers.get(eventByKey[pending[0]].id).name;
        text += `${changes}，${pending.length > 1 ? `有 ${pending.length} 位客户出现值得进一步确认的联系时机，可以先联系${first}，再按明确需求和时间安排跟进其他几位。` : "可以结合之前的沟通顺势问一句，先确认对方的具体安排。"}`;
      } else if (contacted.length || deferred.length) {
        if (contacted.length) text += `相关变化中已有 ${contacted.length} 位客户记录了联系结果，可以先等后续反馈。`;
        if (deferred.length) text += `${customers.get(eventByKey[deferred[0]].id).name}已经安排稍后联系，按约定时间处理就好。`;
        text += "这轮暂时没有需要重复联系的新变化。";
      } else {
        if (report.note) text += "周先生提到下周去车展，可以留作之后自然聊天的话题。";
        text += "今天暂时没有明确需要专门联系的变化，先按原计划跟进就好。";
      }
    }
    if (expired.length) text += "其中的临时需求已经过了时间窗口，这次先略过。";
    if (report.missed) text += `另有 ${num(report.missed)} 位暂未读到，结论只针对已查看的范围，我会继续补看。`;
    return text;
  }

  function makeWeeklyReport(model) {
    const reports = [...new Map(model.reports.filter((report) => report.dayCode >= 16 && report.dayCode <= Math.min(22, model.dayCode))
      .map((report) => [report.dayCode, report])).values()].sort((a, b) => a.dayCode - b.dayCode);
    const covered = new Set(reports.flatMap((report) => [...idsFor(report.tagIds)]));
    const posts = reports.reduce((sum, report) => sum + report.posts, 0);
    const opportunities = new Set(reports.flatMap(reportKeys).map((key) => eventByKey[key].id));
    const contacted = new Set(model.followups.filter((record) => record.status === "contacted").map((record) => eventByKey[record.key].id));
    const text = posts
      ? `这周持续关注了 ${num(covered.size)} 位客户，读到 ${num(posts)} 条朋友圈，整体还是生活近况和家庭、用车安排。${opportunities.size ? `其中 ${opportunities.size} 位出现过值得跟进的变化，` : "暂时没有明确需要专门联系的新变化。"}${contacted.size ? `已有 ${contacted.size} 位记录了联系结果。` : ""}可以结合最近的时间窗口继续跟进，已经联系过的先等反馈。重点客户的新朋友圈，我会继续逐条告诉你。`
      : "这周暂时没有读到新的朋友圈，先按现有计划跟进。名单是否合适，可以结合你自己的客户进展判断。";
    return { id: `2026-W47-${model.dayCode}-${reports.map((report) => report.id).join("-")}`, weekKey: "2026-W47",
      label: model.dayCode >= 22 ? "11 月 16 日—22 日" : `11 月 16 日—${model.dayCode} 日，截至今天`,
      posts, customerCount: covered.size,
      dayCount: reports.length, summary: text };
  }

  function renderWeekly(week) {
    if (!week) return "";
    return `<div class="assistant" data-weekly-id="${week.id}"><p class="history-summary">${week.label} · 本周总结</p><p class="message-text">${escapeHtml(week.summary)}</p></div>`;
  }

  function renderWeeklyReview(weekId) {
    return `<div class="assistant"><p class="message-text">这周的客户动态我整理好了。要不要顺手调整一下重点名单？现在有 ${Object.keys(state.focus).length} 位重点客户，哪些人需要多留意，还是按你的客户进展来。</p>
      <section class="editor setup-card" aria-label="每周名单确认">
        ${button("weekly-edit-focus", "调整重点名单", { kind: "primary block", data: weekId })}
        ${button("weekly-keep-focus", "先保持，之后我来改", { kind: "block", data: weekId })}
      </section></div>`;
  }

  function renderSummarySettings() {
    const prefs = state.settingsDraft || { ...state.summaryPrefs, reviewMode: state.weeklyReviewMode };
    return `<div class="assistant"><p class="message-text">总结按你方便的频率来。日报默认每天 18:00，周总结默认周日 18:00。你临时想问近况，也可以随时在这里问我。</p>
      <section class="editor setup-card" aria-label="总结与询问设置">
        <label class="check-row"><input type="checkbox" data-change="summary-daily" ${prefs.daily ? "checked" : ""}><span class="row-copy"><strong>每天发一段总结</strong><small>监控客户今天的近况与跟进时机</small></span></label>
        <label class="check-row"><input type="checkbox" data-change="summary-weekly" ${prefs.weekly ? "checked" : ""}><span class="row-copy"><strong>每周发一段总结</strong><small>汇总这一周的变化与联系进展</small></span></label>
        <label class="check-row"><input type="checkbox" data-change="summary-review" ${prefs.reviewMode === "weekly" ? "checked" : ""}><span class="row-copy"><strong>每周问我是否调整重点名单</strong><small>选“之后我来改”后，等你主动唤醒调整</small></span></label>
        ${button("summary-settings-save", "保存安排", { kind: "primary block" })}${textButton("summary-settings-cancel", "取消编辑")}
      </section></div>`;
  }

  function makeReport(model, scenario, day, time = "18:00") {
    const covered = idsFor(model.tags);
    const total = covered.size;
    const missed = scenario === "partial" ? Math.min(72, Math.floor(total * .15)) : 0;
    const checked = total - missed;
    const reportKeys = {
      daily: (mockDays.find((item) => item.code === model.dayCode) || mockDays.find((day) => day.code === 19)).keys,
      some: ["hangzhou", "visit", "swap"],
      busy: ["fast", "hangzhou", "visit", "swap", "family", "quote", "test", "price", "subsidy", "drive", "arrival", "display"],
    };
    const matching = (reportKeys[scenario] || []).filter((key) => covered.has(eventByKey[key].id));
    const eventRank = (key) => {
      const event = eventByKey[key];
      if (key === "fast" || (key === "hangzhou" && model.focus[event.id] === "instant")) return 0;
      return model.focus[event.id] ? 1 : 2;
    };
    const timely = scenario === "some" ? matching.filter((key) => eventRank(key) === 0) : [];
    const opportunities = matching.filter((key) => !timely.includes(key)).sort((a, b) => eventRank(a) - eventRank(b));
    const summarizedExtras = new Set(model.reports.flatMap((report) => report.extraKeys || []));
    const extraMoments = model.extras.filter((moment) => moment.dayCode <= model.dayCode
      && covered.has(moment.id) && !summarizedExtras.has(moment.key));
    const report = {
      id: model.nextId++, day, time, total, checked, missed, opportunities, timely,
      posts: checked === 0 || scenario === "no-updates" ? 0 : mockMoments.filter((moment) => moment.dayCode === model.dayCode && covered.has(moment.id)).length + extraMoments.length,
      note: ["quiet", "overflow"].includes(scenario) && covered.has(4),
      tagIds: [...model.tags], dayCode: model.dayCode, extraKeys: extraMoments.map((moment) => moment.key),
    };
    report.summary = composeDailySummary(report, model);
    return report;
  }
  function makeDayReport(model, code) {
    const day = mockDays.find((item) => item.code === code);
    const report = makeReport({ ...model, dayCode: code }, "daily", day.label);
    model.nextId = report.id + 1;
    report.opportunities = day.keys.filter((key) => idsFor(model.tags).has(eventByKey[key].id));
    report.note = code === 19 && idsFor(model.tags).has(4);
    report.summary = composeDailySummary(report, model);
    return report;
  }
  function reportTurns(model, report) {
    return [{ type: "daily", id: report.id }];
  }
  const storageKey = onboarding ? "soker-panke-onboarding-v1" : "soker-panke-mock-v5";
  let state;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (saved?.turns?.panke && allScenarios.some((scenario) => scenario.id === saved.scenario)) state = saved;
  } catch {}
  state ||= makeState(onboarding ? "onboard" : "daily");
  state.tab = "panke";
  state.pendingReplies ||= [];
  state.setupStep ||= null;
  for (const event of state.extras) eventByKey[event.key] = event;
  if (state.pendingMoment) eventByKey[state.pendingMoment.event.key] = state.pendingMoment.event;
  if (!state.configured && state.scopeDraft?.length && !state.setupStep && !state.turns.panke.some((turn) => turn.type === "scope")) {
    state.turns.panke.push({ type: "scope" });
  }

  let dialogView = "";
  let dialogParent = "";
  let picker = null;
  let tagPreviewId = "";
  let tagPreviewLimit = 20;
  let selectedMoment = "";
  let selectedFriend = 0;
  let toastTimer;
  let pendingScan = null;
  let pendingConnection = null;
  let liveTimer = null;
  let replyTimer = null;
  let activeReply = null;
  const replyWaiters = new Map();
  let lastDelivered = null;
  const openedDetails = new Set();
  const openedReports = new Set();

  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
  }
  function announce(message) {
    $("live").textContent = message;
  }
  function notify(message) {
    clearTimeout(toastTimer);
    $("toast").textContent = message;
    $("toast").hidden = false;
    announce(message);
    toastTimer = setTimeout(() => { $("toast").hidden = true; }, 2200);
  }
  function button(action, label, { kind = "", data = "", disabled = false, withIcon = "" } = {}) {
    return `<button type="button" class="button ${kind}" data-act="${action}" data-id="${escapeHtml(data)}"${disabled ? " disabled" : ""}>${withIcon ? icon(withIcon) : ""}${escapeHtml(label)}</button>`;
  }
  function textButton(action, label, data = "", extra = "") {
    return `<button type="button" class="text-button ${extra}" data-act="${action}" data-id="${escapeHtml(data)}">${escapeHtml(label)}</button>`;
  }
  function chevronButton(action, heading, description, glyph, id = "") {
    return `<button class="entry" type="button" data-act="${action}" data-id="${escapeHtml(id)}">
      <span class="note-icon">${icon(glyph)}</span>
      <span class="row-copy"><strong>${escapeHtml(heading)}</strong>${description ? `<small>${escapeHtml(description)}</small>` : ""}</span>
      ${icon("next")}
    </button>`;
  }
  function avatar(customer) {
    const portrait = portraits[customer.id];
    if (portrait) return `<img class="avatar portrait" alt="" src="${portrait}">`;
    return `<span class="avatar ${customer.id % 3 === 0 ? "alt" : ""}" aria-hidden="true">${escapeHtml(customer.name[0])}</span>`;
  }
  function searchField(id, placeholder, value = "") {
    return `<label class="search-field">${icon("search")}<input type="search" aria-label="${placeholder}" id="${id}" value="${escapeHtml(value)}" placeholder="${placeholder}" autocomplete="off"></label>`;
  }



  function renderStatus() {
    let content = "";
    if (state.connection === "expired") {
      content = `<button type="button" class="status reconnect" data-act="reconnect">${icon("warn")}<span>连接失效</span></button>`;
    } else if (state.connection === "connected") {
      const hasPeople = state.tags.length || Object.keys(state.focus).length;
      content = hasPeople && !state.paused
        ? `<button type="button" class="status monitor" data-act="activity" aria-label="正在监控朋友圈，查看当前状态"><span>正在监控朋友圈</span>${monitorSignal()}</button>`
        : `<button type="button" class="status" data-act="activity"><span>${state.paused ? "监控已暂停" : "微信已连接"}</span></button>`;
    }
    const slot = $("statusSlot");
    if (slot.innerHTML !== content) slot.innerHTML = content;
  }

  function monitorSignal() {
    return '<span class="monitor-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
  }

  function renderQuickActions() {
    const suggestions = state.connection === "connected"
      ? [["today", "日总结"], ["week-summary", "周总结"], ["scope", "监控名单"], ["focus", "重点名单"]] : [];
    const content = suggestions.map(([action, label]) =>
      `<button type="button" data-act="${action}"><span>${label}</span></button>`).join("");
    if ($("quick").innerHTML !== content) $("quick").innerHTML = content;
  }


  function renderChrome() {
    renderStatus();
    renderQuickActions();
  }
  function previewTools() {
    return `<button class="demo-tool" type="button" data-act="mock-refresh">刷新一次朋友圈<small>慢慢查看，再交代当前状态</small></button>
      <button class="demo-tool" type="button" data-act="mock-live">重点客户发布新动态<small>等待约 12 秒，再主动提醒</small></button>
      <button class="demo-tool" type="button" data-act="mock-ordinary">普通客户发布新动态<small>近况进入每日总结</small></button>
      <button class="demo-tool" type="button" data-act="mock-summary">发送当日总结<small>一句话交代今天的朋友圈</small></button>
      <button class="demo-tool" type="button" data-act="mock-next-day">进入第二天<small>到时间主动发总结</small></button>
      <button class="demo-tool" type="button" data-act="mock-week">到周总结时间<small>汇总一周，适时确认重点名单</small></button>`;
  }

  function scenarioButtons(items = scenarios) {
    return items.map(({ id, title, subtitle, icon: glyph }) =>
      `<button type="button" class="scene" data-act="scene" data-id="${id}" aria-pressed="${state.scenario === id}">
        ${icon(glyph)}<span><strong>${title}</strong><small>${subtitle}</small></span>${icon("next", "scene-arr")}
      </button>`).join("");
  }

  function reportKeys(report) {
    return [...new Set([...(report.timely || []), ...report.opportunities])];
  }
  function eventDate(event) {
    return `${mockDays.find((day) => day.code === (event.dayCode || 19)).label} ${event.time}`;
  }
  function reportIntro(report) {
    const count = reportKeys(report).length;
    const period = report.dayCode && report.dayCode !== state.dayCode ? report.day.replaceAll(" ", "") : "今天";
    if (report.checked === 0) return ["这轮检查还没完成", "暂时没有可核对的检查结果。恢复连接后可以再查一次。"];
    if (report.missed) return ["暂有部分检查结果", `已检查范围里暂无明确的跟进机会，还有 ${report.missed} 位客户待补查。`];
    if (!report.posts) return ["今天没有新动态", "这一轮已检查完，可以按原计划跟进。"];
    if (!count) return [`${period}暂无跟进建议`, "这轮动态里，暂时没有值得你现在联系客户的事。"];
    if (count > 3) return ["先处理最有时效的 3 条", `${period}有 ${count} 位客户值得跟进，先看时间窗口较短的。`];
    return [`${period}有 ${count} 位值得跟进`, "这几条有明确的联系时机，原文和联系建议都整理好了。"];
  }

  function renderReport(report) {
    return renderDaily(report);
  }


  function renderDaily(report) {
    if (!report) return "";
    return `<div class="assistant" data-daily-id="${report.id}" data-report-id="${report.id}" aria-label="${report.day}的每日总结"><p class="message-text">${escapeHtml(report.summary || composeDailySummary(report, state))}</p></div>`;
  }

  function toggle(action, label, data, expanded) {
    return `<button class="text-button" type="button" data-act="${action}" data-id="${escapeHtml(data)}" aria-expanded="${expanded}">${escapeHtml(label)} ${icon(expanded ? "down" : "next")}</button>`;
  }

  function renderNote(reportId) {
    const key = `note-${reportId}`;
    const expanded = openedDetails.has(key);
    return `<div class="note-list">
      <span class="note-label">有条近况可以顺带知道</span>
      <div class="note">
        <button class="note-row" type="button" data-act="detail" data-id="${key}" aria-expanded="${expanded}">
          <span class="note-icon">${icon("note")}</span>
          <span class="row-copy"><strong>周先生下周会去车展</strong><small>知道就好，暂时不用跟进</small></span>
          ${icon(expanded ? "down" : "next")}
        </button>
        ${expanded ? `<div class="detail"><p class="quote">“下周和朋友去车展逛逛，看看今年有什么新东西。”<span>朋友圈 · 11 月 19 日 08:05</span></p><p>你们之前聊过车展。他只是提到行程，可以留作下次见面的谈资。</p></div>` : ""}
      </div>
    </div>`;
  }

  function renderEvent(key, context, instant = false) {
    const event = eventByKey[key];
    if (!event) return "";
    const person = customers.get(event.id);
    const summary = event.summary || event.title || "最近的生活近况";
    return `<p class="message-text">刚刚${escapeHtml(person.name)}发了朋友圈，说的是${escapeHtml(summary)}，你可以看看。</p>
      <article class="moment-card" aria-label="${escapeHtml(person.name)}的朋友圈">
        <div class="card-copy"><div class="moment-meta">${avatar(person)}<span class="row-copy"><strong>${escapeHtml(person.name)}</strong><small>${eventDate(event)}</small></span></div>
        <p>${escapeHtml(event.source)}</p></div>
        <div class="moment-actions">${textButton("copy-open-moment", person.wechat ? "复制微信号并查看朋友圈" : "查看朋友圈", key)}</div>
      </article>`;
  }

  function privacySummary() {
    return `<div class="privacy-summary">
      <div class="privacy-line">${icon("shield")}<div><strong>只读朋友圈</strong>
        <p>只读所选客户向你开放的动态。不读取私聊、支付信息，也不绕过微信的可见范围。</p></div></div>
      <div class="privacy-line">${icon("hand")}<div><strong>跟进由你决定</strong>
        <p>我不会自动点赞、评论或给客户发消息。你可以随时调整名单或暂停监控。</p></div></div>
    </div>`;
  }

  function renderConnect(turn) {
    if (turn.done) return `<div class="assistant"><p class="message-text">微信账号「${escapeHtml(turn.done)}」已连接。先按标签选出要关注的客户，再由你挑选重点客户。</p>
      ${!state.tags.length && !state.scopeDraft ? `<div class="actions">${button("scope", "选择标签客户")}</div>` : ""}</div>`;
    const expired = turn.type === "expired";
    const cancel = textButton("connect-cancel", "取消授权");
    let card;
    switch (pendingConnection?.stage) {
      case "preparing":
      case "verifying":
      case "recognizing":
        card = `${thinkingDots()}<p>${pendingConnection.stage === "preparing" ? "正在生成连接二维码" : pendingConnection.stage === "recognizing" ? "正在读取扫码结果" : "正在核对微信账号"}</p>
          <div class="connection-actions">${cancel}</div>`;
        break;
      case "qr":
        card = `<h2>用微信扫描二维码</h2><p>请在手机微信中完成扫码。</p>
          <img class="connection-preview" src="${demoQr}" alt="微信连接二维码">
          <div class="connection-actions">
            ${button("connect-scan", "我已扫码", { kind: "primary block" })}
            ${textButton("connect-refresh", "刷新二维码")}${cancel}
          </div>`;
        break;
      case "phone":
        card = `<h2>已扫码，等待手机确认</h2><p>请在手机微信上确认本次连接。</p>
          <div class="connection-actions">${button("connect-phone", "已在微信确认", { kind: "primary block" })}${cancel}</div>`;
        break;
      case "verify":
        card = `<h2>确认使用这个微信</h2>
          <div class="entry"><span class="avatar account-icon">${icon("note")}</span><span class="row-copy"><strong>${escapeHtml(state.chosenAccount)}</strong><small>微信账号</small></span></div>
          <div class="connection-actions">${button("connect-confirm", "确认使用此账号", { kind: "primary block" })}${cancel}</div>`;
        break;
      default:
        card = expired
          ? `<h2>微信连接已失效</h2><p>之前的简报可以回看。重新连接原账号后，我会继续检查。</p>
            ${button("connect-start", "重新连接微信", { kind: "primary block" })}`
          : turn.deferred
            ? `<h2>已暂缓连接微信</h2><p>准备好后，可以回来继续设置盘客。</p>
              ${button("connect-card", "查看说明并继续", { kind: "block" })}`
            : `<div class="connection-actions">
                ${button("connect-start", "连接微信", { kind: "primary block" })}
                ${textButton("connect-later", "稍后连接", "", "muted")}
              </div>
  `;
    }
    const showsIntro = !expired && !turn.deferred && !pendingConnection;
    const intro = showsIntro
      ? `<div class="review-welcome">
          <h1>你好，我是 Soker。</h1>
          <p>客户多了，来不及一条条看朋友圈？我帮你留意，发现值得跟进的变化就告诉你。</p>
          <div class="welcome-capability">${icon("report")}<div><strong>朋友圈日报</strong><p>每天把你选中的客户近况整理成一份日报，告诉你有哪些变化值得跟进。</p></div></div>
          <div class="welcome-capability">${icon("bell")}<div><strong>重点客户监控</strong><p>重点客户一发新动态，我就单独提醒你，附上朋友圈原文。</p></div></div>
          ${privacySummary()}
        </div>`
      : "";
    return `<div class="assistant${showsIntro ? " connection-intro" : ""}">${intro}<section class="${showsIntro ? "connection-start" : "editor"}" id="connectionCard" tabindex="-1">${card}</section></div>`;
  }

  function renderScope() {
    if (!state.scopeDraft) return "";
    const draft = state.scopeDraft;
    const count = idsFor(draft).size;
    const repeated = draft.reduce((sum, id) => sum + byTag[id].ids.length, 0) - count;
    const available = state.noTags ? [] : tags.filter((tag) => !state.unavailableTags.includes(tag.id));
    return `<div class="assistant"><p class="message-text">想把哪些客户放进每日总结？在这里按微信标签勾选就好。每天我会把他们的朋友圈整理成一段话，告诉你整体近况和有没有值得跟进的变化。</p>
      <section class="editor" aria-label="更新监控名单"><h2>监控客户</h2>
        ${state.unavailableTags.length ? '<p class="alert">有标签暂时读不到，可以先刷新再确认。</p>' : ""}
        ${available.length ? `<div class="check-list">${available.map((tag) => `<div class="tag-choice"><label class="check-row">
          <input type="checkbox" data-change="tag" value="${tag.id}" ${draft.includes(tag.id) ? "checked" : ""} ${tag.ids.length ? "" : "disabled"}>
          <span class="row-copy"><strong>${tag.name}</strong></span><span class="row-stat">${num(tag.ids.length)} 位</span>
          </label>${tag.ids.length ? `<button class="icon-button" type="button" data-act="tag-preview" data-id="${tag.id}" aria-label="查看${tag.name}的客户">${icon("next")}</button>` : ""}</div>`).join("")}</div>`
          : '<p class="empty">暂时没有读到微信标签。建好客户标签后，可以回来刷新。</p>'}
        <p class="selection-status">已选 ${draft.length} 个标签，共 ${num(count)} 位${repeated ? `（去重 ${num(repeated)} 位）` : ""}</p>
        <div class="connection-actions scope-actions">
          ${state.noTags || state.unavailableTags.length ? button("tags-refresh", "刷新标签", { kind: "primary block" })
            : button("scope-save", state.configured ? "保存监控名单" : "确认监控客户", { kind: "primary block", disabled: !state.configured && !count })}
          ${textButton("scope-cancel", "取消编辑", "", "muted")}
        </div></section></div>`;
  }

  function renderSetupFocus() {
    const people = sortedCustomers(Object.keys(state.focusDraft || {}));
    return `<div class="assistant"><p class="message-text">监控名单选好了，我会每天给你发一段总结。接下来，你想把谁设为重点客户？你亲自选人，他们每发一条朋友圈，我就在这里提醒，附上原文和微信号。</p>
      <section class="editor setup-card" aria-label="选择重点客户"><h2>${people.length ? `已选 ${people.length} 位重点客户` : "重点客户"}</h2>
        ${people.slice(0, 3).map((person) => `<div class="selected-person">${avatar(person)}<span>${escapeHtml(person.name)}</span></div>`).join("")}
        ${button("setup-picker", people.length ? "编辑重点名单" : "选择重点客户", { kind: "primary block" })}
        ${people.length ? button("setup-review", "确认重点客户", { kind: "block" }) : textButton("setup-skip", "暂不设重点")}
      </section></div>`;
  }

  function renderClawBot() {
    const status = state.clawBot === "demo" ? "授权已完成" : "用微信接收盘客提醒";
    return `<section class="editor setup-card" aria-label="微信 ClawBot">
      <h2>微信 ClawBot</h2><p>${status}。它用于和助手对话，也可作为日报和重点动态的通知渠道。朋友圈读取权限单独管理。</p>
      ${state.clawBot === "demo" ? "" : button("clawbot-demo", "授权微信 ClawBot", { kind: "block" })}
    </section>`;
  }

  function renderFocus() {
    const people = sortedCustomers(Object.keys(state.focus));
    return `<div class="assistant"><p class="message-text">${people.length
      ? `你现在重点关注 ${people.length} 位客户。任何一位发了新朋友圈，我都会在这里提醒你，附上原文、朋友圈入口和微信号。`
      : "你还没选重点客户。你来选人，选好后每条新朋友圈我都会在这里提醒你。"}想增减名单，直接点下面编辑就好。</p>
      <section class="editor setup-card" aria-label="当前重点名单">
        ${people.slice(0, 3).map((person) => `<div class="selected-person">${avatar(person)}<span>${escapeHtml(person.name)}</span><span class="row-stat">${escapeHtml(person.context)}</span></div>`).join("")}
        ${people.length > 3 ? `<p class="setup-meta">共 ${people.length} 位</p>` : ""}
        ${button("focus-picker", people.length ? "更新重点客户" : "选择重点客户", { kind: "block", data: "all" })}
      </section></div>`;
  }

  function renderHistory() {
    const reports = [...state.reports].reverse();
    return `<div class="assistant"><p class="message-text">这些是之前发给你的每日总结。点一个日期，我把那段话找出来。</p>
      <section class="editor"><h2>每日总结记录</h2>${reports.length
        ? reports.map((report) => `<div class="history-row">${chevronButton("history-open", `${report.day} ${report.time}`, `${num(report.checked)} 位客户 · ${num(report.posts)} 条朋友圈`, "report", report.id)}</div>`).join("")
        : "<p>到每日总结时间，我会把关注客户的朋友圈整理成一段话发在这里。</p>"}</section></div>`;
  }

  function renderActivity() {
    const total = idsFor(state.tags).size;
    const focus = Object.keys(state.focus).length;
    const text = state.paused ? "朋友圈监控已经暂停。准备继续时，告诉我恢复监控就好。"
      : pendingScan ? "正在刷新朋友圈，我会慢慢看一遍。看到重点客户的新动态就直接告诉你。"
      : state.lastRefresh || "我刚看过一遍朋友圈，目前还没有新发布的动态。我会接着留意，监控客户每天发一段总结，重点客户有新动态就提醒你。";
    return `<div class="assistant"><p class="message-text">${text}</p>
      <p class="history-summary">每日总结名单 ${num(total)} 位 · 重点提醒名单 ${focus} 位</p>
      <div class="monitor-controls">${textButton("scope", "更新监控客户")}${textButton("focus", "更新重点客户")}
        ${textButton(state.paused ? "resume-monitor" : "pause-confirm", state.paused ? "恢复监控" : "暂停监控")}
      </div></div>`;
  }

  function renderOpening(key) {
    const event = eventByKey[key];
    const status = state.eventStatus[key];
    const value = state.openingDrafts[key] ?? event.opening;
    return `<div class="assistant"><p class="message-text">可以顺着${escapeHtml(customers.get(event.id).name)}刚发的动态自然问一句。你可以改改这段开场白，再去微信联系。</p><section class="editor">
      <h2>${escapeHtml(customers.get(event.id).name)} · 开场参考</h2>
      <textarea class="draft-field" data-draft="${key}" aria-label="编辑开场白" maxlength="800">${escapeHtml(value)}</textarea>
      <div class="actions">${button("copy", "复制开场白", { data: key, withIcon: "copy" })}${button("mock-wechat", "去微信联系", { data: key })}</div>
      <div class="card-line">${textButton("followup", status === "contacted" ? "修改联系结果" : "我已联系，记一下", key)}${textButton("later", "稍后提醒", key)}</div>
    </section></div>`;
  }

  function customerMoments(id) {
    return [...mockMoments, ...state.extras].filter((moment) => moment.id === id && moment.dayCode <= state.dayCode)
      .sort((a, b) => b.dayCode - a.dayCode || b.time.localeCompare(a.time));
  }

  function renderCustomer(id) {
    const customer = customers.get(id);
    if (!customer) return "";
    const name = escapeHtml(customer.name);
    const detail = customerDetails[id];
    const moments = customerMoments(id).slice(0, 5);
    const records = state.followups.filter((record) => eventByKey[record.key]?.id === id).reverse();
    const activeKeys = reportKeys(state.reports.at(-1) || { opportunities: [] });
    const event = activeKeys.map((key) => eventByKey[key]).find((item) => item.id === id);
    return `<div class="assistant"><section class="editor">
      <div class="selected-person">${avatar(customer)}<h2>${name}</h2><span class="row-stat">${state.focus[id] ? "重点客户" : customer.stage}</span></div>
      <p>${escapeHtml(customer.context)}</p>
      ${detail ? `<p>${detail.need}</p><p class="quote">${detail.history}<span>此前沟通 · ${detail.lastContact}</span></p>` : `<p>当前跟进阶段为${customer.stage}，可结合下方近况判断是否需要联系。</p>`}
      ${event ? button("opening", "准备开场白", { data: event.key, kind: "block" }) : ""}
      <h3 class="section-caption">最近的朋友圈</h3>
      ${moments.length ? moments.map((moment) => `<div class="moment-item"><p>${escapeHtml(moment.source)}</p><small>${mockDays.find((day) => day.code === moment.dayCode).label} ${moment.time}</small></div>`).join("") : '<p>最近三天暂时没有新的朋友圈。</p>'}
      <h3 class="section-caption">联系记录</h3>
      ${records.length ? records.map((record) => `<div class="moment-item"><p>${escapeHtml(record.result)}</p><small>${record.time}</small></div>`).join("") : detail ? `<p>${detail.lastContact} · ${detail.history}</p>` : "<p>这位客户尚未记录联系结果。</p>"}
    </section></div>`;
  }

  function renderFollowup(key) {
    const event = eventByKey[key];
    const name = customers.get(event.id).name;
    const confirmed = key === "visit" || key === "lin-confirm" ? "已约周六 14:00 试驾"
      : key === "hangzhou" ? "已约今天 15:00 见面" : "已沟通，等客户回复";
    return `<div class="assistant"><p class="message-text">你和${escapeHtml(name)}这次聊得怎么样？选一个结果，我帮你记到档案里。</p>
      <section class="editor setup-card"><h2>记录联系结果</h2>
        ${button("result-confirmed", confirmed, { kind: "primary block", data: key })}
        ${button("result-waiting", "已联系，等回复", { kind: "block", data: key })}
        ${button("later", "稍后提醒我", { kind: "block", data: key })}
        ${textButton("result-unrelated", "这次不用跟进", key)}
      </section></div>`;
  }

  function renderReminder(key) {
    const name = customers.get(eventByKey[key].id).name;
    const day = mockDays.find((item) => item.code === state.dayCode).label;
    return `<div class="assistant"><p class="message-text">想什么时候再联系${escapeHtml(name)}？我会把提醒和这条动态放在一起。</p>
      <section class="editor setup-card">
        ${button("remind-today", `${day} 15:00`, { kind: "block", data: key })}
        ${button("remind-tomorrow", `11 月 ${state.dayCode + 1} 日 09:00`, { kind: "block", data: key })}
      </section></div>`;
  }

  function renderRecords() {
    const records = [...state.followups].reverse();
    return `<div class="assistant"><p class="message-text">这些是你已确认的联系结果和稍后提醒。客户的新动态我会继续留意。</p>
      <section class="editor"><h2>处理记录 · ${records.length} 条</h2>
        ${records.length ? records.map((record) => {
          const person = customers.get(eventByKey[record.key].id);
          return `<div class="moment-item"><button class="daily-customer" type="button" data-act="customer" data-id="${person.id}">${avatar(person)}<strong>${escapeHtml(person.name)}</strong><span class="row-stat">${record.resolved ? "提醒已完成" : record.status === "contacted" ? "已联系" : record.status === "later" ? "稍后" : "不用跟进"}</span></button><p>${escapeHtml(record.result)}</p><small>${record.time}</small></div>`;
        }).join("") : "<p>完成一次联系后，可以在这里回看结果。</p>"}
      </section></div>`;
  }

  function renderReceipt(turn) {
    const person = customers.get(eventByKey[turn.record.key].id);
    return `<div class="assistant"><p class="message-text">记下了，${escapeHtml(person.name)}这次的结果是“${escapeHtml(turn.record.result)}”。${turn.record.status === "later" ? "到时我会再提醒你。" : "客户档案和今天的待跟进状态已经同步。"}我会继续留意新的朋友圈。</p>
      <div class="actions">${button("today", "继续看今天")}${textButton("customer", "看看客户档案", person.id)}</div>
    </div>`;
  }

  function renderCandidate(turn) {
    const subject = turn.mode === "focus" ? "设为重点客户" : turn.mode === "remove" ? "移出重点关注"
      : turn.mode === "result" ? "记录联系结果" : "查看联系参考";
    return `<div class="assistant"><section class="editor">
      <h2>${turn.ids.length > 1 ? "找到同名客户" : subject}</h2>
      <p>${turn.ids.length > 1 ? "我找到了同名客户。看一下备注，你说的是哪一位？" : "核对一下客户备注，再确认这次操作。"}</p>
      ${turn.ids.map((id) => {
        const customer = customers.get(id);
        return chevronButton(`candidate-${turn.mode}`, customer.name, customer.context, "person", id);
      }).join("")}
    </section></div>`;
  }


  function renderTurn(turn) {
    switch (turn.type) {
      case "date": return `<div class="day">${escapeHtml(turn.text)}</div>`;
      case "user": return `<div class="user-message" aria-label="我">${escapeHtml(turn.text)}</div>`;
      case "assistant": return `<div class="assistant"><p class="message-text">${escapeHtml(turn.text)}</p></div>`;
      case "report": return renderReport(state.reports.find((report) => report.id === turn.id));
      case "daily": return renderDaily(state.reports.find((report) => report.id === turn.id));
      case "weekly": return renderWeekly(state.weeklyReports.find((week) => week.id === turn.id));
      case "weekly-review": return renderWeeklyReview(turn.id);
      case "privacy": return `<div class="assistant">${privacySummary()}</div>`;
      case "clawbot": return `<div class="assistant">${renderClawBot()}</div>`;
      case "summary-settings": return renderSummarySettings();
      case "opportunity-details": return renderOpportunityDetails(state.reports.find((report) => report.id === turn.id));
      case "instant": return `<div class="assistant">${renderEvent(turn.key, "instant", true)}</div>`;
      case "connect": case "expired": return renderConnect(turn);
      case "scope": return renderScope();
      case "setup-focus": return renderSetupFocus();
      case "focus": return renderFocus();
      case "history": return renderHistory();
      case "activity": return renderActivity();
      case "opening": return renderOpening(turn.key);
      case "customer": return renderCustomer(turn.id);
      case "followup": return renderFollowup(turn.key);
      case "reminder": return renderReminder(turn.key);
      case "records": return renderRecords();
      case "receipt": return renderReceipt(turn);
      case "candidate": return renderCandidate(turn);

      default: return "";
    }
  }

  const transientTypes = new Set(["weekly-review", "summary-settings", "opportunity-details", "scope", "setup-focus", "setup-review", "focus", "history", "activity", "opening", "candidate", "customer", "followup", "reminder", "records"]);
  function commitTurns(...turns) {
    const log = state.turns[state.tab];
    for (const turn of turns) {
      if (transientTypes.has(turn.type)) {
        const previous = log.findLastIndex((item) => item.type === turn.type);
        if (previous >= 0) log.splice(previous, 1);
      }
      if (turn.type === "weekly-review") state.lastWeeklyReview = turn.id;
      log.push(turn);
    }
  }
  function thinkingDots() {
    return '<span class="thinking-dots" role="status" aria-label="Soker 正在思考"><i></i><i></i><i></i></span>';
  }
  function append(...turns) {
    const immediate = turns.filter((turn) => ["user", "date"].includes(turn.type));
    if (immediate.length) commitTurns(...immediate);
    const replies = turns.filter((turn) => !["user", "date"].includes(turn.type));
    const completion = replies.map((turn) => {
      state.pendingReplies.push(turn);
      return new Promise((resolve) => replyWaiters.set(turn, resolve));
    });
    renderChat("latest");
    pumpReplies();
    return Promise.all(completion);
  }
  function pumpReplies() {
    if (activeReply || !state.pendingReplies.length) return;
    activeReply = state.pendingReplies[0];
    const turn = activeReply;
    const delay = turn.type === "assistant" ? Math.min(3100, 1500 + turn.text.length * 7)
      : ["report", "daily", "weekly", "customer"].includes(turn.type) ? 2500 : 1900;
    renderChat("latest");

    announce("Soker 正在整理回复");
    replyTimer = setTimeout(() => {
      const nearBottom = chat.scrollHeight - chat.clientHeight - chat.scrollTop < 70;
      state.pendingReplies.shift();
      activeReply = null;
      replyTimer = null;
      if ((turn.proactive && (state.paused || (turn.type === "daily" && !state.summaryPrefs.daily) || (turn.type === "weekly" && !state.summaryPrefs.weekly)))
        || (turn.type === "weekly-review" && (state.paused || state.weeklyReviewMode !== "weekly" || state.lastWeeklyReview === turn.id))) {
        replyWaiters.get(turn)?.(false);
        replyWaiters.delete(turn);
        renderChat("preserve");

        pumpReplies();
        return;
      }
      if (turn.type === "instant" && (state.paused || state.connection !== "connected" || !state.focus[eventByKey[turn.key].id])) {
        replyWaiters.get(turn)?.(false);
        replyWaiters.delete(turn);
        renderChat("preserve");

        pumpReplies();
        return;
      }
      commitTurns(turn);
      lastDelivered = turn;
      renderChat(nearBottom ? "latest" : "preserve");

      replyWaiters.get(turn)?.(true);
      replyWaiters.delete(turn);
      announce("Soker 已回复");
      pumpReplies();
    }, delay);
  }
  function cancelReplies() {
    clearTimeout(replyTimer);
    replyTimer = null;
    activeReply = null;
    state.pendingReplies = [];
    for (const resolve of replyWaiters.values()) resolve(false);
    replyWaiters.clear();
  }
  function renderChat(position = "preserve") {
    const previous = chat.scrollTop;
    const log = state.turns[state.tab];
    const incoming = log.map(renderTurn).join("");
    renderQuickActions();
    stream.innerHTML = incoming + (activeReply ? `<div class="assistant typing">${thinkingDots()}</div>` : "");
    for (const message of stream.querySelectorAll(":scope > .assistant")) {
      message.setAttribute("aria-label", "Soker 发来的消息");
      message.insertAdjacentHTML("afterbegin", `<div class="agent-author">${brandImage}<span>Soker</span></div>`);
    }
    if (lastDelivered) {
      const index = log.indexOf(lastDelivered);
      stream.children[index]?.classList.add("message-arrival");
      lastDelivered = null;
    }
    if (position === "latest") {
      const last = stream.lastElementChild;
      chat.scrollTop = last ? Math.min(last.offsetTop - stream.firstElementChild.offsetTop, chat.scrollHeight) : previous;
    } else if (position === "top") {
      chat.scrollTop = 0;
    } else {
      chat.scrollTop = previous;
    }
    renderStatus();
    persist();
  }


  function positionSheet() {
    const bounds = app.getBoundingClientRect();
    const viewportTop = window.visualViewport?.offsetTop ?? 0;
    const viewportBottom = Math.min(innerHeight, viewportTop + (window.visualViewport?.height ?? innerHeight));
    const bottom = viewportBottom;
    const available = Math.max(0, bottom - Math.max(viewportTop, bounds.top));
    sheet.classList.toggle("compact", available < 430);
    sheet.style.setProperty("--left", `${Math.max(0, bounds.left)}px`);
    sheet.style.setProperty("--right", `${Math.max(0, document.documentElement.clientWidth - bounds.right)}px`);
    sheet.style.setProperty("--bottom", `${Math.max(0, innerHeight - bottom)}px`);
    sheet.style.setProperty("--available", `${available}px`);
    const wrap = $("sheetContent").querySelector(".picker-wrap");
    if (sheet.open && wrap) {
      const controls = Array.from(wrap.children).filter((element) => !element.classList.contains("picker-list"));
      const controlsHeight = controls.reduce((sum, element) => sum + element.offsetHeight, 0)
        + controls.length * parseFloat(getComputedStyle(wrap).rowGap);
      sheet.classList.toggle("compact", available < 430 || $("sheetContent").clientHeight - controlsHeight - 10 < 112);
    }
  }

  function showSheet(view, parent = "") {
    const alreadyOpen = sheet.open;
    dialogView = view;
    dialogParent = parent;
    renderSheet();
    positionSheet();
    if (!alreadyOpen) {
      sheet.showModal();
      onSheetChange(true);
    }
    positionSheet();
    $("sheetTitle").focus({ preventScroll: true });
  }

  function closeSheet() {
    if (sheet.open) {
      sheet.close();
      onSheetChange(false);
    }
    dialogView = "";
    dialogParent = "";
    picker = null;
  }

  function renderSheet() {
    const titles = {
      directory: "微信朋友", "friend-detail": customers.get(selectedFriend)?.name, scenarios: "场景预览",
      picker: "选择重点客户", pause: "暂停监控",
      "tag-preview": byTag[tagPreviewId]?.name, moment: "朋友圈原文",
    };
    const hasPicker = ["picker", "directory", "tag-preview"].includes(dialogView);
    const fullScreen = ["picker", "directory", "friend-detail", "tag-preview", "moment"].includes(dialogView);
    sheet.classList.toggle("picker", hasPicker);
    sheet.classList.toggle("full-screen", fullScreen);
    $("sheetHead").classList.toggle("with-back", Boolean(dialogParent));
    $("sheetHead").innerHTML = `${dialogParent ? `<button class="icon-button" type="button" data-act="sheet-back" aria-label="返回">${icon("back")}</button>` : ""}
      <h2 id="sheetTitle" tabindex="-1">${titles[dialogView]}</h2>
      <button class="icon-button" type="button" data-act="sheet-close" aria-label="${fullScreen && !dialogParent ? "返回对话" : "关闭"}">${icon(fullScreen && !dialogParent ? "back" : "close")}</button>`;
    const foot = $("sheetFoot");
    foot.hidden = true;
    foot.innerHTML = "";
    const content = $("sheetContent");
    if (dialogView === "scenarios") {
      content.innerHTML = `<div class="scenes">${scenarioButtons(allScenarios)}</div><div class="demo-tools">${previewTools()}</div>`;
    } else if (dialogView === "friend-detail") {
      const person = customers.get(selectedFriend);
      const moments = customerMoments(selectedFriend);
      content.innerHTML = `<div class="entry">${avatar(person)}<span class="row-copy"><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.context)}</small></span></div>
        <h3 class="section-caption">朋友圈</h3>
        ${moments.length ? moments.map(moment => `<article class="moment-item"><p>${escapeHtml(moment.source)}</p><small>${eventDate(moment)}</small></article>`).join("") : '<p class="empty">还没有这位朋友的朋友圈记录。</p>'}`;
    } else if (dialogView === "directory") {
      content.innerHTML = `<div class="picker-wrap">${searchField("directoryQuery", "搜索客户名或备注")}
        <div class="picker-list" id="directoryRows"></div></div>`;
      renderDirectory();
    } else if (dialogView === "tag-preview") {
      const tag = byTag[tagPreviewId];
      const selected = state.scopeDraft?.includes(tag.id);
      content.innerHTML = `<div class="picker-wrap"><p class="sheet-intro">这个标签里有 ${num(tag.ids.length)} 位客户。选中标签后，整组客户都会加入关注范围。</p>
        <div class="picker-list">${sortedCustomers(tag.ids).slice(0, tagPreviewLimit).map((person) => `<div class="entry">${avatar(person)}<span class="row-copy"><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.context)} · ${person.stage}</small></span></div>`).join("")}
        ${tag.ids.length > tagPreviewLimit ? button("tag-preview-more", "显示更多客户", { kind: "block" }) : ""}</div></div>`;
      foot.hidden = false;
      foot.innerHTML = button("tag-select", selected ? "移出这组客户" : "选中这组客户", { kind: "primary block" });
    } else if (dialogView === "pause") {
      content.innerHTML = '<p class="sheet-intro">暂停后，我会停止检查当前客户的朋友圈。已生成的简报和历史记录仍可回看。</p>';
      foot.hidden = false;
      foot.innerHTML = `<div class="actions">${button("sheet-close", "继续编辑", { kind: "ghost" })}${button("pause-save", "确认暂停", { kind: "primary" })}</div>`;
    } else if (dialogView === "moment") {
      const event = eventByKey[selectedMoment];
      const person = customers.get(event.id);
      content.innerHTML = `<article class="moment-card"><div class="card-copy"><div class="moment-meta">${avatar(person)}<span class="row-copy"><strong>${escapeHtml(person.name)}</strong><small>${eventDate(event)}</small></span></div><p>${escapeHtml(event.source)}</p></div></article>
        <p class="sheet-intro" style="margin-top:16px">微信号 · ${escapeHtml(person.wechat)}</p>
        <p class="sheet-intro" id="copyFeedback" role="status"></p>`;
    } else if (dialogView === "picker") {
      renderPicker();
    }
  }

  function renderDirectory(limit = 20) {
    const query = $("directoryQuery").value.trim().toLowerCase();
    const monitored = new Set([...idsFor(state.tags), ...Object.keys(state.focus).map(Number)]);
    const result = sortedCustomers(monitored).sort((a, b) => Number(Boolean(customerDetails[b.id])) - Number(Boolean(customerDetails[a.id])))
      .filter((person) => `${person.name} ${person.context}`.toLowerCase().includes(query));
    $("directoryRows").innerHTML = `
      <p class="picker-summary">${query ? `匹配到 ${num(result.length)} 位` : `已关注 ${num(result.length)} 位`}</p>
      ${result.slice(0, limit).map((customer) => chevronButton("directory-customer", customer.name, customer.context, "person", customer.id)).join("")}
      ${!monitored.size ? '<p class="empty">选好监控客户或重点客户后，会在这里看到他们的朋友圈。</p>' : !result.length ? '<p class="empty">没有匹配的朋友，可以换个名字或备注试试。</p>' : ""}
      ${result.length > limit ? button("directory-more", "加载更多客户", { kind: "block", data: limit + 20 }) : ""}`;
  }

  function openPicker(filter = "all", customerId = 0, setup = false) {
    state.focusDraft = Object.fromEntries(Object.keys(state.focusDraft || state.focus).filter((id) => customers.has(Number(id))).map((id) => [id, "instant"]));
    picker = { query: "", filter, stage: "", limit: 20, candidate: customerId, setup };
    if (customerId) picker.query = customers.get(customerId).name;
    showSheet("picker");
    persist();
  }

  function matchesPicker() {
    if (!picker) return [];
    const query = picker.query.trim().toLowerCase();
    return sortedCustomers(customers.keys()).filter((person) => {
      if (picker.candidate && picker.candidate !== person.id) return false;
      if (picker.filter === "selected" && !state.focusDraft[person.id]) return false;
      if (picker.stage && picker.stage !== person.stage) return false;
      return [person.name, person.context, ...person.labels].join(" ").toLowerCase().includes(query);
    });
  }

  function renderPicker() {
    $("sheetContent").innerHTML = `<div class="picker-wrap">
      <p class="sheet-intro">亲自勾选重点客户。他们每发一条新朋友圈，都会单独提醒你。</p>
      ${searchField("pickerQuery", "搜索姓名、备注或标签", picker.query)}
      <div class="filter-row"><div class="filters" id="pickerFilters" aria-label="客户筛选"></div>
        <select data-change="stage" aria-label="跟进阶段">
          <option value="">所有阶段</option>${stages.map((stage) => `<option ${picker.stage === stage ? "selected" : ""}>${stage}</option>`).join("")}
        </select></div>
      <div class="bulk-line" id="bulkLine"></div>
      <div class="picker-list" id="pickerRows" aria-label="客户列表"></div>
    </div>`;
    updatePicker();
  }

  function updatePicker() {
    if (dialogView !== "picker" || !state.focusDraft) return;
    const draft = state.focusDraft;
    const count = Object.keys(draft).length;
    const matched = matchesPicker();
    const available = matched.filter((customer) => !draft[customer.id]);
    const checked = matched.filter((customer) => Boolean(draft[customer.id]));
    const rows = $("pickerRows");
    const before = rows.scrollTop;
    const active = root.activeElement;
    const restoreSelector = rows.contains(active)
      ? active.matches('input[data-change="customer"]') ? `input[data-change="customer"][value="${active.value}"]`
        : active.dataset.id ? `button[data-act="${active.dataset.act}"][data-id="${active.dataset.id}"]` : ""
      : "";
    $("pickerFilters").innerHTML = [["all", "全部客户"], ["selected", `已选 ${count}`]]
      .map(([filter, label]) => `<button class="filter" type="button" data-act="picker-filter" data-id="${filter}" aria-pressed="${picker.filter === filter}"><span>${label}</span></button>`).join("");
    const filtering = Boolean(picker.query.trim() || picker.stage || picker.filter !== "all");
    $("bulkLine").innerHTML = `<span>${num(matched.length)} 位${filtering ? "匹配" : "可选客户"}</span>
      ${matched.length > 1 && available.length && (filtering || !picker.setup) ? textButton("batch-add", filtering ? `加入筛选中的 ${num(available.length)} 位` : `加入剩余 ${num(available.length)} 位`) : ""}
      ${matched.length > 1 && checked.length && picker.filter === "selected" ? textButton("batch-remove", `移出筛选中的 ${num(checked.length)} 位`) : ""}`;
    rows.innerHTML = matched.length
      ? matched.slice(0, picker.limit).map((customer) => {
        const mode = draft[customer.id];
        return `<div class="level-row">
          <label class="check-row">
            <input type="checkbox" data-change="customer" value="${customer.id}" ${mode ? "checked" : ""}>
            ${avatar(customer)}<span class="row-copy"><strong>${escapeHtml(customer.name)}</strong><small>${escapeHtml(customer.context)} · ${customer.stage}</small></span>
          </label>

        </div>`;
      }).join("") + (matched.length > picker.limit ? button("picker-more", `再显示 ${Math.min(20, matched.length - picker.limit)} 位`, { kind: "block" }) : "")
      : `<div class="empty"><p>${picker.query ? "没有匹配的客户。可以换一个名字或清空筛选。" : "当前筛选里没有客户。"}</p>${textButton("clear-filters", "清空筛选")}</div>`;
    rows.scrollTop = before;
    if (restoreSelector) {
      const next = rows.querySelector(restoreSelector) || rows.querySelector("input") || $("pickerFilters").querySelector('[aria-pressed="true"]');
      next?.focus({ preventScroll: true });
    }
    const foot = $("sheetFoot");
    foot.hidden = false;

    const saveLabel = picker.setup ? count ? `确认 ${count} 位重点客户` : "暂不设重点，继续" : "保存重点名单";
    foot.innerHTML = `<p class="picker-summary" role="status"><strong>已选 ${num(count)} 位</strong> · 每条新朋友圈都提醒</p>
      <div class="actions">${picker.setup ? "" : textButton("cancel-focus", "取消编辑", "", "muted")}${button("focus-save", saveLabel, { kind: "primary" })}</div>`;
    if (sheet.open) positionSheet();
  }

  function goToPanke() {
    state.tab = "panke";
  }
  function openScope(draft, requested = true) {
    if (state.connection !== "connected") return showConnection(state.connection === "expired" ? "expired" : "connect");
    state.scopeDraft = draft ?? state.scopeDraft ?? [...state.tags];
    state.turns.panke = state.turns.panke.filter((turn) => !["setup-focus", "setup-review"].includes(turn.type));
    if (!state.configured) state.setupStep = "tags";
    append(...(requested ? [{ type: "user", text: "我想更新监控客户。" }] : []), { type: "scope" });
  }

  function openFocus(requested = true) {
    if (state.connection !== "connected") return showConnection(state.connection === "expired" ? "expired" : "connect");
    if (!state.configured) {
      if (!state.scopeDraft?.length) return openScope(undefined, requested);
      return openPicker("all", 0, true);
    }
    append(...(requested ? [{ type: "user", text: "我想更新重点客户。" }] : []), { type: "focus" });
  }

  function confirmScope() {
    if (!state.scopeDraft || state.unavailableTags.length || state.noTags) return;
    if (state.configured) return saveScope();
    if (!state.scopeDraft.length) return;
    state.focusDraft ||= {};
    state.setupStep = "focus";
    state.turns.panke = state.turns.panke.filter((turn) => !["scope", "setup-focus", "setup-review"].includes(turn.type));
    append({ type: "user", text: `把这些标签里的 ${num(idsFor(state.scopeDraft).size)} 位客户放进每日总结。` }, { type: "setup-focus" });
  }

  function confirmSetupFocus() {
    if (state.configured || !state.scopeDraft?.length) return;
    if (state.connection !== "connected") return showConnection("connect");
    const selected = sortedCustomers(Object.keys(state.focusDraft || {}));
    const names = selected.slice(0, 3).map((person) => person.name).join("、");
    const text = selected.length ? `把${names}${selected.length > 3 ? `等 ${num(selected.length)} 位客户` : ""}设为重点。` : "先不设重点客户。";
    commitTurns({ type: "user", text });
    saveScope(state.focusDraft || {});
  }

  function saveScope(setupFocus) {
    if (!state.scopeDraft || state.unavailableTags.length || state.noTags) return;
    const first = !state.configured;
    if (pendingScan) stopScan(false);
    state.tags = [...state.scopeDraft];
    if (setupFocus) state.focus = Object.fromEntries(Object.keys(setupFocus).map((id) => [id, "instant"]));
    state.scopeDraft = null;
    state.setupStep = null;
    state.configured = true;
    if (first) { state.focusDraft = null; state.paused = false; }
    state.turns.panke = state.turns.panke.filter((turn) => !["scope", "setup-focus", "setup-review"].includes(turn.type));
    const count = idsFor(state.tags).size;
    if (first) {
      const focusCount = Object.keys(state.focus).length;
      const focusNotice = focusCount
        ? `你选的 ${num(focusCount)} 位重点客户一有新动态，我就单独提醒你，并附上朋友圈入口和微信号。`
        : "";
      append({
        type: "assistant",
        text: `好，${num(count)} 位客户的朋友圈我已经开始帮你留意了。我会每天整理一份日报，有值得跟进的消息就在这里告诉你。${focusNotice}\n\n想在微信里也收到提醒的话，你可以绑定微信 ClawBot。以后有重要消息，我就能直接推送到你的微信上。`,
      }, { type: "clawbot" });
      startScan();
      return;
    }
    append({ type: "user", text: `监控名单改为 ${count} 位客户。` }, {
      type: "assistant",
      text: count ? `监控名单已更新，共 ${count} 位。下一份每日总结就按这个范围整理。想继续调整，随时在这里说“更新监控客户”。`
        : `每日总结名单已清空。当前重点客户 ${Object.keys(state.focus).length} 位，他们发新朋友圈时会在这里提醒你。`,
    });
  }

  function saveFocus() {
    if (!state.focusDraft) return;
    if (picker?.setup) { closeSheet(); confirmSetupFocus(); return; }
    const before = new Set(Object.keys(state.focus));
    const next = Object.keys(state.focusDraft).filter((id) => customers.has(Number(id)));
    const added = next.filter((id) => !before.has(id)).map((id) => customers.get(Number(id)).name);
    const removed = [...before].filter((id) => !next.includes(id)).map((id) => customers.get(Number(id)).name);
    state.focus = Object.fromEntries(next.map((id) => [id, "instant"]));
    state.focusDraft = null;
    state.turns.panke = state.turns.panke.filter((turn) => turn.type !== "weekly-review");
    closeSheet();
    const changes = [added.length ? `加入了${added.slice(0, 3).join("、")}${added.length > 3 ? `等 ${added.length} 位` : ""}` : "",
      removed.length ? `移出了${removed.slice(0, 3).join("、")}${removed.length > 3 ? `等 ${removed.length} 位` : ""}` : ""].filter(Boolean).join("，");
    append({ type: "user", text: "按我刚才勾选的，更新重点名单。" },
      { type: "assistant", text: `${changes ? `已${changes}。` : "重点名单已保存。"}当前 ${next.length} 位重点客户，每发一条新朋友圈就提醒你，卡片里可以查看朋友圈、复制微信号。` });
  }

  function showConnection(type) {
    if (state.connection === "connected") return openScope();
    const turn = state.turns.panke.findLast((item) => item.type === type && !item.done);
    if (turn) {
      turn.deferred = false;
      state.turns.panke.splice(state.turns.panke.indexOf(turn), 1);
    }
    append(turn || { type });
  }
  function setConnectionStage(stage, nextStage) {
    clearTimeout(pendingConnection?.timer);
    pendingConnection = stage ? { stage } : null;
    if (nextStage) pendingConnection.timer = setTimeout(() => setConnectionStage(nextStage), 1600);
    if (state.tab === "panke") {
      const focused = $("connectionCard")?.contains(root.activeElement);
      renderChat("latest");
      if (focused) $("connectionCard")?.focus({ preventScroll: true });
    }
  }
  function startConnection() {
    if (state.connection === "connected" || pendingConnection) return;
    const turn = state.turns.panke.findLast((item) => ["connect", "expired"].includes(item.type) && !item.done);
    state.turns.panke = state.turns.panke.filter((item) => item !== turn);
    commitTurns({ type: "user", text: "连接微信。" }, turn || { type: "connect" });
    setConnectionStage("preparing", "qr");
  }
  function confirmConnection() {
    if (pendingConnection?.stage !== "verify") return;
    const reconnect = state.connection === "expired";
    pendingConnection = null;
    state.connection = "connected";
    commitTurns({ type: "user", text: "确认使用周亦这个微信。" });
    const latest = state.turns.panke.findLast((item) => ["connect", "expired"].includes(item.type) && !item.done);
    if (latest) latest.done = state.chosenAccount;
    if (reconnect && state.configured && !state.paused) {
      append({ type: "assistant", text: "微信已重新连接，按当前的监控名单和重点名单继续留意朋友圈。" });
      startScan();
    } else if (state.configured) {
      append({ type: "assistant", text: "微信已连接。当前的监控处于暂停状态，准备继续时可以在这里说“恢复监控”。" });
    } else {
      openScope(undefined, false);
    }
  }

  async function startScan(outcome = "refresh", retryReport = null, deliverSummary = false) {
    if (pendingScan) return append({ type: "activity" });
    if (state.connection !== "connected") return showConnection(state.connection === "expired" ? "expired" : "connect");
    if (state.paused) return append({ type: "activity" });
    if (!state.tags.length && !Object.keys(state.focus).length) return openScope();
    const scan = { timer: null, extraCount: state.extras.length };
    pendingScan = scan;
    state.pendingRefresh = { deliverSummary, retryId: retryReport?.id || null };
    const proactive = outcome === "scheduled";
    state.pendingRefresh.proactive = proactive;
    if (!proactive) await append({ type: "activity" });
    else { renderStatus(); persist(); }
    if (pendingScan !== scan) return;
    scan.timer = setTimeout(() => {
      if (pendingScan !== scan) return;
      pendingScan = null;
      state.pendingRefresh = null;
      state.refreshCount += 1;
      state.turns.panke = state.turns.panke.filter((turn) => turn.type !== "activity");
      state.lastRefresh = state.extras.length > scan.extraCount
        ? "刚刷新了朋友圈，有新的客户近况。普通监控客户的内容会整理进每日总结，重点客户的新动态会单独发给你。我继续留意。"
        : ["刚刷新了朋友圈，目前还没有新的动态。我会继续留意，有重点客户发朋友圈就直接告诉你。",
           "刚看了一遍，关注的客户暂时还没发新的朋友圈。我继续留意，每日总结到时间会发在这里。"][state.refreshCount % 2];
      if (deliverSummary || retryReport) publishDailySummary(retryReport, proactive);
      else append({ type: "assistant", text: state.lastRefresh });
      renderStatus();
    }, 12000);
  }

  function stopScan(announceStop = true) {
    clearTimeout(pendingScan?.timer);
    pendingScan = null;
    state.pendingRefresh = null;
    if (announceStop) append({ type: "assistant", text: "这轮刷新已停下。准备继续时，在这里告诉我就好。" });
  }


  function cancelMoment() {
    clearTimeout(liveTimer);
    liveTimer = null;
    state.pendingMoment = null;
  }

  function scheduleMoment() {
    clearTimeout(liveTimer);
    if (!state.pendingMoment) return;
    liveTimer = setTimeout(() => {
      const event = state.pendingMoment?.event;
      state.pendingMoment = null;
      liveTimer = null;
      if (!event || state.paused || state.connection !== "connected") { persist(); return; }
      if (!state.extras.some((item) => item.key === event.key)) state.extras.push(event);
      state.liveCount += 1;
      state.liveDelivered = true;
      state.demoTime = event.time;
      eventByKey[event.key] = event;
      if (state.focus[event.id] && !state.deliveredInstant.includes(event.key)) {
        state.deliveredInstant.push(event.key);
        append({ type: "date", text: `${mockDays.find((day) => day.code === state.dayCode).label} ${event.time}`, code: state.dayCode },
          { type: "instant", key: event.key });
      } else persist();
    }, Math.max(1000, state.pendingMoment.dueAt - Date.now()));
  }

  function publishDailySummary(retryReport = null, proactive = false) {
    if (!state.tags.length) {
      if (proactive) { persist(); return; }
      append({ type: "assistant", text: "每日总结名单当前为空。想让我每天汇总谁的朋友圈，直接说“更新监控客户”就好。" });
      return;
    }
    let report = state.reports.findLast((item) => item.dayCode === state.dayCode);
    if (!report || retryReport) {
      report = makeDayReport(state, state.dayCode);
      state.reports.push(report);
      if (retryReport) retryReport.retried = report.id;
    }
    if (proactive && (!state.summaryPrefs.daily || [...state.turns.panke, ...state.pendingReplies].some((turn) => ["daily", "report"].includes(turn.type) && turn.id === report.id))) { persist(); return; }
    append({ type: "date", text: `${report.day} ${report.time}`, code: report.dayCode }, { type: "daily", id: report.id, proactive });
  }

  function requestDailySummary() {
    if (state.reports.some((report) => report.dayCode === state.dayCode) || !state.tags.length) publishDailySummary();
    else startScan("summary", null, true);
  }


  function queueWeeklyReview(week) {
    const weekKey = week.weekKey;
    if (state.paused || state.weeklyReviewMode !== "weekly" || state.lastWeeklyReview === weekKey) return;
    if (state.pendingReplies.some((turn) => turn.type === "weekly-review" && turn.id === weekKey)) return;
    append({ type: "weekly-review", id: weekKey });
  }

  function publishWeeklySummary(proactive = false) {
    if (!state.configured) return state.connection === "connected" ? openScope(undefined, false) : showConnection("connect");
    const cutoff = Math.min(22, state.dayCode);
    for (const code of range(16, cutoff)) {
      if (!state.reports.some((report) => report.dayCode === code) && state.tags.length) state.reports.push(makeDayReport(state, code));
    }
    state.reports.sort((a, b) => a.dayCode - b.dayCode || a.id - b.id);
    const week = makeWeeklyReport(state);
    if (!state.weeklyReports.some((item) => item.id === week.id)) state.weeklyReports.push(week);
    const sent = [...state.turns.panke, ...state.pendingReplies].some((turn) =>
      turn.type === "weekly" && state.weeklyReports.find((item) => item.id === turn.id)?.weekKey === week.weekKey && turn.proactive);
    if ((!proactive || state.summaryPrefs.weekly) && (!proactive || !sent)) {
      append({ type: "date", text: `${mockDays.find((day) => day.code === state.dayCode).label} · 周总结`, code: state.dayCode },
        { type: "weekly", id: week.id, proactive });
    }
    if (proactive) queueWeeklyReview(week);
    persist();
  }

  function simulateWeek() {
    if (activeReply || pendingScan) return notify("等这一条整理好，再看周总结。");
    if (!state.configured || state.connection !== "connected" || state.paused) return notify("开始监控后，可以查看本周总结。");
    cancelMoment();
    state.dayCode = 22;
    state.demoTime = "18:00";
    publishWeeklySummary(true);
  }

  function openSummarySettings(requested = true) {
    state.settingsDraft = { ...state.summaryPrefs, reviewMode: state.weeklyReviewMode };
    append(...(requested ? [{ type: "user", text: "我想调整总结和名单询问的安排。" }] : []), { type: "summary-settings" });
  }

  function saveSummarySettings() {
    if (!state.settingsDraft) return;
    state.summaryPrefs = { daily: state.settingsDraft.daily, weekly: state.settingsDraft.weekly };
    state.weeklyReviewMode = state.settingsDraft.reviewMode;
    state.settingsDraft = null;
    state.turns.panke = state.turns.panke.filter((turn) => turn.type !== "summary-settings");
    const summaries = [state.summaryPrefs.daily ? "每天一段总结" : "", state.summaryPrefs.weekly ? "每周一段总结" : ""].filter(Boolean).join("，");
    const review = state.weeklyReviewMode === "weekly" ? "每周我会问一次是否调整重点名单。" : "需要改名单时，等你主动告诉我。";
    append({ type: "user", text: "按我勾选的安排来。" },
      { type: "assistant", text: `安排已记下。${summaries ? `给你发${summaries}。` : "总结先按需问我就好。"}${review}重点客户有新朋友圈，仍会逐条提醒你。` });
  }

  function keepWeeklyFocus() {
    state.weeklyReviewMode = "manual";
    state.turns.panke = state.turns.panke.filter((turn) => turn.type !== "weekly-review");
    append({ type: "user", text: "重点名单先保持，之后我来改。" },
      { type: "assistant", text: "好，继续按现有名单留意朋友圈。之后需要改名单时，告诉我“更新重点客户”就好，我等你来安排。" });
  }

  async function copyAndOpenMoment(key) {
    const event = eventByKey[key];
    const person = customers.get(event.id);
    const copied = person.wechat ? await copyText(person.wechat, "微信号已复制") : false;
    if (signal.aborted) return;
    selectedMoment = key;
    showSheet("moment");
    $("copyFeedback").textContent = copied ? "微信号已复制" : person.wechat
      ? "微信号复制未完成，可以在这里长按微信号复制。" : "这位客户暂时没有微信号，可以先查看朋友圈内容。";
  }

  function renderOpportunityDetails(report) {
    if (!report) return "";
    const keys = reportKeys(report).filter((key) => !state.eventStatus[key] && (!eventByKey[key].expiresAt || eventByKey[key].expiresAt > report.time));
    return `<div class="assistant"><p class="message-text">${keys.length ? "我把值得进一步确认的变化和依据展开说一下。" : "这些变化已经有处理安排，先按原计划来就好。"}
  ${keys.slice(0, 5).map((key) => {
      const event = eventByKey[key];
      return `
  ${customers.get(event.id).name}：${event.reason || event.summary}
  原文“${event.source}”（${eventDate(event)}）。`;
    }).join("\n")}</p></div>`;
  }

  function switchScenario(next) {
    const scenario = allScenarios.find((scene) => scene.id === next);
    if (!scenario) return;
    clearTimeout(pendingScan?.timer);
    cancelMoment();
    clearTimeout(pendingConnection?.timer);
    cancelReplies();
    pendingScan = pendingConnection = null;
    closeSheet();
    openedReports.clear();
    openedDetails.clear();
    picker = null;
    state = makeState(next);
    renderChrome();
    renderChat(["daily", "priority", "weekly", "expired", "tag-error"].includes(next) ? "latest" : "top");

    if (next === "onboard") {
      state.turns.panke = [];
      append({ type: "connect" });
    }
    announce(`已切换到${scenario.title}`);
  }

  function matchPeople(message) {
    const relevant = [...customers.values()].filter((customer) => message.includes(customer.name))
      .filter((customer) => namedCustomers[customer.id]);
    return relevant.slice(0, 6).map((customer) => customer.id);
  }
  function latestCustomerEvent(id) {
    const keys = [...state.reports.flatMap(reportKeys), ...state.extras.map((item) => item.key)];
    return keys.reverse().find((key) => eventByKey[key].id === Number(id));
  }
  function sendMessage(value) {
    const text = value.trim();
    if (!text) return;
    append({ type: "user", text });


    if (/claw\s*bot/i.test(text)) return append({ type: "clawbot" });
    if (/隐私|权限范围|读取范围/.test(text)) return append({ type: "privacy" });
    if (/场景预览/.test(text)) return showSheet("scenarios");
    if (/每周.*(再问|问一次|询问|提醒.*名单)/.test(text) && !/不|别/.test(text)) {
      state.weeklyReviewMode = "weekly";
      return append({ type: "assistant", text: "记下了，今后每周总结时，我会问一次要不要调整重点名单。" });
    }
    if (/不.*(每周|主动).*问|以后.*我来改|先保持.*名单/.test(text)
      || (/先不改|先保持|不改了|不更改|不调整|保持不变/.test(text) && state.turns.panke.at(-2)?.type === "weekly-review")) return keepWeeklyFocus();
    if (/总结.*(设置|安排|频率)|调整.*(日报|周总结)|只要.*(日报|周总结)|(关闭|开启|打开|停用).*(日报|周总结)/.test(text)) {
      state.settingsDraft = { ...state.summaryPrefs, reviewMode: state.weeklyReviewMode };
      if (/只要.*周总结/.test(text)) { state.settingsDraft.daily = false; state.settingsDraft.weekly = true; }
      if (/只要.*日报/.test(text)) { state.settingsDraft.daily = true; state.settingsDraft.weekly = false; }
      if (/(关闭|停用).*日报/.test(text)) state.settingsDraft.daily = false;
      if (/(关闭|停用).*周总结/.test(text)) state.settingsDraft.weekly = false;
      if (/(开启|打开).*日报/.test(text)) state.settingsDraft.daily = true;
      if (/(开启|打开).*周总结/.test(text)) state.settingsDraft.weekly = true;
      return append({ type: "summary-settings" });
    }
    if (/周总结|这周.*(总结|近况|情况)/.test(text)) return publishWeeklySummary(false);
    if (/展开.*(商机|变化|跟进)|哪几个.*(商机|值得)|详细.*(商机|跟进)/.test(text)) {
      const report = state.reports.findLast((item) => item.dayCode === state.dayCode);
      return append({ type: "opportunity-details", id: report?.id });
    }
    const people = matchPeople(text);
    const tagMatches = tags.filter((tag) => tag.ids.length && text.includes(tag.name)).map((tag) => tag.id);
    if (/处理记录|联系记录/.test(text)) return append({ type: "records" });
    if (/今天.*(谁|情况|机会|跟进)|先.*联系谁|先.*跟进谁|还有谁|下一位/.test(text)) {
      return requestDailySummary();
    }
    if (/已联系|约好了|已约|等回复|发过了/.test(text)) {
      if (people.length > 1) {
        state.pendingResult = text;
        return append({ type: "candidate", ids: people, mode: "result" });
      }
      const key = people.length === 1 ? latestCustomerEvent(people[0]) : state.activeEvent;
      if (key) return recordFollowup(key, "contacted", text);
    }
    if (/隐私|读取范围|读取权限/.test(text)) return showSheet("privacy");
    if (/恢复.*监控|继续.*监控/.test(text)) return actions["resume-monitor"]();
    if (/暂停.*监控|停止.*监控/.test(text)) return showSheet("pause");
    if (/之前.*总结|总结记录|历史.*总结/.test(text)) return append({ type: "history" });
    if (/日报|简报|每日总结|今天.*总结/.test(text)) return requestDailySummary();
    if (/刷新.*朋友圈|刷新一下|再看.*朋友圈/.test(text)) return startScan();
    if (/监控.*(状态|怎么样)|有没有.*(朋友圈|新动态)|有人发/.test(text)) return append({ type: "activity" });
    if (/盘一下|盘一次|再查|今天有机会|检查一下|进度/.test(text)) {
      return /进度/.test(text) ? append({ type: "activity" }) : startScan(state.scenario);
    }
    if (/重点|重要客户|重要名单|特别关注/.test(text)) {
      if (people.length && /加|设为|移|取消|去掉/.test(text)) {
        return append({ type: "candidate", ids: people, mode: /移|去掉|取消/.test(text) ? "remove" : "focus" });
      }
      return openFocus(false);
    }
    if (tagMatches.length || /监控客户|监控名单|监控范围|更新监控|修改监控|范围|标签|我想关注|只看/.test(text)) return openScope(tagMatches.length ? tagMatches : undefined, false);
    if (people.length) {
      return people.length > 1 ? append({ type: "candidate", ids: people, mode: "customer" }) :
        append({ type: "customer", id: people[0] });
    }
    if (/连.*微信|扫码/.test(text)) return showConnection(state.connection === "expired" ? "expired" : "connect");
    append({ type: "assistant", text: "想改名单，直接说“更新监控客户”或“更新重点客户”；想看今天的概况，说“看看每日总结”就好。" });
  }



  async function copyText(value, success) {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
    } catch {
      const field = document.createElement("textarea");
      field.value = value;
      field.style.cssText = "position:fixed;left:-9999px;top:0";
      (sheet.open ? sheet : app).append(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      if (!copied) {
        notify("复制暂时没有成功，可以长按文本复制。");
        return false;
      }
    }
    notify(success);
    return true;
  }
  function copyOpening(key) {
    void copyText(state.openingDrafts[key] ?? eventByKey[key].opening, "开场白已复制");
  }
  async function copyWeChat(id) {
    const person = customers.get(Number(id));
    const copied = await copyText(person.wechat, `微信号已复制 · ${person.wechat}`);
    if (copied && $("copyFeedback")) $("copyFeedback").textContent = `微信号已复制 · ${person.wechat}`;
  }


  function candidateFocus(id, remove) {
    if (state.connection !== "connected") return showConnection("connect");
    state.focusDraft ||= { ...state.focus };
    if (remove) delete state.focusDraft[id];
    else state.focusDraft[id] = "instant";
    openPicker("all", id, !state.configured);
  }

  function restoreChatFocus(action, id) {
    const target = Array.from(stream.querySelectorAll(`[data-act="${action}"]`))
      .find((item) => item.dataset.id === id);
    target?.focus({ preventScroll: true });
  }

  function setEventStatus(id, value) {
    if (value === "later") return append({ type: "reminder", key: id });
    recordFollowup(id, "contacted", "已联系，等客户回复。");
  }

  function recordFollowup(key, status, result, remindAt = "") {
    const event = eventByKey[key];
    const person = customers.get(event.id);
    state.eventStatus[key] = status;
    if (status === "contacted") {
      const knownKeys = new Set([...state.reports.flatMap(reportKeys), ...state.extras.map((item) => item.key)]);
      for (const item of events.filter((item) => knownKeys.has(item.key) && item.id === event.id)) {
        if (!state.eventStatus[item.key] || state.eventStatus[item.key] === "later") state.eventStatus[item.key] = "contacted";
      }
      for (const record of state.followups) {
        if (eventByKey[record.key]?.id === event.id && record.status === "later") record.resolved = true;
      }
    }
    const day = mockDays.find((item) => item.code === state.dayCode).label;
    const record = { key, status, result, time: `${day} ${state.demoTime || "09:20"}`, remindAt };
    state.followups = state.followups.filter((item) => item.key !== key);
    state.followups.push(record);
    state.turns.panke = state.turns.panke.filter((turn) => !["followup", "reminder"].includes(turn.type));
    const request = state.turns.panke.at(-1);
    if (request?.type === "user" && request.text === result) append({ type: "receipt", record });
    else append({ type: "user", text: `${person.name}，${result}` }, { type: "receipt", record });
  }

  function simulateLiveMoment(kind = "priority") {
    if (activeReply || pendingScan || state.pendingMoment) return notify("我还在留意这轮动态，稍等一下。");
    if (state.connection !== "connected" || state.paused || !state.configured) return notify("开始监控后，可以查看客户的新朋友圈。");
    const focusIds = Object.keys(state.focus).map(Number);
    const ordinaryIds = [...idsFor(state.tags)].filter((id) => !state.focus[id]);
    const id = kind === "ordinary" ? ordinaryIds.includes(4) ? 4 : ordinaryIds[0]
      : focusIds.includes(2) ? 2 : focusIds[0];
    if (!id) return notify(kind === "ordinary" ? "每日总结名单里暂时没有普通监控客户，可以先修改监控名单。" : "先在 Chat 里选几位重点客户，再查看他们的新朋友圈。");
    const sequence = state.liveCount || 0;
    if (sequence >= 2) return notify("暂时没有新的朋友圈，我会继续留意。");
    const isLin = id === 2;
    const base = isLin ? eventByKey[sequence ? "lin-confirm" : "lin-life"] : {
      key: `mock-moment-${state.dayCode}-${id}-${sequence}`, id, dayCode: state.dayCode,
      source: casualMoments[sequence ? 2 : 1], summary: sequence ? "周末陪家人的安排" : "和老朋友聚餐的生活近况",
      time: sequence ? "18:26" : "18:12", opening: "看到您分享的近况了，最近过得怎么样？",
    };
    const event = { ...base, dayCode: state.dayCode };
    eventByKey[event.key] = event;
    state.pendingMoment = { event, dueAt: Date.now() + 12000 };
    persist();
    scheduleMoment();
  }

  function simulateNextDay() {
    if (activeReply || pendingScan) return notify("这轮刷新完成后，可以进入第二天。");
    if (state.connection !== "connected" || state.paused || !state.configured) return notify("先开始监控，再查看下一天。");
    if (state.dayCode >= 22) return notify("已经到本周最后一天，可以查看周总结。");
    cancelMoment();
    state.dayCode += 1;
    state.demoTime = "18:00";
    startScan("scheduled", null, true);
  }

  const actions = {
    scene: switchScenario,
    "mock-live": () => { closeSheet(); simulateLiveMoment(); },
    "mock-ordinary": () => { closeSheet(); simulateLiveMoment("ordinary"); },
    "mock-refresh": () => { closeSheet(); startScan(); },
    "mock-summary": () => { closeSheet(); requestDailySummary(); },
    "mock-next-day": () => { closeSheet(); simulateNextDay(); },
    "mock-week": () => { closeSheet(); simulateWeek(); },
    "week-summary": () => { append({ type: "user", text: "看看这周的朋友圈总结。" }); publishWeeklySummary(false); },
    "weekly-open": (id) => append({ type: "user", text: "回看这一周的总结。" }, { type: "weekly", id }),
    "weekly-edit-focus": () => {
      state.turns.panke = state.turns.panke.filter((turn) => turn.type !== "weekly-review");
      append({ type: "user", text: "这次我来调整一下重点名单。" });
      openFocus(false);
    },
    "weekly-keep-focus": keepWeeklyFocus,
    "summary-settings": () => { closeSheet(); openSummarySettings(); },
    "summary-settings-save": saveSummarySettings,
    "summary-settings-cancel": () => {
      state.settingsDraft = null;
      state.turns.panke = state.turns.panke.filter((turn) => turn.type !== "summary-settings");
      renderChat();
    },
    "moment-open": (key) => { selectedMoment = key; showSheet("moment"); },
    "copy-wechat": copyWeChat,
    "copy-open-moment": copyAndOpenMoment,
    "clawbot-demo": () => {
      state.clawBot = "demo";
      renderChat();
      notify("微信 ClawBot 已绑定");
    },
    "sheet-close": closeSheet,
    "sheet-back": () => showSheet(dialogParent),
    "directory-more": (id) => renderDirectory(Number(id)),
    "directory-customer": (id) => {
      selectedFriend = Number(id);
      showSheet("friend-detail", "directory");
    },
    "manage-connection": () => {
      closeSheet();
      goToPanke();
      if (state.connection === "connected") {
        append({ type: "assistant", text: "微信账号「周亦」已连接。当前的客户范围和最近检查结果都可以查看。" }, { type: "activity" });
      } else {
        showConnection(state.connection === "expired" ? "expired" : "connect");
      }
    },
    activity: () => append({ type: "user", text: "看看朋友圈监控进度。" }, { type: "activity" }),
    check: () => startScan(),
    "scan-stop": () => stopScan(),
    history: () => append({ type: "user", text: "看看这几天的日报。" }, { type: "history" }),
    today: () => { append({ type: "user", text: "看看今天的朋友圈总结。" }); requestDailySummary(); },
    records: () => append({ type: "user", text: "看看处理记录。" }, { type: "records" }),
    customer: (id) => append({ type: "user", text: `看看${customers.get(Number(id)).name}最近怎么样。` }, { type: "customer", id: Number(id) }),
    "daily-report": (id) => append({ type: "user", text: "展开这份日报。" }, { type: "report", id: Number(id) }),
    "history-open": (id) => {
      const report = state.reports.find((item) => item.id === Number(id));
      if (report) append({ type: "user", text: `看看${report.day}这份日报。` }, { type: "report", id: report.id });
    },
    scope: () => openScope(),
    "tag-preview": (id) => {
      tagPreviewId = id;
      tagPreviewLimit = 20;
      showSheet("tag-preview");
    },
    "tag-preview-more": () => {
      tagPreviewLimit += 20;
      const list = $("sheetContent").querySelector(".picker-list");
      const position = list.scrollTop;
      renderSheet();
      $("sheetContent").querySelector(".picker-list").scrollTop = position;
    },
    "tag-select": () => {
      if (!state.scopeDraft) return closeSheet();
      state.scopeDraft = state.scopeDraft.includes(tagPreviewId)
        ? state.scopeDraft.filter((id) => id !== tagPreviewId) : [...state.scopeDraft, tagPreviewId];
      closeSheet();
      renderChat();
      stream.querySelector(`[data-act="tag-preview"][data-id="${tagPreviewId}"]`)?.focus({ preventScroll: true });
    },
    "scope-save": confirmScope,
    "setup-picker": () => openPicker("all", 0, true),
    "setup-review": confirmSetupFocus,
    "setup-skip": () => {
      state.focusDraft = {};
      confirmSetupFocus();
    },
    "scope-cancel": () => {
      state.scopeDraft = null;
      state.setupStep = null;
      if (!state.configured) state.focusDraft = null;
      state.turns.panke = state.turns.panke.filter((turn) => turn.type !== "scope");
      renderChat();
    },
    "tags-refresh": () => {
      state.noTags = false;
      state.unavailableTags = [];
      renderChat();
      notify("微信标签已刷新");
    },
    "pause-confirm": () => showSheet("pause"),
    "pause-save": () => {
      if (pendingScan) stopScan(false);
      cancelMoment();
      state.paused = true;
      state.scopeDraft = null;
      state.turns.panke = state.turns.panke.filter((turn) => turn.type !== "scope");
      closeSheet();
      append({ type: "assistant", text: "朋友圈监控已暂停。想继续时，在这里说“恢复监控”就好。" });
    },
    "resume-monitor": () => {
      state.paused = false;
      append({ type: "assistant", text: "好，继续监控朋友圈。我会每天整理监控客户的总结，重点客户发了新朋友圈就直接提醒你。" });
      startScan();
    },
    focus: openFocus,
    "focus-picker": (id) => openPicker(id || "all"),
    "focus-save": saveFocus,
    "cancel-focus": () => {
      state.focusDraft = null;
      persist();
      closeSheet();
    },
    "picker-filter": (id) => {
      picker.filter = id;
      picker.candidate = 0;
      picker.limit = 20;
      $("pickerRows").scrollTop = 0;
      updatePicker();
      $("pickerFilters").querySelector(`[data-id="${id}"]`)?.focus({ preventScroll: true });
    },
    "picker-more": () => {
      picker.limit += 20;
      updatePicker();
    },
    "clear-filters": () => {
      Object.assign(picker, { query: "", filter: "all", stage: "", candidate: 0, limit: 20 });
      renderPicker();
      $("pickerQuery").focus();
    },
    "batch-add": () => {
      for (const customer of matchesPicker()) state.focusDraft[customer.id] ||= "instant";
      updatePicker();
      persist();
    },
    "batch-remove": () => {
      for (const customer of matchesPicker()) delete state.focusDraft[customer.id];
      updatePicker();
      persist();
    },
    "candidate-focus": (id) => candidateFocus(Number(id), false),
    "candidate-remove": (id) => candidateFocus(Number(id), true),
    "candidate-customer": (id) => append({ type: "customer", id: Number(id) }),
    "candidate-result": (id) => {
      const key = latestCustomerEvent(id);
      if (key) recordFollowup(key, "contacted", state.pendingResult || "已联系，等客户回复。");
      else append({ type: "assistant", text: "这位客户暂时没有关联的动态，我先把客户档案发给你。" }, { type: "customer", id: Number(id) });
      state.pendingResult = "";
    },
    "connect-card": () => showConnection("connect"),
    reconnect: () => showConnection("expired"),
    "connect-start": startConnection,
    "connect-refresh": () => setConnectionStage("preparing", "qr"),
    "connect-scan": () => setConnectionStage("recognizing", "phone"),
    "connect-phone": () => setConnectionStage("verifying", "verify"),
    "connect-cancel": () => setConnectionStage(null),
    "connect-confirm": confirmConnection,
    "connect-later": () => {
      const turn = state.turns.panke.findLast((item) => item.type === "connect" && !item.done);
      if (turn) turn.deferred = true;
      setConnectionStage(null);
    },
    retry: (id) => {
      const report = state.reports.find((item) => item.id === Number(id));
      if (report?.retried) return actions["history-open"](String(report.retried));
      if (report?.tagIds?.join(",") !== state.tags.join(",")) {
        append({ type: "assistant", text: "关注范围已经变更。我可以按现在的范围重新检查一轮。" }, { type: "activity" });
        return;
      }
      if (report) startScan("quiet", report);
    },
    detail: (id) => {
      if (openedDetails.has(id)) openedDetails.delete(id);
      else openedDetails.add(id);
      renderChat();
      restoreChatFocus("detail", id);
    },
    "more-report": (id) => {
      const reportId = Number(id);
      const wasOpen = openedReports.has(reportId);
      if (wasOpen) openedReports.delete(reportId);
      else openedReports.add(reportId);
      renderChat();
      if (wasOpen) restoreChatFocus("more-report", id);
      else {
        const report = stream.querySelector(`[data-report-id="${id}"]`);
        const next = report?.querySelectorAll(".opportunity")[3];
        if (next) chat.scrollTop += next.getBoundingClientRect().top - chat.getBoundingClientRect().top - 12;
      }
    },
    opening: (key) => {
      state.activeEvent = key;
      append({ type: "user", text: `帮我想想怎么和${customers.get(eventByKey[key].id).name}开口。` }, { type: "opening", key });
    },
    followup: (key) => {
      state.activeEvent = key;
      append({ type: "user", text: "帮我记录这次联系结果。" }, { type: "followup", key });
    },
    "mock-wechat": (key) => {
      state.activeEvent = key;
      append({ type: "user", text: "我去微信联系一下，回来记录结果。" }, { type: "followup", key });
    },
    "result-confirmed": (key) => {
      const result = ["visit", "lin-confirm"].includes(key) ? "已约 11 月 21 日周六 14:00 试驾。"
        : key === "hangzhou" ? `已约 11 月 ${state.dayCode} 日 15:00 见面。` : "已沟通，等客户回复。";
      recordFollowup(key, "contacted", result);
    },
    "result-waiting": (key) => recordFollowup(key, "contacted", "已联系，等客户回复。"),
    "result-unrelated": (key) => recordFollowup(key, "unrelated", "这次不用跟进，继续留意新动态。"),
    "remind-today": (key) => {
      const time = `11 月 ${state.dayCode} 日 15:00`;
      recordFollowup(key, "later", `${time} 再联系。`, time);
    },
    "remind-tomorrow": (key) => {
      const time = `11 月 ${state.dayCode + 1} 日 09:00`;
      recordFollowup(key, "later", `${time} 再联系。`, time);
    },
    copy: copyOpening,
    contacted: (id) => setEventStatus(id, "contacted"),
    later: (id) => setEventStatus(id, "later"),
  };
  const changes = {
    "summary-daily": (field) => { state.settingsDraft.daily = field.checked; persist(); },
    "summary-weekly": (field) => { state.settingsDraft.weekly = field.checked; persist(); },
    "summary-review": (field) => { state.settingsDraft.reviewMode = field.checked ? "weekly" : "manual"; persist(); },
    tag: (field) => {
      state.scopeDraft = field.checked
        ? [...new Set([...state.scopeDraft, field.value])]
        : state.scopeDraft.filter((id) => id !== field.value);
      renderChat();
      stream.querySelector(`input[data-change="tag"][value="${field.value}"]`)?.focus({ preventScroll: true });
    },
    stage: (field) => {
      picker.stage = field.value;
      picker.candidate = 0;
      picker.limit = 20;
      $("pickerRows").scrollTop = 0;
      updatePicker();
    },
    customer: (field) => {
      if (field.checked) state.focusDraft[field.value] ||= "instant";
      else delete state.focusDraft[field.value];
      updatePicker();
      persist();
    },
    briefing: (field) => { state.prefs.briefing = field.checked; persist(); },
    urgent: (field) => { state.prefs.urgent = field.checked; persist(); },
  };

  root.addEventListener("click", (event) => {
    const target = event.target.closest("[data-act]");
    if (target && !target.disabled) {
      if (activeReply && target.closest(".chat, .quick, .status-slot") && !["detail", "more-report"].includes(target.dataset.act)) {
        notify("Soker 正在整理这条回复，稍等一下。");
        return;
      }
      actions[target.dataset.act]?.(target.dataset.id);
    }
    if (event.target === sheet) {
      const bounds = sheet.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top) closeSheet();
    }
  }, { signal });

  root.addEventListener("change", (event) => {
    const field = event.target;
    if (field.dataset.change) changes[field.dataset.change]?.(field);
  }, { signal });

  root.addEventListener("input", (event) => {
    const field = event.target;
    if (field.id === "pickerQuery") {
      picker.query = field.value;
      picker.candidate = 0;
      picker.limit = 20;
      $("pickerRows").scrollTop = 0;
      updatePicker();
    } else if (field.id === "directoryQuery") {
      renderDirectory();
    } else if (field.dataset.draft) {
      state.openingDrafts[field.dataset.draft] = field.value;
      persist();
    }
  }, { signal });

  sheet.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeSheet();
  }, { signal });

  function repositionOpenSheet() {
    if (sheet.open) positionSheet();
  }

  window.addEventListener("resize", repositionOpenSheet, { signal });
  window.visualViewport?.addEventListener("resize", repositionOpenSheet, { signal });
  window.visualViewport?.addEventListener("scroll", repositionOpenSheet, { signal });

  renderChrome();
  const resumeAtLatest = ["daily", "priority", "weekly", "expired"].includes(state.scenario) || (state.scenario === "onboard" && state.configured);
  renderChat(resumeAtLatest ? "latest" : "top");

  // Older sessions could stop at the separate start-monitoring button.
  if (!state.configured && state.setupStep === "review" && state.connection === "connected" && state.scopeDraft?.length) {
    state.pendingReplies = state.pendingReplies.filter((turn) => turn.type !== "setup-review");
    saveScope(state.focusDraft || {});
  }
  if (state.pendingReplies.length) pumpReplies();
  if (state.pendingMoment && !state.paused) scheduleMoment();
  if (state.pendingRefresh && !state.paused && state.connection === "connected") {
    const pending = state.pendingRefresh;
    startScan(pending.proactive ? "scheduled" : "refresh", state.reports.find((report) => report.id === pending.retryId) || null, pending.deliverSummary);
  }

  return {
    send(text) {
      if (!text.trim()) return false;
      if (activeReply || state.pendingReplies.length) {
        notify("Soker 正在整理这条回复，稍等一下。");
        return false;
      }
      sendMessage(text);
      return true;
    },
    openFriends() {
      showSheet("directory");
    },
    dispose() {
      listeners.abort();
      clearTimeout(toastTimer);
      clearTimeout(pendingScan?.timer);
      clearTimeout(pendingConnection?.timer);
      clearTimeout(liveTimer);
      clearTimeout(replyTimer);
      for (const resolve of replyWaiters.values()) resolve(false);
      replyWaiters.clear();
      if (sheet.open) sheet.close();
    },
  };
}
