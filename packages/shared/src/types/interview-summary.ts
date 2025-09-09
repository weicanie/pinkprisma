import { InterviewQuestion } from './question';

export const job_type_list = [
	// 技术研发类
	'前端',
	'后端',
	'全栈',
	'客户端',
	'嵌入式',
	'硬件开发',
	// 算法与AI类
	'算法',
	'计算机视觉',
	'自然语言处理',
	'推荐算法',
	// 数据类
	'数据开发',
	'数据分析',
	'数据仓库',
	'大数据开发',
	// 测试与质量类
	'测试',
	'测试开发',
	// 运维与基础架构类
	'运维',
	// 游戏开发类
	'游戏客户端',
	'游戏服务端',
	'游戏引擎',
	// 产品与设计类
	'产品经理',
	'运营',
	'设计',
	// 安全类
	'安全',
	// 实施与支持类
	'实施',
	// 综合类
	'其它',
	'未知方向'
];
export const interview_type_list = ['实习', '校招', '社招', '其它', '未知'];
export const turn_list = ['一面', '二面', '三面', '四面及以上', 'HR面', '笔试', '其它', '未知轮次'];
export const company_scale_list = ['小厂', '中厂', '大厂', '国央企', '外企', '其它', '未知规模'];
export const quiz_type_list = ['问答题', '选择题', '力扣算法题', '其它'];

export enum JobType {
	// 技术研发类
	Frontend = '前端',
	Backend = '后端',
	FullStack = '全栈',
	Client = '客户端',
	Embedded = '嵌入式',
	HardwareDevelopment = '硬件开发',
	// 算法与AI类
	Algorithm = '算法',
	ComputerVision = '计算机视觉',
	NaturalLanguageProcessing = '自然语言处理',
	RecommendationAlgorithm = '推荐算法',
	// 数据类
	DataDevelopment = '数据开发',
	DataAnalysis = '数据分析',
	DataWarehouse = '数据仓库',
	BigDataDevelopment = '大数据开发',
	// 测试与质量类
	Test = '测试',
	TestDevelopment = '测试开发',
	// 运维与基础架构类
	DevOps = '运维',
	// 游戏开发类
	GameClient = '游戏客户端',
	GameServer = '游戏服务端',
	GameEngine = '游戏引擎',
	// 产品与设计类
	ProductManager = '产品经理',
	Operations = '运营',
	Design = '设计',
	// 安全类
	Security = '安全',
	// 实施与支持类
	Implementation = '实施',
	// 综合类
	Other = '其它',
	Unkown = '未知方向'
}

export enum InterviewType {
	Internship = '实习',
	CampusRecruitment = '校招',
	SocialRecruitment = '社招',
	Other = '其它',
	Unkown = '未知'
}

export enum CompanyScale {
	SmallFactory = '小厂',
	MediumFactory = '中厂',
	LargeFactory = '大厂',
	StateEnterprise = '国央企',
	ForeignEnterprise = '外企',
	Other = '其它',
	Unkown = '未知规模'
}

export enum Turn {
	FirstRound = '一面',
	SecondRound = '二面',
	ThirdRound = '三面',
	FourthRound = '四面及以上',
	HRRound = 'HR面',
	Other = '其它',
	Unkown = '未知轮次'
}

export enum APIProvider {
	deepseek = 'deepseek',
	kimi = 'kimi',
	proxy = 'proxy', //国内代理
	qwen = 'qwen', //千问
	zhipu = 'zhipu' //智谱
}

/**
 * 可用的用于处理项目经验的模型
 */
