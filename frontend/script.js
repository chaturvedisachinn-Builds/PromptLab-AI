
(() => {
  "use strict";

  const API = "http://127.0.0.1:8000/api/v1";
  const TIMEOUT = 30000;
  let lastRequest = null;
  const $ = (id) => document.getElementById(id);

  const el = {
    input: $("promptInput"),
    count: $("charCount"),
    console: $("consoleWrap"),
    panel: $("outputPanel"),
    text: $("outputText"),
    evalReport: $("evaluationReport"),
    tag: $("outputTag"),
    status: $("outputStatus"),
    loading: $("outputLoading"),
    loadingText: $("loadingText"),
    toast: $("toast"),
    metadata: $("metadata"),
    model: $("modelInfo"),
    request: $("requestInfo"),
    action: $("actionInfo"),
    time: $("timeInfo"),
    retry: $("retryButton"),
    clear: $("clearButton"),
    copy: $("copyOutput"),
    copyMd: $("copyMarkdownButton"),
    txt: $("downloadTxt"),
    md: $("downloadMd"),
    pdf: $("downloadPdf"),
    history: $("historyList"),
    promptName: $("promptName"),
    savePrompt: $("savePromptButton"),
    libraryMessage: $("libraryMessage"),
    menu: $("menuButton"),
    links: $("navLinks")
  };

  const actions = [...document.querySelectorAll("[data-action]")];
  const templates = [...document.querySelectorAll("[data-template]")];

  let result = "";
  let evaluatedPrompt = "";
  let improvedPrompt = "";
  let raf = 0;
  let toastTimer = 0;
  let loadingTimer = 0;

  const labels = {
    generate: "Generated prompt",
    improve: "Improved prompt",
    explain: "Explanation",
    optimize: "Optimized prompt",
    evaluate: "Prompt Evaluation"
  };

  const history = [];

  const setDisabled = (value) => {
    [...actions, el.retry, el.clear, el.copy, el.copyMd,
      el.txt, el.md, el.pdf].forEach((button) => {
      if (button) button.disabled = value;
    });
  };

  const toast = (message) => {
    clearTimeout(toastTimer);
    el.toast.textContent = message;
    el.toast.classList.add("show");
    toastTimer = setTimeout(
      () => el.toast.classList.remove("show"), 2300
    );
  };

  const updateCount = () => {
    el.count.textContent =
      `${el.input.value.length.toLocaleString()} / 10,000`;

    el.input.style.height = "auto";
    el.input.style.height =
      `${Math.min(el.input.scrollHeight, 340)}px`;
  };

  const errorMessage = (status, data) => {
    const detail = data?.detail || data?.message || data?.error;

    if (status === 404) return "This action is unavailable on the backend.";
    if (status === 422) return detail || "Please provide a valid prompt.";
    if (status >= 500) return "The AI server encountered an error. Please try again.";

    return detail || "The request could not be completed.";
  };

  // Existing AI action request
  const request = async (action, prompt) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(`${API}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("The backend returned invalid JSON.");
      }

      if (!response.ok) {
        throw new Error(errorMessage(response.status, data));
      }

      if (typeof data?.result !== "string") {
        throw new Error("The backend response did not include a result.");
      }

      return data;

    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("The request timed out. Please try again.");
      }

      if (error instanceof TypeError) {
        throw new Error(
          navigator.onLine
            ? "Backend offline. Start FastAPI and try again."
            : "No internet connection. Please reconnect and try again."
        );
      }

      throw error;

    } finally {
      clearTimeout(timer);
    }
  };

  // New Prompt Evaluation API request
  const evaluateRequest = async (prompt) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(`${API}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("The backend returned invalid JSON.");
      }

      if (!response.ok) {
        throw new Error(errorMessage(response.status, data));
      }

      if (
        typeof data.overall_score !== "number" ||
        !data.clarity ||
        !data.specificity ||
        !data.context ||
        !data.structure ||
        !Array.isArray(data.suggestions)
      ) {
        throw new Error("The evaluation response is incomplete.");
      }

      return data;

    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Evaluation timed out. Please try again.");
      }

      if (error instanceof TypeError) {
        throw new Error(
          navigator.onLine
            ? "Backend offline. Start FastAPI and try again."
            : "No internet connection. Please reconnect and try again."
        );
      }

      throw error;

    } finally {
      clearTimeout(timer);
    }
  };

  const render = (markdown) => {
    if (window.marked?.parse) {
      el.text.innerHTML = window.marked.parse(markdown, {
        gfm: true,
        breaks: true,
        headerIds: false,
        mangle: false
      });
    } else {
      el.text.textContent = markdown;
    }
  };

  const type = (content) => new Promise((resolve) => {
    cancelAnimationFrame(raf);

    const start = performance.now();
    const duration = Math.min(
      2200,
      Math.max(400, content.length * 7)
    );

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);

      el.text.textContent =
        content.slice(0, Math.ceil(content.length * progress));

      el.text.scrollIntoView({ block: "nearest" });

      if (progress < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        render(content);
        resolve();
      }
    };

    raf = requestAnimationFrame(frame);
  });

  const setLoading = (value) => {
    clearTimeout(loadingTimer);

    el.console.classList.toggle("thinking", value);
    el.loading.classList.toggle("hidden", !value);

    setDisabled(value);

    if (value) {
      el.loadingText.textContent = "Connecting…";

      loadingTimer = setTimeout(() => {
        el.loadingText.textContent = "Generating response…";
      }, 500);
    }
  };

  const enableResultTools = () => {
    [
      el.retry, el.clear, el.copy, el.copyMd,
      el.txt, el.md, el.pdf
    ].forEach((button) => {
      button.disabled = false;
    });
  };

  const showNormalOutput = () => {
    el.text.hidden = false;
    el.evalReport.hidden = true;
    el.evalReport.classList.add("hidden");
    el.text.classList.remove("hidden");
  };

  const showEvaluationOutput = () => {
    el.text.hidden = true;
    el.text.classList.add("hidden");
    el.evalReport.hidden = false;
    el.evalReport.classList.remove("hidden");
  };

  // Build evaluation report safely using DOM elements
  const renderEvaluation = (data) => {
    el.evalReport.replaceChildren();

    const heading = document.createElement("div");
    heading.className = "evaluation-heading";

    const title = document.createElement("h2");
    title.textContent = "Prompt Quality Report";

    const score = document.createElement("div");
    score.className = "evaluation-score";

    const scoreNumber = document.createElement("strong");
    scoreNumber.textContent = `${data.overall_score}/100`;

    const scoreLabel = document.createElement("span");
    scoreLabel.textContent = "Overall score";

    score.append(scoreNumber, scoreLabel);
    heading.append(title, score);

    const summary = document.createElement("p");
    summary.className = "evaluation-summary";
    summary.textContent = data.summary || "";

    const dimensions = [
      ["Clarity", data.clarity],
      ["Specificity", data.specificity],
      ["Context", data.context],
      ["Structure", data.structure]
    ];

    const grid = document.createElement("div");
    grid.className = "evaluation-grid";

    dimensions.forEach(([name, dimension]) => {
      const card = document.createElement("article");
      card.className = "evaluation-card";

      const cardHeading = document.createElement("div");
      cardHeading.className = "evaluation-card-heading";

      const cardName = document.createElement("strong");
      cardName.textContent = name;

      const cardScore = document.createElement("span");
      cardScore.textContent = `${dimension.score}/100`;

      const track = document.createElement("div");
      track.className = "evaluation-track";

      const fill = document.createElement("div");
      fill.className = "evaluation-fill";
      fill.style.width =
        `${Math.max(0, Math.min(100, dimension.score))}%`;

      track.append(fill);

      const feedback = document.createElement("p");
      feedback.textContent = dimension.feedback;

      cardHeading.append(cardName, cardScore);
      card.append(cardHeading, track, feedback);
      grid.append(card);
    });

    const suggestionsHeading = document.createElement("h3");
    suggestionsHeading.textContent = "Improvement suggestions";

    const suggestions = document.createElement("ul");
    suggestions.className = "evaluation-suggestions";

    data.suggestions.forEach((suggestion) => {
      const item = document.createElement("li");
      item.textContent = suggestion;
      suggestions.append(item);
    });

        const improveButton = document.createElement("button");
    improveButton.type = "button";
    improveButton.className = "button evaluation-improve-button";
    improveButton.textContent = "Improve This Prompt";

    improveButton.addEventListener("click", () => {
      if (!lastRequest || lastRequest.action !== "evaluate") {
        toast("Evaluate a prompt first");
        return;
      }

      // Restore the exact prompt that received this evaluation.
      el.input.value = lastRequest.prompt;
      updateCount();
      run("improve");
    });

    el.evalReport.append(
      heading,
      summary,
      grid,
      suggestionsHeading,
      suggestions,
      improveButton
    );
  };

  const saveHistory = (entry) => {
    history.unshift(entry);
    el.history.innerHTML = "";

    history.slice(0, 8).forEach((item) => {
      const button = document.createElement("button");
      button.className = "history-item";

      const title = document.createElement("strong");
      title.textContent = labels[item.action];

      const details = document.createElement("small");
      details.textContent =
        `${item.prompt.slice(0, 120)} · ${item.time}`;

      button.append(title, document.createElement("br"), details);

      button.addEventListener("click", () => {
        el.input.value = item.prompt;
        updateCount();
        toast("Prompt restored");
        el.input.focus();
      });

      el.history.append(button);
    });
  };

  const setLibraryMessage = (message, isError = false) => {
    el.libraryMessage.textContent = message;
    el.libraryMessage.style.color =
      isError ? "var(--danger)" : "var(--muted)";
  };

  const loadLibrary = async () => {
    try {
      const response = await fetch(`${API}/prompts`);

      if (!response.ok) {
        throw new Error("Could not load the prompt library.");
      }

      const prompts = await response.json();
      el.history.replaceChildren();

      if (!prompts.length) {
        const empty = document.createElement("p");
        empty.className = "library-empty";
        empty.textContent =
          "No saved prompts yet. Save your first prompt above.";

        el.history.append(empty);
        return;
      }

      prompts.forEach((prompt) => {
        const card = document.createElement("article");
        card.className = "library-card";

        const details = document.createElement("div");

        const name = document.createElement("strong");
        name.textContent = prompt.name;

        const meta = document.createElement("small");
        meta.textContent =
          `Version ${prompt.latest_version} · Updated ${new Date(prompt.updated_at + "Z").toLocaleString()}`;

        details.append(name, meta);

        const button = document.createElement("button");
        button.className = "button";
        button.type = "button";
        button.textContent = "Load latest version";

        button.addEventListener("click", () => {
          loadPromptVersion(prompt.prompt_id);
        });

        card.append(details, button);
        el.history.append(card);
      });

    } catch (error) {
      el.history.textContent = error.message;

      setLibraryMessage(
        "Start the FastAPI backend to use the saved prompt library.",
        true
      );
    }
  };

  const loadPromptVersion = async (promptId) => {
    try {
      const response =
        await fetch(`${API}/prompts/${promptId}/versions`);

      if (!response.ok) {
        throw new Error("Could not load this prompt.");
      }

      const versions = await response.json();

      if (!versions.length) {
        throw new Error("No versions were found.");
      }

      el.input.value = versions[0].content;
      updateCount();
      el.input.focus();

      toast(`Loaded version ${versions[0].version}`);

      document.querySelector("#console").scrollIntoView({
        behavior: "smooth"
      });

    } catch (error) {
      setLibraryMessage(error.message, true);
    }
  };

  const saveCurrentPrompt = async () => {
    const name = el.promptName.value.trim();
    const content = el.input.value.trim();

    if (!name) {
      setLibraryMessage("Enter a name for this prompt first.", true);
      el.promptName.focus();
      return;
    }

    if (!content) {
      setLibraryMessage(
        "Enter a prompt in the workspace before saving.",
        true
      );
      el.input.focus();
      return;
    }

    el.savePrompt.disabled = true;

    try {
      const response = await fetch(`${API}/prompts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ name, content })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not save this prompt.");
      }

      setLibraryMessage(
        `Saved “${data.name}” as version ${data.version}.`
      );

      await loadLibrary();

    } catch (error) {
      setLibraryMessage(error.message, true);

    } finally {
      el.savePrompt.disabled = false;
    }
  };

  // Existing Generate, Improve, Explain and Optimize operations
  const run = async (action) => {
    if (action === "evaluate") {
      return runEvaluation();
    }

    const prompt = el.input.value.trim();

    if (!prompt) {
      el.input.focus();
      toast("Please enter a prompt first");
      return;
    }

    cancelAnimationFrame(raf);

    result = "";
    lastRequest = { action, prompt };

    el.panel.classList.add("visible");
    el.tag.textContent = labels[action];
    el.status.textContent = "";
    el.text.textContent = "";
    el.metadata.hidden = true;

    showNormalOutput();
    setLoading(true);

    const started = performance.now();

    try {
      const data = await request(action, prompt);
      if (action === "improve") {
  improvedPrompt = data.result;
}

      result = data.result;

      setLoading(false);

      el.status.textContent = "Completed";
      el.model.textContent = data.model || "—";
      el.request.textContent = data.request_id || "—";
      el.action.textContent = action;
      el.time.textContent =
        `${Math.round(performance.now() - started)} ms`;

      el.metadata.hidden = false;

      enableResultTools();

      await type(result);

    } catch (error) {
      setLoading(false);

      el.status.textContent = "Request failed";
      el.text.textContent = error.message;

      el.panel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

      toast(error.message);
    }
  };

  // New Prompt Evaluation operation
  const runEvaluation = async () => {
    const prompt = el.input.value.trim();


    if (!prompt) {
        el.input.focus();
        toast("Please enter a prompt first");
        return;
    }

    

    cancelAnimationFrame(raf);

    result = "";
    lastRequest = { action: "evaluate", prompt };

    el.panel.classList.add("visible");
    el.tag.textContent = labels.evaluate;
    el.status.textContent = "";
    el.text.textContent = "";
    el.evalReport.replaceChildren();
    el.metadata.hidden = true;

    showEvaluationOutput();
    setLoading(true);

    const started = performance.now();

    try {
      const data = await evaluateRequest(prompt);

      result = JSON.stringify(data, null, 2);

      renderEvaluation(data);

      setLoading(false);

      el.status.textContent = "Evaluation completed";
      el.model.textContent = data.model || "—";
      el.request.textContent = data.request_id || "—";
      el.action.textContent = "evaluate";
      el.time.textContent =
        `${Math.round(performance.now() - started)} ms`;

      el.metadata.hidden = false;

      enableResultTools();

      el.panel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

      toast("Prompt evaluation completed");

    } catch (error) {
      setLoading(false);

      el.status.textContent = "Evaluation failed";
      el.evalReport.textContent = error.message;

      el.panel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

      toast(error.message);
    }
  };

  const copy = async (value) => {
    if (!value) {
      return toast("Nothing to copy yet");
    }

    try {
      await navigator.clipboard.writeText(value);
      toast("Copied successfully");
    } catch {
      toast("Unable to copy output");
    }
  };

  const download = (name, content, type) => {
    const link = document.createElement("a");

    link.href = URL.createObjectURL(
      new Blob([content], { type })
    );

    link.download = name;
    link.click();

    URL.revokeObjectURL(link.href);
  };

  // Button event listeners
  actions.forEach((button) => {
    button.addEventListener("click", () => {
      run(button.dataset.action);
    });
  });

  templates.forEach((button) => {
    button.addEventListener("click", () => {
      el.input.value = button.dataset.template;
      updateCount();
      el.input.focus();

      document.querySelector("#console").scrollIntoView({
        behavior: "smooth"
      });
    });
  });

  el.input.addEventListener("input", updateCount);

  el.input.addEventListener("keydown", (event) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "Enter"
    ) {
      event.preventDefault();
      run("generate");
    }
  });

  el.copy.addEventListener("click", () => {
    copy(
      !el.evalReport.hidden
        ? el.evalReport.innerText
        : el.text.innerText
    );
  });

  el.copyMd.addEventListener("click", () => copy(result));

  el.retry.addEventListener("click", () => {
    if (lastRequest) {
      run(lastRequest.action);
    }
  });

  el.clear.addEventListener("click", () => {
    cancelAnimationFrame(raf);

    result = "";
    lastRequest = null;

    el.panel.classList.remove("visible");
    el.text.textContent = "";
    el.evalReport.replaceChildren();

    showNormalOutput();
  });

  el.txt.addEventListener("click", () => {
    download(
      "promptlab-response.txt",
      !el.evalReport.hidden
        ? el.evalReport.innerText
        : el.text.innerText,
      "text/plain"
    );
  });

  el.md.addEventListener("click", () => {
    download(
      "promptlab-response.md",
      result,
      "text/markdown"
    );
  });

  el.pdf.addEventListener("click", () => window.print());

  el.menu.addEventListener("click", () => {
    const open = el.links.classList.toggle("open");
    el.menu.setAttribute("aria-expanded", String(open));
  });

  el.savePrompt.addEventListener("click", saveCurrentPrompt);

  // Initialize application
  updateCount();
  loadLibrary();

})();
