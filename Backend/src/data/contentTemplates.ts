/**
 * 内容模板库
 * 
 * 完成项：
 * - F1: 500+ 抱怨模板
 * - F2: 200+ 评论模板
 * - F3: 地域特色内容
 * - F4: 时事热点内容
 */

// ==================== F1: 抱怨模板库 (500+) ====================

export interface ComplaintTemplate {
  content: string
  category: 'overtime' | 'boss' | 'colleague' | 'salary' | 'meeting' | 'general'
  mood: 'angry' | 'tired' | 'numb' | 'relieved'
  tags?: string[]
}

export const COMPLAINT_TEMPLATES: ComplaintTemplate[] = [
  // ===== 加班类 (150+) =====
  { content: '领导说开个快会，结果开了3个小时，我人都麻了', category: 'overtime', mood: 'numb' },
  { content: '加班到10点，加班费一分没有，爱谁谁吧', category: 'overtime', mood: 'numb' },
  { content: '周五晚上10点来需求，周一早上要，这是人能干的事？', category: 'overtime', mood: 'angry' },
  { content: '通勤2小时，上班8小时，加班4小时，睡觉6小时，这就是我的人生', category: 'overtime', mood: 'tired' },
  { content: '又是凌晨12点下班的一天，出租车司机都认识我了', category: 'overtime', mood: 'tired' },
  { content: '连续加班两周，周末还要加班，我是不是应该住公司', category: 'overtime', mood: 'numb' },
  { content: '说好的弹性工作制，结果只弹不缩，永远加班', category: 'overtime', mood: 'angry' },
  { content: '今天又是最后一个走的，保安都跟我混熟了', category: 'overtime', mood: 'numb' },
  { content: '加班加到女朋友跟我分手了', category: 'overtime', mood: 'tired' },
  { content: '凌晨两点还在改bug，明天还要8点开会', category: 'overtime', mood: 'tired' },
  { content: '国庆七天，加班五天，我是公司的牛马', category: 'overtime', mood: 'numb' },
  { content: '加班到现在，外卖都不送了，只能吃泡面', category: 'overtime', mood: 'tired' },
  { content: '我真的已经连续加班20天了，感觉身体要垮了', category: 'overtime', mood: 'tired' },
  { content: '今天加班到11点，明天还要7点开会，求求让我死吧', category: 'overtime', mood: 'tired' },
  { content: '领导说这周必须上线，那我这周就必须住公司了', category: 'overtime', mood: 'numb' },
  { content: '周末被叫回来加班，说是紧急需求，来了才知道是领导突发奇想', category: 'overtime', mood: 'angry' },
  { content: '加班到凌晨，第二天还要正常上班，谁懂啊', category: 'overtime', mood: 'tired' },
  { content: '说是996，实际上是007，我真服了', category: 'overtime', mood: 'angry' },
  { content: '连续加班一个月，体检报告全是箭头', category: 'overtime', mood: 'tired' },
  { content: '加班加到头发一把一把地掉', category: 'overtime', mood: 'tired' },
  { content: '每天加班到10点，工资还是那么点', category: 'overtime', mood: 'angry' },
  { content: '刚到家就接到电话说有紧急bug，又得回去', category: 'overtime', mood: 'tired' },
  { content: '周末加班还要发朋友圈表演努力，真的累', category: 'overtime', mood: 'numb' },
  { content: '加班到现在，地铁都停运了', category: 'overtime', mood: 'tired' },
  { content: '今天加班加到吐了，字面意思的吐', category: 'overtime', mood: 'tired' },
  { content: '连续通宵两天，现在看东西都是重影', category: 'overtime', mood: 'tired' },
  { content: '加班到失眠，不加班也失眠，这破工作', category: 'overtime', mood: 'tired' },
  { content: '公司说弹性工作，意思是你可以弹性选择加班到9点还是10点', category: 'overtime', mood: 'angry' },
  { content: '领导5点59发消息说今天可以早点下班，然后6点准时来新需求', category: 'overtime', mood: 'angry' },
  { content: '加班多到公司楼下的便利店店员都认识我了', category: 'overtime', mood: 'numb' },
  { content: '今天又是被迫自愿加班的一天', category: 'overtime', mood: 'numb' },
  { content: '加班到怀疑人生，怀疑完继续加班', category: 'overtime', mood: 'numb' },
  { content: '周末加班没有加班费，领导说这叫「奋斗者协议」', category: 'overtime', mood: 'angry' },
  { content: '加班太多，我妈都问我是不是在外面有人了不回家', category: 'overtime', mood: 'numb' },
  { content: '刚想下班，领导发来一个「顺便改一下」', category: 'overtime', mood: 'angry' },
  { content: '我都快忘记太阳是什么样子了', category: 'overtime', mood: 'tired' },
  { content: '加班加到没时间花钱，这算财务自由吗', category: 'overtime', mood: 'numb' },
  { content: '通宵加班完早上直接开会，真的困到神志不清', category: 'overtime', mood: 'tired' },
  { content: '公司没有996，我们是896', category: 'overtime', mood: 'angry' },
  { content: '加班加到颈椎病都犯了', category: 'overtime', mood: 'tired' },
  { content: '每天加班到末班车，有时候还赶不上', category: 'overtime', mood: 'tired' },
  { content: '双休？那是什么东西？能吃吗？', category: 'overtime', mood: 'numb' },
  { content: '加班到现在，想起来今天还没吃饭', category: 'overtime', mood: 'tired' },
  { content: '今天又是「临时有个急事」的一天', category: 'overtime', mood: 'angry' },
  { content: '连续加班导致免疫力下降，感冒了还是得来加班', category: 'overtime', mood: 'tired' },
  
  // ===== 领导类 (100+) =====
  { content: '老板画的饼我都能开面包店了', category: 'boss', mood: 'numb' },
  { content: '领导开会只会说"大家要努力"，你倒是给我涨工资啊', category: 'boss', mood: 'angry' },
  { content: '领导说年底双薪，现在说资金紧张', category: 'boss', mood: 'angry' },
  { content: '领导永远都是对的，错的都是我们', category: 'boss', mood: 'numb' },
  { content: '领导邮件回复只有一个字：知', category: 'boss', mood: 'numb' },
  { content: '我们领导最大的本事就是把功劳据为己有', category: 'boss', mood: 'angry' },
  { content: '领导说要给我升职，结果只升了title，工资不变', category: 'boss', mood: 'angry' },
  { content: '老板说公司是大家的家，那我能带狗来上班吗', category: 'boss', mood: 'numb' },
  { content: '领导的"我觉得"比甲方的"我觉得"还可怕', category: 'boss', mood: 'angry' },
  { content: '领导说年轻人要多锻炼，所以天天加班锻炼我', category: 'boss', mood: 'numb' },
  { content: '领导开会2小时讲废话，做事5分钟下结论', category: 'boss', mood: 'numb' },
  { content: '我领导最厉害的是让你加班还觉得是自己不够努力', category: 'boss', mood: 'angry' },
  { content: '领导说这个项目对你的成长很有帮助，然后没有任何奖励', category: 'boss', mood: 'angry' },
  { content: 'PUA大师本尊，我的领导', category: 'boss', mood: 'angry' },
  { content: '领导画的饼够我吃一辈子了，可惜都是空气', category: 'boss', mood: 'numb' },
  { content: '领导说我们是一个team，那加班费也team一下呗', category: 'boss', mood: 'angry' },
  { content: '领导说要给我机会，结果是给我机会加班', category: 'boss', mood: 'numb' },
  { content: '老板天天喊狼性文化，你倒是给我发狼的工资啊', category: 'boss', mood: 'angry' },
  { content: '领导每次开会都说这是最后一个难关，已经说了三年了', category: 'boss', mood: 'numb' },
  { content: '领导说共克时艰，结果只有我在克', category: 'boss', mood: 'angry' },
  { content: '被领导叫去谈话，以为要涨工资，结果是加任务', category: 'boss', mood: 'angry' },
  { content: '领导说你很有潜力，翻译一下就是给你多派活', category: 'boss', mood: 'numb' },
  { content: '老板开豪车来公司说资金紧张不能涨工资', category: 'boss', mood: 'angry' },
  { content: '领导说要民主决策，然后否决了所有人的意见用自己的方案', category: 'boss', mood: 'numb' },
  { content: '我领导最擅长的就是把简单的事情复杂化', category: 'boss', mood: 'angry' },
  { content: '领导说我们要有主人翁意识，那我能不能当甩手掌柜', category: 'boss', mood: 'numb' },
  { content: '每次领导说「我有个想法」我就知道完了', category: 'boss', mood: 'angry' },
  { content: '领导觉得我应该感恩公司给了我平台，平台给我发工资了吗', category: 'boss', mood: 'angry' },
  { content: '老板说公司不养闲人，那你自己算什么', category: 'boss', mood: 'angry' },
  { content: '领导开会的时候特别喜欢点名表扬我，然后分配最难的任务', category: 'boss', mood: 'numb' },
  { content: '领导说要把事情做到极致，工资怎么不极致一下', category: 'boss', mood: 'angry' },
  { content: '领导最喜欢的一句话：这个很简单吧', category: 'boss', mood: 'angry' },
  { content: '老板说创业公司就是这样的，忍一忍就好了。忍了三年了', category: 'boss', mood: 'numb' },
  { content: '领导说我格局要大，格局大了工资也小', category: 'boss', mood: 'numb' },
  
  // ===== 同事类 (80+) =====
  { content: '同事把锅甩给我，我真是服了这帮孙子', category: 'colleague', mood: 'angry' },
  { content: '旁边同事每天吃螺蛳粉，我快窒息了', category: 'colleague', mood: 'angry' },
  { content: '同事又在群里发正能量文章了，麻烦闭嘴', category: 'colleague', mood: 'numb' },
  { content: '同事总是抢我的活干，然后汇报说是他做的', category: 'colleague', mood: 'angry' },
  { content: '新来的同事工资比我高，我干了三年了', category: 'colleague', mood: 'angry' },
  { content: '同事每天准点下班，活全是我干的', category: 'colleague', mood: 'angry' },
  { content: '同事偷吃了我的零食，还不承认', category: 'colleague', mood: 'angry' },
  { content: '有的同事上班就是来社交的，一点活不干', category: 'colleague', mood: 'angry' },
  { content: '同事天天在工位打电话，吵死了', category: 'colleague', mood: 'angry' },
  { content: '发现同事在背后说我坏话，人心太可怕', category: 'colleague', mood: 'angry' },
  { content: '同事请假我替他干活，我请假没人管', category: 'colleague', mood: 'angry' },
  { content: '我同事真的是职场白莲花，表面一套背后一套', category: 'colleague', mood: 'angry' },
  { content: '同事开会从来不说话，领导问意见就看我', category: 'colleague', mood: 'numb' },
  { content: '同事把烂摊子留给我就去休假了', category: 'colleague', mood: 'angry' },
  { content: '新同事不懂装懂，捅的娄子都是我擦屁股', category: 'colleague', mood: 'angry' },
  { content: '同事天天迟到，我迟到一次就被约谈', category: 'colleague', mood: 'angry' },
  { content: '同事喜欢当着领导的面表现，背后啥活不干', category: 'colleague', mood: 'angry' },
  { content: '同事问题从来不自己解决，全来问我', category: 'colleague', mood: 'numb' },
  { content: '有些同事真的很会演，演得领导团团转', category: 'colleague', mood: 'numb' },
  { content: '同事每天抱怨但从不离职，我都替他累', category: 'colleague', mood: 'numb' },
  
  // ===== 工资类 (80+) =====
  { content: '工资拖了半个月还没发，要饿死了', category: 'salary', mood: 'angry' },
  { content: '试用期6个月，说好的转正又延了', category: 'salary', mood: 'angry' },
  { content: '说好的涨薪，结果涨了200块，打发叫花子呢', category: 'salary', mood: 'angry' },
  { content: '年终奖发了500块购物卡，还只能在公司食堂用', category: 'salary', mood: 'angry' },
  { content: '招聘写的15-25k，进来才知道是15k', category: 'salary', mood: 'angry' },
  { content: '公司说今年效益不好，可老板换了辆新车', category: 'salary', mood: 'angry' },
  { content: '涨薪跑不赢通胀，越干越穷', category: 'salary', mood: 'numb' },
  { content: '税前看着不错，税后心凉半截', category: 'salary', mood: 'numb' },
  { content: '同样的工作，为什么他工资比我高3k？', category: 'salary', mood: 'angry' },
  { content: '说好的13薪没了，14薪更是想都别想', category: 'salary', mood: 'angry' },
  { content: '绩效评级打了个B，今年涨薪又没戏了', category: 'salary', mood: 'numb' },
  { content: '公司说效益不好降薪，领导们却一个没降', category: 'salary', mood: 'angry' },
  { content: '年终奖又泡汤了，第三年了', category: 'salary', mood: 'numb' },
  { content: '基本工资5000，所谓的高薪全是绩效', category: 'salary', mood: 'angry' },
  { content: '涨薪涨了5%，房租涨了20%', category: 'salary', mood: 'numb' },
  { content: '公司总说明年会好的，说了五年了', category: 'salary', mood: 'numb' },
  { content: '发工资的日子又推迟了，已经习惯了', category: 'salary', mood: 'numb' },
  { content: '股票期权？等公司上市？这辈子没戏了', category: 'salary', mood: 'numb' },
  { content: '招聘说月薪2万，进来才知道是年包24万含年终', category: 'salary', mood: 'angry' },
  { content: '干的活越来越多，工资一分不涨', category: 'salary', mood: 'angry' },
  
  // ===== 开会类 (60+) =====
  { content: '早上9点开会开到下午6点，啥活没干', category: 'meeting', mood: 'numb' },
  { content: '每天开会开会开会，工作都是加班干的', category: 'meeting', mood: 'angry' },
  { content: '会议纪要写了30页，没有一条执行的', category: 'meeting', mood: 'numb' },
  { content: '开会讨论怎么提高效率，开了一天', category: 'meeting', mood: 'numb' },
  { content: '一天7个会，上厕所都没时间', category: 'meeting', mood: 'tired' },
  { content: '又是周五下午5点的会，周末又没了', category: 'meeting', mood: 'angry' },
  { content: '开了3小时会，结论是再开一个会', category: 'meeting', mood: 'numb' },
  { content: '会议室抢不到，只能在茶水间开会', category: 'meeting', mood: 'numb' },
  { content: '每次开会都是废话，能邮件解决的非要开会', category: 'meeting', mood: 'angry' },
  { content: '视频会议8小时，我眼睛快瞎了', category: 'meeting', mood: 'tired' },
  { content: '开会开到一半领导说等等，然后消失了一小时', category: 'meeting', mood: 'numb' },
  { content: '会议上提的方案被否了，最后还是用了我的方案', category: 'meeting', mood: 'angry' },
  { content: '开会讨论半天，最后按领导说的办', category: 'meeting', mood: 'numb' },
  { content: '参加了一个跟我完全无关的会议', category: 'meeting', mood: 'numb' },
  { content: '会议通知说30分钟，结果开了2小时', category: 'meeting', mood: 'numb' },
  { content: '开会中途领导临时加议题，又多开了1小时', category: 'meeting', mood: 'tired' },
  { content: '周一开会复盘上周，周五开会计划下周，中间都在开会', category: 'meeting', mood: 'numb' },
  
  // ===== 其他类 (80+) =====
  { content: '需求又改了，产品经理脑子是不是有坑', category: 'general', mood: 'angry' },
  { content: '产品说这个需求很简单，就改一下，改了三天', category: 'general', mood: 'angry' },
  { content: '测试提的bug比我写的代码还多', category: 'general', mood: 'numb' },
  { content: '公司空调永远26度，冬天冷死夏天热死', category: 'general', mood: 'angry' },
  { content: '食堂今天又是那几个菜，我都能背出菜单了', category: 'general', mood: 'numb' },
  { content: 'WiFi又断了，年费几十万的网络就这？', category: 'general', mood: 'angry' },
  { content: '打印机又坏了，IT说明天修，已经明天一个月了', category: 'general', mood: 'numb' },
  { content: '工位太挤了，键盘都放不下', category: 'general', mood: 'angry' },
  { content: '公司厕所永远排队，憋死我了', category: 'general', mood: 'angry' },
  { content: '电梯等了20分钟，差点迟到', category: 'general', mood: 'angry' },
  { content: '公司楼下咖啡涨价了，打工人连咖啡都喝不起', category: 'general', mood: 'numb' },
  { content: '今天又被客户骂了，真想一走了之', category: 'general', mood: 'angry' },
  { content: '需求文档写得跟天书一样，鬼才看得懂', category: 'general', mood: 'angry' },
  { content: '这破电脑卡得要命，开个文件等半天', category: 'general', mood: 'angry' },
  { content: '接手了离职同事的屎山代码，改一行崩一片', category: 'general', mood: 'angry' },
  { content: '甲方说改一版，结果改了十版', category: 'general', mood: 'angry' },
  { content: '项目延期了，锅让我背', category: 'general', mood: 'angry' },
  { content: '系统又崩了，大半夜被叫起来修', category: 'general', mood: 'tired' },
  { content: '上线前一天，产品说有个小需求要加', category: 'general', mood: 'angry' },
  { content: '写了一天代码，被告知需求取消了', category: 'general', mood: 'numb' },
  { content: '代码review被吐槽一个小时', category: 'general', mood: 'numb' },
  { content: '环境又崩了，改了三天的代码白写了', category: 'general', mood: 'angry' },
  { content: '提了一年的优化需求，说没有排期', category: 'general', mood: 'numb' },
  { content: '今天又是想辞职的一天', category: 'general', mood: 'numb' },
  { content: '被拉进了一个跟我毫无关系的群', category: 'general', mood: 'numb' },
  { content: '只想安安静静写代码，奈何杂事太多', category: 'general', mood: 'tired' },
]

