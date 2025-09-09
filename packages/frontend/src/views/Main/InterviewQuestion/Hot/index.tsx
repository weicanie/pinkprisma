import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/utils/theme';
import { job_type_list } from '@prisma-ai/shared';

import { RefreshCcw, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from '../../../../hooks/use-mobile';
import { useCustomMutation } from '../../../../query/config';
import { updateHot100 } from '../../../../services/question';
import { getUserRole } from '../../../../utils/getUerRole';
import QuestionList from '../components/QuestionList';

const jobTypeListGroup = {
	software: job_type_list.slice(0, 4).concat(job_type_list.slice(14, 16)).concat(['运维']),
	hardware: job_type_list.slice(4, 6),
	ai: job_type_list.slice(6, 10),
	data: job_type_list.slice(10, 14),
	other: job_type_list.slice(16)
};

const groupNameMap = {
	software: '软件开发',
	data: '数据',
	ai: '人工智能/算法',
	hardware: '硬件',
	other: '其他'
};

/**
 * 热门面试题页面
 * 展示各职位类型下最热门的100道面试题
 */
const InterviewQuestionHotPage: React.FC = () => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	// 第一级：当前选中的分组
	const [activeGroup, setActiveGroup] = useState<keyof typeof jobTypeListGroup>('software');
	// 第二级：当前选中的具体职位类型
	const [activeJobType, setActiveJobType] = useState('前端');

	// 当分组变化时，自动选择该分组下的第一个职位类型
	React.useEffect(() => {
		const firstJobType = jobTypeListGroup[activeGroup][0];
		if (firstJobType) {
			setActiveJobType(firstJobType);
		}
	}, [activeGroup]);

	const handleUpdateHot100 = useCustomMutation(updateHot100, {
		onSuccess: data => {
			toast.info(data.data);
		}
	});
	const userRole = getUserRole();

	/**
	 * 排序策略枚举
	 */
	enum SortStrategy {
		AVERAGE_RANK = 'average_rank', // 平均排名策略（题目极端）
		WEIGHTED_SCORE = 'weighted_score', // 加权综合评分策略（题目优先）
		TOTAL_HEAT = 'total_heat', // 总热度策略（题目和数量）
		HYBRID = 'hybrid' // 混合策略（均衡）
	}

	// 当前使用的排序策略
	const [sortStrategy, setSortStrategy] = useState<SortStrategy>(SortStrategy.HYBRID);

	const isMobile = useIsMobile();

	return (
		<div className={`transition-colors duration-200 bg-global p-4 md:p-8`}>
			<div className="container mx-auto">
				{/* 页面标题 */}
				<Card
					className={`mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
				>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle
									className={`text-2xl ${
										isDark ? 'text-white' : 'text-gray-900'
									} flex items-center gap-2`}
								>
									<TrendingUp className="w-8 h-8 text-orange-500" />
									面试题 hot 100
									{userRole === 'admin' && (
										<Button
											variant="outline"
											size="icon"
											title="更新缓存"
											onClick={() => handleUpdateHot100.mutate({})}
										>
											<RefreshCcw className="w-4 h-4" />
										</Button>
									)}
									{/* 第一级：职位分组选择 */}
									<Select
										value={activeGroup}
										onValueChange={(value: keyof typeof jobTypeListGroup) => setActiveGroup(value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="选择职位分组" />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(groupNameMap).map(([key, name]) => (
												<SelectItem key={key} value={key}>
													{name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</CardTitle>
								<p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
									基于最新面经出现频次统计的高频面试题
								</p>
							</div>
							{!isMobile && (
								<div className="flex items-center gap-2">
									{/* <Settings2 className="w-4 h-4 text-gray-500" /> */}
									<Select
										value={sortStrategy}
										onValueChange={(value: SortStrategy) => setSortStrategy(value)}
									>
										<SelectTrigger className="w-48">
											<SelectValue placeholder="选择排序策略" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={SortStrategy.HYBRID}>综合热度排名</SelectItem>
											{/* <SelectItem value={SortStrategy.AVERAGE_RANK}>平均排名</SelectItem> */}
											<SelectItem value={SortStrategy.WEIGHTED_SCORE}>加权热度排名</SelectItem>
											<SelectItem value={SortStrategy.TOTAL_HEAT}>总热度排名</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
						</div>
					</CardHeader>
				</Card>

				{/* 第二级：具体职位类型选择Tab */}
				<Tabs value={activeJobType} onValueChange={setActiveJobType} className="w-full">
					<TabsList
						className={`grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-1 h-auto p-1 pt-3 pb-3 ${
							isDark ? 'bg-gray-800' : 'bg-gray-100'
						}`}
					>
						{/* 第二级：具体职位类型选择Tab */}
						{jobTypeListGroup[activeGroup].map(jobType => (
							<TabsTrigger
								key={jobType}
								value={jobType}
								className={` px-2 py-1 text-base ${
									activeJobType === jobType
										? isDark
											? 'bg-blue-600 text-white'
											: 'bg-blue-500 text-gray-700!'
										: isDark
											? 'text-gray-300 hover:bg-gray-700'
											: 'text-gray-700! hover:bg-gray-200'
								}`}
							>
								{jobType}
							</TabsTrigger>
						))}
					</TabsList>

					{/* 题目内容区域 - 使用Suspense进行异步加载 */}
					<TabsContent value={activeJobType} className="mt-6">
						<QuestionList jobType={activeJobType} sortStrategy={sortStrategy} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

export default InterviewQuestionHotPage;
