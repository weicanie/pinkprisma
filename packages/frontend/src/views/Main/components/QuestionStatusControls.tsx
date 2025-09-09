import { BookOpen, CheckCircle, SquarePen, Star } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '../../../components/ui/dialog';
import { useCustomMutation } from '../../../query/config';
import { noteSet, toggleFavorite, toggleMaster } from '../../../services/question';
import MilkdownEditor from './Editor';
import { useQueryClient } from '@tanstack/react-query';
import { InterviewSummaryQueryKey } from '../../../query/keys';

interface QuestionStatusControlsProps {
	articleId: number;
	initialStatus?: {
		is_favorite: boolean;
		is_master: boolean;
		note: string | null;
	};
	onStatusChange?: (status: {
		is_favorite: boolean;
		is_master: boolean;
		note: string | null;
	}) => void;
}
/**
 * 面试题状态、笔记展示和更新组件。包括收藏、掌握状态和笔记。
 */
export const QuestionStatusControls: React.FC<QuestionStatusControlsProps> = ({
	articleId,
	initialStatus,
	onStatusChange
}) => {
	const [status, setStatus] = useState({
		is_favorite: initialStatus?.is_favorite ?? false,
		is_master: initialStatus?.is_master ?? false,
		note: initialStatus?.note ?? null
	});
	const queryClient = useQueryClient();
	const [noteContent, setNoteContent] = useState(status.note || '');
	const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);

	// 收藏状态切换
	const favoriteMutation = useCustomMutation(toggleFavorite, {
		onSuccess: data => {
			if (data.code === '0') {
				const newStatus = { ...status, is_favorite: data.data };
				setStatus(newStatus);
				onStatusChange?.(newStatus);
				toast.success(status.is_favorite ? '取消收藏' : '收藏');
				queryClient.invalidateQueries({
					queryKey: [InterviewSummaryQueryKey.UnuploadedCount]
				});
			}
		}
	});

	// 掌握状态切换
	const masterMutation = useCustomMutation(toggleMaster, {
		onSuccess: data => {
			if (data.code === '0') {
				const newStatus = { ...status, is_master: data.data };
				setStatus(newStatus);
				onStatusChange?.(newStatus);
				toast.success(status.is_master ? '设置为未掌握' : '设置为已掌握');
				queryClient.invalidateQueries({
					queryKey: [InterviewSummaryQueryKey.UnuploadedCount]
				});
			}
		}
	});

	// 设置笔记
	const noteMutation = useCustomMutation(noteSet, {
		onSuccess: data => {
			if (data.code === '0') {
				const newStatus = { ...status, note: data.data };
				setStatus(newStatus);
				onStatusChange?.(newStatus);
				setIsNoteDialogOpen(false);
				toast.success('笔记保存成功');
			}
		}
	});

	const handleFavoriteToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		favoriteMutation.mutate(articleId);
	};

	const handleMasterToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		masterMutation.mutate(articleId);
	};

	const handleNoteSave = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		noteMutation.mutate({ articleId, note: noteContent });
	};

	const handleNoteDialogOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		setIsNoteDialogOpen(true);
		setNoteContent(status.note || '');
	};

	return (
		<div className="flex items-center gap-2">
			{/* 收藏按钮 */}
			<Button
				variant="ghost"
				size="sm"
				onClick={handleFavoriteToggle}
				disabled={favoriteMutation.isPending}
				className={`p-2 h-8 w-8 ${
					status.is_favorite
						? 'text-yellow-500 hover:text-yellow-600'
						: 'text-gray-400 hover:text-yellow-500'
				}`}
				title={status.is_favorite ? '取消收藏' : '收藏'}
			>
				<Star className={`size-5 ${status.is_favorite ? 'fill-current' : ''}`} />
			</Button>

			{/* 掌握状态按钮 */}
			<Button
				variant="ghost"
				size="sm"
				onClick={handleMasterToggle}
				disabled={masterMutation.isPending}
				className={`p-2 h-8 w-8 ${
					status.is_master
						? 'text-green-500 hover:text-green-600'
						: 'text-gray-400 hover:text-green-500'
				}`}
				title={status.is_master ? '标记为未掌握' : '标记为已掌握'}
			>
				<CheckCircle className={`size-5`} />
			</Button>

			{/* 笔记按钮 */}
			<Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
				<DialogTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleNoteDialogOpen}
						className={`p-2 h-8 w-8 ${
							status.note
								? 'text-blue-500 hover:text-blue-600'
								: 'text-gray-400 hover:text-blue-500'
						}`}
						title={status.note ? '编辑笔记' : '添加笔记'}
					>
						{status.note ? <BookOpen className="size-5" /> : <SquarePen className="size-5" />}
					</Button>
				</DialogTrigger>
				<DialogContent
					className="block lg:max-w-2xl! sm:max-w-[80vw]! min-h-[50vh] max-h-[80vh] overflow-y-auto overflow-x-hidden scb-thin bg-editor"
					// 阻止点击事件冒泡到外部组件
					onClick={e => {
						e.stopPropagation();
					}}
				>
					<DialogHeader>
						<DialogTitle className="space-x-3">
							<span className=" text-gray-400">笔记</span>
							<span className="text-sm text-gray-500">
								支持
								<a href="https://markdown.com.cn/cheat-sheet.html" target="_blank">
									markdown语法
								</a>
							</span>
						</DialogTitle>
					</DialogHeader>
					<MilkdownEditor
						text={noteContent}
						isShwoMode={false}
						onChange={setNoteContent}
						className="w-[calc(100%-5rem)]"
					/>
					<div className="space-y-4 fixed bottom-5 right-5">
						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
								取消
							</Button>
							<Button onClick={handleNoteSave} disabled={noteMutation.isPending}>
								{noteMutation.isPending ? '保存中...' : '保存'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
