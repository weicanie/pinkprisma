import avatarImage1 from '@/assets/images/avatars/avatar-1.png';
import avatarImage2 from '@/assets/images/avatars/avatar-2.png';
import avatarImage3 from '@/assets/images/avatars/avatar-3.png';
import avatarImage4 from '@/assets/images/avatars/avatar-4.png';
import avatarImage5 from '@/assets/images/avatars/avatar-5.png';
import { Container } from './c-cpns/Container';

const testimonials = [
	[
		{
			content:
				'PrismaAI 的题库质量非常高，答案都有文档溯源，这让我对知识的理解更深刻了。',
			author: {
				name: '张小明',
				role: '字节跳动前端工程师',
				image: avatarImage1
			}
		},
		{
			content:
				'AI 分析功能太酷了！上传了我的面经，自动生成的思维导图帮我理清了思路。',
			author: {
				name: '李小红',
				role: '准备面试的后端开发者',
				image: avatarImage4
			}
		}
	],
	[
		{
			content:
				'终于有一个不搞信息茧房的平台了。在这里能看到最真实、最多样的面试经验。',
			author: {
				name: '王大力',
				role: '某大厂 SDE',
				image: avatarImage5
			}
		},
		{
			content:
				'共建共享的理念很棒，大家一起贡献知识，一起成长。这才是技术社区应有的样子。',
			author: {
				name: '陈小美',
				role: '腾讯 COO',
				image: avatarImage2
			}
		}
	],
	[
		{
			content:
				'一键导入 Anki 的功能太实用了，现在我可以随时随地复习面试题目。',
			author: {
				name: '刘小强',
				role: '阿里巴巴工程师',
				image: avatarImage3
			}
		},
		{
			content:
				'这个平台帮我系统地整理了面试知识点，不再是零散的八股文，而是有体系的知识网络。',
			author: {
				name: '赵小芳',
				role: '美团技术专家',
				image: avatarImage4
			}
		}
	]
];

function QuoteIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
	return (
		<svg aria-hidden="true" width={105} height={78} {...props}>
			<path d="M25.086 77.292c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622C1.054 58.534 0 53.411 0 47.686c0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C28.325 3.917 33.599 1.507 39.324 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Zm54.24 0c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622-2.11-4.52-3.164-9.643-3.164-15.368 0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C82.565 3.917 87.839 1.507 93.564 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Z" />
		</svg>
	);
}

export function Testimonials() {
	return (
		<section
			id="testimonials"
			aria-label="What our customers are saying"
			className="bg-slate-50 py-20 sm:py-32"
		>
			<Container>
				<div className="mx-auto max-w-2xl md:text-center">
					<h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
						开发者们都在说什么
					</h2>
					<p className="mt-4 text-lg tracking-tight text-slate-700">
						来自真实用户的反馈，看看 PrismaAI 如何帮助他们在面试中脱颖而出。
					</p>
				</div>
				<ul
					role="list"
					className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-3"
				>
					{testimonials.map((column, columnIndex) => (
						<li key={columnIndex}>
							<ul role="list" className="flex flex-col gap-y-6 sm:gap-y-8">
								{column.map((testimonial, testimonialIndex) => (
									<li key={testimonialIndex}>
										<figure className="relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10">
											<QuoteIcon className="absolute top-6 left-6 fill-slate-100" />
											<blockquote className="relative">
												<p className="text-lg tracking-tight text-slate-900">
													{testimonial.content}
												</p>
											</blockquote>
											<figcaption className="relative mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
												<div>
													<div className="font-display text-base text-slate-900">
														{testimonial.author.name}
													</div>
													<div className="mt-1 text-sm text-slate-500">
														{testimonial.author.role}
													</div>
												</div>
												<div className="overflow-hidden rounded-full bg-slate-50">
													<img
														className="h-14 w-14 object-cover"
														src={testimonial.author.image}
														alt=""
														width={56}
														height={56}
													/>
												</div>
											</figcaption>
										</figure>
									</li>
								))}
							</ul>
						</li>
					))}
				</ul>
			</Container>
		</section>
	);
}
