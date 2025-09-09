import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useCustomQuery } from '../../../../query/config';
import { InterviewSummaryQueryKey } from '../../../../query/keys';
import { AnkiUploadServiceV2 as AnkiUploadService } from '../../../../services/anki/upload';
import { ListTodo, CircleHelp, Star } from 'lucide-react';

import {
	getUnuploadedCount,
	getUnuploadedQuestions,
	updateUploadedQuestions
} from '../../../../services/question';
import { PageHeader } from '../../components/PageHeader';

const AnkiPage = () => {
	const [ankiUploadProgress, setAnkiUploadProgress] = useState({ total: 0, completed: 0 });
	const [isUploading, setIsUploading] = useState(false);

	const { data: unuploadedCountData, refetch: refetchUnuploadedCount } = useCustomQuery(
		[InterviewSummaryQueryKey.UnuploadedCount],
		async () => {
			const res = await getUnuploadedCount();
			return res;
		}
	);
	const unuploadedCount = unuploadedCountData?.data || { total: 0, unmaster: 0, favorite: 0 };

	const handleUploadToAnki = async (onlyUnmaster = false, onlyfavorite = false) => {
		setIsUploading(true);
		const ankiUploader = new AnkiUploadService(progress => {
			setAnkiUploadProgress(progress);
		});

		try {
			const total = unuploadedCount.total || 0;
			const allArticles = [];
			const pageSize = 500;
			for (let i = 0; i * pageSize < total; i++) {
				const page = i + 1;
				const res = await getUnuploadedQuestions(page, pageSize);
				let allArticleGet = res.data;
				if (onlyUnmaster) {
					allArticleGet = allArticleGet.filter(item => !item.is_master);
				}
				if (onlyfavorite) {
					allArticleGet = allArticleGet.filter(item => item.is_favorite);
				}
				allArticles.push(...allArticleGet);
			}
			const uploadedResults = await ankiUploader.uploadQuestions(allArticles);

			// Batch update to backend
			const batchSize = 200;
			for (let i = 0; i < uploadedResults.length; i += batchSize) {
				const batch = uploadedResults.slice(i, i + batchSize);
				await updateUploadedQuestions(batch);
			}

			toast.success('上传 Anki 成功');
			refetchUnuploadedCount();
		} catch (e) {
			let errorMessage = '上传 Anki 失败';
			if (e instanceof Error) {
				errorMessage = `${errorMessage}: ${e.message}`;
			}
			toast.error(errorMessage);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div>
			<PageHeader
				title="Anki 同步"
				description="将所有未导入的面试题导入到 Anki 中。请在本地保持Anki开启以进行导入。"
			/>
			<div className="p-8 pt-0">
				{/* 栅格三卡片布局 */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* 全部 */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<div className="flex items-center gap-2">
								<ListTodo className="h-5 w-5 text-primary" />
								<CardTitle className="text-base">全部的面试题</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold flex items-center gap-3">
								<span>{unuploadedCount.total}</span>
								<Badge variant="outline">未导入</Badge>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								onClick={() => handleUploadToAnki(false, false)}
								disabled={isUploading}
								className="w-full"
							>
								{isUploading
									? `正在导入... (${ankiUploadProgress.completed}/${ankiUploadProgress.total})`
									: '导入 Anki'}
							</Button>
						</CardFooter>
					</Card>

					{/* 未掌握 */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<div className="flex items-center gap-2">
								<CircleHelp className="h-5 w-5 text-primary" />
								<CardTitle className="text-base">未掌握的面试题</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold flex items-center gap-3">
								<span>{unuploadedCount.unmaster}</span>
								<Badge variant="outline">未导入</Badge>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								onClick={() => handleUploadToAnki(true, false)}
								disabled={isUploading}
								className="w-full"
							>
								{isUploading
									? `正在导入... (${ankiUploadProgress.completed}/${ankiUploadProgress.total})`
									: '仅导入未掌握'}
							</Button>
						</CardFooter>
					</Card>

					{/* 已收藏 */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<div className="flex items-center gap-2">
								<Star className="h-5 w-5 text-primary" />
								<CardTitle className="text-base">收藏的面试题</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold flex items-center gap-3">
								<span>{unuploadedCount.favorite}</span>
								<Badge variant="outline">未导入</Badge>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								onClick={() => handleUploadToAnki(false, true)}
								disabled={isUploading}
								className="w-full"
							>
								{isUploading
									? `正在导入... (${ankiUploadProgress.completed}/${ankiUploadProgress.total})`
									: '仅导入已收藏'}
							</Button>
						</CardFooter>
					</Card>
				</div>

				{/* 当完全没有需要导入的题时，给出提示与引导 */}
				{unuploadedCount.total === 0 && (
					<div className="mt-8 text-center text-muted-foreground">
						<p className="text-xl font-bold">所有面试题都已同步到 Anki！</p>
						<div className="mt-4 flex justify-center gap-4">
							<Button asChild variant="outline">
								<Link to="/main/interview-summary/mine">查看我的面经</Link>
							</Button>
							<Button asChild variant="outline">
								<Link to="/main/interview-summary/market">探索面经市场</Link>
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default AnkiPage;
