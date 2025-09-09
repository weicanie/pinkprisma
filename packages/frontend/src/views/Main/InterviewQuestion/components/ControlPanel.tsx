import { Button } from '@/components/ui/button';
import { CornerDownLeft, Minimize2 } from 'lucide-react';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectControls } from '../../../../store/controlPanelSlice';
import { getControlCallbacks } from '../utils/controlManager';

/**
 * 屏幕右下角的固定控制面板
 *
 * 显示所有已注册的`QuestionRead`组件的控制按钮。
 * 每个控件包括问题标题、一个折叠按钮和一个返回顶部按钮。
 */
export const ControlPanel: React.FC = () => {
	const controls = useSelector(selectControls);

	// 当没有控件时，不渲染任何内容
	if (controls.length === 0) {
		return null;
	}

	return (
		<div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
			{/* 从下到上排列按钮 */}
			{controls.map(({ id, title }) => {
				const callbacks = getControlCallbacks(id);
				if (!callbacks) return null;

				return (
					<div
						key={id}
						className={`max-w-[90vw]  flex animate-in fade-in-90 slide-in-from-bottom-10 items-center gap-2 rounded-lg border bg-sidebar p-2 shadow-lg `}
					>
						<span className="w-full pl-2 truncate text-sm font-medium">{title}</span>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => {
								callbacks.onCollapse();
							}}
							title="折叠"
						>
							<Minimize2 className="size-4" />
						</Button>
						<Button variant="ghost" size="icon" onClick={callbacks.onScrollTop} title="返回顶部">
							<CornerDownLeft className="size-4" />
						</Button>
					</div>
				);
			})}
		</div>
	);
};
