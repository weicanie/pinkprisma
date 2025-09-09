import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import { useQueryClient } from '@tanstack/react-query';
import { BookCheck, BookPlus, Map, Text } from 'lucide-react';
import React, { Suspense, useCallback, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '../../../../lib/utils';
import { useCustomMutation, useCustomQuery } from '../../../../query/config';
import { createQueryKey } from '../../../../query/keys';
import { getQuestionById, importById } from '../../../../services/question';
import { getUserRole } from '../../../../utils/getUerRole';
import ClickCollapsible from '../../components/ClickCollapsible';
import { MySpin } from '../../components/MySpin';
import { QuestionStatusControls } from '../../components/QuestionStatusControls';
import { useControlBtn } from '../hooks/UseControlBtn';

// 懒加载组件
const QuestionEdit = React.lazy(() => import('../../components/QuestionEdit'));
const MarkdownEditor = React.lazy(() => import('../../components/Editor_react_markdown'));
const MarkmapHooks = React.lazy(() => import('../../components/Markmap/markmap-hooks'));
const MilkdownEditor = React.lazy(() => import('../../components/Editor'));

interface QuestionReadProps {
	questionIdFromProps?: number;
	className?: string;
	isHot100?: boolean;
	//供外部组件覆盖默认行为
	onCollapse?: (questionId?: string) => void;
	onScrollTop?: () => void;
}

/**
 * 面试题详情页
 * 展示单个面试题的详细内容，包括答案、导图总结和要点。
 */
const QuestionRead: React.FC<QuestionReadProps> = React.memo(
	({ questionIdFromProps, className, isHot100, onCollapse, onScrollTop }) => {
		let { questionId } = useParams<{ questionId: string }>();
		if (questionIdFromProps) {
			questionId = `${questionIdFromProps}`;
		}
		const { resolvedTheme } = useTheme();
		const queryClient = useQueryClient();

		const userRole = getUserRole();
		const isDark = resolvedTheme === 'dark';

		const cardRef = useRef<HTMLDivElement>(null);

		// 哪些问题项是展开的
		const [questionOpenMap, setQuestionOpenMap] = useState<Record<string, boolean>>({
			content: false,
			mindmap: false,
			gist: false
		});
		const isContentOpen = questionOpenMap[`content`];
		const isMindmapOpen = questionOpenMap[`mindmap`];
		const isGistOpen = questionOpenMap[`gist`];
		const handleClick = (e: React.MouseEvent, key: 'content' | 'mindmap' | 'gist') => {
			e.stopPropagation();
			setQuestionOpenMap(prev => ({
				...prev,
				[key]: !prev[key]
			}));
		};

		// 根据URL中的ID获取面试题详情
		const { data, status, error } = useCustomQuery(
			createQueryKey.questions.questionDetail(questionId!), // 查询键
			() => getQuestionById(Number(questionId)), // 获取数据的函数
			{
				enabled: !!questionId // 只有当questionId存在时才执行查询
			}
		);

		const handleCollapse = useCallback(() => {
			setQuestionOpenMap({
				content: false,
				mindmap: false,
				gist: false
			});
		}, []);

		const handleScrollTop = useCallback(() => {
			cardRef.current?.scrollIntoView({
				behavior: 'smooth',
				//答案未展开时，滚动到中间；答案展开时，滚动到顶部
				block: isContentOpen ? 'start' : 'center'
			});
		}, [isContentOpen]);

		const questionData = data?.data;

		//添加控制按钮
		useControlBtn({
			id: questionId!,
			title: questionData?.title ?? '加载中...',
			onCollapse: onCollapse ? () => onCollapse(questionId) : handleCollapse,
			onScrollTop: onScrollTop ? onScrollTop : handleScrollTop
		});

		const importMutation = useCustomMutation(importById);
		const handleImportQuestion = useCallback(
			(e: React.MouseEvent<HTMLButtonElement>) => {
				e.stopPropagation();
				importMutation.mutate(Number(questionId), {
					onSuccess: () => {
						queryClient.invalidateQueries({
							queryKey: createQueryKey.questions.questionDetail(questionId!)
						});
					}
				});
			},
			[questionId]
		);

		if (status === 'pending') {
			return <div className="p-4">加载中...</div>;
		}

		if (status === 'error') {
			return <div className="p-4 text-red-500">错误: {error?.message}</div>;
		}

		if (!questionData) {
			return <div className="p-4 text-center text-gray-500">没有找到面试题数据</div>;
		}

		return (
			<div className={cn(`transition-colors duration-200 bg-global p-4 md:p-8`, className)}>
				<div className="container mx-auto">
					<Card
						className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${isHot100 ? 'border-none shadow-none py-0' : ''}`}
						ref={cardRef}
					>
						<CardHeader className={`${isHot100 ? 'px-0' : ''}`}>
							<div className="flex justify-between items-start">
								<div>
									{!isHot100 && (
										<CardTitle
											className={`text-xl ${
												isDark ? 'text-white' : 'text-gray-900'
											} flex items-center gap-2}`}
										>
											{questionData.title}
										</CardTitle>
									)}
									{/* 收藏、掌握状态控制 */}
									<div className="mt-2 flex items-center gap-4">
										{questionData.notYours ? (
											<Button
												variant="ghost"
												size="sm"
												onClick={handleImportQuestion}
												disabled={importMutation.isPending}
												className={`p-2 h-8 w-8 ${
													questionData.notYours
														? 'text-gray-400 hover:text-green-500'
														: 'text-green-500 hover:text-green-600'
												}`}
												title={questionData.notYours ? '导入面试题' : '面试题已导入'}
											>
												<BookPlus className={`size-5`} />
											</Button>
										) : (
											<QuestionStatusControls
												articleId={Number(questionId)}
												initialStatus={{
													is_favorite: questionData.is_favorite,
													is_master: questionData.is_master,
													note: questionData.note ?? ''
												}}
											/>
										)}
										{userRole === 'admin' && (
											<Suspense fallback={<div>加载编辑弹窗...</div>}>
												<QuestionEdit
													question={questionData}
													onSuccess={() => {
														queryClient.invalidateQueries({
															queryKey: createQueryKey.questions.questionDetail(questionId!)
														});
													}}
												/>
											</Suspense>
										)}
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent className={`space-y-4 ${isHot100 ? 'px-1' : ''}`}>
							{/* 参考答案 */}
							<ClickCollapsible
								title={
									<span className={`text-base ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
										{'答案'}
									</span>
								}
								icon={
									<BookCheck className={`size-5 ${isDark ? 'text-blue-300' : 'text-blue-800'}`} />
								}
								open={isContentOpen}
								onClick={e => handleClick(e, 'content')}
								enablePreload={true}
							>
								<Suspense fallback={<MySpin text="加载编辑器..."></MySpin>}>
									<MarkdownEditor
										initialValue={questionData.content || '暂无答案'}
										isReadOnly={true}
									/>
								</Suspense>
							</ClickCollapsible>

							{/* 导图总结 */}
							{questionData.content_mindmap && (
								<ClickCollapsible
									title={
										<span className={`text-base ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
											{'导图总结'}
										</span>
									}
									icon={<Map className={`size-5 ${isDark ? 'text-blue-300' : 'text-blue-800'}`} />}
									open={isMindmapOpen}
									onClick={e => handleClick(e, 'mindmap')}
									enablePreload={false}
								>
									<Suspense fallback={<div>加载导图...</div>}>
										<MarkmapHooks
											text={
												questionData.content_mindmap
													?.replace(/\\n/g, '\n')
													.replace(/\\t/g, '\t')
													.replace(/\\r/g, '\r')
													.replace(/\\\\/g, '\\')
													.replace(/\\"/g, '"')
													.replace(/\\'/g, "'") || '暂无导图总结'
											}
										/>
									</Suspense>
								</ClickCollapsible>
							)}

							{/* 要点总结 */}
							<ClickCollapsible
								title={
									<span className={`text-base ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
										{'要点'}
									</span>
								}
								icon={<Text className={`size-5 ${isDark ? 'text-blue-300' : 'text-blue-800'}`} />}
								open={isGistOpen}
								onClick={e => handleClick(e, 'gist')}
								enablePreload={true}
							>
								<Suspense fallback={<div>加载编辑器...</div>}>
									<MilkdownEditor isShwoMode={true} text={questionData.gist || '暂无要点'} />
								</Suspense>
							</ClickCollapsible>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}
);

export default QuestionRead;
