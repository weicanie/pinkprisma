import { z } from 'zod';
import {
	company_scale_list,
	interview_type_list,
	job_type_list,
	turn_list
} from './interview-summary';

/**
 * 面经通过llm提取出的面试题
 */
export const interviewSummaryArticleSchema = z.object({
	title: z.string().describe('问题'),
	content: z.string().describe('问题答案'),
	gist: z.string().describe('摘要'),
	content_mindmap: z.string().describe('思维导图摘要'),
	hard: z.union([z.string(), z.number()]).describe('难度评级,从易到难1~5'),
	quiz_type: z.string().describe('题目考察方式,为其中之一：选择题、问答题、力扣算法题、其它'),
	content_type: z.string().describe('题目内容类型,如：javascript、typescript')
});

export type InterviewSummaryArticle = z.infer<typeof interviewSummaryArticleSchema>;
/**
 * llm补全的面试题的schema
 */
export const interviewSummaryCompleteSchema = z.object({
	job_type: z
		.enum(job_type_list as [string, ...string[]])
		.describe('岗位方向，无法推断时为`未知方向`'),
	interview_type: z
		.enum(interview_type_list as [string, ...string[]])
		.describe('招聘类型，无法推断时为`未知`'),
	company_scale: z
		.enum(company_scale_list as [string, ...string[]])
		.describe('公司规模，无法推断时为`未知规模`'),
	company_name: z.string().describe('公司名称，无法推断时为`未知公司`'),
	turn: z.enum(turn_list as [string, ...string[]]).describe('面试轮次，无法推断时为`未知轮次`'),
	job_name: z.string().describe('岗位名称，无法推断时为`未知岗位`')
});

export enum copyright_type {
	reprint = '转载',
	origin = '原创'
}
const copyright_type_list = [copyright_type.origin, copyright_type.reprint];
/**
 * 新建面经的Dto的schema
 */
export const interviewSummaryCreateDtoSchema = z.object({
	content: z.string().min(1, '面经内容不能为空'),
	own: z.boolean(),
	job_type: z.enum(job_type_list as [string, ...string[]]).optional(),
	interview_type: z.enum(interview_type_list as [string, ...string[]]).optional(),
	company_scale: z.enum(company_scale_list as [string, ...string[]]).optional(),
	turn: z.enum(turn_list as [string, ...string[]]).optional(),
	copyright_type: z.enum(copyright_type_list as [string, ...string[]]),
	company_name: z.string().optional(),
	job_name: z.string().optional(),
	job_link: z.string().optional(),
	post_link: z.string().optional()
});
