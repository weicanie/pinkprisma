import {
	type InterviewQuestion,
	type InterviewQuestionInfoVo,
	type MyQuestionData,
	type MyQuestionInfoVo,
	type PersistentTaskVo,
	type ServerDataFormat as SDF,
	type StartCrawlQuestionDto,
	type UpdateQuestionDto
} from '@prisma-ai/shared';
import { instance } from './config';

export async function startCrawlQuestions(crawlData: StartCrawlQuestionDto) {
	const res = await instance.post<StartCrawlQuestionDto, SDF<{ id: string }>>(
		'/question/crawl',
		crawlData
	);
	return res.data;
}

export async function startGenerateMindmap() {
	const res = await instance.post<null, SDF<{ id: string }>>('/question/generate-mindmap', null);
	return res.data;
}

export async function startUploadToAnki() {
	const res = await instance.post<null, SDF<{ id: string }>>('/question/upload-to-anki', null);
	return res.data;
}

export async function getTaskResult(taskId: string) {
	const res = await instance.get<SDF<{ task: PersistentTaskVo }>>(`/question/task/${taskId}`);
	return res.data;
}

export async function getUnuploadedCount() {
	const res = await instance.get<
		SDF<{
			total: number;
			unmaster: number;
			favorite: number;
		}>
	>('/question/unuploaded-count');
	return res.data;
}

export async function getUnuploadedQuestions(page: number, size: number) {
	const res = await instance.get<
		SDF<(InterviewQuestion & { own?: boolean; is_favorite?: boolean; is_master?: boolean })[]>
	>(`/question/unuploaded?page=${page}&size=${size}`);
	return res.data;
}

export async function updateUploadedQuestions(
	updates: { articleId: number; ankiNoteId: number }[]
) {
	const res = await instance.post('/question/update-uploaded', updates);
	return res.data;
}

/**
 * 获取指定职位类型的热门面试题Top100
 * @param jobtype 职位类型（如：前端、后端等）
 * @returns 热门面试题列表，包含interview_count字段表示在面经中出现的次数
 */
export async function getHot100Questions(jobtype: string) {
	const res = await instance.get<SDF<InterviewQuestionInfoVo[]>>(
		`/question/hot-100?jobtype=${encodeURIComponent(jobtype)}`
	);
	return res.data;
}

/**
 * 转换面试题的收藏状态
 * @param articleId 面试题ID
 * @returns 转换后的收藏状态
 */
export async function toggleFavorite(articleId: number) {
	const res = await instance.post<{ articleId: number }, SDF<boolean>>(
		'/question/toggle-favorite',
		{ articleId }
	);
	return res.data;
}

/**
 * 转换面试题的掌握状态
 * @param articleId 面试题ID
 * @returns 转换后的掌握状态
 */
export async function toggleMaster(articleId: number) {
	const res = await instance.post<{ articleId: number }, SDF<boolean>>('/question/toggle-master', {
		articleId
	});
	return res.data;
}

/**
 * 设置面试题的笔记内容
 * @param articleId 面试题ID
 * @param note 笔记内容
 * @returns 设置后的笔记内容
 */
export async function noteSet(dto: { articleId: number; note: string }) {
	const res = await instance.post<{ articleId: number; note: string }, SDF<string>>(
		'/question/set-note',
		dto
	);
	return res.data;
}

/**
 * 获取面试题的收藏、掌握状态和笔记
 * @param articleId 面试题ID
 * @returns 面试题状态信息
 */
export async function getQuestionStatus(articleId: number) {
	const res = await instance.get<
		SDF<{ is_favorite: boolean; is_master: boolean; note: string | null }>
	>(`/question/status?articleId=${articleId}`);
	return res.data;
}

/**
 * 主动更新hot100缓存
 * @returns 更新结果
 */
export async function updateHot100() {
	const res = await instance.get<SDF<string>>('/question/update-hot100');
	return res.data;
}

/**
 * 更新面试题
 * @param dto 更新内容
 * @returns 更新结果
 */
export async function updateQuestion(dto: UpdateQuestionDto) {
	const res = await instance.post<UpdateQuestionDto, SDF<string>>('/question/update', dto);
	return res.data;
}

/**
 * 获取用户拥有的面试题
 * @param jobtype 职位类型
 * @returns 用户拥有的面试题
 */
export async function getMyQuestions(
	jobtype: string,
	pageNumber: number,
	pageSize: number,
	master: string[], //长度为0代表全部
	favorite: string[],
	companyScale: string[]
) {
	const res = await instance.post<
		{
			jobtype: string;
			pageNumber: number;
			pageSize: number;
			master: string[];
			favorite: string[];
			companyScale: string[];
		},
		SDF<MyQuestionInfoVo>
	>(`/question/my-questions`, {
		jobtype,
		pageNumber,
		pageSize,
		master,
		favorite,
		companyScale
	});
	return res.data;
}

/**
 * 按id获取某道面试题数据
 * @param articleId 面试题ID
 * @returns 面试题数据
 */
export async function getQuestionById(articleId: number) {
	const res = await instance.get<SDF<MyQuestionData>>(`/question/by-id?articleId=${articleId}`);
	return res.data;
}

/**
 * 将指定id的面试题导入给用户
 * @param articleId 面试题ID
 * @returns 导入结果
 */
export async function importById(articleId: number) {
	const res = await instance.get<SDF<string>>(`/question/import-by-id?articleId=${articleId}`);
	return res.data;
}
