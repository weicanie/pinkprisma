import { APIProvider, SelectedLLM, type InterviewSummaryCreateDto } from '@prisma-ai/shared';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { selectedLLMToApiType } from '../services/apikey/apikey_ls.service';

// 用于存储面经创建表单的数据接口
export interface InterviewSummaryState {
	form: InterviewSummaryCreateDto;
	model: SelectedLLM;
	apiType: APIProvider;
	table: {
		all: {
			pageIndex: number;
			pageSize: number;
		};
		market: {
			pageIndex: number;
			pageSize: number;
		};
	};
	// 我的面经表格-过滤选项状态管理
	filterOptions: {
		// 每个列ID对应的过滤值选中状态
		selectedFilters: Record<string, string[]> & { own: boolean[] };
	};
}

// 初始化状态，所有字段均为空或默认值
const initialState: InterviewSummaryState = {
	form: {
		content: '',
		own: false, // 默认为别人的面经
		modelConfig: {
			api_type: APIProvider.kimi,
			llm_type: SelectedLLM.k2,
			apiKey: ''
		}
	},
	table: {
		all: {
			pageIndex: 0,
			pageSize: 10
		},
		market: {
			pageIndex: 0,
			pageSize: 10
		}
	},
	filterOptions: {
		selectedFilters: {
			job_type: [],
			interview_type: [],
			company_scale: [],
			//搜索框内容
			search: [],
			own: [] //! boolean[]
		}
	},
	model: SelectedLLM.glm4_5,
	apiType: APIProvider.zhipu
};

// 创建面经的 Redux Slice
const InterviewSummarySlice = createSlice({
	name: 'InterviewSummary',
	initialState,
	reducers: {
		// 设置表单数据，支持部分更新
		setInterviewSummaryForm: (
			state,
			action: PayloadAction<Partial<InterviewSummaryState['form']>>
		) => {
			state.form = { ...state.form, ...action.payload };
		},
		// 重置表单数据到初始状态
		resetInterviewSummaryForm: state => {
			state.form = initialState.form;
		},
		setInterviewSummaryLLM: (state, { payload }: PayloadAction<SelectedLLM>) => {
			state.model = payload;
			state.apiType = selectedLLMToApiType[payload];
		},
		setInterviewSummaryTablePageIndex: (
			state,
			{ payload }: PayloadAction<{ type: 'all' | 'market'; pageIndex: number }>
		) => {
			state.table[payload.type].pageIndex = payload.pageIndex;
		},
		setInterviewSummaryTablePageSize: (
			state,
			{ payload }: PayloadAction<{ type: 'all' | 'market'; pageSize: number }>
		) => {
			state.table[payload.type].pageSize = payload.pageSize;
		},
		// 设置所有列的过滤值选中状态
		setInterviewSummaryFilterOptions: (
			state,
			{ payload }: PayloadAction<Record<string, string[]> & { own: boolean[] }>
		) => {
			state.filterOptions.selectedFilters = payload;
		},
		// 更新单个列的过滤值选中状态
		updateInterviewSummaryColumnFilter: (
			state,
			{ payload }: PayloadAction<{ columnId: string; selectedFilterValues: any[] }>
		) => {
			const { columnId, selectedFilterValues } = payload;
			if (selectedFilterValues.length === 0) {
				delete state.filterOptions.selectedFilters[columnId];
			} else {
				state.filterOptions.selectedFilters[columnId] = selectedFilterValues ?? [];
			}
		},
		// 清除所有过滤选项
		clearInterviewSummaryAllFilters: state => {
			state.filterOptions.selectedFilters = {
				company_name: [],
				job_name: [],
				job_type: [],
				interview_type: [],
				company_scale: [],
				search: [],
				own: []
			};
		},
		// 清除指定列的过滤选项
		clearInterviewSummaryColumnFilter: (state, { payload }: PayloadAction<string>) => {
			state.filterOptions.selectedFilters[payload] = [];
		}
	}
});

// 导出 Actions，以便在组件中 dispatch
export const {
	setInterviewSummaryForm,
	resetInterviewSummaryForm,
	setInterviewSummaryLLM,
	setInterviewSummaryTablePageIndex,
	setInterviewSummaryTablePageSize,
	setInterviewSummaryFilterOptions,
	updateInterviewSummaryColumnFilter,
	clearInterviewSummaryAllFilters,
	clearInterviewSummaryColumnFilter
} = InterviewSummarySlice.actions;

// 导出 Selector，用于从 store 中获取面经表单数据
export const selectInterviewSummaryForm = (state: { interviewSummary: InterviewSummaryState }) =>
	state.interviewSummary.form;

export const selectInterviewSummaryLLM = (state: { interviewSummary: InterviewSummaryState }) =>
	state.interviewSummary.model;

export const selectInterviewSummaryApiType = (state: { interviewSummary: InterviewSummaryState }) =>
	state.interviewSummary.apiType;
// ----- 分页参数 -----
export const selectInterviewSummaryTableAllPageIndex = (state: {
	interviewSummary: InterviewSummaryState;
}) => state.interviewSummary.table.all.pageIndex;

export const selectInterviewSummaryTableAllPageSize = (state: {
	interviewSummary: InterviewSummaryState;
}) => state.interviewSummary.table.all.pageSize;

export const selectInterviewSummaryTableMarketPageIndex = (state: {
	interviewSummary: InterviewSummaryState;
}) => state.interviewSummary.table.market.pageIndex;

export const selectInterviewSummaryTableMarketPageSize = (state: {
	interviewSummary: InterviewSummaryState;
}) => state.interviewSummary.table.market.pageSize;
// ----- 过滤选项 -----
//获取所有列的过滤值
export const selectInterviewSummaryFilterOptions = (state: {
	interviewSummary: InterviewSummaryState;
}) => state.interviewSummary.filterOptions.selectedFilters;

//获取某列的过滤值
export const selectInterviewSummaryColumnFilter =
	(columnId: string) => (state: { interviewSummary: InterviewSummaryState }) => {
		return state.interviewSummary.filterOptions.selectedFilters[columnId];
	};

// 导出 Reducer，用于在 store 中注册
export const InterviewSummaryReducer = InterviewSummarySlice.reducer;
