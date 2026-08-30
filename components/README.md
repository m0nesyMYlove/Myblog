# Components

此目录下的组件会被 [`unplugin-vue-components`](https://github.com/antfu/unplugin-vue-components) 自动注册、按需加载，模板里直接用标签即可。

弃用的或暂时不用的组件移到 `.exclude/` 子目录（已在 `valaxy.config.ts` 配置排除，不会被注册）。

# Spoiler

隐藏文本组件，点击/悬停显示，带模糊效果和过渡动画。

## 参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `revealOn` | `'click' \| 'hover' \| 'both'` | `'both'` | 触发显示方式 |
| `blurIntensity` | `number` | `4` | 模糊强度（像素） |
| `animationDuration` | `number` | `0.3` | 动画时长（秒） |
| `permanentAfterClick` | `boolean` | `true` | 点击后是否永久显示 |
| `tooltip` | `string` | `'点击或悬停查看'` | 悬停提示文字 |

## 用法

```html
<!-- 基础用法（点击或悬停均可显示） -->
<Spoiler>隐藏内容</Spoiler>

<!-- 只支持点击 -->
<Spoiler reveal-on="click">点击显示</Spoiler>

<!-- 高强度模糊 -->
<Spoiler :blur-intensity="8">重度模糊</Spoiler>
```
