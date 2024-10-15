// Piwik（Matomo）トラッカーの初期化
var _paq = (window._paq = window._paq || []);

let lastLogTime = 0;
const LOG_INTERVAL = 10000; // 10秒
let currentReferrer = document.referrer;

// URLからサイトIDを生成する関数
function generateSiteId(url) {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString();
}

// ウェブサイト情報をログに記録し、トラッキングを行う関数
function logWebsiteInfo(force = false, clickedUrl = null) {
  const currentTime = Date.now();
  if (!force && currentTime - lastLogTime < LOG_INTERVAL) {
    return; // 最後のログから10秒経過していない場合は処理をスキップ（ただし、forceがtrueの場合は常に実行）
  }
  lastLogTime = currentTime;

  var websiteInfo = {
    url: clickedUrl || document.location.href,
    title: document.title,
    referrer: currentReferrer,
    timestamp: new Date().toISOString(),
  };

  console.log("Visited Website:", websiteInfo);

  // URLからサイトIDを生成
  const siteId = generateSiteId(websiteInfo.url);

  // バックグラウンドスクリプトにデータを送信
  try {
    chrome.runtime.sendMessage({
      type: "websiteVisited",
      data: websiteInfo,
      siteId: siteId,
    });
  } catch (error) {
    console.error("Failed to send message to background:", error);
  }

  // Matomoトラッカーが初期化されている場合のみトラッキングを実行
  if (window.Matomo && window.Matomo.getTracker) {
    var tracker = window.Matomo.getTracker("#", siteId);
    tracker.setCustomUrl(websiteInfo.url);
    tracker.setDocumentTitle(websiteInfo.title);
    tracker.setReferrerUrl(websiteInfo.referrer);
    tracker.trackPageView();
  }

  // 現在のURLを次のページのリファラーとして設定
  currentReferrer = websiteInfo.url;
}

// デバウンス関数
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

// リンクのクリックを監視する関数
function addLinkClickListener() {
  document.body.addEventListener("click", function (event) {
    const link = event.target.closest("a");
    if (link && link.href && !link.href.startsWith("javascript:")) {
      logWebsiteInfo(true, link.href); // リンクがクリックされたら強制的にログを記録
    }
  });
}

// piwik.jsをロード
var scriptElement = document.createElement("script");
scriptElement.type = "text/javascript";
scriptElement.async = true;
scriptElement.src = chrome.runtime.getURL("piwik.js");
scriptElement.onload = function () {
  // piwik.jsがロードされた後にトラッカーを初期化
  window.Matomo = window.Matomo || {};
  window.Matomo.getTracker = function (trackerUrl, siteId) {
    console.log("Custom getTracker called", trackerUrl, siteId);
    return {
      setCustomUrl: function (url) {
        console.log("setCustomUrl", url);
      },
      setDocumentTitle: function (title) {
        console.log("setDocumentTitle", title);
      },
      setReferrerUrl: function (referrer) {
        console.log("setReferrerUrl", referrer);
      },
      trackPageView: function () {
        console.log("trackPageView called");
      },
    };
  };

  // 初期のウェブサイト情報をログに記録
  logWebsiteInfo(true);

  // リンクのクリックリスナーを追加
  addLinkClickListener();

  // ページの変更を監視（SPA対応）
  const debouncedLogWebsiteInfo = debounce(() => logWebsiteInfo(false), 1000); // 1秒のデバウンス
  var observer = new MutationObserver(function (mutations) {
    debouncedLogWebsiteInfo();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};
(document.head || document.documentElement).appendChild(scriptElement);

console.log("Content script loaded and initialized");
