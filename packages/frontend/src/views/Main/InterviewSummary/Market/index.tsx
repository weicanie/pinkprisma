import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
	company_scale_list,
	interview_type_list,
	job_type_list,
	type InterviewSummaryVo
} from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import type { Row, Table } from '@tanstack/react-table';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent } from '../../../../components/ui/card';
import { useCustomMutation, useCustomQuery } from '../../../../query/config';
import { InterviewSummaryQueryKey } from '../../../../query/keys';
import {
	getMarketSummaries,
	getUserInterviewSummaryIds,
	importSummaryById
} from '../../../../services/InterviewSummary';
import {
	selectInterviewSummaryTableMarketPageIndex,
	selectInterviewSummaryTableMarketPageSize,
	setInterviewSummaryTablePageIndex,
	setInterviewSummaryTablePageSize
} from '../../../../store/InterviewSummary';
import { ConfigDataTable } from '../../components/config-data-table';
import type { DataTableConfig } from '../../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../../components/config-data-table/data-table/columns/header';
import { DataTableRowActions } from '../../components/config-data-table/data-table/columns/row-actions';
import { MySpin } from '../../components/MySpin';
import { PageHeader } from '../../components/PageHeader';

let summaryToImport: number[] = [];
let curTimeout: NodeJS.Timeout;
/**
 * 合并导入特定id面经的请求为一次批处理请求
 */
async function importSummarys(importMutation: { mutate: (...arg: any) => any }, summaryId: number) {
	summaryToImport.push(summaryId);

	if (curTimeout) clearTimeout(curTimeout);
	curTimeout = setTimeout(() => {
		importMutation.mutate({
			summaryId: summaryToImport,
			onSuccess: () => {
				summaryToImport = [];
			}
		});
	}, 100);
}

/**
 * 面经市场页面
 * 展示所有公开分享的面经，并提供筛选和导入功能
 */
