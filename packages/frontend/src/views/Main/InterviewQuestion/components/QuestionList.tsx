import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/utils/theme';
import type { InterviewQuestionInfoVo } from '@prisma-ai/shared';
import { BookCopy, List, Text } from 'lucide-react';
import React, { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { useCustomQuery } from '../../../../query/config';
import { QuestionQueryKey } from '../../../../query/keys';
import { getHot100Questions } from '../../../../services/question';
import ClickCollapsible from '../../components/ClickCollapsible';
import { MySpin } from '../../components/MySpin';
import { ControlPanel } from './ControlPanel';

const QuestionRead = lazy(() => import('./QusetionRead'));

interface QuestionListProps {
	jobType: string;
	sortStrategy: string;
}

/**
 * 排序策略枚举
 */
enum SortStrategy {
	AVERAGE_RANK = 'average_rank', // 平均排名策略（题目极端）
	WEIGHTED_SCORE = 'weighted_score', // 加权综合评分策略（题目优先）
	TOTAL_HEAT = 'total_heat', // 总热度策略（题目和数量）
	HYBRID = 'hybrid' // 混合策略（均衡）
}

/**
 * 面试题列表组件
 * 负责渲染指定职位类型的面试题列表
 * 使用懒加载、useMemo、鼠标悬浮预渲染优化性能
 */
const QuestionList: React.FC<QuestionListProps> = ({ jobType, sortStrategy }) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	// 获取当前职位类型的热门面试题
	const { data, status, error } = useCustomQuery(
		[QuestionQueryKey.Hot100, jobType],
		() => getHot100Questions(jobType),
		{
			enabled: !!jobType // 只有当jobType存在时才执行查询
		}
	);

	/**
	 * 按content_type分组并根据不同策略进行排序
	 * @param questions 面试题列表
	 * @returns 按指定策略排序的分组数据
	 */
	const groupAndSortQuestions = useCallback(
		(questions: InterviewQuestionInfoVo[]) => {
			// 按content_type分组
			const groupedByContentType = questions.reduce(
				(acc, question, index) => {
					const contentType = question.content_type || '未分类';
					if (!acc[contentType]) {
						acc[contentType] = [];
					}
					// 添加原始排名信息（index + 1）
					acc[contentType].push({ ...question, originalRank: index + 1 });
					return acc;
				},
				{} as Record<string, (InterviewQuestionInfoVo & { originalRank: number })[]>
			);

			// 计算每个content_type的各种指标
			const contentTypeWithMetrics = Object.entries(groupedByContentType).map(
				([contentType, items]) => {
					const totalQuestions = items.length;
					const avgRank = items.reduce((sum, item) => sum + item.originalRank, 0) / totalQuestions;
					const totalHeat = items.reduce((sum, item) => sum + item.interview_count, 0);
					const avgHeat = totalHeat / totalQuestions;

					// 计算最高排名题目的排名（最小值）
					const bestRank = Math.min(...items.map(item => item.originalRank));

					// 计算加权综合评分
					// 公式：(题目数量权重 * log(题目数量)) + (热度权重 * 平均热度) + (排名权重 * (101 - 平均排名))
					const quantityWeight = 0.3;
					const heatWeight = 0.4;
					const rankWeight = 0.3;

					const weightedScore =
						quantityWeight * Math.log(totalQuestions + 1) +
						heatWeight * (avgHeat / 10) + // 归一化热度
						(rankWeight * (101 - avgRank)) / 100; // 归一化排名（排名越小分数越高）

					// 混合策略评分：综合考虑多个因素
					// 优先考虑有高质量题目的分类，同时兼顾数量和热度
					const hybridScore =
						(0.4 * (101 - bestRank)) / 100 + // 最佳题目排名权重40%
						(0.3 * (101 - avgRank)) / 100 + // 平均排名权重30%
						(0.2 * Math.log(totalQuestions + 1)) / Math.log(11) + // 题目数量权重20%（假设最多10题）
						0.1 *
							(avgHeat /
								Math.max(
									...Object.values(groupedByContentType).map(
										g => g.reduce((sum, item) => sum + item.interview_count, 0) / g.length
									)
								)); // 相对热度权重10%

					return {
						contentType,
						items,
						avgRank,
						totalHeat,
						avgHeat,
						bestRank,
						totalQuestions,
						weightedScore,
						hybridScore
					};
				}
			);

			// 根据选择的策略进行排序
			switch (sortStrategy) {
				case SortStrategy.AVERAGE_RANK:
					return contentTypeWithMetrics.sort((a, b) => a.avgRank - b.avgRank);

				case SortStrategy.WEIGHTED_SCORE:
					return contentTypeWithMetrics.sort((a, b) => b.weightedScore - a.weightedScore);

				case SortStrategy.TOTAL_HEAT:
					return contentTypeWithMetrics.sort((a, b) => b.totalHeat - a.totalHeat);

				case SortStrategy.HYBRID:
				default:
					return contentTypeWithMetrics.sort((a, b) => b.hybridScore - a.hybridScore);
			}
		},
		[sortStrategy]
	);

	// 使用useMemo缓存分组和排序结果
	const groupedQuestions = useMemo(() => {
		if (!data?.data) return [];
		return groupAndSortQuestions(data.data);
	}, [data?.data, groupAndSortQuestions]);

	// 哪些问题项是展开的
	const [questionOpenMap, setQuestionOpenMap] = useState<Record<string, boolean>>({});

	//memo + useCallback 优化 QuestionRead
	const handleQuestionCollapse = useCallback((questionId?: string) => {
		setQuestionOpenMap(prev => ({
			...prev,
			[questionId!]: false
		}));
	}, []);

	if (status === 'pending') {
		return <MySpin text="加载面试题中..." />;
	}

	if (status === 'error') {
		return <div className="text-center py-8 text-red-500">错误: {error?.message}</div>;
	}

	const questionsData = data?.data || [];

	return (
		<Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
			<ControlPanel />
			<CardHeader>
				<CardTitle
					className={`flex items-center gap-2 text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}
				>
					<List className="size-6 text-green-500" />
					{jobType}
					<Badge variant="outline" className="text-xs">
						共 {questionsData[0]?.total_interview_count || 0} 篇面经
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{questionsData.length > 0 ? (
					<div className="space-y-4">
						{groupedQuestions.map(
							({ contentType, items, avgRank, totalHeat, weightedScore, hybridScore }) => {
								return (
									<ClickCollapsible
										key={contentType}
										title={
											<div className="text-base font-semibold flex items-center gap-2 w-full text-left">
												{contentType} ({items.length} 题)
												<Badge variant="outline" className="text-xs">
													{sortStrategy === SortStrategy.AVERAGE_RANK
														? `平均排名: ${avgRank.toFixed(1)}`
														: sortStrategy === SortStrategy.WEIGHTED_SCORE
															? `加权热度: ${+weightedScore.toFixed(1) * 100}`
															: sortStrategy === SortStrategy.TOTAL_HEAT
																? `总热度: ${+totalHeat * 10}`
																: `综合热度: ${+hybridScore.toFixed(1) * 100}`}
												</Badge>
											</div>
										}
										icon={<BookCopy className="size-5" />}
										defaultOpen={false}
										enablePreload={true}
									>
										<div className="space-y-4 mt-4">
											{items.map(question => {
												//! 维持和组件内的key相同
												const questionId = `${question.id}`;
												const isQuestionOpen = questionOpenMap[questionId];
												const handleClick = (e: React.MouseEvent) => {
													e.stopPropagation();
													setQuestionOpenMap(prev => ({
														...prev,
														[questionId]: !prev[questionId]
													}));
												};
												return (
													<div
														key={questionId}
														className={`p-4 rounded-lg border-l-4 border-blue-500`}
													>
														<ClickCollapsible
															title={
																<button
																	className={`font-semibold mb-2 flex items-center gap-2 text-base w-full text-left ${
																		isDark ? 'text-blue-300' : 'text-blue-800'
																	}`}
																>
																	<Text className="size-5" />
																	{question.title}
																	<Badge variant="outline" className="text-xs">
																		出现 {question.interview_count} 次
																	</Badge>
																</button>
															}
															onClick={handleClick}
															icon={''}
															open={isQuestionOpen}
															enablePreload={true}
														>
															{/* 组件挂载即添加控件按钮，因此需要点击后才挂载 */}
															{isQuestionOpen && (
																<>
																	<div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
																		<Badge variant="outline">难度: {question.hard}</Badge>
																		<Badge variant="outline">{question.version}</Badge>
																		<Badge variant="outline">{question.job_type || '通用'}</Badge>
																	</div>
																	{/* 问题答案区域 */}
																	<Suspense fallback={<MySpin text="加载中..." />}>
																		<QuestionRead
																			questionIdFromProps={question.id}
																			className="bg-transparent p-0 md:p-0"
																			isHot100={true}
																			onCollapse={handleQuestionCollapse}
																		/>
																	</Suspense>
																</>
															)}
														</ClickCollapsible>
													</div>
												);
											})}
										</div>
									</ClickCollapsible>
								);
							}
						)}
					</div>
				) : (
					<div className="text-center text-gray-500 py-8">
						<p>暂无 {jobType} 相关的热门面试题数据</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default QuestionList;
