/**
 * BigQuery Release Notes — Client-side logic
 * Fetches release notes, renders cards, handles tweet sharing,
 * copy-to-clipboard, CSV export, and theme toggling.
 */

// ---- DOM References ----
const notesGrid = document.getElementById("notesGrid");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const noteCount = document.getElementById("noteCount");
const btnRefresh = document.getElementById("btnRefresh");
const refreshIcon = document.getElementById("refreshIcon");
const refreshText = document.getElementById("refreshText");

const tweetModal = document.getElementById("tweetModal");
const tweetText = document.getElementById("tweetText");
const charCount = document.getElementById("charCount");

let currentTweetLink = "";

// ---- Fetch & Render ----

async function fetchReleaseNotes() {
    setLoading(true);

    try {
        const response = await fetch("/api/releases");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (!data.success) {
            showError(data.error || "Failed to fetch release notes.");
            return;
        }

        renderNotes(data.notes);
        noteCount.textContent = `${data.count} updates`;
    } catch (err) {
        showError(err.message);
    } finally {
        setLoading(false);
    }
}

function renderNotes(notes) {
    errorState.classList.add("hidden");
    notesGrid.classList.remove("hidden");
    notesGrid.innerHTML = "";

    if (notes.length === 0) {
        notesGrid.innerHTML = `
            <div class="loading-state" style="grid-column:1/-1">
                <p>No release notes found.</p>
            </div>`;
        return;
    }

    notes.forEach((note, i) => {
        const card = document.createElement("div");
        card.className = "note-card";
        card.style.animationDelay = `${Math.min(i * 0.06, 0.8)}s`;

        // Generate badges HTML if categories are present
        const badgesHtml = (note.categories || []).map(cat => 
            `<span class="cat-badge cat-${cat.toLowerCase()}">${escapeHtml(cat)}</span>`
        ).join("");

        card.innerHTML = `
            <div class="note-meta">
                <span class="note-date">${escapeHtml(note.published)}</span>
                <div class="note-categories">${badgesHtml}</div>
            </div>
            <h2 class="note-title">
                <a href="${escapeHtml(note.link)}" target="_blank" rel="noopener noreferrer">
                    ${escapeHtml(note.title)}
                </a>
            </h2>
            <div class="note-content">${note.content_html}</div>
            <div class="note-actions">
                <button class="btn-tweet" onclick="openTweetModal(${i})" aria-label="Share on X">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Post on X
                </button>
                <button class="btn-copy" onclick="copyToClipboard(${i}, this)" aria-label="Copy to clipboard">
                    <svg class="copy-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    <span class="copy-label">Copy</span>
                </button>
                <button class="btn-expand-card" onclick="toggleCardExpand(${i}, this)" aria-label="Read more in-place">
                    Read more
                </button>
            </div>
        `;

        notesGrid.appendChild(card);
    });

    // Check for overflowed elements and hide expand button if not overflowed
    requestAnimationFrame(updateExpandButtonsVisibility);

    // Store notes globally for tweet modal access
    window.__bqNotes = notes;
}

// ---- Loading / Error states ----

function setLoading(isLoading) {
    if (isLoading) {
        loadingState.classList.remove("hidden");
        notesGrid.classList.add("hidden");
        errorState.classList.add("hidden");
        btnRefresh.classList.add("loading");
        btnRefresh.disabled = true;
        refreshText.textContent = "Loading…";
    } else {
        loadingState.classList.add("hidden");
        btnRefresh.classList.remove("loading");
        btnRefresh.disabled = false;
        refreshText.textContent = "Refresh";
    }
}

function showError(msg) {
    loadingState.classList.add("hidden");
    notesGrid.classList.add("hidden");
    errorState.classList.remove("hidden");
    errorMessage.textContent = msg;
    noteCount.textContent = "";
}

// ---- Tweet Modal ----

function openTweetModal(index) {
    const note = window.__bqNotes[index];
    if (!note) return;

    currentTweetLink = note.link;

    // Compose a default tweet
    const title = note.title;
    const hashtags = "#BigQuery #GoogleCloud";
    const draft = `${title}\n\n${hashtags}\n${note.link}`;

    tweetText.value = draft.substring(0, 280);
    updateCharCount();

    tweetModal.classList.remove("hidden");
    tweetText.focus();
}

