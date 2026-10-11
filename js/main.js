(function () {
  document.documentElement.classList.add("js");

  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    function useFallback() {
      var fallback = img.getAttribute("data-fallback");
      if (!fallback || img.getAttribute("src") === fallback) return;
      img.setAttribute("src", fallback);
    }
    img.addEventListener("error", useFallback);
    if (img.complete && img.naturalWidth === 0) useFallback();
  });

  function fitLiveFrames() {
    document.querySelectorAll("[data-live-frame]").forEach(function (wrap) {
      var frame = wrap.querySelector("iframe");
      if (!frame || !wrap.clientWidth) return;
      frame.style.transform = "scale(" + (wrap.clientWidth / 1440) + ")";
    });
  }

  fitLiveFrames();
  window.addEventListener("resize", fitLiveFrames);

  var crowdCanvas = document.querySelector("[data-crowd]");
  if (crowdCanvas && crowdCanvas.getContext) {
    var crowdCtx = crowdCanvas.getContext("2d");
    var crowdImg = new Image();
    var crowdCols = 15;
    var crowdRows = 7;
    var crowdActive = [];
    var crowdPool = [];
    var crowdStage = { w: 0, h: 0 };
    var crowdDpr = 1;
    var crowdReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function crowdRand(min, max) {
      return min + Math.random() * (max - min);
    }

    function crowdTake() {
      if (!crowdPool.length) return null;
      return crowdPool.splice(Math.floor(Math.random() * crowdPool.length), 1)[0];
    }

    function crowdSpawn(progress) {
      var peep = crowdTake();
      if (!peep) return;
      var dir = Math.random() > 0.5 ? 1 : -1;
      var scale = Math.min(1, Math.max(0.42, crowdStage.h / 260));
      var drawW = peep.sw * scale;
      var drawH = peep.sh * scale;
      var low = Math.max(8, crowdStage.h - drawH);
      var high = Math.max(8, crowdStage.h - drawH - Math.min(60, crowdStage.h * 0.22));
      var y = crowdRand(Math.min(high, low), Math.max(high, low));
      var startX = dir === 1 ? -drawW : crowdStage.w + drawW;
      var endX = dir === 1 ? crowdStage.w + drawW : -drawW;
      peep.scaleX = dir;
      peep.w = drawW;
      peep.h = drawH;
      peep.baseY = y;
      peep.anchorY = y;
      peep.startX = startX;
      peep.endX = endX;
      peep.duration = 10000 / crowdRand(0.5, 1.5);
      peep.born = performance.now() - progress * peep.duration;
      peep.x = startX + (endX - startX) * progress;
      peep.y = y;
      crowdActive.push(peep);
    }

    function crowdReset() {
      crowdActive.forEach(function (peep) {
        crowdPool.push(peep);
      });
      crowdActive = [];
      var rect = crowdCanvas.getBoundingClientRect();
      crowdStage.w = rect.width || crowdCanvas.clientWidth;
      crowdStage.h = rect.height || crowdCanvas.clientHeight;
      crowdDpr = window.devicePixelRatio || 1;
      crowdCanvas.width = Math.max(1, Math.round(crowdStage.w * crowdDpr));
      crowdCanvas.height = Math.max(1, Math.round(crowdStage.h * crowdDpr));
      if (crowdReduce) {
        var scale = Math.min(1, Math.max(0.42, crowdStage.h / 260));
        var x = -20;
        crowdPool.slice().forEach(function (peep) {
          var drawW = peep.sw * scale;
          if (x > crowdStage.w) return;
          var index = crowdPool.indexOf(peep);
          if (index >= 0) crowdPool.splice(index, 1);
          peep.scaleX = 1;
          peep.w = drawW;
          peep.h = peep.sh * scale;
          peep.x = x;
          peep.y = Math.max(8, crowdStage.h - peep.h);
          crowdActive.push(peep);
          x += drawW * 0.62;
        });
        crowdPaint(0);
        return;
      }
      while (crowdPool.length) crowdSpawn(Math.random());
      crowdActive.sort(function (a, b) { return a.anchorY - b.anchorY; });
    }

    function crowdPaint(now) {
      var finished = [];
      crowdCtx.setTransform(crowdDpr, 0, 0, crowdDpr, 0, 0);
      crowdCtx.clearRect(0, 0, crowdStage.w, crowdStage.h);
      crowdActive.forEach(function (peep) {
        if (!crowdReduce) {
          var t = (now - peep.born) / peep.duration;
          if (t >= 1) {
            finished.push(peep);
            return;
          }
          peep.x = peep.startX + (peep.endX - peep.startX) * t;
          var wave = Math.abs((now / 250) % 2 - 1);
          peep.y = Math.max(4, peep.baseY - wave * 6);
        }
        crowdCtx.save();
        crowdCtx.translate(peep.x, peep.y);
        crowdCtx.scale(peep.scaleX, 1);
        crowdCtx.drawImage(crowdImg, peep.sx, peep.sy, peep.sw, peep.sh, 0, 0, peep.w, peep.h);
        crowdCtx.restore();
      });
      finished.forEach(function (peep) {
        var index = crowdActive.indexOf(peep);
        if (index >= 0) crowdActive.splice(index, 1);
        crowdPool.push(peep);
        crowdSpawn(0);
      });
    }

    function crowdLoop(now) {
      if (!document.hidden) crowdPaint(now);
      window.requestAnimationFrame(crowdLoop);
    }

    window.addEventListener("resize", crowdReset);
    crowdImg.onload = function () {
      var cellW = crowdImg.naturalWidth / crowdCols;
      var cellH = crowdImg.naturalHeight / crowdRows;
      var total = crowdCols * crowdRows;
      crowdPool = [];
      for (var i = 0; i < total; i++) {
        crowdPool.push({
          sx: (i % crowdCols) * cellW,
          sy: Math.floor(i / crowdCols) * cellH,
          sw: cellW,
          sh: cellH
        });
      }
      crowdReset();
      if (!crowdReduce) window.requestAnimationFrame(crowdLoop);
    };
    crowdImg.src = "images/peeps/all-peeps.png";
  }

  var welcome = document.querySelector("[data-welcome]");
  if (welcome) {
    var reduceWelcome = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var welcomeTimer = 0;
    document.body.classList.add("welcome-open");

    function closeWelcome() {
      if (welcome.classList.contains("is-leaving") || welcome.classList.contains("is-done")) return;
      window.clearTimeout(welcomeTimer);
      var clip = welcome.querySelector("video");
      if (clip) clip.pause();
      if (reduceWelcome) {
        welcome.classList.add("is-done");
        document.body.classList.remove("welcome-open");
        return;
      }
      welcome.classList.add("is-leaving");
      window.setTimeout(function () {
        welcome.classList.add("is-done");
        document.body.classList.remove("welcome-open");
      }, 1200);
    }

    var welcomeVideo = welcome.querySelector("video");
    welcome.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeWelcome();
    });
    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeWelcome();
    });
    if (reduceWelcome) {
      if (welcomeVideo) welcomeVideo.pause();
      closeWelcome();
    } else {
      if (welcomeVideo) {
        var playWelcome = welcomeVideo.play();
        if (playWelcome && playWelcome.catch) playWelcome.catch(function () {});
      }
      welcomeTimer = window.setTimeout(function () {
        if (welcomeVideo) welcomeVideo.pause();
        closeWelcome();
      }, 4500);
    }
  }

  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  function setNav(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNav(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setNav(false);
        toggle.focus();
      }
    });
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var serviceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var serviceReveals = document.querySelectorAll(".services-reveal");
  if (!serviceMotion && "IntersectionObserver" in window) {
    var serviceObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-shown");
        serviceObserver.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -18% 0px" });
    serviceReveals.forEach(function (item) {
      if (item.getBoundingClientRect().top < window.innerHeight * 0.86) {
        item.classList.add("is-shown");
      } else {
        serviceObserver.observe(item);
      }
    });
  } else {
    serviceReveals.forEach(function (item) {
      item.classList.add("is-shown");
    });
  }

  var sectionLinks = document.querySelectorAll("[data-nav] a[href^='#']");
  var sections = Array.prototype.map.call(sectionLinks, function (link) {
    var id = link.getAttribute("href").slice(1);
    return document.getElementById(id);
  }).filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var visible = new Set();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      var current = sections.find(function (section) {
        return visible.has(section.id);
      });
      sectionLinks.forEach(function (link) {
        var active = current && link.getAttribute("href") === "#" + current.id;
        link.classList.toggle("is-active", Boolean(active));
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  document.querySelectorAll("[data-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");
      document.querySelectorAll("[data-filter]").forEach(function (item) {
        var selected = item === button;
        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      document.querySelectorAll("[data-categories]").forEach(function (card) {
        var categories = card.getAttribute("data-categories").split(" ");
        var show = filter === "all" || categories.indexOf(filter) !== -1;
        card.hidden = !show;
      });
      var track = document.querySelector("[data-project-track]");
      if (track) {
        track.scrollLeft = 0;
        track.dispatchEvent(new Event("scroll"));
      }
    });
  });

  var projectTrack = document.querySelector("[data-project-track]");
  if (projectTrack) {
    var projectPrev = document.querySelector("[data-project-prev]");
    var projectNext = document.querySelector("[data-project-next]");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function projectStep() {
      var card = projectTrack.querySelector(".project-card:not([hidden])");
      if (!card) return projectTrack.clientWidth;
      var styles = window.getComputedStyle(projectTrack);
      var gap = parseFloat(styles.columnGap || styles.gap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function updateProjectNav() {
      var max = projectTrack.scrollWidth - projectTrack.clientWidth;
      if (projectPrev) projectPrev.disabled = projectTrack.scrollLeft <= 2;
      if (projectNext) projectNext.disabled = projectTrack.scrollLeft >= max - 2;
    }

    function moveProjects(direction) {
      projectTrack.scrollBy({
        left: direction * projectStep(),
        behavior: reduceMotion ? "auto" : "smooth"
      });
    }

    if (projectPrev) projectPrev.addEventListener("click", function () { moveProjects(-1); });
    if (projectNext) projectNext.addEventListener("click", function () { moveProjects(1); });
    projectTrack.addEventListener("scroll", updateProjectNav, { passive: true });
    window.addEventListener("resize", updateProjectNav);
    updateProjectNav();

    var projectTimer = null;
    var workSection = document.getElementById("work");

    function advanceProjects() {
      var max = projectTrack.scrollWidth - projectTrack.clientWidth;
      if (max <= 2) return;
      if (projectTrack.scrollLeft >= max - 4) {
        projectTrack.scrollTo({ left: 0, behavior: reduceMotion ? "auto" : "smooth" });
      } else {
        moveProjects(1);
      }
    }

    function startProjects() {
      if (reduceMotion || projectTimer) return;
      projectTimer = window.setInterval(advanceProjects, 4200);
    }

    function stopProjects() {
      window.clearInterval(projectTimer);
      projectTimer = null;
    }

    if (workSection) {
      workSection.addEventListener("mouseenter", stopProjects);
      workSection.addEventListener("mouseleave", startProjects);
      workSection.addEventListener("focusin", stopProjects);
      workSection.addEventListener("focusout", function (event) {
        if (!workSection.contains(event.relatedTarget)) startProjects();
      });
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopProjects();
      else startProjects();
    });
    startProjects();
  }

  document.querySelectorAll("[data-enquiry]").forEach(function (control) {
    control.addEventListener("click", function () {
      var select = document.querySelector("#project-type");
      if (select) select.value = control.getAttribute("data-enquiry");
    });
  });

  var projectType = document.querySelector("#project-type");
  var enquiry = new URLSearchParams(window.location.search).get("enquiry");
  if (projectType && enquiry) {
    var match = Array.prototype.some.call(projectType.options, function (option) {
      return option.value === enquiry;
    });
    if (match) projectType.value = enquiry;
  }

  var slider = document.querySelector("[data-work-slider]");
  if (slider) {
    var track = slider.querySelector("[data-work-track]");
    var slides = slider.querySelectorAll(".work-slide");
    var dots = slider.querySelectorAll("[data-work-dots] button");
    var slideStatus = slider.querySelector("[data-work-status]");
    var index = 0;
    var timer = null;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function show(next) {
      index = (next + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      slides.forEach(function (slide, slideIndex) {
        slide.setAttribute("aria-hidden", slideIndex === index ? "false" : "true");
      });
      dots.forEach(function (dot, dotIndex) {
        var selected = dotIndex === index;
        dot.classList.toggle("is-selected", selected);
        if (selected) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      var label = slides[index].querySelector("strong");
      if (slideStatus && label) slideStatus.textContent = "Showing " + label.textContent;
    }

    function start() {
      if (reduceMotion || timer) return;
      timer = window.setInterval(function () { show(index + 1); }, 3800);
    }

    function stop() {
      window.clearInterval(timer);
      timer = null;
    }

    slider.querySelector("[data-work-prev]").addEventListener("click", function () {
      show(index - 1);
    });
    slider.querySelector("[data-work-next]").addEventListener("click", function () {
      show(index + 1);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () { show(dotIndex); });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    slider.addEventListener("focusin", stop);
    slider.addEventListener("focusout", function (event) {
      if (!slider.contains(event.relatedTarget)) start();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    show(0);
    start();
  }

  var form = document.querySelector("#enquiry-form");
  if (!form) return;

  var status = document.querySelector("#form-status");
  var serviceId = "service_0wz3l4p";
  var templateId = "template_mfjih6d";
  var publicKey = "VgGYJ5iMGYwoQuPhW";

  if (window.emailjs) {
    emailjs.init(publicKey);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var honeypot = form.querySelector("[name='company_website']");
    if (honeypot && honeypot.value) {
      form.reset();
      setStatus("Message sent. I'll reply with the next steps.", "success");
      return;
    }

    var data = new FormData(form);
    var name = String(data.get("name") || "").trim();
    var email = String(data.get("email") || "").trim();
    var phone = String(data.get("phone") || "").trim() || "Not provided";
    var company = String(data.get("company") || "").trim() || "Not provided";
    var type = String(data.get("project_type") || "").trim();
    var description = String(data.get("description") || "").trim();

    var message = [
      "Phone / WhatsApp: " + phone,
      "Company: " + company,
      "Project type: " + type,
      "",
      description
    ].join("\n");

    var submitButton = form.querySelector("[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    setStatus("", "");

    if (!window.emailjs) {
      submitButton.disabled = false;
      submitButton.textContent = "Send Project Enquiry";
      setStatus("The form could not connect. Please email gauravkmadhuaka@gmail.com.", "error");
      return;
    }

    emailjs.send(serviceId, templateId, {
      to_name: "Gaurav",
      to_email: "gauravkmadhuaka@gmail.com",
      from_name: name,
      from_email: email,
      subject: "Project enquiry — " + type,
      message: message,
      reply_to: email
    }).then(function () {
      form.reset();
      if (projectType) projectType.value = "";
      setStatus("Message sent. I'll reply with the next steps.", "success");
    }).catch(function () {
      setStatus("The message could not be sent. Please email gauravkmadhuaka@gmail.com or message me on WhatsApp.", "error");
    }).finally(function () {
      submitButton.disabled = false;
      submitButton.textContent = "Send Project Enquiry";
    });
  });

  function setStatus(text, state) {
    if (!status) return;
    status.textContent = text;
    status.className = "form-status" + (state ? " is-" + state : "");
  }
})();
