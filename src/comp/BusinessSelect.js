/**
 *
 * @overview
 * @author xingwang
 * @create 14-7-31
 */
LBF.define('qidian.comp.BusinessSelect', function (require, exports, module) {
    var Node = require('ui.Nodes.Node'),
        ComboBox = require('qidian.comp.ComboBox'),
    //ComboBox = require('ui.widget.ComboBox.ComboBox'),
        each = require('lang.each'),
        console = require('qidian.comp.logger'),
        isArray = require('lang.isArray'),
        classes = ['area', 'areaDetail'],
    //classes = ['first-class', 'second-class'],
        LEVEL_DEF_OPTION = [{
            name: '全部分类',
            code: -1
        },
            {
                name: '全部分类',
                code: -2
            }],
        topLevels = ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118'],
        areaDetail = {
            '10211': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的工业及工业品公司',
                'code': '10211',
                'level': 2
            },
            '10210': {
                'name': '化工/肥料/农药',
                'descr': '例如塑料加工、农药生产制造公司等',
                'code': '10210',
                'level': 2
            },
            '10105': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的主题美食公司',
                'code': '10105',
                'level': 2
            },
            '11301': {
                'name': '美容/护理',
                'descr': '例如美容会所、护肤纤体中心等',
                'code': '11301',
                'level': 2
            },
            '10510': {
                'name': '水/电/暖/气',
                'descr': '例如地暖供应、水质监测服务公司等',
                'code': '10510',
                'level': 2
            },
            '10511': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的生活服务公司',
                'code': '10511',
                'level': 2
            },
            '10101': {
                'name': '中式美食',
                'descr': '例如中式炒菜，地方菜系餐馆，大闸蟹供应等',
                'code': '10101',
                'level': 2
            },
            '10103': {
                'name': '甜品饮品',
                'descr': '例如奶茶，蛋糕，咖啡公司等',
                'code': '10103',
                'level': 2
            },
            '10102': {
                'name': '西餐/日韩料理/异国美食',
                'descr': '例如外国风味餐馆等',
                'code': '10102',
                'level': 2
            },
            '11604': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的商业服务公司等',
                'code': '11604',
                'level': 2
            },
            '11704': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的汽车、汽配及祖灵公司',
                'code': '11704',
                'level': 2
            },
            '11601': {
                'name': '投资/证券',
                'descr': '例如证券交易、投资服务公司等',
                'code': '11601',
                'level': 2
            },
            '11701': {
                'name': '4S店/汽车经销商',
                'descr': '例如汽车4S店、汽车经销商等',
                'code': '11701',
                'level': 2
            },
            '11702': {
                'name': '维修/保养/改装',
                'descr': '例如汽车维修保养和改装公司等',
                'code': '11702',
                'level': 2
            },
            '11703': {
                'name': '租车/代驾',
                'descr': '例如租车、代驾服务公司等',
                'code': '11703',
                'level': 2
            },
            '11603': {
                'name': '典当/抵押/信贷',
                'descr': '例如典当、抵押、信贷公司等',
                'code': '11603',
                'level': 2
            },
            '11602': {
                'name': '银行/保险',
                'descr': '例如银行、保险公司等',
                'code': '11602',
                'level': 2
            },
            '10206': {
                'name': '工程机械/行业设备/仪器仪表',
                'descr': '例如液压器，电测仪，压缩机生产制造公司等',
                'code': '10206',
                'level': 2
            },
            '10207': {
                'name': '环保/废料回收',
                'descr': '例如空气过滤、废料加工公司等',
                'code': '10207',
                'level': 2
            },
            '10204': {
                'name': '电工/电气/开关/线缆',
                'descr': '例如电导管、电源开关、电缆、调速器生产制造公司等',
                'code': '10204',
                'level': 2
            },
            '10205': {
                'name': '五金/工具',
                'descr': '例如小五金部件和加工工具生产制造公司等',
                'code': '10205',
                'level': 2
            },
            '10202': {
                'name': '电子/IC/集成电路',
                'descr': '例如半导体，电子元件，电真空器件生产制造公司等',
                'code': '10202',
                'level': 2
            },
            '10203': {
                'name': '安防/监控器材',
                'descr': '例如消防器材，监视器，防盗报警器生产制造公司等',
                'code': '10203',
                'level': 2
            },
            '10201': {
                'name': '照明工业',
                'descr': '例如探照灯、荧光灯、显示屏等生产制造公司等',
                'code': '10201',
                'level': 2
            },
            '10208': {
                'name': '能源/电力/水利',
                'descr': '例如工业油加工、风电能源轴承生产公司等',
                'code': '10208',
                'level': 2
            },
            '10209': {
                'name': '采掘/冶炼/金属',
                'descr': '例如贵金属提炼、不锈钢加工公司等',
                'code': '10209',
                'level': 2
            },
            '11102': {
                'name': '楼盘/物业',
                'descr': '例如小区物业、楼盘交易商等',
                'code': '11102',
                'level': 2
            },
            '11103': {
                'name': '建材/工程',
                'descr': '例如建材市场、写字楼修建等',
                'code': '11103',
                'level': 2
            },
            '11101': {
                'name': '开发商',
                'descr': '房地产开发商等',
                'code': '11101',
                'level': 2
            },
            '11106': {
                'name': '房屋中介',
                'descr': '例如房产中介、房产交易服务公司等',
                'code': '11106',
                'level': 2
            },
            '11107': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的房产、装修及租售公司',
                'code': '11107',
                'level': 2
            },
            '11104': {
                'name': '家具/家居',
                'descr': '例如橱柜桌椅家具批发零售公司等',
                'code': '11104',
                'level': 2
            },
            '11105': {
                'name': '室内设计/装潢',
                'descr': '例如室内设计方案、装修服务承包公司等',
                'code': '11105',
                'level': 2
            },
            '10804': {
                'name': '电信增值业务',
                'descr': '例如集成通讯系统、短信接口服务公司等',
                'code': '10804',
                'level': 2
            },
            '10805': {
                'name': '话费充值',
                'descr': '例如移动、联通、电信充值服务公司等',
                'code': '10805',
                'level': 2
            },
            '10806': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的数码及通讯公司',
                'code': '10806',
                'level': 2
            },
            '10801': {
                'name': '移动通讯',
                'descr': '例如通讯服务商，电话增值业务公司等',
                'code': '10801',
                'level': 2
            },
            '10802': {
                'name': '数码产品',
                'descr': '例如手机、数码相机商务公司等',
                'code': '10802',
                'level': 2
            },
            '10803': {
                'name': '固话/宽带',
                'descr': '例如光纤宽带代理、400电话网络服务公司等',
                'code': '10803',
                'level': 2
            },
            '11803': {
                'name': '宾馆/酒店',
                'descr': '例如宾馆、酒店、招待所等',
                'code': '11803',
                'level': 2
            },
            '11802': {
                'name': '旅行社',
                'descr': '例如旅行社、旅游业务办理机构等',
                'code': '11802',
                'level': 2
            },
            '11801': {
                'name': '客运/票务',
                'descr': '例如机票、火车票业务办理公司等',
                'code': '11801',
                'level': 2
            },
            '11807': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的旅游及出行公司',
                'code': '11807',
                'level': 2
            },
            '11806': {
                'name': '农家乐/度假村',
                'descr': '例如农家乐、度假村机构等',
                'code': '11806',
                'level': 2
            },
            '11805': {
                'name': '景区/公园/游乐',
                'descr': '例如景区、公园、游乐场等',
                'code': '11805',
                'level': 2
            },
            '11804': {
                'name': '户外/拓展',
                'descr': '例如户外设备供应、户外活动服务公司等',
                'code': '11804',
                'level': 2
            },
            '11201': {
                'name': '医疗设备/器械',
                'descr': '例如牙科设备、X光影像材料供应公司等',
                'code': '11201',
                'level': 2
            },
            '11203': {
                'name': '制药/生物',
                'descr': '例如药物研发、化学技术服务公司等',
                'code': '11203',
                'level': 2
            },
            '11202': {
                'name': '医疗/护理/卫生',
                'descr': '例如医院、诊所、健康咨询中心等',
                'code': '11202',
                'level': 2
            },
            '11205': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的医疗及整形整容公司',
                'code': '11205',
                'level': 2
            },
            '11204': {
                'name': '医疗整形',
                'descr': '例如整形医院、创面修复机构等',
                'code': '11204',
                'level': 2
            },
            '10104': {
                'name': '小吃快餐',
                'descr': '例如便当盒饭，老鸭粉丝汤，卤味，烧烤公司等',
                'code': '10104',
                'level': 2
            },
            '11302': {
                'name': '养生/按摩',
                'descr': '例如养生会所、按摩中心等',
                'code': '11302',
                'level': 2
            },
            '11303': {
                'name': '保健品',
                'descr': '例如营养品、维生素供应商等',
                'code': '11303',
                'level': 2
            },
            '11304': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的美容及保健公司',
                'code': '11304',
                'level': 2
            },
            '10602': {
                'name': '化妆品/护肤品',
                'descr': '例如化妆品批发、美容用品供应公司等',
                'code': '10602',
                'level': 2
            },
            '10603': {
                'name': '生活用品',
                'descr': '例如纺织品、母婴用印、日用品公司等',
                'code': '10603',
                'level': 2
            },
            '10601': {
                'name': '家电/小家电/厨卫用具',
                'descr': '例如电热水器、净水设备公司等',
                'code': '10601',
                'level': 2
            },
            '10606': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的日用杂货及家电公司',
                'code': '10606',
                'level': 2
            },
            '10604': {
                'name': '食品饮料',
                'descr': '例如罐装饮料、膨化食品公司等',
                'code': '10604',
                'level': 2
            },
            '10605': {
                'name': '烟酒',
                'descr': '例如香烟、各类酒公司等',
                'code': '10605',
                'level': 2
            },
            '10703': {
                'name': '奢侈品/收藏品',
                'descr': '例如古董鉴定、紫砂壶生产、艺术收藏品拍卖公司等',
                'code': '10703',
                'level': 2
            },
            '10702': {
                'name': '工艺品/玩具/珠宝',
                'descr': '例如工艺品、儿童玩具、珠宝首饰公司等',
                'code': '10702',
                'level': 2
            },
            '10701': {
                'name': '服装服饰',
                'descr': '例如女装批发、热转印加工、内衣分销公司等',
                'code': '10701',
                'level': 2
            },
            '10704': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的鞋服、工艺品及奢侈品公司',
                'code': '10704',
                'level': 2
            },
            '11003': {
                'name': '非赢利性组织',
                'descr': '例如宗教团体、社工团体、慈善机构等',
                'code': '11003',
                'level': 2
            },
            '11002': {
                'name': '公共事业',
                'descr': '例如事业单位、公共事务局等',
                'code': '11002',
                'level': 2
            },
            '11001': {
                'name': '政府',
                'descr': '例如政府机关、地方行政机关等',
                'code': '11001',
                'level': 2
            },
            '11005': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的政府机关及社会组织等',
                'code': '11005',
                'level': 2
            },
            '11004': {
                'name': '行业组织',
                'descr': '例如科技协会、贸易协会、设计协会等',
                'code': '11004',
                'level': 2
            },
            '10905': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的媒体、广告及出版公司',
                'code': '10905',
                'level': 2
            },
            '10904': {
                'name': '图书/音像',
                'descr': '例如书店、音像店、图书批发公司等',
                'code': '10904',
                'level': 2
            },
            '10901': {
                'name': '广告',
                'descr': '例如平面设计、广告创意服务公司等',
                'code': '10901',
                'level': 2
            },
            '10903': {
                'name': '新闻媒体/报刊杂志',
                'descr': '例如新闻撰写、杂志出版公司等',
                'code': '10903',
                'level': 2
            },
            '10902': {
                'name': '文化/广电/影视',
                'descr': '例如广告拍摄、才艺表演、配音服务公司等',
                'code': '10902',
                'level': 2
            },
            '10412': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的商业服务公司',
                'code': '10412',
                'level': 2
            },
            '10411': {
                'name': '货物运输/大宗物流',
                'descr': '例如货物进出口、物流运输公司等',
                'code': '10411',
                'level': 2
            },
            '10410': {
                'name': '办公用品及设备',
                'descr': '例如刻章、化学仪器、文具公司等',
                'code': '10410',
                'level': 2
            },
            '10307': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的教育及出国机构',
                'code': '10307',
                'level': 2
            },
            '10306': {
                'name': '留学/移民',
                'descr': '例如留学咨询服务、国外学校申请代理机构等',
                'code': '10306',
                'level': 2
            },
            '10305': {
                'name': '语言培训',
                'descr': '例如英语、日语、韩语、韩语培训机构等',
                'code': '10305',
                'level': 2
            },
            '10304': {
                'name': '职业培训/企业管理',
                'descr': '例如厨师、会计、电脑、营销咨询机构等',
                'code': '10304',
                'level': 2
            },
            '10303': {
                'name': '兴趣辅导/特长教育',
                'descr': '例如奥数班、体育辅导、琴棋书画教育机构等',
                'code': '10303',
                'level': 2
            },
            '10302': {
                'name': '大中小学',
                'descr': '例如课程学校、学科辅导机构等',
                'code': '10302',
                'level': 2
            },
            '10301': {
                'name': '孕前/婴幼儿教育',
                'descr': '例如儿童辅导、育儿机构等',
                'code': '10301',
                'level': 2
            },
            '11506': {
                'name': '咖啡厅/茶馆',
                'descr': '例如咖啡厅、茶馆等',
                'code': '11506',
                'level': 2
            },
            '11507': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的休闲娱乐公司',
                'code': '11507',
                'level': 2
            },
            '11504': {
                'name': '文艺演出',
                'descr': '例如文艺活动场地、演出票务订购服务机构等',
                'code': '11504',
                'level': 2
            },
            '11505': {
                'name': '会馆会所',
                'descr': '例如聚会会馆、私人会所等',
                'code': '11505',
                'level': 2
            },
            '11502': {
                'name': '洗浴',
                'descr': '例如桑拿、汗蒸、浴场等',
                'code': '11502',
                'level': 2
            },
            '11503': {
                'name': '电影院',
                'descr': '例如电影院、放映室等',
                'code': '11503',
                'level': 2
            },
            '11501': {
                'name': 'KTV/酒吧/夜店',
                'descr': '例如KTV、酒吧、夜店等',
                'code': '11501',
                'level': 2
            },
            '10401': {
                'name': '商务中介/外贸报关代理',
                'descr': '例如发票代理机构等',
                'code': '10401',
                'level': 2
            },
            '10402': {
                'name': '工商注册/代理代办',
                'descr': '例如战略咨询、产权代理、代理记账机构等',
                'code': '10402',
                'level': 2
            },
            '10403': {
                'name': '公关/市场推广',
                'descr': '例如营销推广服务、商业策划机构等',
                'code': '10403',
                'level': 2
            },
            '10404': {
                'name': '会展服务',
                'descr': '例如展览策划筹备、展览器材管理等',
                'code': '10404',
                'level': 2
            },
            '10405': {
                'name': '印刷/包装/平面设计',
                'descr': '例如文件打印、包装设计、标识规划公司等',
                'code': '10405',
                'level': 2
            },
            '10406': {
                'name': '咨询/顾问',
                'descr': '例如签证代办、证券顾问机构等',
                'code': '10406',
                'level': 2
            },
            '10407': {
                'name': '人力资源/财会',
                'descr': '例如人才管理、猎头机构等',
                'code': '10407',
                'level': 2
            },
            '10408': {
                'name': '外包服务',
                'descr': '例如翻译服务、产权服务等外包性质机构等',
                'code': '10408',
                'level': 2
            },
            '10409': {
                'name': '加盟招商',
                'descr': '例如各行各业的连锁加盟服务机构等',
                'code': '10409',
                'level': 2
            },
            '11407': {
                'name': '其他',
                'descr': '例如其他不包括在已有分类主题内的计算机及互联网公司',
                'code': '11407',
                'level': 2
            },
            '11406': {
                'name': '点卡/虚拟币',
                'descr': '例如游戏点卡充值、游戏增值服务公司等',
                'code': '11406',
                'level': 2
            },
            '11405': {
                'name': '网络游戏',
                'descr': '例如游戏客服中心、游戏会员俱乐部、游戏发行商等',
                'code': '11405',
                'level': 2
            },
            '11404': {
                'name': '互联网服务',
                'descr': '例如互联网电子商务系统解决方案公司等',
                'code': '11404',
                'level': 2
            },
            '11403': {
                'name': '计算机服务/维修',
                'descr': '例如计算机硬件调试及维修服务公司等',
                'code': '11403',
                'level': 2
            },
            '11402': {
                'name': '计算机硬件',
                'descr': '例如电脑台式机硬件产品供应公司等',
                'code': '11402',
                'level': 2
            },
            '11401': {
                'name': '计算机软件',
                'descr': '例如办公软件产品供应公司等',
                'code': '11401',
                'level': 2
            },
            '10509': {
                'name': '美发',
                'descr': '例如美发店、生发服务公司等',
                'code': '10509',
                'level': 2
            },
            '10508': {
                'name': '宠物',
                'descr': '例如宠物医院、宠物用品、宠物护理商店等',
                'code': '10508',
                'level': 2
            },
            '10501': {
                'name': '快递/物流/速运',
                'descr': '例如快递公司、货运代理公司等',
                'code': '10501',
                'level': 2
            },
            '10503': {
                'name': '家政服务',
                'descr': '例如月子会所、保洁清洗服务、家政服务机构等',
                'code': '10503',
                'level': 2
            },
            '10502': {
                'name': '婚庆摄影',
                'descr': '例如婚纱摄影公司等',
                'code': '10502',
                'level': 2
            },
            '10505': {
                'name': '鲜花速递',
                'descr': '例如鲜花速递、生鲜速递服务机构等',
                'code': '10505',
                'level': 2
            },
            '10504': {
                'name': '维修/疏通',
                'descr': '例如开锁服务、家电维修、水管疏通机构等',
                'code': '10504',
                'level': 2
            },
            '10507': {
                'name': '洗衣房',
                'descr': '例如干洗店等',
                'code': '10507',
                'level': 2
            },
            '10506': {
                'name': '搬家/搬运',
                'descr': '例如搬场、设备装卸公司等',
                'code': '10506',
                'level': 2
            },
            '116': {
                'name': '金融/保险',
                'code': '116',
                'nextLevel': ['11604', '11601', '11603', '11602'],
                'level': 1
            },
            '117': {
                'name': '汽车/汽配/租赁',
                'code': '117',
                'nextLevel': ['11704', '11701', '11702', '11703'],
                'level': 1
            },
            '118': {
                'name': '旅游/出行',
                'code': '118',
                'nextLevel': ['11803', '11802', '11801', '11807', '11806', '11805', '11804'],
                'level': 1
            },
            '115': {
                'name': '休闲娱乐',
                'code': '115',
                'nextLevel': ['11506', '11507', '11504', '11505', '11502', '11503', '11501'],
                'level': 1
            },
            '114': {
                'name': '计算机/互联网',
                'code': '114',
                'nextLevel': ['11407', '11406', '11405', '11404', '11403', '11402', '11401'],
                'level': 1
            },
            '108': {
                'name': '手机数码/通讯服务',
                'code': '108',
                'nextLevel': ['10804', '10805', '10806', '10801', '10802', '10803'],
                'level': 1
            },
            '109': {
                'name': '媒体/广告/出版',
                'code': '109',
                'nextLevel': ['10905', '10904', '10901', '10903', '10902'],
                'level': 1
            },
            '111': {
                'name': '房产/装修/租售',
                'code': '111',
                'nextLevel': ['11102', '11103', '11101', '11106', '11107', '11104', '11105'],
                'level': 1
            },
            '110': {
                'name': '政府机关/社会组织',
                'code': '110',
                'nextLevel': ['11003', '11002', '11001', '11005', '11004'],
                'level': 1
            },
            '113': {
                'name': '美容/保健',
                'code': '113',
                'nextLevel': ['11301', '11302', '11303', '11304'],
                'level': 1
            },
            '112': {
                'name': '医疗/整形整容',
                'code': '112',
                'nextLevel': ['11201', '11203', '11202', '11205', '11204'],
                'level': 1
            },
            '102': {
                'name': '工业/工业品',
                'code': '102',
                'nextLevel': ['10211', '10210', '10206', '10207', '10204', '10205', '10202', '10203', '10201', '10208', '10209'],
                'level': 1
            },
            '103': {
                'name': '教育/出国',
                'code': '103',
                'nextLevel': ['10307', '10306', '10305', '10304', '10303', '10302', '10301'],
                'level': 1
            },
            '101': {
                'name': '美食餐饮',
                'code': '101',
                'nextLevel': ['10105', '10101', '10103', '10102', '10104'],
                'level': 1
            },
            '106': {
                'name': '日用杂货/家电',
                'code': '106',
                'nextLevel': ['10602', '10603', '10601', '10606', '10604', '10605'],
                'level': 1
            },
            '107': {
                'name': '鞋服/工艺品/奢侈品',
                'code': '107',
                'nextLevel': ['10703', '10702', '10701', '10704'],
                'level': 1
            },
            '104': {
                'name': '商业服务',
                'code': '104',
                'nextLevel': ['10412', '10411', '10410', '10401', '10402', '10403', '10404', '10405', '10406', '10407', '10408', '10409'],
                'level': 1
            },
            '105': {
                'name': '生活服务',
                'code': '105',
                'nextLevel': ['10510', '10511', '10509', '10508', '10501', '10503', '10502', '10505', '10504', '10507', '10506'],
                'level': 1
            }
        };

    module.exports = exports = Node.inherit({
        events: {
            'unload': 'removeComponents'
        },

        render: function () {
            var areaSelect = this,
                selector = this.get('selector'),
                maxdisplay = this.get('maxdisplay'),
                $ = this.jQuery,
                comboboxArr = this.comboboxArr = [],
                $select;

            if (!selector || ($select = $(selector)).length === 0) {
                // todo
                // container mode
            }
            if(!maxdisplay){
                maxdisplay = 10;//默认是展示10个
            }

            // init comboboxes
            var changeFunc = this.get('functions').change;
            $select.each(function (i) {
                var combobox = new ComboBox({
                    selector: this,
                    optionsContainer: $(this).parent().parent(),
                    maxDisplay:maxdisplay
                });

                //console.log($(this).parent())

                comboboxArr.push(combobox);

                combobox.bind('select', function (event, code) {

                    changeFunc();

                    combobox.nextAll('.area-combobox').addClass('hidden');
                    var selected = areaDetail[code];
                    areaSelect.set(classes[i], selected);

                    if (i === 1 && selected && selected.descr) {
                        $('#area-detail-tip').text(selected.descr);
                        $('#area-detail-tip').show();
                    } else {
                        $('#area-detail-tip').hide();
                        $('#area-detail-tip').text('');
                    }

                    var nextLevels = areaSelect.nextLevel(code);
                    if (!nextLevels) {
                        return;
                    }
                    var nextLevel = selected.level;

                    // get region list & transform to option list
                    options = areaSelect.adaptorRegion2Options(nextLevel, nextLevels);

                    // reset next level combobox options
                    var nextLvCombobox = comboboxArr[nextLevel];
                    nextLvCombobox.removeClass('hidden').reset(options);
                }).bind('reset', function () {
                    // update options to region select
                    areaSelect.set(classes[i] + 'Options', combobox.get('options'));
                });
            });

            // init region
            this.selectRegion(areaSelect.get('region'));
        },
        nextLevel: function (code) {
            var areaSelect = this;
            return areaDetail[code] && areaDetail[code].nextLevel;
        },

        selectRegion: function (select) {
            var areaSelect = this,
                comboboxArr = this.comboboxArr;

            topLevelOptions = this.adaptorRegion2Options(0, topLevels);
            comboboxArr[0].reset(topLevelOptions);

            if (!select || !select[classes[0]]) {
                /*
                 comboboxArr[1]
                 .addClass('hidden');
                 .reset(this.adaptorRegion2Options(1,[]));
                 */
                return this;
            }
            each(classes, function (i, lvName) {
                var code = select[lvName];
                if (!code) {
                    return;
                }
                code = code.toString();
                var combobox = comboboxArr[i],
                    idx = -1,
                    options;

                if (options = areaSelect.get(lvName + 'Options')) {
                    each(options, function (i, option) {
                        var key = option.value,
                            area = areaDetail[key];
                        if (area && area.code === code) {
                            idx = i;
                            return;
                        }
                    });
                }
                if (idx === -1) {
                    console.warn('[region select][set region] illegal region code ' + code + ' at level ' + lvName);
                    return;
                }
                combobox.select(idx);
            });

        },

        validSelect: function () {
            var region = this.getSelectedRegion(),
                selected = 0;

            each(classes, function (i, lvName) {
                if (region[lvName]) {
                    selected++;
                }
            });
            if (selected === 2) {
                return true;
            } else {
                return false;
            }
        },
        getSelectedRegion: function () {
            var regionSelect = this,
                region = {};

            each(classes, function (i, lvName) {
                region[lvName] = regionSelect.get(lvName) || null;
            });

            return region;
        },

        adaptorRegion2Options: function (level, list) {
            // add default option
            var forFormat = [];
            forFormat.push(LEVEL_DEF_OPTION[level]);
            each(list, function (i, value) {
                forFormat.push(areaDetail[value]);
            });

            //list.unshift(LEVEL_DEF_OPTION[level]);
            // transform regions to combobox options
            return this.format(forFormat);
        },
        /**
         * 禁用选项
         */
        disable: function (options) {
            var comboboxArr = this.comboboxArr;
            options.area && comboboxArr[0] ? comboboxArr[0].disable() : '';//nation
            options.areaDetail && comboboxArr[1] ? comboboxArr[1].disable() : '';//province

        },

        /**
         * remove the comboboxArr to avoid memory leak
         */
        removeComponents: function () {
            each(this.comboboxArr, function (index, combobox) {
                combobox.remove();
            });

            this.comboboxArr = [];
        },

        format: function (region) {
            if (!isArray(region)) {
                return {
                    text: region.name,
                    // in case of typeof region.code === 'undefined'
                    value: region.code || ''
                };
            }

            var options = [];
            each(region, function (i, orig) {
                options.push({
                    text: orig.name,
                    value: orig.code || ''
                });
            });

            return options;
        }
    });

    // default properties to be merged from constructor options
    exports.settings = {
        region: null
    };

    exports.areaDetail = areaDetail;

    var getRegionByCode = exports.getRegionByCode = function (region) {
        var args = [],
            ret = {},
            retArr;

        each(classes, function (i, lvName) {
            //args.push(region[lvName] || null);
            if (region[lvName]) {
                ret[lvName] = areaDetail[region[lvName].toString()];
            }

        });

        return ret;
    };

});

