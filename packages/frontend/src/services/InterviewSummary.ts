import type {
	CompanyScale,
	GetAllUserSummariesDto,
	ImportSummariesFromIdDto,
	InterviewSummaryAllVo,
	InterviewSummaryCreateDto,
	InterviewSummaryDetailVo,
	InterviewSummaryProcessTaskVo,
	InterviewSummaryVo,
	InterviewType,
	JobType,
	ProcessCrawledDto,
	ProcessDelayedDto,
	ServerDataFormat as SDF
} from '@prisma-ai/shared';
import { instance } from './config';

const BASE_URL = '/interview-summary';

export interface BackendTask {
	id: string;
}

/**
 * 创建面经
 * @param data 面经创建DTO
 * @returns 创建成功后的面经信息
 */
export const createInterviewSummary = async (data: InterviewSummaryCreateDto) => {
	const res = await instance.post<InterviewSummaryCreateDto, SDF<BackendTask>>(`${BASE_URL}`, data);
	return res.data;
};

/**
 * 导入指定ID的面经
 * @param data 包含面经ID的DTO
 * @returns 导入操作的结果
 */
export const importSummaryById = async (data: ImportSummariesFromIdDto) => {
	const res = await instance.post<ImportSummariesFromIdDto, SDF<null>>(
		`${BASE_URL}/import_id`,
		data
	);
	return res.data;
};

/**
 * 获取当前用户创建和导入的所有面经
 * @returns 包含创建的面经和导入的面经的对象
 */
export const getAllUserSummaries = async (
	pageNumber: number,
	pageSize: number,
	filterOptions: Record<string, string[]> & { own: boolean[] }
) => {
	const keys = [];
	const keyExpected = ['job_type', 'interview_type', 'company_scale', 'own', 'search'];
	for (const key in filterOptions) {
		filterOptions[key] = filterOptions[key] ?? [];
		keys.push(key);
	}
	for (const key of keyExpected) {
		if (!keys.includes(key)) {
			filterOptions[key] = [];
			console.error(`filterOptions中缺少${key}字段，已自动填充为空数组`);
		}
	}
	const res = await instance.post<GetAllUserSummariesDto, SDF<InterviewSummaryAllVo>>(
		`${BASE_URL}/all`,
		{
			pageNumber,
			pageSize,
			job_type: filterOptions.job_type as JobType[],
			interview_type: filterOptions.interview_type as InterviewType[],
			company_scale: filterOptions.company_scale as CompanyScale[],
			//搜索框内容
			search: filterOptions.search,
			own: filterOptions.own.length === 0 ? undefined : filterOptions.own.includes(true)
		}
	);
	return res.data;
};

/**
 * 根据ID获取指定面经的详细信息
 * @param summaryId 面经ID
 * @returns 指定面经的详细信息
 */
export const getSummaryById = async (summaryId: number) => {
	const res = await instance.get<SDF<InterviewSummaryDetailVo>>(
		`${BASE_URL}/summary_id/${summaryId}`
	);
	return res.data;
};

/**
 * 获取面经市场的列表（用户未导入的）
 * @returns 面经市场列表
 */
export const getMarketSummaries = async () => {
	const res = await instance.get<SDF<InterviewSummaryVo[]>>(`${BASE_URL}/market`);
	return res.data;
};

/**
 * 获取用户创建和导入的所有面经id
 */
export const getUserInterviewSummaryIds = async () => {
	const res = await instance.get<SDF<string[]>>(`${BASE_URL}/ids`);
	return res.data;
};

/**
 * 获取面经创建任务进度
 * @param taskId 任务ID
 * @returns 任务进度信息
 */
export const getTaskProgress = async (taskId: string) => {
	const res = await instance.get<SDF<InterviewSummaryProcessTaskVo>>(`${BASE_URL}/task/${taskId}`);
	return res.data;
};

/**
 * 启动面经爬虫
 * @param count 爬取数量
 * @param job_type 职位类型
 * @param stage 阶段
 */
export async function startCrawl(count: number, job_type: string, stage: 'url' | 'data') {
	return (
		await instance.post<
			{ count: number; job_type: string; stage: 'url' | 'data' },
			SDF<BackendTask>
		>(`${BASE_URL}/crawl`, { count, job_type, stage })
	).data;
}

/**
 * 处理已爬取的面经
 */
export async function processCrawled(data: ProcessCrawledDto) {
	return (
		await instance.post<ProcessCrawledDto, SDF<BackendTask>>(`${BASE_URL}/process_crawled`, data)
	).data;
}

/**
 * 处理延迟处理的面试题
 */
export async function processDelayed(data: ProcessDelayedDto) {
	return (
		await instance.post<ProcessDelayedDto, SDF<BackendTask>>(`${BASE_URL}/process_delayed`, data)
	).data;
}

/**
 * 重嵌入所有面经和面试题
 * @param vectorCleaned 是否清理向量数据库中的数据
 * @returns 重嵌入任务ID
 */
export async function reEmbedVector(vectorCleaned: boolean) {
	return (
		await instance.post<void, SDF<BackendTask>>(
			`${BASE_URL}/re_embed_vector?vector_cleaned=${vectorCleaned ? 'true' : ''}`,
			void 0
		)
	).data;
}
