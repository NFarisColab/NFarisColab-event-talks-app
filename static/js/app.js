/**
 * BigQuery Release Notes — Client-side logic
 * Fetches release notes, renders cards, and handles tweet sharing.
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

        card.innerHTML = `
            <span class="note-date">${escapeHtml(note.published)}</span>
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
                <a href="${escapeHtml(note.link)}" class="btn-read-more" target="_blank" rel="noopener noreferrer">
                    Read more →
                </a>
            </div>
        `;

        notesGrid.appendChild(card);
    });

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

// ---- Init ----
fetchReleaseNotes();
