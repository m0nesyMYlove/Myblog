<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useThemeConfig } from 'valaxy-theme-yun/composables/index.ts'

// 覆盖主题同名组件(valaxy-theme-yun/components/prologue/YunPrologueSquare.vue):
// 首页开场"白方块旋转变圆再淡入头像"的动画在手机端卡顿。原实现用
// transition: all 把 0 5px 100px 的大模糊阴影与 transform/border-radius
// 一起补间,阴影几何随方块变圆逐帧变化,手机端每帧都要重新光栅化 100px
// 模糊,加上水合/字体/图片解码抢占主线程,掉帧明显。这里把阴影移到
// 几何固定(永远圆形)的 ::after 伪元素上仅做 opacity 淡入,交给合成器
// 处理,不再随形状补间重绘;transition 收窄为 transform/border-radius。
// 视觉与原版几乎一致(100px 半透明模糊阴影在渐入过程中形状差异不可感知),
// 其余模板逻辑与主题保持一致,导入路径由相对路径改为包路径。

const themeConfig = useThemeConfig()
const { t } = useI18n()

const showContent = ref(false)
</script>

<template>
  <div
    flex="~ col"
    class="yun-square-container items-center justify-center text-center max-w-2xl"
  >
    <slot />

    <div
      flex="~ col center"
      class="info-with-avatar relative duration-800 transition-cubic-bezier-ease-in"
      :class="{
        show: showContent,
      }"
    >
      <Transition
        enter-from-class="enter-from"
        enter-to-class="enter-to"
        appear
        @after-appear="showContent = true"
      >
        <div
          flex="~ col"
          class="yun-square square-rotate z-1 bg-white/80"
        >
          <LineBurstEffects
            class="absolute top-0 left-0 right-0 bottom-0 size-full scale-200"
            :delay="200"
            :duration="400"
          />
          <Transition
            enter-from-class="op-0"
            enter-to-class="op-100"
            enter-active-class="transition-400 delay-400"
            appear
          >
            <YunAuthorAvatar />
          </Transition>
        </div>
      </Transition>

      <div
        class="info"
        :class="{
          show: showContent,
        }"
      >
        <YunAuthorName class="mt-3" />
        <YunAuthorIntro />

        <div class="py-4 md:py-5 lg:pt-6">
          <YunAnimLineDraw :active="showContent" />
        </div>
        <div
          flex="~ col"
          class="gap-2 items-center justify-center"
        >
          <YunSiteTitle />
          <YunSiteSubtitle />
          <YunSiteDescription />
        </div>
        <div class="scale-x--100 py-4 md:py-5 lg:pb-6">
          <YunAnimLineDraw :active="showContent" />
        </div>

        <YunSocialLinks />

        <div
          class="mt-4 flex-center w-72 md:w-150 m-auto gap-2"
          flex="~ wrap"
        >
          <YunSiteLinkItem
            :page="{
              name: t('menu.posts'),
              icon: 'i-ri-article-line',
              url: '/posts/',
            }"
          />
          <slot />
          <YunSiteLinkItem
            v-for="item, i in themeConfig.pages"
            :key="i" :page="item"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// use scoped for css injection
@use 'sass:map';
@use 'valaxy-theme-yun/styles/vars.scss' as *;

.yun-square {
  position: relative;
  transition: transform 0.8s map.get($cubic-bezier, 'ease-in'),
    border-radius 0.8s map.get($cubic-bezier, 'ease-in');
  border-radius: 50%;
  transform: rotate(0deg) translateY(0%);
  width: var(--avatar-size);
  height: var(--avatar-size);

  // 阴影载体:几何固定为圆形,不随本体方块变圆补间,只做 opacity 淡入
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    box-shadow: 0 5px 100px rgb(0 0 0 / 0.15);
    opacity: 1;
    transition: opacity 0.8s map.get($cubic-bezier, 'ease-in');
    pointer-events: none;
  }

  &.enter-from {
    border-radius: 0%;
    transform: rotate(135deg) translateY(0%);

    &::after {
      opacity: 0;
    }
  }
}

.yun-square-container {
  --avatar-size: 100px;

  .info-with-avatar {
    position: relative;

    &.show {
      // transform: translateY(-50%);
    }
  }

  .info {
    position: relative;
    opacity: 0;
    transform: translateY(0);
    transition: all 0.8s map.get($cubic-bezier, 'ease-in');

    &.show {
      opacity: 1;

      // transform: translateY(calc(50% + var(--avatar-size) / 2));
    }
  }
}
</style>
