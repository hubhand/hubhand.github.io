/**
 * Theme Toggle Module
 * 다크/라이트 모드 전환 기능
 */

(function () {
  'use strict';

  // 저장된 테마 가져오기 또는 시스템 설정 확인
  function getPreferredTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // 시스템 다크모드 설정 확인
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  // 테마 적용
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Giscus 테마도 업데이트 (댓글이 있는 경우)
    updateGiscusTheme(theme);
  }

  // Giscus 테마 업데이트
  function updateGiscusTheme(theme) {
    const giscusFrame = document.querySelector('iframe.giscus-frame');
    if (giscusFrame) {
      const giscusTheme = theme === 'dark' ? 'dark' : 'light';
      giscusFrame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: giscusTheme } } },
        'https://giscus.app'
      );
    }
  }

  // 테마 토글
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  // 초기화
  function init() {
    // 페이지 로드 시 테마 적용
    const theme = getPreferredTheme();
    applyTheme(theme);

    // 토글 버튼 이벤트 리스너
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // 시스템 테마 변경 감지
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        // 사용자가 수동으로 테마를 설정하지 않았을 때만 시스템 설정 따르기
        if (!localStorage.getItem('theme')) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
  }

  // DOM 로드 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 전역으로 테마 함수 노출 (다른 모듈에서 사용할 수 있도록)
  window.ThemeModule = {
    toggle: toggleTheme,
    apply: applyTheme,
    getCurrent: () => document.documentElement.getAttribute('data-theme'),
  };
})();

