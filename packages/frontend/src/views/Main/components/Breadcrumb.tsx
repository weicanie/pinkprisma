import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { shallowEqual, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import { selectBreadRouterList } from '../../../store/bread-router';

export function BreadcrumbNav() {
	let list = useSelector(selectBreadRouterList, shallowEqual);
	const navigate = useNavigate();
	if (list.length === 0) {
		list = [{ name: '首页', path: '/main/home' }];
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{list.map((item, index) => (
					<Fragment key={item.path}>
						<BreadcrumbItem
							className={`cursor-pointer ${index === list.length - 1 || list.length === 1 ? 'text-zinc-900 dark:text-zinc-400' : ''}`}
						>
							<BreadcrumbLink
								onClick={() => {
									navigate(item.path);
								}}
							>
								{item.name}
							</BreadcrumbLink>
						</BreadcrumbItem>
						{index !== list.length - 1 && <BreadcrumbSeparator />}
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