export enum SelectedLLM {
	// deepseek
	// v3 = 'deepseek-chat',
	// r1 = 'deepseek-reasoner',
	// kimi
	k2 = 'kimi-k2-0711-preview',
	// 千问
	qwen3 = 'qwen3-235b-a22b-instruct-2507',
	qwen3_proxy = 'qwen3-235b-a22b-instruct-2507-proxy',
	glm4_5 = 'glm-4.5',
	// qwen_max = 'qwen-max-latest',
	// qwen_plus = 'qwen-plus',
	// qwen_plus_latest = 'qwen-plus-latest',
	// 国内代理
	k2_proxy = 'kimi-k2-0711-preview-proxy' //服务端还原即可
	// gemini_2_5_flash = 'gemini-2.5-flash',
	// gemini_2_5_pro = 'gemini-2.5-pro',
	// gpt_4o = 'gpt-4o'
}
export interface UserModelConfig<T = SelectedLLM> {
	api_type: APIProvider;
	llm_type: T;
	apiKey: string;
}

export interface InterviewSummaryCreateDto {
	content: string; // 面经内容
	own: boolean; // 是否为个人面经
	modelConfig: UserModelConfig;

	job_type?: JobType; // 职位类型
	job_name?: string; // 职位名称
	interview_type?: InterviewType; // 面试类型
	company_name?: string; // 公司名称
	company_scale?: CompanyScale; // 公司规模
	turn?: Turn; // 面试轮次

	job_link?: string; // 职位链接
	post_link?: string; // 原文链接（去掉query和hash）
	post_date?: Date; // 面经发布日期
	post_year?: number; // 面经发布年份
}

export interface InterviewSummaryCompleteDto
	extends Pick<
		InterviewSummaryCreateDto,
		| 'content'
		| 'job_type'
		| 'job_name'
		| 'interview_type'
		| 'company_name'
		| 'company_scale'
		| 'turn'
	> {}

export interface ImportSummariesFromUserDto {
	exporterId: number; // 导出者id
	importerId?: number; // 导入者id, 如果为空,则导入到当前登录用户
}

export interface ImportSummariesFromIdDto {
	summaryId: number[]; // 面经id
	importerId?: number; // 导入者id, 如果为空,则导入到当前登录用户
}

export interface InterviewSummaryQuestionDetailVo extends InterviewQuestion {
	is_favorite: boolean;
	is_master: boolean;
	note: string | null; // 用户笔记
}

export interface InterviewSummaryVo {
	id: number; // 面经id
	// content: string;
	interview_type: string | null; // 面试类型
	job_type: string; // 职位类型
	company_name: string | null; // 公司名称
	company_scale: string | null; // 公司规模
	job_name: string | null; // 职位名称
	job_link: string | null; // 职位链接
	all_article_success: boolean; // 所有文章是否上传成功
	// creator_id: number;
	// copyright_type: string;

	create_at: Date | null;
	update_at: Date | null;
	own: boolean; // 是否自己创建
}

export interface InterviewSummaryDetailVo {
	id: number; // 面经id
	content: string; // 面经内容
	interview_type: string | null; // 面试类型
	job_type: string; // 职位类型
	company_name: string | null; // 公司名称
	company_scale: string | null; // 公司规模
	job_name: string | null; // 职位名称
	job_link: string | null; // 职位链接
	all_article_success: boolean; // 所有文章是否上传成功
	creator_id: number;
	copyright_type: string;
	create_at: Date | null;
	update_at: Date | null;

	articles: InterviewSummaryQuestionDetailVo[];
}

export interface InterviewSummaryAllVo extends InterviewSummaryPagingVo {}

export interface InterviewSummaryPagingVo {
	data: InterviewSummaryVo[];
	total: number;
}

export interface GetAllUserSummariesDto {
	pageNumber: number;
	pageSize: number;
	job_type: JobType[];
	interview_type: InterviewType[];
	company_scale: CompanyScale[];
	search: string[];
	own?: boolean;
}

export interface ProcessCrawledDto {
	modelConfig: UserModelConfig;
	count: number;
	job_type: JobType;
	isDelayed?: boolean; // 是否是延迟处理面试题
}

export interface ProcessDelayedDto {
	modelConfig: UserModelConfig;
	count: number;
	job_type: JobType;
}