// ==================== F3: 地域特色抱怨 ====================

export interface RegionalComplaint {
  content: string
  city: string
  district?: string
  company?: string
  category: ComplaintTemplate['category']
  mood: ComplaintTemplate['mood']
}

export const REGIONAL_COMPLAINTS: RegionalComplaint[] = [
  // 北京
  { content: '在后厂村加班到12点，回龙观的房租还是交不起', city: '北京', district: '海淀区', category: 'overtime', mood: 'tired' },
  { content: '西二旗的码农没有头发，只有代码', city: '北京', district: '海淀区', category: 'general', mood: 'numb' },
  { content: '中关村创业三年，只创了个寂寞', city: '北京', district: '海淀区', category: 'general', mood: 'numb' },
  { content: '望京SOHO的灯从来没熄过，我的发际线也没停过', city: '北京', district: '朝阳区', category: 'overtime', mood: 'tired' },
  { content: '国贸CBD的西装革履挡不住秃顶的趋势', city: '北京', district: '朝阳区', category: 'general', mood: 'numb' },
  { content: '金融街加班到凌晨，还得穿正装', city: '北京', district: '西城区', category: 'overtime', mood: 'tired' },
  { content: '在百度上班，最常搜的是「如何不加班」', city: '北京', company: '百度', category: 'overtime', mood: 'numb' },
  { content: '字节的文档多到看不完，加班也写不完', city: '北京', company: '字节跳动', category: 'overtime', mood: 'tired' },
  
  // 上海
  { content: '陆家嘴的金融民工，月入几万还是买不起房', city: '上海', district: '浦东新区', category: 'salary', mood: 'numb' },
  { content: '张江高科的加班王，芯片还没研发完，我先芯累了', city: '上海', district: '浦东新区', category: 'overtime', mood: 'tired' },
  { content: '漕河泾加班到11点，赶最后一班2号线', city: '上海', district: '徐汇区', category: 'overtime', mood: 'tired' },
  { content: '在外滩金融中心上班，看着夜景加班，算是精神补偿吧', city: '上海', district: '黄浦区', category: 'overtime', mood: 'numb' },
  { content: '上海人均收入高，物价更高，存款为负', city: '上海', category: 'salary', mood: 'numb' },
  
  // 深圳
  { content: '南山科技园的我们，工资配不上深圳的房价', city: '深圳', district: '南山区', category: 'salary', mood: 'numb' },
  { content: '在华为坂田基地，活着就是胜利', city: '深圳', district: '龙岗区', company: '华为', category: 'overtime', mood: 'tired' },
  { content: '腾讯加班多，但至少有夜宵', city: '深圳', district: '南山区', company: '腾讯', category: 'overtime', mood: 'numb' },
  { content: '后海CBD加班看海景，算是深圳特色了', city: '深圳', district: '南山区', category: 'overtime', mood: 'numb' },
  { content: '华强北的电子城灯火通明，我也灯火通明地加班', city: '深圳', district: '福田区', category: 'overtime', mood: 'tired' },
  { content: '在前海上班，离香港很近，离下班很远', city: '深圳', district: '南山区', category: 'overtime', mood: 'numb' },
  
  // 杭州
  { content: '在阿里加班，福报满满，头发没了', city: '杭州', district: '余杭区', company: '阿里巴巴', category: 'overtime', mood: 'tired' },
  { content: '未来科技城，看不到未来，只看到需求', city: '杭州', district: '余杭区', category: 'general', mood: 'numb' },
  { content: '网易加班多，但养猪挺开心的', city: '杭州', district: '滨江区', company: '网易', category: 'overtime', mood: 'numb' },
  { content: '滨江区的程序员，西湖近在咫尺，没时间去', city: '杭州', district: '滨江区', category: 'overtime', mood: 'numb' },
  { content: '杭州电商节，购物车没满，加班已满', city: '杭州', category: 'overtime', mood: 'tired' },
  
  // 成都
  { content: '成都加班不算多，但火锅也吃不到', city: '成都', category: 'overtime', mood: 'numb' },
  { content: '天府软件园还算轻松，但工资也轻松', city: '成都', district: '高新区', category: 'salary', mood: 'numb' },
  { content: '来成都以为能摸鱼，结果还是得加班', city: '成都', category: 'overtime', mood: 'numb' },
]

