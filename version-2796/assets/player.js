(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupPlayer(root) {
    var video = root.querySelector("video");
    var cover = root.querySelector(".player-cover");
    var configNode = root.querySelector(".player-config");
    var source = "";
    var started = false;
    var hls = null;

    if (!video || !configNode) {
      return;
    }

    try {
      source = JSON.parse(configNode.textContent || "{}").src || "";
    } catch (error) {
      source = "";
    }

    function playNow() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function load(callback) {
      if (!source) {
        return;
      }
      if (started) {
        callback();
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        callback();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.on(window.Hls.Events.MANIFEST_PARSED, callback);
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
        callback();
      }
    }

    function play() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
      load(playNow);
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  });
})();
