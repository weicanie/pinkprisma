import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { useSelector } from 'react-redux';
import { useIsMobile } from '../../../../hooks/use-mobile';
import { selectInterviewQuestionJobOption } from '../../../../store/interviewQuestion';
import { PageHeader } from '../../components/PageHeader';
import { JobTypeTabs } from '../components/JobTypeTabs';
import { QuestionTable } from '../components/QuestionTable';

/**
 * 我的面试题页面
 * 用户可以在此页面查看、筛选和管理自己收藏或标记为已掌握的面试题
 */
const MyQuestionsPage = () => {
	// 当前选中的职位类型，默认为'前端'
	const jobOption = useSelector(selectInterviewQuestionJobOption);
	const isMobile = useIsMobile();
	return (
		<div>
			{/* 页面标题和描述 */}
			<PageHeader title="我的面试题" description="来自你创建或导入的真实面经的面试题" />

			<div className="p-0 sm:p-8">
				<Card>
					<CardHeader className={`${isMobile ? 'p-0' : ''}`}>
						{/* 职位类型切换Tabs */}
						<JobTypeTabs />
					</CardHeader>
					<CardContent className={`${isMobile ? 'p-1' : ''}`}>
						{/* 面试题数据表格，现在由它自己根据jobType获取数据 */}
						<QuestionTable jobType={jobOption?.name ?? '前端'} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default MyQuestionsPage;