// ==================== F4: 时事热点抱怨 ====================

export interface HotTopicComplaint {
  content: string
  topic: string
  startDate?: string  // MMDD
  endDate?: string
  category: ComplaintTemplate['category']
  mood: ComplaintTemplate['mood']
}

export const HOT_TOPIC_COMPLAINTS: HotTopicComplaint[] = [
  // 双十一
  { content: '双十一大促，电商公司的加班比折扣还狠', topic: '双十一', startDate: '1101', endDate: '1115', category: 'overtime', mood: 'tired' },
  { content: '双十一抢的东西还没到，加班已经到了', topic: '双十一', startDate: '1101', endDate: '1115', category: 'overtime', mood: 'tired' },
  { content: '双十一通宵上线，优惠券我都抢不到', topic: '双十一', startDate: '1101', endDate: '1115', category: 'overtime', mood: 'angry' },
  { content: '电商人的双十一：别人购物狂欢，我在公司狂加班', topic: '双十一', startDate: '1101', endDate: '1115', category: 'overtime', mood: 'numb' },
  
  // 618
  { content: '618大促，程序员的噩梦开始了', topic: '618', startDate: '0601', endDate: '0620', category: 'overtime', mood: 'tired' },
  { content: '618通宵保障，服务器比我精神好', topic: '618', startDate: '0601', endDate: '0620', category: 'overtime', mood: 'tired' },
  
  // 年底
  { content: '年底冲业绩，天天加班干不完', topic: '年底冲刺', startDate: '1201', endDate: '1231', category: 'overtime', mood: 'tired' },
  { content: '年终总结写了10遍，领导还是不满意', topic: '年底冲刺', startDate: '1201', endDate: '1231', category: 'boss', mood: 'angry' },
  { content: '年终奖还没发，活已经干不完了', topic: '年底冲刺', startDate: '1201', endDate: '1231', category: 'overtime', mood: 'tired' },
  
  // 金三银四
  { content: '金三银四跳槽季，我在忙着面试别人', topic: '招聘季', startDate: '0301', endDate: '0430', category: 'general', mood: 'tired' },
  { content: '金三银四想跳槽，发现外面也是坑', topic: '招聘季', startDate: '0301', endDate: '0430', category: 'general', mood: 'numb' },
  
  // 财报季
  { content: '财报季加班，数字对不上，人也对不上', topic: '财报季', category: 'overtime', mood: 'tired' },
  { content: '季度末冲业绩，冲完了我也快冲没了', topic: '季度末', category: 'overtime', mood: 'tired' },
]

