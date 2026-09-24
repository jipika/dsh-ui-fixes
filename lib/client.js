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
// 选择器说明：类名是 CSS Modules 哈希（`VOzbGW_navList` / `wSkVaW_tabs`），前缀随构建变、
// 后缀恒定，所以按后缀匹配。删掉本插件的 cordis 行即完全恢复。
window.__ModuleLoader__.load({
	id: "dsh-ui-fixes",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		function apply() {
			if (document.getElementById("dsh-ui-fixes-style")) return;
			if (!document.head) {
				document.addEventListener("DOMContentLoaded", apply, { once: true });
				return;
			}
			const style = document.createElement("style");
			style.id = "dsh-ui-fixes-style";
			style.textContent = [
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
			].join("\n");
			document.head.appendChild(style);
		}

		exports.apply = apply;
		exports.inject = [];
		return module.exports;
	}
});
