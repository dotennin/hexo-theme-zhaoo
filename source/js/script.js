console.log("%c Github %c", "background:#333333; color:#ffffff", "", "https://github.com/izhaoo/hexo-theme-zhaoo");

(function ($) {
  "use strict";

  var fn = {
    showMenu: function () {
      $(".menu").fadeIn(300);
      $("body").addClass("lock-screen");
      fn.hideFab();
      ZHAOO.utils.bindKeyup(27, function () {
        fn.hideMenu();
        $(".navbar").removeClass("hide");
      });
    },
    hideMenu: function () {
      $(".menu").fadeOut(300);
      $("body").removeClass("lock-screen");
    },
    showSearch: function () {
      $(".search").fadeIn(300);
      $("body").addClass("lock-screen");
      fn.hideFab();
      ZHAOO.utils.bindKeyup(27, function () {
        fn.hideSearch();
        $(".navbar").removeClass("hide");
      });
    },
    hideSearch: function () {
      $(".search").fadeOut(300);
      $("body").removeClass("lock-screen");
    },
    activeFab: function () {
      $(".fab-up").addClass("fab-up-active");
      $(".fab-plus").addClass("fab-plus-active");
      $(".fab-toc").addClass("fab-toc-active");
      $(".fab-daovoice").addClass("fab-daovoice-active");
      $(".fab-tencent-chao").addClass("fab-tencent-chao-active");
      $(".fab-like").addClass("fab-like-active");
    },
    freezeFab: function () {
      $(".fab-up").removeClass("fab-up-active");
      $(".fab-plus").removeClass("fab-plus-active");
      $(".fab-toc").removeClass("fab-toc-active");
      $(".fab-daovoice").removeClass("fab-daovoice-active");
      $(".fab-tencent-chao").removeClass("fab-tencent-chao-active");
      $(".fab-like").removeClass("fab-like-active");
    },
    showFab: function () {
      $(".fab").removeClass("fab-hide").addClass("fab-show");
    },
    hideFab: function () {
      $(".fab").addClass("fab-hide").removeClass("fab-show");
    },
    scroolFab: function () {
      var height = $(window).height();
      var scrollTop = $(window).scrollTop();
      if (scrollTop > height) {
        fn.showFab();
      } else {
        fn.freezeFab();
        fn.hideFab();
      }
    },
    scroolToTop: function () {
      $('body,html').animate({
        scrollTop: '0px'
      }, 800);
    },
    navbar: {
      mobile: function () {
        var height = $(window).height();
        if (CONFIG.isHome) {
          $(".navbar").addClass("transparent");
        } else {
          $(".navbar").addClass("hide");
        }
        $(window).on("scroll", ZHAOO.utils.throttle(function () {
          var before = $(this).scrollTop();
          $(window).on("scroll", function () {
            var after = $(this).scrollTop();
            if (!CONFIG.isHome) {
              if (before > after && after > 300) {
                $(".navbar").removeClass("hide");
              } else if (before < after || after < 300) {
                $(".navbar").addClass("hide");
              }
            }
            if (CONFIG.isHome) {
              if (before < after && after > height) {
                $(".navbar").removeClass("transparent");
              } else if (before > after && after < height) {
                $(".navbar").addClass("transparent");
              } else if (before > after) {
                $(".navbar").removeClass("hide");
              } else if (before < after) {
                $(".navbar").addClass("hide");
              }
            }
            before = after;
          })
        }, 500));
      },
      desktop: function () {
        $(".navbar").addClass("transparent");
        function center() {
          if ($(window).scrollTop() > 60) {
            $(".navbar .center").addClass("hide");
          } else {
            $(".navbar .center").removeClass("hide");
            if (!CONFIG.isHome) {
              $(".navbar").removeClass("transparent");
            }
          }
        }
        center();
        $(window).on("scroll", ZHAOO.utils.throttle(function () {
          center();
          var before = $(this).scrollTop();
          $(window).on("scroll", function () {
            var after = $(this).scrollTop();
            if (before > after) {
              $(".navbar").removeClass("hide");
            } else if (before < after) {
              $(".navbar").addClass("hide");
            }
            before = after;
          })
        }, 500));
      },
    },
    motto: function () {
      if (CONFIG.preview.motto.api) {
        var data_contents = CONFIG.preview.motto.data_contents && JSON.parse(CONFIG.preview.motto.data_contents);
        $.get(CONFIG.preview.motto.api, function (result) {
          if (data_contents.length > 0) {
            data_contents.forEach(function (item) {
              result = result[item];
            });
          }
          if (result) {
            fn.printMotto(result);
          }
        });
      } else {
        fn.printMotto(CONFIG.preview.motto.default);
      }
    },
    printMotto: function (text) {
      if (CONFIG.preview.motto.typing) {
        if (text.charAt(text.length - 1) === '。') {
          text = text.substr(0, text.length - 1);
        }
        var i = 0;
        var timer = setInterval(function () {
          if (i >= text.length) {
            clearInterval(timer);
          }
          $("#motto").text(text.slice(0, i++));
        }, 100);
      } else {
        $("#motto").text(text);
      }
    },
    background: function () {
      if (!CONFIG.preview.background.api) return;
      $(".preview-image").css("background-image", "url(" + CONFIG.preview.background.api + ")");
    },
    doSearch: function (path, search_id, content_id) {
      // https://segmentfault.com/a/1190000011917419
      $.ajax({
        url: path,
        dataType: "xml",
        success: function (xmlResponse) {
          var datas = $("entry", xmlResponse).map(function () {
            return {
              title: $("title", this).text(),
              content: $("content", this).text(),
              url: $("url", this).text()
            };
          }).get();
          var $input = document.getElementById(search_id);
          var $resultContent = document.getElementById(content_id);
          $input.addEventListener('input', function () {
            var str = '<ul class=\"search-result-list\">';
            var keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);
            $resultContent.innerHTML = "";
            if (this.value.trim().length <= 0) {
              return;
            }
            datas.forEach(function (data) {
              var isMatch = true;
              var content_index = [];
              var data_title = data.title.trim().toLowerCase();
              var data_content = data.content.trim().replace(/<[^>]+>/g, "").toLowerCase();
              var data_url = data.url;
              var index_title = -1;
              var index_content = -1;
              var first_occur = -1;
              if (data_title != '' && data_content != '') {
                keywords.forEach(function (keyword, i) {
                  index_title = data_title.indexOf(keyword);
                  index_content = data_content.indexOf(keyword);
                  if (index_title < 0 && index_content < 0) {
                    isMatch = false;
                  } else {
                    if (index_content < 0) {
                      index_content = 0;
                    }
                    if (i == 0) {
                      first_occur = index_content;
                    }
                  }
                });
              }
              if (isMatch) {
                str += "<li><a href='" + data_url + "' class='search-result-title' target='_blank'>" + data_title + "</a>";
                var content = data.content.trim().replace(/<[^>]+>/g, "");
                if (first_occur >= 0) {
                  var start = first_occur - 6;
                  var end = first_occur + 6;
                  if (start < 0) {
                    start = 0;
                  }
                  if (start == 0) {
                    end = 10;
                  }
                  if (end > content.length) {
                    end = content.length;
                  }
                  var match_content = content.substr(start, end);
                  keywords.forEach(function (keyword) {
                    var regS = new RegExp(keyword, "gi");
                    match_content = match_content.replace(regS, "<em class=\"search-keyword\">" + keyword + "</em>");
                  })
                  str += "<p class=\"search-result\">" + match_content + "...</p>"
                }
              }
            })
            $resultContent.innerHTML = str;
          })
        }
      })
    }
  }

  var action = {
    smoothScroll: function () {
      // a[href *=#], area[href *=#]
      $(".smooth-scroll, .toc-link").click(function () {
        if (location.pathname.replace(/^\//, "") == this.pathname.replace(/^\//, "") && location.hostname == this.hostname) {
          var $target = $(decodeURIComponent(this.hash));
          $target = $target.length && $target || $("[name=" + this.hash.slice(1) + "]");
          if ($target.length) {
            var targetOffset = $target.offset().top;
            $("html,body").animate({
              scrollTop: targetOffset
            }, 500);
            location.hash = this.hash;
            return false;
          }
        }
      });
    },
    loading: function () {
      $(".loading").delay(500).fadeOut(300);
      $("body").removeClass("lock-screen");
    },
    fab: function () {
      $(".fab-plus").on("click", function () {
        if ($(this).hasClass("fab-plus-active")) {
          fn.freezeFab();
        } else {
          fn.activeFab();
        }
      });
      $(".fab-daovoice").on("click", function () {
        daovoice('openMessages');
      });
      // 点击其他按钮时收起FAB菜单
      $(".fab-up, .fab-toc, .fab-like, .fab-daovoice, .fab-tencent-chao").on("click", function () {
        fn.freezeFab();
      });
      if (CONFIG.fab.always_show) {
        fn.showFab();
      } else {
        $(window).scroll(fn.scroolFab);
      }
    },
    menu: function () {
      $(".menu-close").on("click", function () {
        fn.hideMenu();
        $(".navbar").removeClass("hide");
      });
    },
    setupFabUp: function () {
      $(".fab-up").on("click", function () {
        $('body,html').animate({
          scrollTop: '0px'
        }, 800);
      });
    },
    fancybox: function () {
      $(".fancybox").fancybox();
      $(".article .content img").each(function () {
        var e = document.createElement("a");
        $(e).attr("data-fancybox", "images");
        $(e).attr("href", $(this).attr("src"));
        $(this).wrap(e);
      });
    },
    pjax: function () {
      $(function () {
        $(document).pjax("a:not(.menu *)", '#main', {
          fragment: '#main',
          timeout: 6000
        });
      });
      $(document).on('pjax:complete', function () {
        CONFIG.fancybox && action.fancybox();
      });
    },
    donate: function () {
      $(".donate .icon").on("mouseover", function () {
        $("#qrcode-donate").show();
      });
      $(".donate .icon").children("a").on("mouseover", function () {
        $("#qrcode-donate img").attr('src', eval('CONFIG.donate.' + $(this).attr('id')))
      });
      $(".donate .icon").on("mouseout", function () {
        $("#qrcode-donate").hide();
      });
    },
    lazyload: function () {
      $("img.lazyload").lazyload({
        effect: "fadeIn",
        threshold: 200,
      });
    },
    fixLazyloadFancybox: function () {
      $(document).find('.article img[data-original]').each(function () {
        $(this).parent().attr("href", $(this).attr("data-original"));
      });
    },
    carrier: function () {
      $(".j-carrier-btn").on("click", ZHAOO.utils.throttle(function () {
        $(".j-carrier-data").select();
        document.execCommand("Copy");
        ZHAOO.zui.message({ text: '已复制到剪切板', type: 'success' });
      }, 1000));
    },
    navbar: function () {
      $(window).resize(ZHAOO.utils.throttle(function () {
        ZHAOO.utils.isDesktop() && fn.navbar.desktop();
        ZHAOO.utils.isMobile() && fn.navbar.mobile();
      }, 1000)).resize();
      
      // 移动端菜单切换
      $(".j-navbar-menu-toggle").on("click", function (e) {
        e.stopPropagation();
        $(".navbar-menu-mobile").toggleClass("show");
      });
      
      // 点击菜单项后关闭移动端菜单
      $(".navbar-menu-mobile .navbar-menu-item").on("click", function () {
        $(".navbar-menu-mobile").removeClass("show");
      });
      
      // 点击页面其他地方关闭移动端菜单
      $(document).on("click", function (e) {
        if (!$(e.target).closest(".navbar").length) {
          $(".navbar-menu-mobile").removeClass("show");
        }
      });
      
      // 保留原有的菜单按钮（如果还在使用）
      $(".j-navbar-menu").on("click", function () {
        fn.showMenu();
        $(".qrcode").fadeOut(300);
      });
      
      $(".j-navbar-qrcode").on("click", function () {
        if ($("#qrcode-navbar").is(":hidden")) {
          $("#qrcode-navbar").fadeIn(300);
        } else {
          $("#qrcode-navbar").fadeOut(300);
        }
      });
      $(".j-navbar-back-home").on("click", function () {
        window.location.href = "/";
      });
      $(".j-navbar-search").on("click", function () {
        fn.showSearch();
        $(".qrcode").fadeOut(300);
      });
    },
    preview: function () {
      fn.background();
      fn.motto();
    },
    qrcode: function () {
      if (CONFIG.qrcode.type === 'url') {
        $("#qrcode-navbar").qrcode({
          text: window.location.href,
          width: 150,
          height: 150
        });
      } else if (CONFIG.qrcode.type === 'image') {
        $("#qrcode-navbar").append('<img src="' + CONFIG.qrcode.image + '" alt="qrcode" />');
      }
    },
    toc: function () {
      var current = [];
      var titleList = new Map();
      $("article .content h1,h2,h3,h4,h5,h6").each(function () {
        var title = $(this).attr("id");
        var height = $(this).offset().top;
        titleList.set(height, title);
      });
      $(window).on("scroll", f);
      function f() {
        var height = $(this).scrollTop() || $(window).scrollTop();
        for (var item of titleList) {
          if (item[0] >= height) {
            current = item;
            break;
          }
        }
        $(".toc-link").removeClass("active");
        $(".toc-link[href='#" + current[1] + "']").addClass("active");
      };
      f();
    },
    mobileToc: function () {
      // 移动端目录功能
      var $fabToc = $(".fab-toc");
      var $closeBtn = $(".toc-close-btn");
      var $tocWrap = $(".toc-wrap");
      var $overlay = $(".toc-overlay");
      
      function openToc() {
        $tocWrap.addClass('toc-open');
        $overlay.addClass('toc-overlay-visible');
        $("body").css("overflow", "hidden");
      }
      
      function closeToc() {
        $tocWrap.removeClass('toc-open');
        $overlay.removeClass('toc-overlay-visible');
        $("body").css("overflow", "");
      }
      
      // fab-toc按钮的点击在fab函数中已经有freezeFab，所以这里只需要打开目录
      $fabToc.on("click", function(e) {
        openToc();
      });
      
      $closeBtn.on("click", closeToc);
      $overlay.on("click", closeToc);
      
      // 点击目录链接后关闭目录（移动端）
      $(".toc-link").on("click", function() {
        if ($(window).width() <= 1200) {
          setTimeout(closeToc, 300);
        }
      });
    },
    scrollbar: function () {
      var totalH = $(document).height();
      var clientH = $(window).height();
      $(window).on("scroll", f);
      function f() {
        var validH = totalH - clientH;
        var scrollH = $(document).scrollTop();
        var height = scrollH / validH * 100;
        $(".j-scrollbar-current").css("height", height + '%');
      }
      f();
      $(".j-scrollbar").mousedown(function (e) {
        var scrollH = e.offsetY * totalH / 100;
        $("html,body").animate({ scrollTop: scrollH }, 300);
        $(document).mousemove(function (e) {
          var scrollH = (1 - ((clientH - e.clientY) / clientH)) * totalH;
          $("html,body").scrollTop(scrollH);
          $("html,body").css({ "user-select": "none", "cursor": "move" });
        });
        $(document).mouseup(function () {
          $(document).off('mousemove');
          $("html,body").css({ "user-select": "auto", "cursor": "default" });
        });
      });
    },
    notification: function () {
      if (!CONFIG.notification.list) return;
      var page_white_list = CONFIG.notification.page_white_list && JSON.parse(CONFIG.notification.page_white_list);
      var page_black_list = CONFIG.notification.page_black_list && JSON.parse(CONFIG.notification.page_black_list);
      var path = window.location.pathname;
      if ((page_white_list && page_white_list.indexOf(path) < 0) || (page_black_list && page_black_list.indexOf(path) >= 0)) return;
      var delay = CONFIG.notification.delay;
      var list = JSON.parse(CONFIG.notification.list);
      var playList = list.filter(function (item) {
        return item.enable && ZHAOO.utils.isDuringDate(item.startTime, item.endTime) && item;
      });
      playList.forEach(function (item) {
        ZHAOO.zui.notification({ title: item.title, content: item.content, delay: delay });
      });
    },
    search: function () {
      var path = CONFIG.search.path;
      if (!path) return;
      $(".search-close").on("click", function () {
        fn.hideSearch();
        $(".navbar").removeClass("hide");
      });
      fn.doSearch(path, 'search-input', 'search-output');
    },
    lottie: function () {
      lottie.loadAnimation({
        container: document.getElementById("loading"),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: CONFIG.loading.lottie
      });
    }
  }

  $(function () {
    action.smoothScroll();
    action.loading();
    action.fab();
    action.navbar();
    action.menu();
    action.setupFabUp();
    action.preview();
    CONFIG.fancybox && action.fancybox();
    CONFIG.pjax && action.pjax();
    CONFIG.lazyload.enable && action.lazyload();
    CONFIG.donate.enable && action.donate();
    (CONFIG.lazyload && CONFIG.fancybox) && action.fixLazyloadFancybox();
    CONFIG.carrier.enable && action.carrier();
    CONFIG.qrcode.enable && action.qrcode();
    CONFIG.toc.enable && action.toc();
    CONFIG.toc.enable && action.mobileToc();
    CONFIG.scrollbar.type === 'simple' && action.scrollbar();
    CONFIG.notification.enable && action.notification();
    CONFIG.search.enable && action.search();
    CONFIG.loading.lottie && action.lottie();
  });

})(jQuery);