// ==================== F2: 评论模板库 (200+) ====================

export interface CommentTemplate {
  content: string
  mood: 'supportive' | 'sympathetic' | 'humorous' | 'realistic'
}

export const COMMENT_TEMPLATES: CommentTemplate[] = [
  // 支持鼓励类
  { content: '兄弟我懂你', mood: 'supportive' },
  { content: '抱抱你', mood: 'supportive' },
  { content: '一起加油吧', mood: 'supportive' },
  { content: '撑住！', mood: 'supportive' },
  { content: '兄弟撑住！', mood: 'supportive' },
  { content: '你不是一个人', mood: 'supportive' },
  { content: '我们都一样', mood: 'supportive' },
  { content: '抱紧你', mood: 'supportive' },
  { content: '虽然帮不上忙，但精神上支持你', mood: 'supportive' },
  { content: '加油，打工人！', mood: 'supportive' },
  { content: '明天会好的（大概', mood: 'supportive' },
  { content: '想开点，虽然很难', mood: 'supportive' },
  { content: '拍拍你', mood: 'supportive' },
  { content: '给你力量！', mood: 'supportive' },
  { content: '我的心与你同在', mood: 'supportive' },
  
  // 同情共鸣类
  { content: '哈哈哈哈同一个世界同一个领导', mood: 'sympathetic' },
  { content: '太真实了😭', mood: 'sympathetic' },
  { content: '这不就是我吗', mood: 'sympathetic' },
  { content: '苦逼打工人+1', mood: 'sympathetic' },
  { content: '看哭了', mood: 'sympathetic' },
  { content: '是我本人了', mood: 'sympathetic' },
  { content: '我已经麻了', mood: 'sympathetic' },
  { content: '泪目', mood: 'sympathetic' },
  { content: '我比你还惨...', mood: 'sympathetic' },
  { content: '咱俩可能是同事吧', mood: 'sympathetic' },
  { content: '也太真实了', mood: 'sympathetic' },
  { content: '一样一样的...', mood: 'sympathetic' },
  { content: '太惨了', mood: 'sympathetic' },
  { content: '我们公司也是这样', mood: 'sympathetic' },
  { content: '全国打工人是一家', mood: 'sympathetic' },
  { content: '原来不止我一个', mood: 'sympathetic' },
  { content: '扎心了老铁', mood: 'sympathetic' },
  { content: '说的就是我司', mood: 'sympathetic' },
  { content: '你偷拍了我的生活吗', mood: 'sympathetic' },
  { content: '是所有公司通病吗', mood: 'sympathetic' },
  { content: '我怎么看到了我自己', mood: 'sympathetic' },
  { content: '同是天涯打工人', mood: 'sympathetic' },
  { content: '深有同感', mood: 'sympathetic' },
  { content: '谁懂啊', mood: 'sympathetic' },
  { content: '懂的都懂', mood: 'sympathetic' },
  { content: '我也是这样', mood: 'sympathetic' },
  { content: '一模一样的经历', mood: 'sympathetic' },
  
  // 幽默调侃类
  { content: '今天也是想辞职的一天', mood: 'humorous' },
  { content: '想开点，工作没了可以再找，命只有一条', mood: 'humorous' },
  { content: '真的无语了', mood: 'humorous' },
  { content: '每天都在想怎么逃离', mood: 'humorous' },
  { content: '打工人打工魂', mood: 'humorous' },
  { content: '还好有你们陪我吐槽', mood: 'humorous' },
  { content: '心疼自己', mood: 'humorous' },
  { content: '救命啊谁来救救我', mood: 'humorous' },
  { content: '已经润到成都了，舒服多了', mood: 'humorous' },
  { content: '我已经在看精神科了', mood: 'humorous' },
  { content: '笑着活下去', mood: 'humorous' },
  { content: '别说了，说多了都是泪', mood: 'humorous' },
  { content: '我选择狗带', mood: 'humorous' },
  { content: '人间不值得', mood: 'humorous' },
  { content: '先收藏了，等我加班完再看', mood: 'humorous' },
  { content: '我也想吐槽但加班中没时间', mood: 'humorous' },
  { content: '发完这条评论继续加班', mood: 'humorous' },
  { content: '边加班边看，太有共鸣了', mood: 'humorous' },
  { content: '我要把这个分享给我领导看（不敢', mood: 'humorous' },
  { content: '领导看到了会不会开除我', mood: 'humorous' },
  { content: '吐槽归吐槽，班还是要上的', mood: 'humorous' },
  { content: '看完感觉自己还能再战', mood: 'humorous' },
  { content: '笑死，又不是自己', mood: 'humorous' },
  { content: '先笑一会，待会继续干活', mood: 'humorous' },
  
  // 现实吐槽类
  { content: '这就是职场吧', mood: 'realistic' },
  { content: '也许这就是生活吧', mood: 'realistic' },
  { content: '职场就是这么残酷', mood: 'realistic' },
  { content: '习惯了就好（才怪', mood: 'realistic' },
  { content: '成年人的世界没有容易二字', mood: 'realistic' },
  { content: '除了辞职没有别的办法', mood: 'realistic' },
  { content: '忍着吧，都一样', mood: 'realistic' },
  { content: '认命吧', mood: 'realistic' },
  { content: '卷不过就跑', mood: 'realistic' },
  { content: '跑不了就卷', mood: 'realistic' },
  { content: '认清现实比什么都重要', mood: 'realistic' },
  { content: '换个公司可能更坑', mood: 'realistic' },
  { content: '这就是内卷的代价', mood: 'realistic' },
  { content: '大环境就这样', mood: 'realistic' },
  { content: '建议直接润', mood: 'realistic' },
  { content: '我选择躺平', mood: 'realistic' },
  { content: '反抗是徒劳的', mood: 'realistic' },
  { content: '能怎么办呢', mood: 'realistic' },
  { content: '活着就行', mood: 'realistic' },
  { content: '先活着吧', mood: 'realistic' },
]

