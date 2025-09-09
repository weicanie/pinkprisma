import { Badge } from '@/components/ui/badge';
import {
	company_scale_list,
	interview_type_list,
	job_type_list,
	type InterviewSummaryVo
} from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import lodash from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../../components/ui/card';
import { useCustomQuery } from '../../../../query/config';
import { createQueryKey } from '../../../../query/keys';
import { getAllUserSummaries } from '../../../../services/InterviewSummary';
import {
	clearInterviewSummaryAllFilters,
	selectInterviewSummaryColumnFilter,
	selectInterviewSummaryFilterOptions,
	selectInterviewSummaryTableAllPageIndex,
	selectInterviewSummaryTableAllPageSize,
	setInterviewSummaryTablePageIndex,
	setInterviewSummaryTablePageSize,
	updateInterviewSummaryColumnFilter
} from '../../../../store/InterviewSummary';
import { ConfigDataTable } from '../../components/config-data-table';
import type { DataTableConfig } from '../../components/config-data-table/config.type';
import { DataTableColumnHeader } from '../../components/config-data-table/data-table/columns/header';
import { MySpin } from '../../components/MySpin';
import { PageHeader } from '../../components/PageHeader';
import SummaryCreate from './SummaryCreate';

// 表格列的通用配置
/**
 * 我的面经页面
 * 包含用户创建和导入的面经列表
 */
const dataCols: DataTableConfig<InterviewSummaryVo>['columns']['dataCols'] = [
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
		enableSorting: false,
		options: job_type_list.map(type => ({ label: type, value: type }))
	},
	{
		accessorKey: 'interview_type',
		header: ({ column }) => <DataTableColumnHeader column={column} title="面试类型" />,
		cell: ({ row }) => <Badge variant="outline">{row.original.interview_type || 'N/A'}</Badge>,
		filterFn: (row, id, value) => value.includes(row.getValue(id)),
		columnId: 'interview_type',
		title: '面试类型',
		enableSorting: false,
		options: interview_type_list.map(type => ({ label: type, value: type }))
	},
	{
		accessorKey: 'company_scale',
		header: ({ column }) => <DataTableColumnHeader column={column} title="公司规模" />,
		cell: ({ row }) => <Badge variant="default">{row.original.company_scale || 'N/A'}</Badge>,
		filterFn: (row, id, value) => value.includes(row.getValue(id)),
		columnId: 'company_scale',
		title: '公司规模',
		enableSorting: false,
		options: company_scale_list.map(scale => ({ label: scale, value: scale }))
	},
	{
		accessorKey: 'all_article_success',
		header: ({ column }) => <DataTableColumnHeader column={column} title="处理状态" />,
		cell: ({ row }) => (
			<Badge variant={row.original.all_article_success ? 'default' : 'destructive'}>
				{row.original.all_article_success ? '已处理' : '处理中'}
			</Badge>
		),
		enableSorting: false
	},
	{
		accessorKey: 'create_at',
		header: ({ column }) => <DataTableColumnHeader column={column} title="创建时间" />,
		cell: ({ row }) => <div>{new Date(row.original.create_at!).toLocaleDateString()}</div>,
		enableSorting: false
	},
	{
		accessorKey: 'own',
		header: ({ column }) => <DataTableColumnHeader column={column} title="创建/导入" />,
		cell: ({ row }) => <Badge variant="outline">{row.original.own ? '创建' : '导入'}</Badge>,
		enableSorting: false,
		filterFn: (row, id, value) => value.includes(row.getValue(id)),
		columnId: 'own',
		title: '来源',
		options: [
			{ label: '创建', value: true },
			{ label: '导入', value: false }
		]
	}
];

const InterviewSummaryMine = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const pageIndex = useSelector(selectInterviewSummaryTableAllPageIndex);
	const pageSize = useSelector(selectInterviewSummaryTableAllPageSize);

	const filterOptionsData = useSelector(selectInterviewSummaryFilterOptions);
	const filterOptions = lodash.cloneDeep(filterOptionsData);

	// 预取下一页数据
	const prefetchNextPage = (currentPageIndex: number) => {
		queryClient.prefetchQuery({
			queryKey: createQueryKey.interviewSummaries.allByPage(
				currentPageIndex + 2,
				pageSize,
				filterOptions
			),
			queryFn: () => getAllUserSummaries(currentPageIndex + 2, pageSize, filterOptions),
			staleTime: 5 * 60 * 1000
		});
	};
	// 在用户鼠标移入分页组件时开启预取模式，不断获取最新一页的下一页数据
	const handleNextPageHoverCreator = () => {
		//柯里化
		return (currentPageIndex: number) => {
			prefetchNextPage(currentPageIndex);
		};
	};

	const {
		data: allData,
		status: allStatus,
		error: allError
	} = useCustomQuery(
		createQueryKey.interviewSummaries.allByPage(pageIndex + 1, pageSize, filterOptions),
		() => getAllUserSummaries(pageIndex + 1, pageSize, filterOptions)
	);

	if (allStatus === 'pending') return <MySpin text="加载面经中..." />;
	if (allStatus === 'error') return <div>错误: {allError?.message}</div>;

	const allWithId = allData?.data?.data ?? [];
	const allTotal = allData?.data?.total ?? 0;

	const allTableConfig: DataTableConfig<InterviewSummaryVo> = {
		columns: {
			dataCols,
			selectCol: [],
			rowActionsCol: []
		},
		options: {
			toolbar: {
				enable: true,
				searchColIds: ['job_name', 'company_name', 'interview_type', 'job_type'],
				filterOptions: {
					selectorSet: (selectedState: { columnId: string; selectedFilterValues: string[] }) => {
						dispatch(updateInterviewSummaryColumnFilter(selectedState));
					},
					selectorGet: (columnId: string) => {
						return selectInterviewSummaryColumnFilter(columnId);
					},
					resetFilter: () => {
						dispatch(clearInterviewSummaryAllFilters());
					}
				}
			},
			pagination: {
				enable: allTotal > 10,
				showSizeChanger: allTotal > 20,
				pageSizeOptions: [10, 20, 50, 100],

				manualPagination: true,
				rowCount: allTotal,

				pageSize: pageSize,
				pageIndex: pageIndex,
				setPageIndex: (pageIndex: number) => {
					dispatch(setInterviewSummaryTablePageIndex({ pageIndex, type: 'all' }));
				},
				setPageSize: (pageSize: number) => {
					dispatch(setInterviewSummaryTablePageSize({ pageSize, type: 'all' }));
				},
				handleNextPageHover: handleNextPageHoverCreator()
			}
		},
		onRowClick: (rowData: { id: number }) => () => {
			navigate(`/main/interview-summary/detail/${rowData?.id}`);
		},
		createBtn: <SummaryCreate />
	};

	return (
		<div>
			<PageHeader
				title="我的面经"
				description="管理您创建和导入的面经，点击上传按钮来添加新的面经。"
			/>
			<div className="p-4 md:p-8">
				<Card>
					<CardContent>
						<ConfigDataTable<InterviewSummaryVo>
							dataTableConfig={allTableConfig}
							data={allWithId}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default InterviewSummaryMine;
