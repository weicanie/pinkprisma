import backgroundImage from '@/assets/images/background-faqs.jpg';
import { Container } from './c-cpns/Container';

const faqs = [
	[
		{
			question: 'PrismaAI hub 的面试题库质量如何保证？',
			answer:
				'用户创建的每道面试题，都采用文档溯源机制，并进行语义化版本管理、持续迭代更新。社区成员可以对题目进行反馈和修正，确保内容的准确性和时效性。'
		},
		{
			question: '一键导入 Anki 是如何工作的？',
			answer:
				'系统会将您的面试题库自动转换为 Anki 卡片格式，支持一键批量自动导入，让您可以随时随地进行高效复习。'
		}
	],
	[
		// {
		// 	question: '免费版和付费版有什么区别？',
		// 	answer:
		// 		'免费版提供基础题库访问和有限的 AI 分析次数。付费版解锁完整功能，包括无限 AI 分析、高级统计、优先支持等。'
		// },
		{
			question: '如何参与社区贡献？',
			answer: '您可以通过分享面试经历、提交题目反馈、参与讨论等方式参与贡献。'
		},
		{
			question: '数据安全如何保障？',
			answer:
				'我们采用企业级加密技术保护用户数据，严格遵守数据保护法规。您的个人信息和数据都会得到妥善保护。'
		}
	],
	[
		{
			question: '支持哪些技术栈的面经？',
			answer: '大模型拥有优秀的通用能力，理论上支持所有技术栈。'
		},
		{
			question: '如何获得支持？',
			answer: '您可以通过 github issues、邮件联系我们。'
		}
	]
];

export function Faqs() {
	return (
		<section
			id="faq"
			aria-labelledby="faq-title"
			className="relative overflow-hidden bg-slate-50 py-20 sm:py-32"
		>
			<img
				className="absolute top-0 left-1/2 max-w-none translate-x-[-30%] -translate-y-1/4"
				src={backgroundImage}
				alt=""
				width={1558}
				height={946}
			/>
			<Container className="relative">
				<div className="mx-auto max-w-2xl lg:mx-0">
					<h2
						id="faq-title"
						className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl"
					>
						常见问题
					</h2>
					<p className="mt-4 text-lg tracking-tight text-slate-700">
						如果您有其他问题，请随时联系我们。
					</p>
				</div>
				<ul
					role="list"
					className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"
				>
					{faqs.map((column, columnIndex) => (
						<li key={columnIndex}>
							<ul role="list" className="flex flex-col gap-y-8">
								{column.map((faq, faqIndex) => (
									<li key={faqIndex}>
										<h3 className="font-display text-lg/7 text-slate-900">{faq.question}</h3>
										<p className="mt-4 text-sm text-slate-700">{faq.answer}</p>
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
