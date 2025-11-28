/**
 * Search Module
 * 게시글 검색 및 태그 필터링 기능
 */

(function () {
  'use strict';

  // 모듈 상태
  let searchPosts = [];
  let selectedTags = new Set();
  let searchQuery = '';

  // DOM 요소
  let searchInput = null;
  let tagsContainer = null;
  let postsList = null;
  let emptyState = null;

  // 디바운스 함수
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 검색 실행
  function performSearch() {
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = searchPosts.filter((post) => {
      // 검색어 필터링
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query));

      // 태그 필터링
      const matchesTags =
        selectedTags.size === 0 ||
        post.tags.some((tag) => selectedTags.has(tag));

      return matchesQuery && matchesTags;
    });

    renderPosts(filtered);
  }

  // 게시글 렌더링
  function renderPosts(posts) {
    if (!postsList || !emptyState) return;

    if (posts.length === 0) {
      postsList.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';
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

  // 태그 렌더링
  function renderTags() {
    if (!tagsContainer) return;

    // 모든 태그 수집
    const allTags = new Set();
    searchPosts.forEach((post) => {
      post.tags.forEach((tag) => allTags.add(tag));
    });

    if (allTags.size === 0) {
      tagsContainer.style.display = 'none';
      return;
    }

    tagsContainer.style.display = 'flex';
    tagsContainer.innerHTML = Array.from(allTags)
      .sort()
      .map(
        (tag) => `
      <button 
        class="tag ${selectedTags.has(tag) ? 'active' : ''}" 
        data-tag="${escapeHtml(tag)}"
      >
        ${escapeHtml(tag)}
      </button>
    `
      )
      .join('');

    // 태그 클릭 이벤트
    tagsContainer.querySelectorAll('.tag').forEach((tagBtn) => {
      tagBtn.addEventListener('click', () => {
        const tag = tagBtn.dataset.tag;
        if (selectedTags.has(tag)) {
          selectedTags.delete(tag);
          tagBtn.classList.remove('active');
        } else {
          selectedTags.add(tag);
          tagBtn.classList.add('active');
        }
        performSearch();
      });
    });
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
  function init(posts) {
    searchPosts = posts || [];
    
    // DOM 요소 캐싱
    searchInput = document.getElementById('searchInput');
    tagsContainer = document.getElementById('tagsContainer');
    postsList = document.getElementById('postsList');
    emptyState = document.getElementById('emptyState');

    if (searchInput) {
      // 검색 입력 이벤트
      const debouncedSearch = debounce(() => {
        searchQuery = searchInput.value;
        performSearch();
      }, 200);

      searchInput.addEventListener('input', debouncedSearch);

      // Enter 키 처리
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          searchQuery = searchInput.value;
          performSearch();
        }
      });
    }

    // 태그 렌더링
    renderTags();
    
    // 초기 게시글 렌더링
    renderPosts(searchPosts);
  }

  // 전역으로 노출
  window.SearchModule = {
    init: init,
    search: performSearch,
    renderPosts: renderPosts,
  };
})();

