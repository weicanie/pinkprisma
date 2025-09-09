import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/utils/theme';
import { useQueryClient } from '@tanstack/react-query';
import { BookCheck, BookCopy, FileText, List, Map, Text } from 'lucide-react';
import React, { Suspense, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCustomQuery } from '../../../../query/config';
import { InterviewSummaryQueryKey } from '../../../../query/keys';
import { getSummaryById } from '../../../../services/InterviewSummary';
import { getUserRole } from '../../../../utils/getUerRole';
import ClickCollapsible from '../../components/ClickCollapsible';
import { QuestionStatusControls } from '../../components/QuestionStatusControls';
const QuestionEdit = React.lazy(() => import('../../components/QuestionEdit'));
const MarkdownEditor = React.lazy(() => import('../../components/Editor_react_markdown'));
const MarkmapHooks = React.lazy(() => import('../../components/Markmap/markmap-hooks'));
const MilkdownEditor = React.lazy(() => import('../../components/Editor'));

/**
 * 面经详情页
 * 展示单个面经的详细内容，包括原始文本和AI处理后的问题清单
 */
const SummaryRead: React.FC = () => {
	const { summaryId } = useParams<{ summaryId: string }>();
	const { resolvedTheme } = useTheme();

	// 懒加载答案、导图、编辑弹窗
	const [showAnswer, setShowAnswer] = useState(false);
	const [showMindmap, setShowMindmap] = useState(false);
	const [showEdit, setShowEdit] = useState(false);

	const isDark = resolvedTheme === 'dark';
	const userRole = getUserRole();
	const queryClient = useQueryClient();
	// 根据URL中的ID获取面经详情
	const { data, status, error } = useCustomQuery(
		[InterviewSummaryQueryKey.Detail, summaryId],
		() => getSummaryById(Number(summaryId)),
		{
			enabled: !!summaryId // 只有当summaryId存在时才执行查询
		}
	);

	if (status === 'pending') {
		return <div className="p-4">加载中...</div>;
	}

	if (status === 'error') {
		return <div className="p-4 text-red-500">错误: {error?.message}</div>;
	}

	const summaryData = data?.data;

	if (!summaryData) {
		return <div className="p-4 text-center text-gray-500">没有找到面经数据</div>;
	}

	// console.log('SummaryRead ~ summaryData:', JSON.stringify(summaryData.articles, null, 2));

	// 判断面经是否已处理（即是否有关联的面试题）
	const isProcessed = summaryData.articles && summaryData.articles.length > 0;

	/**
	 * 生成按content_type分类的面试题Markdown文档
	 * 算法说明：
	 * 1. 遍历所有articles，按content_type进行分组
	 * 2. 对每个content_type下的题目按title排序
	 * 3. 生成Markdown格式：一级标题为content_type，二级标题为title
	 * @param articles 面试题数组
	 * @returns 生成的Markdown字符串
	 */
	const generateQuestionListMarkdown = (articles: typeof summaryData.articles): string => {
		if (!articles || articles.length === 0) {
			return '# 面试题清单\n\n暂无面试题数据';
		}

		// 步骤1: 按content_type分组
		const groupedByContentType = articles.reduce(
			(acc, article) => {
				const contentType = article.content_type || '未分类';
				if (!acc[contentType]) {
					acc[contentType] = [];
				}
				acc[contentType].push(article);
				return acc;
			},
			{} as Record<string, typeof articles>
		);

		// 步骤2: 对content_type进行排序，确保输出顺序一致
		const sortedContentTypes = Object.keys(groupedByContentType).sort();

		// 步骤3: 生成Markdown内容
		let markdown = '';

		sortedContentTypes.forEach((contentType, i) => {
			// 一级标题：content_type
			markdown += `#### ${contentType}\n\n`;

			// 对该类型下的题目按title排序
			const sortedArticles = groupedByContentType[contentType].sort((a, b) =>
				a.title.localeCompare(b.title, 'zh-CN')
			);

			// 二级标题：title（使用无序列表格式）
			sortedArticles.forEach(article => {
				markdown += `- ${article.title}\n`;
			});
			// 在每个content_type之间添加空行
			if (i !== sortedContentTypes.length - 1) markdown += '\n';
		});

		return markdown;
	};

	// 生成面试题清单的Markdown
	const questionlistMd = generateQuestionListMarkdown(summaryData.articles);
	return (
		<div className={`min-h-screen transition-colors duration-200 bg-global p-4 md:p-8`}>
			<div className="container mx-auto">
				{/* 原始面经 */}
				<Card
					className={`mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
				>
					<CardHeader>
						<div className="flex justify-between items-start">
							<div>
								<CardTitle
									className={`text-xl ${
										isDark ? 'text-white' : 'text-gray-900'
									} flex items-center gap-2`}
								>
									<FileText className="w-6 h-6" />
									{summaryData.job_name || '未命名职位'} - {summaryData.company_name || '未知公司'}
								</CardTitle>
								<CardDescription className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
									创建于{' '}
									{summaryData.create_at
										? new Date(summaryData.create_at).toLocaleDateString()
										: '未知'}
									{summaryData.update_at && (
										<> · 更新于 {new Date(summaryData.update_at).toLocaleDateString()}</>
									)}
								</CardDescription>
							</div>
							<Badge variant={isProcessed ? 'default' : 'destructive'}>
								{isProcessed ? '已处理' : '处理中'}
							</Badge>
						</div>
					</CardHeader>
					<CardContent>
						{summaryData.creator_id !== 1 && (
							//FIXME 换行丢失问题
							<div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'} border`}>
								<MilkdownEditor isShwoMode={true} text={summaryData.content} />
							</div>
						)}
						<div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'} border`}>
							<MilkdownEditor isShwoMode={true} text={questionlistMd} />
						</div>
					</CardContent>
				</Card>

				<Separator className="my-8" />

				{/* AI处理后的问题清单 */}
				<Card
					className={`mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
				>
					<CardHeader>
						<CardTitle
							className={`flex items-center gap-2 text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}
						>
							<List className="size-6 text-green-500" />
							面试题清单
						</CardTitle>
						<CardDescription className={`flex ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
							<span>这些面试题将帮助到社区的全体用户，发现答案有误请提交issue：</span>
							<Link
								to="https://github.com/weicanie/prisma-ai/issues"
								className="group"
								aria-label="PrismaAI on GitHub"
								target="_blank"
							>
								<svg
									className="relative bottom-[3px] size-6 fill-slate-500 group-hover:fill-slate-700"
									aria-hidden="true"
									viewBox="0 0 24 24"
								>
									<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
								</svg>
							</Link>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isProcessed ? (
							<div className="space-y-4">
								{(() => {
									// 按content_type分组面试题
									const groupedByContentType = summaryData.articles.reduce(
										(acc, article) => {
											const contentType = article.content_type || '未分类';
											if (!acc[contentType]) {
												acc[contentType] = [];
											}
											acc[contentType].push(article);
											return acc;
										},
										{} as Record<string, typeof summaryData.articles>
									);

									// 对content_type进行排序
									const sortedContentTypes = Object.keys(groupedByContentType).sort();

									return sortedContentTypes.map(contentType => (
										<ClickCollapsible
											key={contentType}
											title={
												<span className="text-base font-semibold">{`${contentType} (${groupedByContentType[contentType].length})`}</span>
											}
											icon={<BookCopy className="size-5" />}
											defaultOpen={false}
											//懒加载：鼠标进入时加载内容
											onMouseEnter={() => {
												setShowEdit(true);
											}}
										>
											<div className="space-y-4 mt-4">
												{groupedByContentType[contentType]
													.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
													.map((article, index) => (
														<div
															key={`${contentType}-${index}`}
															className={`p-4 rounded-lg ${
																isDark ? 'bg-gray-800' : 'bg-gray-100'
															} border-l-4 border-blue-500`}
														>
															<ClickCollapsible
																title={
																	<h5
																		className={`font-semibold mb-2 flex items-center gap-2 text-base ${
																			isDark ? 'text-blue-300' : 'text-blue-800'
																		}`}
																	>
																		<Text className="size-5" />
																		{article.title}
																		<QuestionStatusControls
																			articleId={article.id}
																			initialStatus={article}
																		/>
																		{userRole === 'admin' && (
																			<Suspense fallback={<div>加载编辑弹窗...</div>}>
																				{showEdit && (
																					<QuestionEdit
																						question={article}
																						// 更新成功后，重新查询面经详情
																						onSuccess={() => {
																							queryClient.invalidateQueries({
																								queryKey: [
																									InterviewSummaryQueryKey.Detail,
																									summaryId
																								]
																							});
																						}}
																					/>
																				)}
																			</Suspense>
																		)}
																	</h5>
																}
																icon={''}
																defaultOpen={false}
															>
																<>
																	<div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
																		<Badge variant="outline">难度: {article.hard}</Badge>
																		<Badge variant="outline">版本: {article.version}</Badge>
																	</div>
																	<div className="space-y-2">
																		<ClickCollapsible
																			title={
																				<span
																					className={`text-base ${isDark ? 'text-blue-300' : 'text-blue-800'}`}
																				>
																					{'答案'}
																				</span>
																			}
																			icon={
																				<BookCheck
																					className={`size-5 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}
																				/>
																			}
																			defaultOpen={showAnswer}
																			onMouseEnter={() => setShowAnswer(true)}
																			enablePreload={true}
																		>
																			<Suspense fallback={<div>加载编辑器...</div>}>
																				{showAnswer && (
																					<MarkdownEditor
																						initialValue={article.content || '暂无答案'}
																						isReadOnly={true}
																					/>
																				)}
																			</Suspense>
																		</ClickCollapsible>

																		{article.content_mindmap && (
																			<ClickCollapsible
																				title={
																					<span
																						className={`text-base ${isDark ? 'text-blue-300' : 'text-blue-800'}`}
																					>
																						{'导图总结'}
																					</span>
																				}
																				icon={
																					<Map
																						className={`size-5 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}
																					/>
																				}
																				defaultOpen={showMindmap}
																				onMouseEnter={() => setShowMindmap(true)}
																				enablePreload={true}
																			>
																				<Suspense fallback={<div>加载导图...</div>}>
																					{showMindmap && (
																						<MarkmapHooks
																							text={
																								article.content_mindmap
																									?.replace(/\\n/g, '\n')
																									.replace(/\\t/g, '\t')
																									.replace(/\\r/g, '\r')
																									.replace(/\\\\/g, '\\')
																									.replace(/\\"/g, '"')
																									.replace(/\\'/g, "'") || '暂无导图总结'
																							}
																						/>
																					)}
																				</Suspense>
																			</ClickCollapsible>
																		)}

																		<ClickCollapsible
																			title={
																				<span
																					className={`text-base ${isDark ? 'text-blue-300' : 'text-blue-800'}`}
																				>
																					{'要点'}
																				</span>
																			}
																			icon={
																				<Text
																					className={`size-5 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}
																				/>
																			}
																			defaultOpen={true}
																		>
																			<Suspense fallback={<div>加载编辑器...</div>}>
																				<MilkdownEditor
																					isShwoMode={true}
																					text={article.gist || '暂无要点'}
																				/>
																			</Suspense>
																		</ClickCollapsible>
																	</div>
																</>
															</ClickCollapsible>
														</div>
													))}
											</div>
										</ClickCollapsible>
									));
								})()}
							</div>
						) : (
							<div className="text-center text-gray-500 py-8">
								<p>AI 正在努力处理中，请稍后再来查看...</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default SummaryRead;
