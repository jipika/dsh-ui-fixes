// dsh-ui-fixes — browser half: two local CSS fixes for the DSH web GUI.
//
// 修复 1 · 设置弹窗左侧导航滚不动
//   官方设置弹窗 `*_panel` 是固定 `height:800px` + `overflow:hidden`，右侧内容区
//   `*_options` 有 `overflow-y:auto` 能滚，但左侧导航 `*_navList` 是 `overflow:visible`
//   → 设置项一多（桌面设置/手机连接/Token Saver/记忆…）超过可用的 ~656px 就被裁且滚不动。
//   实测：人为造溢出 736/920 时滚轮 scrollTop 恒 0；加下面规则后 scrollTop=184。
//
// 修复 2 · 会话 header 标签间距 36px 太远
//   官方 `.wSkVaW_tabs { gap:36px }` 与插件写的 `[class$="_tabs"] { gap:8px }`
//   特异度相同（都是 0,1,0），官方加载在后 → 36px 生效，紧凑间距被覆盖。
//   这里用 !important 把 8px 落实（作用域限定在会话 header，避免影响其它 `*_tabs`）。
//
// 修复 3 · 中间对话流不能拖拽调宽（harmonizer 覆盖了官方变量定义）
//   官方在同一个元素上定义：`._0cyzDW_root{--dsh-chat-content-width:var(--dsh-chat-user-width,
//   clamp(680px, calc(var(--dsh-conversation-column-width,0px) * .64), 920px))}`，
//   拖拽写的就是 `--dsh-chat-user-width`。harmonizer 写了
//   `div[data-phase]{--dsh-chat-content-width:var(--enhancer-content-width)}`（=固定 748px）
//   把整条定义替换掉 → 拖拽永远被 748px 压住。这里还原官方表达式。
//   注意：副作用是 harmonizer 的「对话内容宽度」滑块不再影响布局（拖拽优先）。
//
// 修复 4 · 设置页（插件页）tab 组的两条多余线条 + harmonizer 强加的边距（2026-09-27 合并）
//   ① 容器 `.X_tabs{border-bottom:.5px solid var(--dsw-alias-border-l2)}` 横贯整行；
//   ② 选中 tab 的 `::after{height:2px;background:rgb(20,20,19)}`（纯黑）贴在胶囊底下。
//   选中态已经是橙色实心胶囊，这两条线纯属多余；用 aria-selected 精确定位，
//   并限定在 `[class$="_section"]` 内，不碰会话 header 的同名 `_tabs`。
//   ③ 同一个 `[class$="_section"] > [class$="_tabs"]` 上把 harmonizer 的全局规则
//   `[class$=_tabs]{margin:0 0 12px 8px}` 收回成官方值 `margin:2px 0 0` ——
//   那条全局选择器会把官方设置页的 `vDoQkq_tabs`（官方只有 margin-top:2px）也改掉，
//   表现为 tab 行相对标题右移 8px、下方凭空多出 12px。
//
// 修复 5 · markdown 正文图片必须在文档流中占位（2026-09-27）
//   现象：`![](/path)` 图片在对话流里渲染成浮在文字上的小缩略图，不占布局空间，
//   正文和表格从它底下/旁边穿过。官方 MarkdownText.module.css 的 `.image` 本是
//   `display:block; max-width:100%; height:auto`（正常占位），但实际渲染中被其它
//   规则干扰成脱离文档流。这里做防御性兜底：正文 markdown 容器内的图片一律
//   强制块级、在流内、不浮动不定位。
//   ⚠️ 选择器要点：web-frontend 的 CSS module 类名是 `_markdown_<hash>` 形态
//   （实测 `_markdown_19new_5`，hash 在后、语义在前）——与 client bundle 的
//   `VOzbGW_navList` 形态相反，必须用 [class*="_markdown"] 包含匹配，
//   [class$="_markdown"] 永远不命中。作用域限定在 markdown 容器内，
//   不伤 lightbox（portal 到 body）与 ImagePreview（`_frame` 固定 180px 卡片）。
//
// 选择器说明：类名是 CSS Modules 哈希（`VOzbGW_navList` / `wSkVaW_tabs`），前缀随构建变、
// 后缀恒定，所以按后缀匹配。删掉本插件的 cordis 行即完全恢复。
window.__ModuleLoader__.load({
	id: "dsh-ui-fixes",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		function apply() {
			if (!document.head) {
				document.addEventListener("DOMContentLoaded", apply, { once: true });
				return;
			}
			const css = [
				"/* ── 修复 1：设置弹窗左侧导航可滚动 ── */",
				'[class$="_navList"] {',
				'  overflow-y: auto !important;',
				'  min-height: 0 !important;',
				'  overscroll-behavior: contain;',
				'  scrollbar-width: thin;',
				'}',
				'[class$="_nav"]:has(> [class$="_navList"]) {',
				'  overflow: hidden !important;',
				'  min-height: 0 !important;',
				'}',
				"",
				"/* ── 修复 2：会话 header 标签紧凑间距（官方 36px → 8px） ── */",
				'[data-slot="conversation.session.header"] [class$="_tabs"] {',
				'  gap: 8px !important;',
				'  margin-left: 8px !important;',
				'}',
				"",
				"/* ── 修复 3：恢复对话宽度拖拽（还原官方变量定义） ── */",
				'div[data-phase] {',
				'  --dsh-chat-content-width: var(--dsh-chat-user-width, clamp(680px, calc(var(--dsh-conversation-column-width, 0px) * .64), 920px)) !important;',
				'}',
				"",
				"/* ── 修复 4：设置页 tab 组的多余线条 ── */",
				'[class$="_section"] > [class$="_tabs"] {',
				'  border-bottom: none !important;',
				'  /* harmonizer 的全局 `[class$=_tabs]{margin:0 0 12px 8px}` 连官方设置页的',
				'     `vDoQkq_tabs`（官方只有 margin-top:2px）一起改了 → tab 行右移 8px、下方多 12px。',
				'     这里把 margin 还原成官方值；(0,2,0) 也压得过 harmonizer 的 (0,1,0)。 */',
				'  margin: 2px 0 0 !important;',
				'}',
				'[class$="_section"] [class$="_tab"][aria-selected="true"]::after {',
				'  display: none !important;',
				'}',
				"",
				"/* ── 修复 4b：设置页 tab 恢复官方外观（去掉 harmonizer 强加的胶囊） ── */",
				"/* harmonizer 的 `[class$=_tabs] [class*=_tab]{border-radius:14px;height:28px;",
				"   padding:0 14px;background:var(--dsw-alias-bg-layer-1)}` 特异性 (0,2,0)，压过官方",
				"   `.X_tab{background:0 0;border:0;padding:7px 1px 9px}` (0,1,0) → 每个 tab 变成胶囊，",
				"   胶囊内文字比标题凭空缩进 15px（14px 内边距 + 1px 边框），整行看着不齐。",
				"   这里还原官方尺寸（无背景 / 无边框 / padding 7px 1px 9px），选中态改用",
				"   文字色 + 字重区分，文字从此与标题左对齐。 */",
				'[class$="_section"] > [class$="_tabs"] > [class*="_tab"] {',
				'  height: auto !important;',
				'  padding: 7px 1px 9px !important;',
				'  border: 0 !important;',
				'  border-radius: 0 !important;',
				'  background: transparent !important;',
				'  color: var(--dsw-alias-label-tertiary) !important;',
				'  font-size: 13px !important;',
				'  line-height: 20px !important;',
				'}',
				'[class$="_section"] > [class$="_tabs"] > [class*="_tab"][aria-selected="true"] {',
				'  color: var(--dsw-alias-brand-primary, var(--dsw-specific-sidebar-nav-item-active-accent, #D97757)) !important;',
				'  font-weight: 600 !important;',
				'}',
				"",
				"/* ── 修复 6：提问卡片的主按钮被第三方「无作用域」规则清掉背景 ── */",
				"/* @agents-anywhere/dsh-bridge-next 注入过一条",
				"     div[class$=\"_footerActions\"]>*:last-child{background-color:transparent!important;…}",
				"   它没有任何作用域限定，会命中官方 QuestionComposer 的 `B02uEq_footerActions`，",
				"   把 primary 主按钮（「下一步」/「提交」）的背景清成透明；按钮文字色是",
				"   --dsw-alias-label-primary-foreground（浅色主题下近白）→ 白底白字，看起来\"按钮不见了\"。",
				"   兜底：把 primary 按钮的填充还回来（(0,2,1) 压过它的 (0,2,0)）。",
				"   治本的那一半在 scripts/patch-bridge-next-footer-scope.cjs（幂等 postinstall）。 */",
				'[class$="_footerActions"] > button[class*="_primary"] {',
				'  background-color: var(--dsw-alias-button-primary-fill) !important;',
				'  background-image: none !important;',
				'  box-shadow: none !important;',
				'}',
				"",
				"/* ── 修复 5：markdown 正文图片在文档流中占位 ── */",
				"/* web-frontend 的 CSS module 类名是 `_markdown_<hash>` 形态（hash 在后），",
				'   必须用 [class*="_markdown"] 包含匹配；$= 后缀匹配永远不命中。 */',
				'[class*="_markdown"] img[class*="_image"],',
				'[class*="_markdown"] img {',
				'  display: block !important;',
				'  position: static !important;',
				'  float: none !important;',
				'  max-width: 100% !important;',
				'  height: auto !important;',
				'  object-fit: contain;',
				'}',
				'[class*="_markdown"] [class*="_imageButton"] {',
				'  display: block !important;',
				'  position: static !important;',
				'  float: none !important;',
				'  max-width: 100% !important;',
				'}',
			].join("\n");
			// 复用同一个 <style> 并写入当前版本：client 插件热重载后旧标签还挂在 head 上，
			// 光按 id 去重会让新代码配着旧样式跑。
			let style = document.getElementById("dsh-ui-fixes-style");
			if (style === null) {
				style = document.createElement("style");
				style.id = "dsh-ui-fixes-style";
				document.head.appendChild(style);
			}
			if (style.textContent !== css) style.textContent = css;
		}

		exports.apply = apply;
		exports.inject = [];
		return module.exports;
	}
});
