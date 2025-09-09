import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../../../components/ui/button';
import { useIsMobile } from '../../../../hooks/use-mobile';
import {
	groupNameMap,
	jobTypeListGroup,
	selectInterviewQuestionJobOption,
	setInterviewQuestionJobOption
} from '../../../../store/interviewQuestion';

/**
 * 职位类型切换Tabs组件
 * @param {JobTypeTabsProps} props 组件属性
 */
export const JobTypeTabs: React.FC = () => {
	// 状态：当前激活的职位类型，默认为 '前端'
	const jobOption = useSelector(selectInterviewQuestionJobOption);
	const dispatch = useDispatch();
	const setJobOption = (
		jobOption: Partial<{ group: keyof typeof jobTypeListGroup; name: string }>
	) => {
		dispatch(setInterviewQuestionJobOption(jobOption));
	};

	/**
	 * 处理职位类型按钮点击事件
	 * @param jobType 被点击的职位类型
	 */
	const handleJobTypeClick = (jobType: string) => {
		setJobOption({ name: jobType });
	};

	/**
	 * 处理分组切换事件
	 * @param group 被选中的分组
	 */
	const handleGroupChange = (group: keyof typeof jobTypeListGroup) => {
		setJobOption({
			group: group
		});
		// 自动设置该分组下的第一个职位类型
		const firstJobType = jobTypeListGroup[group as keyof typeof jobTypeListGroup][0];
		if (firstJobType) {
			setJobOption({ name: firstJobType });
		}
	};

	const isMobile = useIsMobile();

	return (
		<Tabs
			value={jobOption?.group ?? 'software'}
			onValueChange={handleGroupChange as (value: string) => void}
			className="w-full"
		>
			{/* TabsList 容器居中 */}
			<div className={`${isMobile ? 'flex justify-center w-full ' : ''}`}>
				<TabsList>
					{Object.entries(groupNameMap).map(([key, name]) => (
						<TabsTrigger
							key={key}
							value={key}
							className={`text-xs ${isMobile ? 'text-xs' : 'text-sm'}`}
						>
							{name}
						</TabsTrigger>
					))}
				</TabsList>
			</div>
			{Object.keys(groupNameMap).map(group => (
				<TabsContent key={group} value={group}>
					{/* TabsContent 内容居中 */}
					<div className={` ${isMobile ? 'flex flex-wrap justify-center gap-2 pt-2' : ''}`}>
						{jobTypeListGroup[group as keyof typeof jobTypeListGroup].map(jobType => (
							<Button
								key={jobType}
								variant={jobOption?.name === jobType ? 'default' : 'outline'}
								onClick={() => handleJobTypeClick(jobType)}
								className={`px-3 h-8 rounded-md transition-colors text-xs ${isMobile ? 'text-xs' : 'text-sm'}`}
							>
								{jobType}
							</Button>
						))}
					</div>
				</TabsContent>
			))}
		</Tabs>
	);
};
