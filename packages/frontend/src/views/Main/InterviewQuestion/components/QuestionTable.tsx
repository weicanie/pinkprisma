import { Badge } from '@/components/ui/badge';
import { useCustomQuery } from '@/query/config';
import { createQueryKey } from '@/query/keys';
import { getMyQuestions } from '@/services/question';
import { ConfigDataTable } from '@/views/Main/components/config-data-table';
import type { DataTableConfig } from '@/views/Main/components/config-data-table/config.type';
import { DataTableColumnHeader } from '@/views/Main/components/config-data-table/data-table/columns/header';
import { company_scale_list, type MyQuestionInfo } from '@prisma-ai/shared';
import { useQueryClient } from '@tanstack/react-query';
import lodash from 'lodash';
import { Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
	clearInterviewQuestionAllFilters,
	selectInterviewQuestionColumnFilter,
	selectInterviewQuestionFilterOptions,
	selectInterviewQuestionTablePageIndex,
	selectInterviewQuestionTablePageSize,
	setInterviewQuestionTablePageIndex,
	setInterviewQuestionTablePageSize,
	updateInterviewQuestionColumnFilter
} from '../../../../store/interviewQuestion';
import { MySpin } from '../../components/MySpin';

/**
 * QuestionTable的属性定义
 */
interface QuestionTableProps {
	/**
	 * 要查询的职位类型
	 */
	jobType: string;
}

/**
 * 可复用的面试题数据表格组件
 * 现在此组件负责根据jobType获取自己的数据
 * @param {QuestionTableProps} props 组件属性
 */
