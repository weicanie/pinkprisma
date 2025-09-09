import { job_type_list } from '@prisma-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 定义职位类型分组
export const jobTypeListGroup = {
	software: job_type_list.slice(0, 4).concat(job_type_list.slice(14, 16)).concat(['运维']),
	hardware: job_type_list.slice(4, 6),
	ai: job_type_list.slice(6, 10),
	data: job_type_list.slice(10, 14),
	other: job_type_list.slice(16)
};

// 职位分组名称映射
export const groupNameMap = {
	software: '软件开发',
	data: '数据',
	ai: '人工智能/算法',
	hardware: '硬件',
	other: '其他'
};

// 面试题目状态接口
export interface InterviewQuestionState {
	// 表格分页状态
	table: {
		pageIndex: number;
		pageSize: number;
		jobOption?: {
			group: keyof typeof jobTypeListGroup;
			name: string;
		};
	};
	// 我的面试题表格-过滤选项状态管理
	filterOptions: {
		// 每个列ID对应的过滤值选中状态
		selectedFilters: Record<string, string[]>;
	};
}

// 初始化状态
const initialState: InterviewQuestionState = {
	table: {
		pageIndex: 0,
		pageSize: 10,
		jobOption: {
			group: 'software',
			name: '前端'
		}
	},
	filterOptions: {
		selectedFilters: {
			is_master: [],
			is_favorite: [],
			company_scale: [],
			//搜索框内容
			search: []
		}
	}
};

// 创建面试题目的 Redux Slice
const InterviewQuestionSlice = createSlice({
	name: 'InterviewQuestion',
	initialState,
	reducers: {
		// 设置表格分页索引
		setInterviewQuestionTablePageIndex: (state, { payload }: PayloadAction<number>) => {
			state.table.pageIndex = payload;
		},
		// 设置表格分页大小
		setInterviewQuestionTablePageSize: (state, { payload }: PayloadAction<number>) => {
			state.table.pageSize = payload;
		},
		// 设置所有列的过滤值选中状态
		setInterviewQuestionFilterOptions: (
			state,
			{ payload }: PayloadAction<Record<string, string[]>>
		) => {
			state.filterOptions.selectedFilters = payload;
		},
		// 更新单个列的过滤值选中状态
		updateInterviewQuestionColumnFilter: (
			state,
			{ payload }: PayloadAction<{ columnId: string; selectedFilterValues: string[] }>
		) => {
			const { columnId, selectedFilterValues } = payload;
			if (selectedFilterValues.length === 0) {
				// 如果没有选中值，删除该列的过滤状态
				delete state.filterOptions.selectedFilters[columnId];
			} else {
				// 更新该列的过滤状态
				state.filterOptions.selectedFilters[columnId] = selectedFilterValues ?? [];
			}
		},
		// 设置职位选项
		setInterviewQuestionJobOption: (
			state,
			{ payload }: PayloadAction<Partial<{ group: keyof typeof jobTypeListGroup; name: string }>>
		) => {
			state.table.jobOption = { ...state.table.jobOption, ...payload } as {
				group: keyof typeof jobTypeListGroup;
				name: string;
			};
		},
		// 清除所有过滤选项
		clearInterviewQuestionAllFilters: state => {
			state.filterOptions.selectedFilters = {
				is_master: [],
				is_favorite: [],
				company_scale: [],
				search: []
			};
		},
		// 清除指定列的过滤选项
		clearInterviewQuestionColumnFilter: (state, { payload }: PayloadAction<string>) => {
			state.filterOptions.selectedFilters[payload] = [];
		}
	}
});

// 导出 Actions
export const {
	setInterviewQuestionTablePageIndex,
	setInterviewQuestionTablePageSize,
	setInterviewQuestionFilterOptions,
	updateInterviewQuestionColumnFilter,
	clearInterviewQuestionAllFilters,
	clearInterviewQuestionColumnFilter,
	setInterviewQuestionJobOption
} = InterviewQuestionSlice.actions;

// 导出 Selectors
export const selectInterviewQuestionTablePageIndex = (state: {
	interviewQuestion: InterviewQuestionState;
}) => state.interviewQuestion.table.pageIndex;

export const selectInterviewQuestionTablePageSize = (state: {
	interviewQuestion: InterviewQuestionState;
}) => state.interviewQuestion.table.pageSize;

//获取所有列的过滤值
export const selectInterviewQuestionFilterOptions = (state: {
	interviewQuestion: InterviewQuestionState;
}) => state.interviewQuestion.filterOptions.selectedFilters;
//获取某列的过滤值
export const selectInterviewQuestionColumnFilter =
	(columnId: string) => (state: { interviewQuestion: InterviewQuestionState }) =>
		state.interviewQuestion.filterOptions.selectedFilters[columnId];

export const selectInterviewQuestionJobOption = (state: {
	interviewQuestion: InterviewQuestionState;
}) => state.interviewQuestion.table.jobOption;

// 导出 Reducer
export const InterviewQuestionReducer = InterviewQuestionSlice.reducer;
