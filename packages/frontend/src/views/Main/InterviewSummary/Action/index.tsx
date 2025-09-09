import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { getUserRole } from '@/utils/getUerRole';
import { APIProvider, job_type_list, JobType } from '@prisma-ai/shared';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { apiKeyLsApi } from '../../../../services/apikey/apikey_ls';
import {
    processCrawled,
    processDelayed,
    reEmbedVector,
    startCrawl
} from '../../../../services/InterviewSummary';
import {
    selectInterviewSummaryApiType,
    selectInterviewSummaryLLM,
    setInterviewSummaryLLM
} from '../../../../store/InterviewSummary';
import { ChangeLLM } from '../../components/ChangeLLM';
import { PageHeader } from '../../components/PageHeader';

const InterviewSummaryAction = () => {
	const [crawlCount, setCrawlCount] = useState<number | string>(10);
	const [crawlJobType, setCrawlJobType] = useState(job_type_list[0]);
	const [crawlStage, setCrawlStage] = useState<'url' | 'data'>('url');

	const [processCount, setProcessCount] = useState<number | string>(10);
	const [processJobType, setProcessJobType] = useState(job_type_list[0]);
	const [isDelayed, setIsDelayed] = useState(false); // 添加延迟处理状态

	const [processDelayedCount, setProcessDelayedCount] = useState<number | string>(10);
	const [processDelayedJobType, setProcessDelayedJobType] = useState(job_type_list[0]);

	const userRole = getUserRole();

	const handleCrawl = async () => {
		const count = Number(crawlCount);
		if (isNaN(count) || count <= 0) {
			toast.error('爬取数量必须大于0');
			return;
		}
		if (!crawlJobType) {
			toast.error('请选择岗位类型');
			return;
		}
		try {
			await startCrawl(count, crawlJobType, crawlStage);
			toast.success('爬虫任务已启动');
		} catch (error: any) {
			toast.error(error.message || '启动爬虫失败');
		}
	};
	const apiType = useSelector(selectInterviewSummaryApiType);
	const model = useSelector(selectInterviewSummaryLLM);

	const handleProcessCrawled = async () => {
		const count = Number(processCount);
		if (isNaN(count) || count <= 0) {
			toast.error('处理数量必须大于0');
			return;
		}
		if (!processJobType) {
			toast.error('请选择岗位类型');
			return;
		}

		// 从LS中获取用户apikey
		const keyEntity = await apiKeyLsApi.getApiKeyByProvider(apiType as APIProvider);

		if (!keyEntity || !keyEntity.data?.apiKey) {
			toast.error(`请先在"API密钥管理"页面设置 ${apiType} 的API密钥。`);
			return;
		}

		const modelConfig = { api_type: apiType, llm_type: model, apiKey: keyEntity.data.apiKey };

		try {
			await processCrawled({
				count: count,
				job_type: processJobType as JobType,
				modelConfig,
				isDelayed // 传递延迟处理状态
			});
			toast.success('处理任务已启动');
		} catch (error: any) {
			toast.error(error.message || '启动处理任务失败');
		}
	};

	const handleProcessDelayed = async () => {
		const count = Number(processDelayedCount);
		if (isNaN(count) || count <= 0) {
			toast.error('处理数量必须大于0');
			return;
		}
		if (!processDelayedJobType) {
			toast.error('请选择岗位类型');
			return;
		}

		// 从LS中获取用户apikey
		const keyEntity = await apiKeyLsApi.getApiKeyByProvider(apiType as APIProvider);

		if (!keyEntity || !keyEntity.data?.apiKey) {
			toast.error(`请先在"API密钥管理"页面设置 ${apiType} 的API密钥。`);
			return;
		}

		const modelConfig = { api_type: apiType, llm_type: model, apiKey: keyEntity.data.apiKey };

		try {
			await processDelayed({
				count: count,
				job_type: processDelayedJobType as JobType,
				modelConfig
			});
			toast.success('处理任务已启动');
		} catch (error: any) {
			toast.error(error.message || '启动处理任务失败');
		}
	};

	const [vectorCleaned, setVectorCleaned] = useState(false);
	const handleReEmbedVector = async () => {
		if (!vectorCleaned) {
			toast.error('请先清理向量数据库中的数据');
			return;
		}
		await reEmbedVector(vectorCleaned);
		toast.success('重嵌入任务已启动');
	};

	return (
		<div>
			<PageHeader title="面经管理" description="管理面经数据，包括获取、处理、重嵌入等操作。" />
			{userRole === 'admin' && (
				<div className="pl-8 pr-8 mb-4 flex flex-col gap-7">
					<Card>
						<CardHeader>
							<CardTitle className="dark:text-gray-300">面经数据获取</CardTitle>
						</CardHeader>
						<CardContent className="action-card">
							<Button onClick={handleCrawl} className="mr-5">
								获取面经数据
							</Button>
							<Input
								type="number"
								value={crawlCount}
								onChange={e => {
									const value = e.target.value;
									// 允许空字符串、负号开头、纯数字
									if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
										setCrawlCount(value);
									}
								}}
								placeholder="请输入数量"
								className="w-32"
							/>
							<Select value={crawlJobType} onValueChange={setCrawlJobType}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="选择岗位类型" />
								</SelectTrigger>
								<SelectContent>
									{job_type_list.map(type => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={crawlStage}
								onValueChange={value => setCrawlStage(value as 'url' | 'data')}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="选择阶段" />
								</SelectTrigger>
								<SelectContent>
									{['url', 'data'].map(type => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle className="dark:text-gray-300">面经数据处理</CardTitle>
						</CardHeader>
						<CardContent className="action-card">
							<Button onClick={handleProcessCrawled} className="mr-5">
								处理面经数据
							</Button>
							<Input
								type="number"
								value={processCount}
								onChange={e => {
									const value = e.target.value;
									// 允许空字符串、负号开头、纯数字
									if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
										setProcessCount(value);
									}
								}}
								placeholder="请输入数量"
								className="w-32"
							/>
							<Select value={processJobType} onValueChange={setProcessJobType}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="选择岗位类型" />
								</SelectTrigger>
								<SelectContent>
									{job_type_list.map(type => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<div className="flex items-center gap-2">
								<Checkbox
									checked={isDelayed}
									onCheckedChange={checked => setIsDelayed(!!checked)}
								/>
								<span className="dark:text-gray-400">延迟处理面试题</span>
							</div>
							<ChangeLLM
								selector={selectInterviewSummaryLLM}
								setModelAction={setInterviewSummaryLLM}
							></ChangeLLM>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle className="dark:text-gray-300">延迟处理的面试题处理</CardTitle>
						</CardHeader>
						<CardContent className="action-card">
							<Button onClick={handleProcessDelayed} className="mr-5">
								处理延迟处理的面试题
							</Button>
							<Input
								type="number"
								value={processDelayedCount}
								onChange={e => {
									const value = e.target.value;
									// 允许空字符串、负号开头、纯数字
									if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
										setProcessDelayedCount(value);
									}
								}}
								placeholder="请输入数量"
								className="w-32"
							/>
							<Select value={processDelayedJobType} onValueChange={setProcessDelayedJobType}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="选择岗位类型" />
								</SelectTrigger>
								<SelectContent>
									{job_type_list.map(type => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle className="dark:text-gray-300">数据重嵌入</CardTitle>
						</CardHeader>
						<CardContent className="action-card">
							<Button onClick={handleReEmbedVector} className="mr-5">
								重嵌入面经和面试题
							</Button>
							<div className="flex items-center gap-2">
								<Checkbox
									checked={vectorCleaned}
									onCheckedChange={checked => setVectorCleaned(!!checked)}
								></Checkbox>
								<span className="dark:text-gray-400">已清理向量数据库中的数据</span>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
};

export default InterviewSummaryAction;
