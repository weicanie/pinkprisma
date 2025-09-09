import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite';

// 自动移除指定包的 modulepreload 的插件
export const autoUnPreloadPlugin = (targets: string[] = []): Plugin => {
	return {
		name: 'auto-unpreload-plugin',
		// 在 HTML 转换阶段执行
		transformIndexHtml(html, { bundle }) {
			if (!bundle || targets.length === 0) return html;

			// 获取需要移除预加载的包对应的文件名
			const filesToRemove = new Set<string>();

			// 遍历所有打包后的 chunk，找到匹配的文件名
			for (const chunk of Object.values(bundle)) {
				if (chunk.type === 'chunk' && targets.some(target => chunk.name.includes(target))) {
					filesToRemove.add(chunk.fileName);
				}
			}

			// 如果没有找到匹配的文件，直接返回原 HTML
			if (filesToRemove.size === 0) return html;

			// 使用正则表达式移除匹配的 modulepreload 链接
			// 匹配 <link rel="modulepreload" href="/filename" ...> 格式的标签
			const modulepreloadRegex =
				/<link[^>]*rel=["']modulepreload["'][^>]*href=["']\/([^"']+)["'][^>]*>/g;

			let modifiedHtml = html;
			let match;

			while ((match = modulepreloadRegex.exec(html)) !== null) {
				const fileName = match[1];
				// 如果文件名在需要移除的列表中，则移除整个 link 标签
				if (filesToRemove.has(fileName)) {
					modifiedHtml = modifiedHtml.replace(match[0], '');
				}
			}

			return modifiedHtml;
		}
	};
};

//! 谨慎使用，会阻塞首屏渲染
// 自动为指定包添加 modulepreload 的插件
export const autoPreloadPlugin = (): Plugin => {
	return {
		name: 'auto-preload-plugin',
		// 在 HTML 转换阶段执行
		transformIndexHtml(html, { bundle }) {
			if (!bundle) return;

			// 需要预加载的包名
			const preloadTargets = [
				'react-markdown-plugin-vendor-2',
				'react-markdown-plugin-vendor-3',
				'markmap-vendor-2'
			];

			const preloadLinks: HtmlTagDescriptor[] = [];

			// 遍历所有打包后的 chunk
			for (const chunk of Object.values(bundle)) {
				if (chunk.type === 'chunk' && preloadTargets.some(target => chunk.name.includes(target))) {
					// 添加 modulepreload 链接
					preloadLinks.push({
						tag: 'link',
						attrs: {
							rel: 'modulepreload',
							href: `/${chunk.fileName}`,
							crossorigin: ''
						},
						injectTo: 'head-prepend'
					});
				}
			}

			return {
				html,
				tags: preloadLinks
			};
		}
	};
};

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		react(),
		// 移除 antd 包的 modulepreload，提高首屏渲染效率
		autoUnPreloadPlugin(['antd-vendor'])
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					'react-vendor': ['react', 'react-dom', 'react-router-dom'],
					'antd-vendor': ['antd'],
					'antd-icon-vendor': ['@ant-design/icons'],
					'antd-x-vendor': ['@ant-design/x'],
					'milkdown-vendor': [
						'@milkdown/core',
						'@milkdown/react',
						'@milkdown/crepe',
						'@milkdown/preset-commonmark',
						'@milkdown/preset-gfm',
						'@milkdown/plugin-collab',
						'@milkdown/plugin-listener',
						'@milkdown/theme-nord',
						'@milkdown/utils',
						'@milkdown/ctx'
					],
					'radix-ui-vendor': [
						'@radix-ui/react-avatar',
						'@radix-ui/react-checkbox',
						'@radix-ui/react-collapsible',
						'@radix-ui/react-dialog',
						'@radix-ui/react-dropdown-menu',
						'@radix-ui/react-icons',
						'@radix-ui/react-label',
						'@radix-ui/react-popover',
						'@radix-ui/react-select',
						'@radix-ui/react-separator',
						'@radix-ui/react-slot',
						'@radix-ui/react-tabs',
						'@radix-ui/react-tooltip'
					],
					'react-query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
					'markmap-vendor': ['markmap-common', 'markmap-view', 'markmap-toolbar'],
					'markmap-vendor-2': ['markmap-lib'],
					'react-markdown-vendor': ['react-markdown', 'rehype-stringify', 'remark-gfm', 'shiki'],
					'react-markdown-plugin-vendor-1': ['rehype-raw'],
					'react-markdown-plugin-vendor-2': ['rehype-starry-night'],
					'react-markdown-plugin-vendor-3': ['remark-mermaid-plugin']
				}
			}
		}
	},
	// build: {
	// 	rollupOptions: {
	// 		output: {
	// 			manualChunks(id) {
	// 				// 将所有 node_modules 的包都拆分到独立的 chunk 中
	// 				if (id.includes('node_modules')) {
	// 					return id.toString().split('node_modules/')[1].split('/')[0].toString();
	// 				}
	// 			}
	// 		}
	// 	}
	// },
	define: {
		// 定义如何处理 Vue 的特性（Milkdown crepe编辑器依赖Vue）
		__VUE_OPTIONS_API__: true,
		__VUE_PROD_DEVTOOLS__: false,
		__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
	},
	assetsInclude: ['**/*.md'],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@/services': path.resolve(__dirname, 'src/services'),
			'@/components': path.resolve(__dirname, 'src/components'),
			'@/hooks': path.resolve(__dirname, 'src/hooks'),
			'@/assets': path.resolve(__dirname, 'src/assets'),
			'@/utils': path.resolve(__dirname, 'src/utils'),
			'@/shadcn-ui': path.resolve(__dirname, 'src/components/ui')
		}
	}
});