export const QuestionTable: React.FC<QuestionTableProps> = ({ jobType }) => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const pageIndex = useSelector(selectInterviewQuestionTablePageIndex);
	const pageSize = useSelector(selectInterviewQuestionTablePageSize);
	const filterOptionsData = useSelector(selectInterviewQuestionFilterOptions);
	const filterOptions = lodash.cloneDeep(filterOptionsData);
	// 预取下一页数据
	const prefetchNextPage = (currentPageIndex: number) => {
		queryClient.prefetchQuery({
			queryKey: createQueryKey.questions.myQuestions(
				jobType,
				currentPageIndex,
				pageSize,
				filterOptions
			),
			queryFn: () =>
				getMyQuestions(
					jobType,
					currentPageIndex + 1,
					pageSize,
					filterOptions.is_favorite ?? [],
					filterOptions.is_master ?? [],
					filterOptions.company_scale ?? []
				),
			staleTime: 5 * 60 * 1000
		});
	};

	// 在用户鼠标移入分页组件时开启预取模式，不断获取最新一页的下一页数据
	const handleNextPageHoverCreator = () => {
		return (currentPageIndex: number) => {
			prefetchNextPage(currentPageIndex + 1);
		};
	};

	// 使用useCustomQuery从服务器获取当前职位类型的面试题数据
	const {
		data: myQuestionsData, // API返回的数据
		status, // 查询状态：'pending', 'success', 'error'
		error // 查询出错时的错误信息
	} = useCustomQuery(
		createQueryKey.questions.myQuestions(jobType, pageIndex, pageSize, filterOptions),
		() =>
			getMyQuestions(
				jobType,
				pageIndex + 1,
				pageSize,
				filterOptions.is_favorite ?? [],
				filterOptions.is_master ?? [],
				filterOptions.company_scale ?? []
			), // 实际获取数据的函数
		{
			enabled: !!jobType // 只有在jobType有值时才执行查询
		}
	);

	if (status === 'pending') {
		return <MySpin text="加载面试题中..." />;
	}

	if (status === 'error') {
		return <div className="p-4 text-red-500">错误: {error?.message}</div>;
	}

	const data = myQuestionsData?.data?.data || [];
	const total = myQuestionsData?.data?.total || 0;

	// 设置项，未实现设置功能
	const questionOpenNewWindow = localStorage.getItem('questionOpenNewWindow') === 'true';

	const tableConfig: DataTableConfig<MyQuestionInfo> = {
		columns: {
			dataCols: [
				{
					accessorKey: 'title',
					header: ({ column }) => <DataTableColumnHeader column={column} title="问题" />,
					cell: ({ row }) => (
						<div className="font-medium w-full min-w-50 whitespace-normal break-words p-2">
							{row.original.title}
						</div>
					),
					enableSorting: false
				},

				{
					accessorKey: 'hard',
					header: ({ column }) => <DataTableColumnHeader column={column} title="难度" />,
					cell: ({ row }) => {
						const difficulty = parseInt(row.original.hard);
						return (
							<div className="flex items-center gap-1">
								{Array.from({ length: 5 }, (_, index) => (
									<Star
										key={index}
										className={`w-4 h-4 ${
											index < difficulty
												? 'fill-gray-300  text-gray-400 dark:fill-gray-400 dark:text-gray-400' // 填充的星星
												: 'text-gray-400' // 空心的星星
										}`}
									/>
								))}
							</div>
						);
					},
					columnId: 'hard',
					title: '难度',
					options: [1, 2, 3, 4, 5].map(h => ({ label: `${h}星`, value: h.toString() }))
				},

				{
					accessorKey: 'is_favorite',
					header: ({ column }) => <DataTableColumnHeader column={column} title="是否收藏" />,
					cell: ({ row }) => (
						<Badge variant={row.original.is_favorite ? 'default' : 'default'}>
							{row.original.is_favorite ? '是' : '否'}
						</Badge>
					),
					filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
					columnId: 'is_favorite',
					title: '是否收藏',
					options: [
						{ label: '是', value: 'true' },
						{ label: '否', value: 'false' }
					],
					enableSorting: false
				},
				{
					accessorKey: 'is_master',
					header: ({ column }) => <DataTableColumnHeader column={column} title="是否掌握" />,
					cell: ({ row }) => (
						<Badge variant={row.original.is_master ? 'default' : 'default'}>
							{row.original.is_master ? '是' : '否'}
						</Badge>
					),
					filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
					columnId: 'is_master',
					title: '是否掌握',
					options: [
						{ label: '是', value: 'true' },
						{ label: '否', value: 'false' }
					],
					enableSorting: false
				},
				{
					accessorKey: 'company_scale',
					header: ({ column }) => <DataTableColumnHeader column={column} title="公司规模" />,
					cell: ({ row }) => <Badge variant="default">{row.original.company_scale}</Badge>,
					filterFn: (row, id, value) => value.includes(row.getValue(id)),
					columnId: 'company_scale',
					title: '公司规模',
					options: company_scale_list.map(s => ({ label: s, value: s })),
					enableSorting: false
				},
				{
					accessorKey: 'company_name',
					header: ({ column }) => <DataTableColumnHeader column={column} title="公司名称" />,
					cell: ({ row }) => <div>{row.original.company_name}</div>,
					enableSorting: false
				},
				{
					accessorKey: 'interview_count',
					header: ({ column }) => <DataTableColumnHeader column={column} title="出现次数" />,
					cell: ({ row }) => <div>{row.original.interview_count}</div>,
					enableSorting: true
				}
			],
			selectCol: [],
			rowActionsCol: []
		},
		options: {
			toolbar: {
				enable: true,
				searchColIds: ['title', 'company_name'], // 支持按问题和公司名称搜索
				filterOptions: {
					selectorSet: (selectedState: { columnId: string; selectedFilterValues: string[] }) => {
						dispatch(updateInterviewQuestionColumnFilter(selectedState));
					},
					selectorGet: (columnId: string) => {
						return selectInterviewQuestionColumnFilter(columnId);
					},
					resetFilter: () => {
						dispatch(clearInterviewQuestionAllFilters());
					}
				}
			},
			pagination: {
				enable: total > 10,
				showSizeChanger: total > 20,

				manualPagination: true,
				rowCount: total,
				pageSizeOptions: [10, 20, 50, 100],

				pageSize: pageSize,
				pageIndex: pageIndex,
				setPageIndex: (pageIndex: number) => {
					dispatch(setInterviewQuestionTablePageIndex(pageIndex));
				},
				setPageSize: (pageSize: number) => {
					dispatch(setInterviewQuestionTablePageSize(pageSize));
				},
				handleNextPageHover: handleNextPageHoverCreator()
			}
		},
		onRowClick: (rowData: { id: number }) => () => {
			if (!questionOpenNewWindow) {
				navigate(`/main/interview-question/detail/${rowData.id}`);
				return;
			}
			// 页面加载完成后跳转
			const newWindow = window.open(`/main/interview-question/detail/${rowData.id}`, '_blank');

			// 尝试更改新窗口的 title
			if (newWindow) {
				// 等待新窗口加载完成后更改 title
				const checkTitle = setInterval(() => {
					try {
						if (newWindow.document.readyState === 'complete') {
							// 从表格行数据中获取标题，这里需要访问完整的行数据
							const title = (rowData as any).title || '未知题目';
							newWindow.document.title = `${title}`;
							//未实现设置功能
							// newWindow.localStorage.setItem('sidebarDefaultOpen', 'false');
							clearInterval(checkTitle);
						}
					} catch (e) {
						// 跨域限制时无法访问，清理定时器
						clearInterval(checkTitle);
					}
				}, 100);

				// 设置超时清理
				setTimeout(() => clearInterval(checkTitle), 5000);
			}
		}
	};

	return <ConfigDataTable<MyQuestionInfo> dataTableConfig={tableConfig} data={data} />;
};
