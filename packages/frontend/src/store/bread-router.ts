import { createSlice } from '@reduxjs/toolkit';
import { path_name } from '../router/router';
interface BreadRouterItem {
	name: string;
	path: string;
}
interface BreadRouterState {
	list: BreadRouterItem[];
}

const initialState: BreadRouterState = { list: [] };

const slice = createSlice({
	name: 'bread-router',
	initialState,
	reducers: {
		/* 路由跳转后,根据当前路由更新面包屑导航 */
		updateAction: (state, { payload: path }: { payload: string }) => {
			if (!path || !path_name[path]) {
				return;
			}
			//'面经-我的面经'
			const names = path_name[path].split('-');
			//['interview-summary','my']
			const paths = path.split('/').filter(item => item !== '' && item !== 'main');

			state.list = [];
			//将paths中的元素映射为面包屑列表的元素,添加到state.list中用于面包屑组件渲染
			//[{name:'面经',path:'/main/interview-summary'},{name:'我的面经',path:'/main/interview-summary/my'}]
			for (let i = 0; i < paths.length; i++) {
				const name = names[i] || '';
				if (!name) continue;
				const path = '/main/' + paths.slice(0, i + 1).join('/');
				state.list.push({ name, path });
			}
		}
	}
});

export const { updateAction } = slice.actions;

export const selectBreadRouterList = (state: { breadRouter: BreadRouterState }) =>
	state.breadRouter.list;

export const breadRouterReducer = slice.reducer;
