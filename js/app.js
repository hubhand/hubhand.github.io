/**
 * Main Application Module
 * 메인 페이지 (index.html) 로직
 */

(function () {
  'use strict';

  // 게시글 데이터
  let allPosts = [];

  // 게시글 목록 로드
  async function loadPosts() {
    const loadingState = document.getElementById('loadingState');
    const postsList = document.getElementById('postsList');

    try {
      const response = await fetch('posts.json');
      
      if (!response.ok) {
        throw new Error('게시글을 불러올 수 없습니다.');
      }

      allPosts = await response.json();

      // 로딩 상태 숨기기
      if (loadingState) {
        loadingState.style.display = 'none';
      }

      // 검색 모듈 초기화
      if (window.SearchModule) {
        window.SearchModule.init(allPosts);
      } else {
        // SearchModule이 로드되지 않은 경우 직접 렌더링
        renderPostsFallback(allPosts);
      }

    } catch (error) {
      console.error('Error loading posts:', error);
      
      if (loadingState) {
        loadingState.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>게시글을 불러오는 데 실패했습니다.</p>
          <p style="font-size: 0.875rem; margin-top: 0.5rem;">잠시 후 다시 시도해주세요.</p>
        `;
      }
    }
  }

  // 폴백 렌더링 (SearchModule이 없는 경우)
  function renderPostsFallback(posts) {
    const postsList = document.getElementById('postsList');
    const emptyState = document.getElementById('emptyState');

    if (!postsList) return;

    if (posts.length === 0) {
      if (emptyState) {
        emptyState.style.display = 'flex';
        emptyState.querySelector('p').textContent = '아직 게시글이 없습니다.';
      }
      return;
    }

    postsList.innerHTML = posts
      .map(
        (post) => `
      <a href="post.html?file=${encodeURIComponent(post.file)}" class="post-card">
        <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
        <div class="post-card-meta">
          <span>${formatDate(post.date)}</span>
          ${post.category ? `<span>•</span><span>${escapeHtml(post.category)}</span>` : ''}
        </div>
        <p class="post-card-excerpt">${escapeHtml(post.excerpt)}</p>
        ${
          post.tags.length > 0
            ? `<div class="post-card-tags">
                ${post.tags.map((tag) => `<span class="post-card-tag">${escapeHtml(tag)}</span>`).join('')}
              </div>`
            : ''
        }
      </a>
    `
      )
      .join('');
  }

  // 날짜 포맷팅
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // HTML 이스케이프
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 초기화
  function init() {
    loadPosts();
  }

  // DOM 로드 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

