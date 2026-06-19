import { H as Hls } from './video-vendor-dru42stk.js';

(function () {
  var shell = document.querySelector('[data-player]');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var overlay = shell.querySelector('.play-overlay');
  var configNode = document.getElementById('media-config');
  var config = {};
  var hls = null;

  try {
    config = JSON.parse(configNode ? configNode.textContent : '{}');
  } catch (error) {
    config = {};
  }

  function attachStream() {
    if (!config.stream || video.dataset.ready === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.stream;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(config.stream);
      hls.attachMedia(video);
    } else {
      video.src = config.stream;
    }

    video.dataset.ready = 'true';
  }

  function start() {
    attachStream();
    overlay.hidden = true;
    shell.classList.add('is-playing');

    var action = video.play();

    if (action && typeof action.catch === 'function') {
      action.catch(function () {
        overlay.hidden = false;
        shell.classList.remove('is-playing');
      });
    }
  }

  overlay.addEventListener('click', start);

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    overlay.hidden = true;
  });

  video.addEventListener('ended', function () {
    overlay.hidden = false;
    shell.classList.remove('is-playing');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
