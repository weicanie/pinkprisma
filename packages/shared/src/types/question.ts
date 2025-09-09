import { z } from 'zod';

export const startCrawlQuestionSchema = z.object({
	list: z.string().url({ message: '必须是合法的URL' }).min(1, 'URL不能为空'),
	domain: z.string().url({ message: '必须是合法的URL' }).min(1, 'URL不能为空')
});

export type StartCrawlQuestionDto = z.infer<typeof startCrawlQuestionSchema>;

export interface InterviewQuestion {
	id: number;
	link: string;
	create_at: Date | null;
	update_at: Date | null;

	title: string; //问题
	quiz_type: string;
	content: string; //参考答案
	content_mindmap: string | null; //参考答案结构化总结
	user_note: string | null; //用户笔记
	gist: string | null; //要点总结
	content_type: string;
	job_type: string | null;
	hard: string;

	own: boolean;

	time_create: Date | null;
	time_update: Date | null;
	interview_summary_id?: number;

	version: string;
	change_log?: string | null;
}

// export type InterviewQuestionData = Pick<
// 	InterviewQuestion,
// 	'id' | 'title' | 'content' | 'content_mindmap' | 'gist'
// >;

// export interface InterviewQuestionDataVo extends InterviewQuestionData {}

export type InterviewQuestionInfo = Omit<InterviewQuestion, 'content' | 'content_mindmap' | 'gist'>;

export interface InterviewQuestionInfoVo extends InterviewQuestionInfo {
	interview_count: number;
	total_interview_count: number;
}

export interface MyQuestionInfo
	extends Pick<InterviewQuestion, 'id' | 'title' | 'job_type' | 'hard'> {
	is_favorite: boolean;
	is_master: boolean;
	interview_count: number;
	company_name: string; // 公司名称
	company_scale: string; // 公司规模
}

export interface MyQuestionData extends Omit<InterviewQuestion, 'own'> {
	note?: string;
	is_favorite: boolean;
	is_master: boolean;
	notYours?: boolean;
}

export interface MyQuestionInfoVo {
	total: number;
	data: MyQuestionInfo[];
}

export interface UpdateQuestionDto {
	articleId: number;

	title?: string;
	content?: string;
	gist?: string;
	content_mindmap?: string;

	version?: string;
	change_log?: string;

	content_type?: string;
	job_type?: string;
	hard?: string;
}