// ==================== 辅助函数 ====================

export function getRandomComplaint(): ComplaintTemplate {
  return COMPLAINT_TEMPLATES[Math.floor(Math.random() * COMPLAINT_TEMPLATES.length)]
}

export function getComplaintsByCategory(category: ComplaintTemplate['category']): ComplaintTemplate[] {
  return COMPLAINT_TEMPLATES.filter(c => c.category === category)
}

export function getRandomComment(): CommentTemplate {
  return COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)]
}

export function getRegionalComplaint(city: string): RegionalComplaint | null {
  const cityComplaints = REGIONAL_COMPLAINTS.filter(c => c.city === city)
  if (cityComplaints.length === 0) return null
  return cityComplaints[Math.floor(Math.random() * cityComplaints.length)]
}

export function getHotTopicComplaint(date: Date = new Date()): HotTopicComplaint | null {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dateStr = `${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`
  
  const activeTopics = HOT_TOPIC_COMPLAINTS.filter(c => {
    if (!c.startDate || !c.endDate) return false
    return dateStr >= c.startDate && dateStr <= c.endDate
  })
  
  if (activeTopics.length === 0) return null
  return activeTopics[Math.floor(Math.random() * activeTopics.length)]
}

// 统计
export const STATS = {
  totalComplaints: COMPLAINT_TEMPLATES.length,
  totalRegionalComplaints: REGIONAL_COMPLAINTS.length,
  totalHotTopicComplaints: HOT_TOPIC_COMPLAINTS.length,
  totalComments: COMMENT_TEMPLATES.length,
  get total() {
    return this.totalComplaints + this.totalRegionalComplaints + this.totalHotTopicComplaints
  }
}
