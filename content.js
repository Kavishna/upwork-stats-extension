(function () {
  // CSS selectors for finding job slider elements
  const SLIDER_SELECTOR = ".air3-slider-content";
  const CLIENT_ACTIVITY_SELECTOR = ".client-activity-items";
  const FEATURES_SELECTOR = ".features";

  // Extract client activity stats (proposals, hires, interviews, etc.)
  function extractClientActivityData(container) {
    const data = {};
    const items = container.querySelectorAll(".ca-item");

    items.forEach((item) => {
      const label = item.querySelector(".title")?.textContent?.trim();
      const value = item.querySelector(".value")?.textContent?.trim();

      if (label && value) {
        if (label.includes("Proposals")) data.proposals = value;
        else if (label.includes("Last viewed")) data.lastViewed = value;
        else if (label.includes("Hires")) data.hires = value;
        else if (label.includes("Interviewing")) data.interviewing = value;
        else if (label.includes("Invites sent")) data.invitesSent = value;
        else if (label.includes("Unanswered invites"))
          data.unansweredInvites = value;
      }
    });

    return data;
  }

  // Extract job features (price, experience level, duration, hourly rate)
  function extractFeaturesData(container) {
    const data = {};
    const items = container.querySelectorAll("li");

    items.forEach((item) => {
      // Check for fixed price jobs
      const price = item.querySelector('[data-cy="fixed-price"]');
      const xp = item.querySelector('[data-cy="expertise"]');
      const duration = item.querySelector('[data-cy="duration2"]');
      const hourly = item.querySelector('[data-cy="clock-timelog"]');

      // Extract fixed price amount
      if (price) {
        const amount = item.querySelector("strong")?.textContent?.trim();
        data.price = amount ? `${amount}` : undefined;
      }

      // Extract hourly rate range
      if (hourly) {
        const rates = item.querySelectorAll("strong");
        if (rates.length === 2) {
          const from = rates[0]?.textContent?.trim();
          const to = rates[1]?.textContent?.trim();
          if (from && to) data.hourlyRate = `${from} - ${to}`;
        } else if (rates.length === 1) {
          const rate = rates[0]?.textContent?.trim();
          if (rate) data.hourlyRate = rate;
        }
      }

      // Extract experience level requirement
      if (xp) {
        const level = item.querySelector("strong")?.textContent?.trim();
        data.experience = level;
      }

      // Extract project duration
      if (duration) {
        const durSpans = item.querySelectorAll("strong span");
        const dur = durSpans.length > 0 ? durSpans[0].textContent.trim() : null;
        data.duration = dur;
      }
    });

    return data;
  }

  // Add stats container with colored badges to the job slider
  function injectStats(slider, stats) {
    const section = slider.querySelector(".air3-card-section");
    if (!section) return;

    const parentElement = section;

    // Remove any previously injected stats to avoid duplicates
    const existing = slider.querySelector(".upwork-stats-injected");
    if (existing) existing.remove();

    // Check if using dark theme
    const isDark = document.documentElement.getAttribute("theme") === "dark";

    // Color schemes for dark and light themes
    const palette = isDark
      ? {
          containerBg: "#1e1e1e",
          containerText: "#f0f0f0",
          border: "#444",
          labels: {
            price: ["#37474f", "#b2ebf2"],
            experience: ["#263238", "#90caf9"],
            hires: ["#3e2723", "#ffcc80"],
            proposals: ["#4e342e", "#ffe082"],
            interviewing: ["#2e7d32", "#c5e1a5"],
            invites: ["#1a237e", "#9fa8da"],
            unanswered: ["#bf360c", "#ffccbc"],
            duration: ["#311b92", "#ce93d8"],
            hourly: ["#4a148c", "#f8bbd0"],
            lastViewed: ["#004d40", "#80cbc4"],
          },
        }
      : {
          containerBg: "#ffffff",
          containerText: "#111",
          border: "#ccc",
          labels: {
            price: ["#e0f7fa", "#004d40"],
            experience: ["#e3f2fd", "#0d47a1"],
            hires: ["#fff3e0", "#ef6c00"],
            proposals: ["#fffde7", "#f57f17"],
            interviewing: ["#f1f8e9", "#33691e"],
            invites: ["#e8eaf6", "#1a237e"],
            unanswered: ["#ffe0b2", "#e65100"],
            duration: ["#f3e5f5", "#4a148c"],
            hourly: ["#fce4ec", "#880e4f"],
            lastViewed: ["#e0f2f1", "#00695c"],
          },
        };

    // Create main stats container
    const container = document.createElement("div");
    container.className = "upwork-stats upwork-stats-injected";
    container.style.cssText = `
    padding: 12px;
    margin-top: 12px;
    background-color: ${palette.containerBg};
    color: ${palette.containerText};
    border: 1px solid ${palette.border};
    border-radius: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 13px;
    line-height: 1.5;
  `;

    // Create colored badge for each stat
    const createLabel = (label, value, type) => {
      const [bg, color] = palette.labels[type];
      const span = document.createElement("span");
      span.textContent = `${label}: ${value}`;
      span.style.cssText = `
      display: inline-block;
      padding: 4px 10px;
      background-color: ${bg};
      color: ${color};
      border-radius: 16px;
      font-weight: 600;
      font-size: 13px;
    `;
      return span;
    };

    // Helper to add stat badge if value exists
    const append = (label, value, key) => {
      if (value) {
        container.appendChild(createLabel(label, value, key));
      }
    };

    // Add all available stat badges
    append("💰 Fixed Price", stats.price, "price");
    append("🕒 Hourly", stats.hourlyRate, "hourly");
    append("🎓 Experience", stats.experience, "experience");
    append("📅 Duration", stats.duration, "duration");
    append("📬 Proposals", stats.proposals, "proposals");
    append("🤝 Hires", stats.hires, "hires");
    append("🎤 Interviewing", stats.interviewing, "interviewing");
    append("✉️ Invites", stats.invitesSent, "invites");
    append("❗ Unanswered", stats.unansweredInvites, "unanswered");
    append("👁️ Last Viewed", stats.lastViewed, "lastViewed");

    // Highlight container if job has previous hires (good indicator)
    if (stats.hires && parseInt(stats.hires) > 0) {
      container.style.border = isDark
        ? "1px solid #a63535ff"
        : "1px solid #ef6c004d";

      container.style.backgroundColor = isDark ? "#a6353571" : "#ef6c004d";
    }

    parentElement.appendChild(container, parentElement.firstChild);
  }

  // Process a single job slider
  function handleSlider(slider) {
    // Skip if already processed
    if (!slider || slider.dataset.statsInjected === "true") return;

    // Wait for slider content to load, then extract and inject stats
    const checkInterval = setInterval(() => {
      const clientData = slider.querySelector(CLIENT_ACTIVITY_SELECTOR);
      const featureData = slider.querySelector(FEATURES_SELECTOR);

      // Both sections must be loaded before we can extract data
      if (clientData && featureData) {
        clearInterval(checkInterval);

        // Extract data from both sections
        const clientStats = extractClientActivityData(clientData);
        const features = extractFeaturesData(featureData);

        // Combine all stats and inject into slider
        const merged = { ...clientStats, ...features };
        injectStats(slider, merged);

        // Mark as processed to avoid duplicate processing
        slider.dataset.statsInjected = "true";
      }
    }, 300);
  }

  // Watch for new job sliders being added to the page
  const observer = new MutationObserver(() => {
    const sliders = document.querySelectorAll(SLIDER_SELECTOR);
    sliders.forEach((slider) => handleSlider(slider));
  });

  // Start observing DOM changes
  observer.observe(document.body, { childList: true, subtree: true });
})();
