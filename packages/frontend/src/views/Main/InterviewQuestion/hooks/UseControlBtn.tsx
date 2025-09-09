import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addControl, removeControl } from '../../../../store/controlPanelSlice';
import { registerControlCallbacks, unregisterControlCallbacks } from '../utils/controlManager';

/**
 * 定义useControlBtn这个Hook的属性接口
 */
interface UseControlBtnProps {
	id: string;
	title: string;
	onCollapse: () => void;
	onScrollTop: () => void;
}

/**
 * 自定义Hook，用于注册和注销QuestionRead组件的控制按钮。
 *
 * @param {UseControlBtnProps} props - 包含控件ID、标题、折叠回调和滚动回调的属性对象。
 */
export const useControlBtn = ({ id, title, onCollapse, onScrollTop }: UseControlBtnProps) => {
	const dispatch = useDispatch();

	useEffect(() => {
		if (id && title) {
			// 将控件信息分派到Redux store
			dispatch(addControl({ id, title }));
			// 注册回调函数
			registerControlCallbacks(id, { onCollapse, onScrollTop });
		}

		// 当组件卸载时，执行清理操作
		return () => {
			if (id) {
				// 从Redux store中移除控件
				dispatch(removeControl(id));
				// 注销回调函数
				unregisterControlCallbacks(id);
			}
		};
	}, [id, title, onCollapse, onScrollTop, dispatch]);
};
