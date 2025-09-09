export enum ProjectQueryKey {
	Projects = 'projects',
	ProjectPolished = 'projectPolished',
	ProjectMined = 'projectMined'
}

export enum SkillQueryKey {
	Skills = 'skills'
}
export enum ResumeQueryKey {
	Resumes = 'resumes',
	ResumeMatched = 'resumeMatched'
}
export enum JobQueryKey {
	Jobs = 'jobs'
}

export enum KnowledgeQueryKey {
	Knowledges = 'knowledges'
}

export enum InterviewSummaryQueryKey {
	All = 'interview-summary-all',
	Created = 'interview-summary-created',
	Imported = 'interview-summary-imported',
	Market = 'interview-summary-market',
	Detail = 'interview-summary-detail',
	UnuploadedCount = 'interview-summary-unuploaded-count',
	UserInterviewSummaryIds = 'interview-summary-user-interview-summary-ids'
}

export enum TaskQueueQueryKey {
	Detail = 'task-queue-detail'
}

export enum ApiKeyQueryKey {
	List = 'apikey-list',
	Detail = 'apikey-detail',
	Providers = 'apikey-providers'
}

export const MANAGE_QUERY_KEY = {
	USERS: 'manage_users',
	SERVICE_STATUS: 'manage_service_status',
	NOTIFICATIONS_ADMIN: 'manage_notifications_admin',
	NOTIFICATIONS_USER: 'manage_notifications_user'
};

export enum QuestionQueryKey {
	Hot100 = 'question-hot100',
	MyQuestions = 'question-my-questions',
	QuestionDetail = 'question-detail'
}

//需要额外构建逻辑的查询key
export const createQueryKey = {
	interviewSummaries: {
		allByPage: (pageNumber: number, pageSize: number, filterOptions: Record<string, string[]>) => {
			for (const key in filterOptions) {
				filterOptions[key] = filterOptions[key].sort();
			}
			return [InterviewSummaryQueryKey.All, pageNumber, pageSize, filterOptions];
		}
	},
	questions: {
		myQuestions: (
			jobtype: string,
			pageNumber: number,
			pageSize: number,
			filterOptions: Record<string, string[]>
		) => {
			for (const key in filterOptions) {
				filterOptions[key] = filterOptions[key].sort();
			}
			return [QuestionQueryKey.MyQuestions, jobtype, pageNumber, pageSize, filterOptions];
		},
		questionDetail: (questionId: string) => [QuestionQueryKey.QuestionDetail, questionId]
	}
};