const InterviewSummaryMarket = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const queryClient = useQueryClient();
	const pageIndex = useSelector(selectInterviewSummaryTableMarketPageIndex);
	const pageSize = useSelector(selectInterviewSummaryTableMarketPageSize);

	// 获取面经市场数据
	const { data, status, error } = useCustomQuery(
		[InterviewSummaryQueryKey.Market],
		getMarketSummaries
	);
	// 获取用户拥有的所有面经id
	const {
		data: userInterviewSummaryIds,
		status: userInterviewSummaryIdsStatus,
		error: userInterviewSummaryIdsError
	} = useCustomQuery(
		[InterviewSummaryQueryKey.UserInterviewSummaryIds],
		getUserInterviewSummaryIds
	);

	// 过滤掉用户已导入的面经
	const marketData =
		data?.data?.filter(item => !userInterviewSummaryIds?.data?.includes(item.id.toString())) ?? [];

	// 导入面经的 mutation
	const importMutation = useCustomMutation(importSummaryById, {
		onSuccess: () => {
			toast.success('导入成功');
			// 成功后，使"我的面经"和"面经市场"的查询失效，以重新获取最新数据
			queryClient.invalidateQueries({ queryKey: [InterviewSummaryQueryKey.All] });
			queryClient.invalidateQueries({ queryKey: [InterviewSummaryQueryKey.Market] });
		},
		onError: (err: unknown) => {
			let errorMessage = '导入失败';
			if (err instanceof Error) {
				errorMessage = `${errorMessage}: ${err.message}`;
			}
			toast.error(errorMessage);
		}
	});
	if (status === 'pending' || userInterviewSummaryIdsStatus === 'pending')
		return <MySpin text="加载面经中..." />;
	if (userInterviewSummaryIdsStatus === 'error')
		return <div>错误: {userInterviewSummaryIdsError?.message}</div>;
	if (status === 'error') return <div>错误: {error?.message}</div>;

	// 表格配置
	const dataTableConfig: DataTableConfig<InterviewSummaryVo> = {
		columns: {
			selectCol: [
				{
					id: '_select',
					header: ({ table }: { table: Table<InterviewSummaryVo> }) => (
						<Checkbox
							checked={
								table.getIsAllPageRowsSelected() ||
								(table.getIsSomePageRowsSelected() && 'indeterminate')
							}
							onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
							aria-label="Select all"
						/>
					),
					cell: ({ row }: { row: Row<InterviewSummaryVo> }) => (
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={value => row.toggleSelected(!!value)}
							aria-label="Select row"
						/>
					),
					enableSorting: false,
					enableHiding: false
				}
			],
			dataCols: [
				{
					accessorKey: 'company_name',
					header: ({ column }) => <DataTableColumnHeader column={column} title="公司名称" />,
					cell: ({ row }) => <div>{row.original.company_name || 'N/A'}</div>,
					enableSorting: false
				},
				{
					accessorKey: 'job_name',
					header: ({ column }) => <DataTableColumnHeader column={column} title="职位名称" />,
					cell: ({ row }) => <div>{row.original.job_name || 'N/A'}</div>,
					enableSorting: false
				},
				{
					accessorKey: 'job_type',
					header: ({ column }) => <DataTableColumnHeader column={column} title="岗位类型" />,
					cell: ({ row }) => <Badge variant="outline">{row.original.job_type}</Badge>,
					filterFn: (row, id, value) => value.includes(row.getValue(id)),
					columnId: 'job_type',
					title: '岗位类型',
					options: job_type_list.map(type => ({ label: type, value: type })),
					enableSorting: false
				},
				{
					accessorKey: 'interview_type',
					header: ({ column }) => <DataTableColumnHeader column={column} title="面试类型" />,
					cell: ({ row }) => <Badge variant="outline">{row.original.interview_type}</Badge>,
					filterFn: (row, id, value) => value.includes(row.getValue(id)),
					columnId: 'interview_type',
					title: '面试类型',
					options: interview_type_list.map(type => ({ label: type, value: type })),
					enableSorting: false
				},
				{
					accessorKey: 'company_scale',
					header: ({ column }) => <DataTableColumnHeader column={column} title="公司规模" />,
					cell: ({ row }) => <Badge variant="default">{row.original.company_scale || 'N/A'}</Badge>,
					filterFn: (row, id, value) => value.includes(row.getValue(id)),
					columnId: 'company_scale',
					title: '公司规模',
					options: company_scale_list.map(scale => ({ label: scale, value: scale })),
					enableSorting: false
				}
			],
			rowActionsCol: [
				{
					id: 'actions',
					cell: ({ row }) => (
						<DataTableRowActions
							row={row}
							actions={[
								{
									label: '导入',
									onClick: () => {
										importSummarys(importMutation, row.original.id);
									}
								}
							]}
						/>
					)
				}
			]
		},
		options: {
			toolbar: {
				enable: true,
				searchColIds: ['job_name', 'company_name', 'company_scale', 'interview_type', 'job_type']
			},
			pagination: {
				enable: marketData.length > 10,
				showSizeChanger: true,

				//使用客户端分页，以支持全局搜索和过滤
				manualPagination: false,
				// rowCount: marketData.length,
				pageSize,
				pageSizeOptions: [10, 50, 100, 500, 1000],
				pageIndex,
				setPageIndex: (pageIndex: number) => {
					dispatch(setInterviewSummaryTablePageIndex({ pageIndex, type: 'market' }));
				},
				setPageSize: (pageSize: number) => {
					dispatch(setInterviewSummaryTablePageSize({ pageSize, type: 'market' }));
				}
			}
		},
		// 点击行跳转到详情页
		onRowClick: rowData => () => {
			navigate(`/main/interview-summary/detail/${rowData?.id}`);
		},
		// 表格级别的操作按钮
		actionBtns: [
			{
				label: '导入选中的面经',
				onClick: (_, selectedRows) => {
					selectedRows.forEach(selected => {
						importSummarys(importMutation, selected.id);
					});
				}
			}
		]
	};

	return (
		<div>
			<PageHeader title="面经市场" description="在这里发现和导入其他人分享的优质面经。" />

			<div className="p-8">
				<Card>
					<CardContent>
						<ConfigDataTable dataTableConfig={dataTableConfig} data={marketData} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default InterviewSummaryMarket;
