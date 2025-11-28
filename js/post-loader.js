/**
 * Post Loader Module
 * 마크다운 게시글 로딩 및 파싱
 */

(function () {
  "use strict";

  // URL에서 파일명 가져오기
  function getFileFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("file");
  }

  // Front Matter 파싱
  function parseFrontMatter(content) {
    // UTF-8 BOM 제거
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }

    const frontMatterMatch = content.match(
      /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
    );

    if (!frontMatterMatch) {
      return { metadata: {}, content: content };
    }

    const frontMatter = frontMatterMatch[1];
    const postContent = frontMatterMatch[2];
    const metadata = {};

    // Front Matter 라인 파싱
    const lines = frontMatter.split(/\r?\n/);
    lines.forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // 따옴표 제거
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // 배열 파싱 (tags)
        if (key === "tags" && value.startsWith("[") && value.endsWith("]")) {
          try {
            value = JSON.parse(value);
          } catch {
            value = value
              .slice(1, -1)
              .split(",")
              .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ""));
          }
        }

        metadata[key] = value;
      }
    });

    return { metadata, content: postContent };
  }

  // marked.js 설정
  function configureMarked() {
    if (typeof marked === "undefined") {
      console.error("marked.js가 로드되지 않았습니다.");
      return;
    }

    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: true,
      mangle: false,
    });
  }

  // 게시글 헤더 렌더링
  function renderPostHeader(metadata) {
    const titleEl = document.getElementById("postTitle");
    const metaEl = document.getElementById("postMeta");
    const tagsEl = document.getElementById("postTags");

    if (titleEl) {
      titleEl.textContent = metadata.title || "제목 없음";
      document.title = `${metadata.title || "게시글"} | hubhand's Blog`;
    }

    if (metaEl) {
      const metaItems = [];

      if (metadata.date) {
        const date = new Date(metadata.date);
        const formattedDate = date.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        metaItems.push(`<span class="post-meta-item">${formattedDate}</span>`);
      }

      if (metadata.category) {
        metaItems.push(
          `<span class="post-meta-item">${escapeHtml(metadata.category)}</span>`
        );
      }

      metaEl.innerHTML = metaItems.join("<span>•</span>");
    }

    if (tagsEl && Array.isArray(metadata.tags) && metadata.tags.length > 0) {
      tagsEl.innerHTML = metadata.tags
        .map((tag) => `<span class="post-tag">${escapeHtml(tag)}</span>`)
        .join("");
    }
  }

  // 게시글 콘텐츠 렌더링
  function renderPostContent(content) {
    const contentEl = document.getElementById("postContent");
    if (!contentEl) return;

    try {
      const html = marked.parse(content);
      contentEl.innerHTML = html;

      // Prism.js로 코드 하이라이팅
      if (typeof Prism !== "undefined") {
        Prism.highlightAllUnder(contentEl);
      }
    } catch (error) {
      console.error("마크다운 파싱 오류:", error);
      contentEl.innerHTML = `
        <div class="error-state">
          <p>게시글을 렌더링하는 데 문제가 발생했습니다.</p>
        </div>
      `;
    }
  }

  // Giscus 댓글 로드
  function loadGiscus() {
    const container = document.getElementById("giscusContainer");
    if (!container) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "hubhand/hubhand.github.io");
    script.setAttribute("data-repo-id", "R_kgDOQec2EA"); // Giscus 설정에서 가져와야 함
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDOQec2EM4CzIzE"); // Giscus 설정에서 가져와야 함
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "1");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-lang", "ko");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    // 현재 테마에 맞게 Giscus 테마 설정
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    script.setAttribute(
      "data-theme",
      currentTheme === "dark" ? "dark" : "light"
    );

    container.appendChild(script);
  }

  // HTML 이스케이프
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // 에러 표시
  function showError(message) {
    const contentEl = document.getElementById("postContent");
    const titleEl = document.getElementById("postTitle");

    if (titleEl) {
      titleEl.textContent = "오류";
      document.title = "오류 | hubhand's Blog";
    }

    if (contentEl) {
      contentEl.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>${escapeHtml(message)}</p>
          <a href="index.html" style="margin-top: 1rem; color: var(--color-accent);">← 목록으로 돌아가기</a>
        </div>
      `;
    }
  }

  // 게시글 로드
  async function loadPost() {
    const filename = getFileFromUrl();

    if (!filename) {
      showError("게시글을 찾을 수 없습니다.");
      return;
    }

    try {
      const response = await fetch(`pages/${filename}`);

      if (!response.ok) {
        throw new Error("게시글을 불러올 수 없습니다.");
      }

      const rawContent = await response.text();
      const { metadata, content } = parseFrontMatter(rawContent);

      // marked.js 설정
      configureMarked();

      // 렌더링
      renderPostHeader(metadata);
      renderPostContent(content);

      // Giscus 로드
      loadGiscus();
    } catch (error) {
      console.error("Error loading post:", error);
      showError("게시글을 불러오는 데 실패했습니다.");
    }
  }

  // 초기화
  function init() {
    loadPost();
  }

  // DOM 로드 후 초기화
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
