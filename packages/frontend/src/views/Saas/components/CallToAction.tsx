import backgroundImage from '@/assets/images/background-call-to-action.jpg';
import { isUserLogin } from '../../../utils/isUserLogin';
import { Button } from './c-cpns/Button';
import { Container } from './c-cpns/Container';

export function CallToAction() {
	const isLogin = isUserLogin();

	return (
		<section id="get-started-today" className="relative overflow-hidden bg-blue-600 py-32">
			<img
				className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
				src={backgroundImage}
				alt=""
				width={2347}
				height={1244}
			/>
			<Container className="relative">
				<div className="mx-auto max-w-lg text-center">
					<h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
						准备好迎接你的 Offer 了吗？
					</h2>
					<p className="mt-4 text-lg tracking-tight text-white">
						立即加入 PrismaAI hub，构建属于我们自己的面试知识库。
					</p>
					{isLogin ? (
						<Button to="/main" color="white" className="mt-10">
							开始使用
						</Button>
					) : (
						<Button to="/register" color="white" className="mt-10">
							免费开始
						</Button>
					)}
				</div>
			</Container>
		</section>
	);
}
