import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * 定义单个控件的信息接口
 */
interface ControlInfo {
	id: string;
	title: string;
}

/**
 * 定义控制面板的状态接口
 */
export interface ControlPanelState {
	controls: ControlInfo[];
}

// 初始化状态
const initialState: ControlPanelState = {
	controls: []
};

/**
 * 创建一个用于控制面板的Redux Slice
 */
const controlPanelSlice = createSlice({
	name: 'controlPanel',
	initialState,
	reducers: {
		/**
		 * 添加或更新一个控件
		 * @param state - 当前状态
		 * @param payload - 控件信息
		 */
		addControl: (state, { payload }: PayloadAction<ControlInfo>) => {
			const index = state.controls.findIndex(c => c.id === payload.id);
			if (index === -1) {
				// 如果控件不存在，则添加到数组末尾
				state.controls.push(payload);
			} else {
				// 如果控件已存在，则更新其信息
				state.controls[index] = payload;
			}
		},
		/**
		 * 移除一个控件
		 * @param state - 当前状态
		 * @param payload - 要移除的控件ID
		 */
		removeControl: (state, { payload }: PayloadAction<string>) => {
			state.controls = state.controls.filter(c => c.id !== payload);
		}
	}
});

// 导出Actions
export const { addControl, removeControl } = controlPanelSlice.actions;

// 导出Selector，用于从state中获取控件列表
export const selectControls = (state: { controlPanel: ControlPanelState }) =>
	state.controlPanel.controls;

// 导出Reducer
export const controlPanelReducer = controlPanelSlice.reducer;
