# dsh-ui-fixes

> Three CSS-only fixes for the DSH web GUI: a scrollable settings nav, compact session-header
> tabs, and a working conversation-width drag handle.
>
> DSH Web GUI 的三个纯 CSS 修复：设置弹窗左侧导航可滚动、会话 header 标签恢复紧凑间距、
> 恢复对话流拖拽调宽。

[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## 它修什么

| # | 症状 | 根因 | 修法 |
| --- | --- | --- | --- |
| ① | 设置弹窗**左侧导航滚不动**，设置项一多就被裁掉 | 官方 `*_panel` 固定 `height:800px` + `overflow:hidden`；右侧 `*_options` 有 `overflow-y:auto` 能滚，左侧 `*_navList` 却是 `overflow:visible` | 约束 `*_nav`，让 `*_navList` 自己滚 |
| ② | 会话 header 标签间距**36px 太远** | 官方 `.X_tabs{gap:36px}` 与 `[class$="_tabs"]{gap:8px}` **特异度相同（都是 0,1,0）**，官方加载在后 → 36px 生效 | `!important` 落实 8px，作用域限定在会话 header |
| ③ | 中间对话流**不能拖拽调宽**（拖了没反应） | 某个 UI 协调插件在**同一个元素**上覆盖了官方变量定义，把动态公式换成固定 `748px`，而拖拽写入的是 `--dsh-chat-user-width` | **还原官方表达式**（⚠️ 不能用 `unset`） |

### ① 设置弹窗左侧导航滚不动

`*_panel` 是固定 `height:800px` + `overflow:hidden`；右侧内容区能滚，左侧导航却是 `overflow:visible`。
装了较多插件的环境（设置里多出「桌面设置」「手机连接」「Token Saver」「记忆」等页面）就会撑爆。

实测（Chromium，人为制造溢出）：

| 状态 | navList client/scroll | 滚轮结果 |
| --- | --- | --- |
| 不溢出（15 个设置页） | 656 / 656 | 看不出问题 |
| 人为造溢出 | 736 / 920 | `scrollTop` 恒 **0**（滚不动） |
| 加上本插件 | 736 / 920 | `scrollTop` = **184** ✓ |

### ② 会话 header 标签间距 36px 太远

两条同特异度的规则打架，官方那条赢：

```css
[class$="_tabs"]  { gap: 8px }    /* 插件想要紧凑 */
.X_tabs           { gap: 36px }   /* 官方，加载在后 → 生效 */
```

本插件用 `!important` 落实 8px，作用域限定在 `[data-slot="conversation.session.header"]`，
不影响其它 `*_tabs`。实测 `gap` **36px → 8px**，四个按钮间距 `[8, 8, 8]`。

### ③ 对话流不能拖拽调宽

官方在会话根元素（`div[data-phase]`）上定义：

```css
._0cyzDW_root {
  --dsh-chat-content-width: var(--dsh-chat-user-width,
      clamp(680px, calc(var(--dsh-conversation-column-width,0px) * .64), 920px));
}
```

**拖拽写入的就是 `--dsh-chat-user-width`**。而 UI 协调插件（如 `dsh-ui-harmonizer`）在**同一个元素**上写：

```css
div[data-phase] { --dsh-chat-content-width: var(--enhancer-content-width) }   /* 固定 748px */
```

整条定义被替换 → 拖拽写得再对，宽度永远是 748px → **纹丝不动**。

本插件还原官方表达式。实测：

| | 被覆盖时 | 本插件 |
| --- | --- | --- |
| 对话列 | x=517, w=**748**, margin `0 205px` | **x=497, w=788, margin `0px 184.766px`**（官方基准值）|
| 拖 +100px | 748 → 748 ✗ | 788 → 640 ✓ |
| 拖 −200px | 748 → 748 ✗ | 640 → 1040 ✓ |
| `--dsh-chat-user-width` | 空 | 640px ✓ |

> ⚠️ **不能用 `unset` 偷懒**：实测 `--dsh-chat-content-width: unset` 会把官方的默认公式一起丢掉，
> 列宽变成撑满 `1158px`、`margin` 归零。必须原样还原官方表达式。

## 安装

```bash
# ① npm（快，走 registry）
dsh plugin --profile <profile> add dsh-ui-fixes

# ② GitHub（源码直装，跟随 main 分支）
dsh plugin --profile <profile> add github:jipika/dsh-ui-fixes
```

```yaml
# ~/.dsh/profiles/<profile>/cordis.patch.yml
- insert:
    - id: ui-fixes
      name: 'dsh-ui-fixes'
```

`desktop` profile 被 Electron 独占（CLI 子命令会被拒），需手改 `package.json`
（`"dsh-ui-fixes": "link:../../local-plugins/dsh-ui-fixes"`）再 `pnpm install`；
**改 client 半边必须重启应用**（client bundle 在 host 启动时读进内存，刷新页面无效）。

## 实现

```
dsh-ui-fixes
  ├─ lib/index.js   host 半边：空 apply()，只为让 cordis 行能挂载 client bundle
  └─ lib/client.js  浏览器半边：__ModuleLoader__.load → 注入一个 <style id="dsh-ui-fixes-style">
```

client 半边 `inject = []`，**不注册任何 slot、不碰官方 DOM、不做任何 JS 改造** —— 只追加一个
`<style>` 元素，注入是幂等的（已存在就直接返回）。删掉 cordis 行即完全恢复。

## 已知限制

- 依赖官方 CSS Modules 的**类名后缀**（`_navList` / `_tabs` / `_nav`）：哈希前缀随前端构建变化，
  后缀恒定，所以按 `[class$="..."]` 匹配。官方前端大改即可能失效。
- ③ 的副作用：**`dsh-ui-harmonizer` 设置里的「对话内容宽度」滑块不再影响布局**（拖拽优先）。
  想恢复滑块，删掉 `lib/client.js` 里「修复 3」那 3 行即可。
- 属于**版本敏感型**补丁，建议随 DSH 升级回归验证一次。

## License

MIT © 2026 jipika
