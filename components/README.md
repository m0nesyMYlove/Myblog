# Components

Components in this dir will be auto-registered and on-demand, powered by [`unplugin-vue-components`](https://github.com/antfu/unplugin-vue-components).

## Icons

You can use icons from almost any icon sets by the power of [Iconify](https://iconify.design/).

-----

# Spoiler 组件

隐藏文本组件，支持点击和悬停显示，带有模糊效果和动画过渡。

## 🎯 功能特性

- ✅ 支持点击和悬停两种交互方式
- ✅ 隐藏时模糊效果
- ✅ 平滑显示动画
- ✅ 灵活的配置选项

## 📋 参数说明

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `revealOn` | `string` | `'both'` | 触发显示方式：`click`、`hover`、`both` |
| `blurIntensity` | `number` | `4` | 模糊强度（像素） |
| `animationDuration` | `number` | `0.3` | 动画时长（秒） |
| `permanentAfterClick` | `boolean` | `true` | 点击后是否永久显示 |
| `tooltip` | `string` | `'点击或悬停查看'` | 悬停提示文字 |

## 💡 使用示例

```markdown
<!-- 基础用法 -->
<Spoiler>隐藏内容</Spoiler>

<!-- 只支持点击 -->
<Spoiler reveal-on="click">点击显示</Spoiler>

<!-- 高强度模糊 -->
<Spoiler :blur-intensity="8">重度模糊</Spoiler>


## 🔧 额外建议

1. **文件命名**：建议使用 `Spoiler.README.md` 或 `README.Spoiler.md` 以便与组件文件对应
2. **文档同步**：当组件更新时，记得同步更新文档
3. **团队协作**：如果有团队协作，这样的文档非常有用

## ⚠️ 唯一注意事项

如果您使用某些特殊的构建配置或插件，理论上可能会有影响，但：
- Valaxy 默认配置是安全的
- 99% 的情况下不会有问题
- 如果真的出现问题，可以在 `valaxy.config.ts` 中排除 markdown 文件：

```typescript
export default defineValaxyConfig({
  components: {
    exclude: [
      /[\\/]\.git[\\/]/,
      /[\\/]\.exclude[\\/]/,
      /\.md$/, // 排除所有 .md 文件（通常不需要）
    ],
  },
})
```

-----
