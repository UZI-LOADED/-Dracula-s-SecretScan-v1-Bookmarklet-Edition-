javascript:(async function() {
  alert("🧛 Dracula's SecretScan is starting...");

  const patterns = [
    /AIza[0-9A-Za-z-_]{35}/g, // Google API Key
    /sk_live_[0-9a-zA-Z]{24}/g, // Stripe live secret key
    /AKIA[0-9A-Z]{16}/g, // AWS Access Key ID
    /(?:aws)?_?secret(?:_?key)?["'\s:=]{1,5}([0-9a-zA-Z/+]{40})/gi,
    /access[_-]?token["'\s:=]{1,5}([a-z0-9_\-\.=]{10,})/gi,
    /secret["'\s:=]{1,5}([a-z0-9_\-\.=]{10,})/gi,
    /client[_-]?secret["'\s:=]{1,5}([a-z0-9_\-\.=]{10,})/gi,
    /auth[_-]?token["'\s:=]{1,5}([a-z0-9_\-\.=]{10,})/gi,
    /password["'\s:=]{1,5}([^\s"'`;&]{4,})/gi,
    /(?:authorization|auth)[\s:=]{1,5}["']?(Bearer\s[a-zA-Z0-9\-\._~\+\/]+=*)["']?/gi,
    /cloudinary:\/\/[0-9a-z]+:[0-9a-z]+@[a-z]+/gi,
    /ghp_[A-Za-z0-9_]{36}/gi, // GitHub Personal Token
    /eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, // JWT
    /:\/\/[a-z0-9_-]{1,}\.virginia\.amazonaws\.com/g, // AWS Virginia region endpoint
    /access_key|api_key|admin_pass|app_secret|aws_secret_key|heroku_api_key|digitalocean|travis_token/gi
  ];

  const results = new Set();
  const searchText = (text) => {
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) matches.forEach(m => results.add(m));
    });
  };

  // Scan inline page content
  searchText(document.documentElement.innerHTML);

  // Fetch and scan JS files
  const scripts = [...document.scripts].map(s => s.src).filter(src => src && src.startsWith("http"));
  for (let src of scripts) {
    try {
      const res = await fetch(src);
      if (res.ok) {
        const js = await res.text();
        searchText(js);
      }
    } catch (e) {
      console.warn("⚠️ Failed to fetch:", src, e);
    }
  }

  // Display results
  if (results.size > 0) {
    alert("🧛 Secrets Detected:\n\n" + [...results].join("\n"));
    console.log("🔍 Dracula's Scan Results:", [...results]);
  } else {
    alert("😴 Nothing exposed... this time.");
  }
})();