function closeModal() {
    tweetModal.classList.add("hidden");
}

function postTweet() {
    const text = tweetText.value.trim();
    if (!text) return;

    // Open X/Twitter Web Intent
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer,width=550,height=420");
    closeModal();
}

function updateCharCount() {
    const len = tweetText.value.length;
    charCount.textContent = len;

    const wrapper = charCount.parentElement;
    wrapper.classList.remove("near-limit", "at-limit");
    if (len >= 280) {
        wrapper.classList.add("at-limit");
    } else if (len >= 240) {
        wrapper.classList.add("near-limit");
    }
}

// Listen for textarea changes
tweetText.addEventListener("input", updateCharCount);

// Close modal on overlay click
tweetModal.addEventListener("click", (e) => {
    if (e.target === tweetModal) closeModal();
});

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !tweetModal.classList.contains("hidden")) {
        closeModal();
    }
});

// ---- Utility ----

function escapeHtml(str) {
    const el = document.createElement("span");
    el.textContent = str || "";
    return el.innerHTML;
}

// ---- Copy to Clipboard ----

async function copyToClipboard(index, btn) {
    const note = window.__bqNotes[index];
    if (!note) return;

    const text = `${note.title}\n${note.published}\n${note.plain_text}\n${note.link}`;

    try {
        await navigator.clipboard.writeText(text);
        btn.classList.add("copied");
        btn.querySelector(".copy-label").textContent = "Copied!";
        showToast("✓ Copied to clipboard");

        setTimeout(() => {
            btn.classList.remove("copied");
            btn.querySelector(".copy-label").textContent = "Copy";
        }, 2000);
    } catch (err) {
        showToast("✕ Failed to copy");
    }
}

// ---- Export to CSV ----

function exportToCSV() {
    const notes = window.__bqNotes;
    if (!notes || notes.length === 0) {
        showToast("No data to export");
        return;
    }

    const headers = ["Title", "Published", "Summary", "Link"];
    const csvRows = [headers.join(",")];

    notes.forEach((note) => {
        const row = [
            csvEscape(note.title),
            csvEscape(note.published),
            csvEscape(note.plain_text),
            csvEscape(note.link),
        ];
        csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `bigquery-release-notes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`✓ Exported ${notes.length} notes to CSV`);
}

function csvEscape(str) {
    if (!str) return '""';
    return '"' + str.replace(/"/g, '""') + '"';
}

// ---- Theme Toggle ----

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    html.setAttribute("data-theme", next);
    localStorage.setItem("bq-theme", next);
}

function loadSavedTheme() {
    const saved = localStorage.getItem("bq-theme");
    if (saved) {
        document.documentElement.setAttribute("data-theme", saved);
    }
}

// ---- Toast Notification ----

function showToast(message) {
    // Remove existing toast
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

// ---- Card In-Place Expansion & Overflow Check ----

function toggleCardExpand(index, btn) {
    const card = btn.closest(".note-card");
    if (!card) return;

    const isExpanded = card.classList.toggle("expanded");

    if (isExpanded) {
        btn.textContent = "Read less";
        btn.setAttribute("aria-label", "Collapse card content");
    } else {
        btn.textContent = "Read more";
        btn.setAttribute("aria-label", "Read more in-place");
        card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function updateExpandButtonsVisibility() {
    document.querySelectorAll(".note-card").forEach((card) => {
        const content = card.querySelector(".note-content");
        const btnExpand = card.querySelector(".btn-expand-card");
        if (content && btnExpand && !card.classList.contains("expanded")) {
            if (content.scrollHeight <= content.clientHeight) {
                btnExpand.classList.add("hidden");
            } else {
                btnExpand.classList.remove("hidden");
            }
        }
    });
}

// Check visibility on window resize
window.addEventListener("resize", updateExpandButtonsVisibility);

// ---- Init ----
loadSavedTheme();
fetchReleaseNotes();
