const STORE_KEY = "gateway-content-hub-v42";
const BUILD_VERSION = "Build v4.2";

const DEFAULT_CALENDAR_EVENTS = [
  {
    id: uid(),
    title: "Campaign Kickoff",
    date: isoDate(new Date()),
    time: "09:00",
    notes: "Weekly campaign sync",
    color: "#5b6e36",
    linkedTaskId: ""
  },
  {
    id: uid(),
    title: "Creative Review",
    date: isoDate(new Date()),
    time: "14:00",
    notes: "Review social assets",
    color: "#918030",
    linkedTaskId: ""
  }
];

const state = {
  currentTab: "submissions",
  calendarMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  submissions: [],
  calendarEvents: [...DEFAULT_CALENDAR_EVENTS]
};

const el = {
  todayDate: document.getElementById("todayDate"),
  buildVersion: document.getElementById("buildVersion"),
  tabs: [...document.querySelectorAll(".tab")],
  panels: [...document.querySelectorAll(".panel")],
  submissionForm: document.getElementById("submissionForm"),
  submissionList: document.getElementById("submissionList"),
  reviewsList: document.getElementById("reviewsList"),
  statusFilter: document.getElementById("statusFilter"),
  decisionFilter: document.getElementById("decisionFilter"),
  dueSoonList: document.getElementById("dueSoonList"),
  submissionCardTemplate: document.getElementById("submissionCardTemplate"),
  calendarLabel: document.getElementById("calendarLabel"),
  calendarGrid: document.getElementById("calendarGrid"),
  prevMonth: document.getElementById("prevMonth"),
  nextMonth: document.getElementById("nextMonth"),
  newEventBtn: document.getElementById("newEventBtn"),
  eventModalTemplate: document.getElementById("eventModalTemplate")
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeUrl(value) {
  const str = String(value || "").trim();
  if (!str) return "";
  if (str.startsWith("http://") || str.startsWith("https://")) return str;
  return "";
}

function hexToRgba(hex, alpha) {
  const clean = String(hex || "").replace("#", "");
  if (clean.length !== 6) return `rgba(91, 110, 54, ${alpha})`;
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createDefaultDesignWork() {
  return {
    assetTitle: "",
    owner: "",
    dueDate: "",
    previewLink: "",
    attachmentName: "",
    attachmentDataUrl: "",
    reviewStatus: "Pending Review"
  };
}

function isoDate(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function isWithinNextDays(dateStr, days) {
  if (!dateStr) return false;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return false;
  const diffMs = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}

function openTaskById(id) {
  if (!id) return;
  setTab("submissions");
  renderSubmissions();
  requestAnimationFrame(() => {
    const card = document.querySelector(`.submission-card[data-id="${CSS.escape(id)}"]`);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function load() {
  const saved = localStorage.getItem(STORE_KEY);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    state.submissions = (parsed.submissions || []).map((submission) => ({
      ...submission,
      title: submission.title || "Untitled Task",
      channel: submission.channel || "",
      requiredBy: submission.requiredBy || "",
      priority: submission.priority || "Medium",
      brief: submission.brief || "",
      status: submission.status || "Queued",
      assignee: submission.assignee || "",
      role: submission.role || "",
      referenceLink: submission.referenceLink || "",
      details: submission.details || null,
      thread: submission.thread || [],
      designFeedback: submission.designFeedback || [],
      designWork: { ...createDefaultDesignWork(), ...(submission.designWork || {}) },
      contentDecision: submission.contentDecision || "None Chosen",
      archived: Boolean(submission.archived),
      detailsCollapsed: submission.detailsCollapsed ?? Boolean(submission.details),
      threadCollapsed: submission.threadCollapsed ?? false
    }));

    state.calendarEvents = parsed.calendarEvents?.length
      ? parsed.calendarEvents.map((event) => ({
          ...event,
          color: event.color || "#5b6e36",
          linkedTaskId: event.linkedTaskId || ""
        }))
      : [...DEFAULT_CALENDAR_EVENTS];
  } catch {
    localStorage.removeItem(STORE_KEY);
  }
}

function save() {
  localStorage.setItem(
    STORE_KEY,
    JSON.stringify({
      submissions: state.submissions,
      calendarEvents: state.calendarEvents
    })
  );
}

function setTab(tabId) {
  state.currentTab = tabId;
  el.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === tabId));
  el.panels.forEach((panel) => panel.classList.toggle("is-active", panel.id === tabId));
}

async function addSubmission(formData) {
  state.submissions.unshift({
    id: uid(),
    title: String(formData.get("title") || "").trim() || "Untitled Task",
    channel: String(formData.get("channel") || "").trim(),
    requiredBy: String(formData.get("requiredBy") || "").trim(),
    priority: String(formData.get("priority") || "").trim() || "Medium",
    brief: String(formData.get("brief") || "").trim(),
    assignee: String(formData.get("assignee") || "").trim(),
    role: String(formData.get("role") || "").trim(),
    referenceLink: String(formData.get("referenceLink") || "").trim(),
    contentDecision: "None Chosen",
    status: "Queued",
    archived: false,
    details: null,
    detailsCollapsed: false,
    designFeedback: [],
    designWork: createDefaultDesignWork(),
    thread: [],
    createdAt: new Date().toISOString()
  });

  save();
  renderSubmissions();
  renderDueSoon();
  renderReviews();
}

function renderSubmissions() {
  if (!el.submissionList) return;
  const status = el.statusFilter?.value || "all";
  const decision = el.decisionFilter?.value || "all";

  const rows = state.submissions.filter((submission) => {
    const matchesStatus =
      status === "Archived"
        ? submission.archived
        : (status === "all" || submission.status === status) && !submission.archived;
    const matchesDecision = decision === "all" || (submission.contentDecision || "None Chosen") === decision;
    return matchesStatus && matchesDecision;
  });

  if (!rows.length) {
    el.submissionList.innerHTML = '<div class="empty">No queue items found.</div>';
    return;
  }

  el.submissionList.innerHTML = "";

  rows.forEach((submission) => {
    const node = el.submissionCardTemplate.content.cloneNode(true);
    const card = node.querySelector(".submission-card");

    node.querySelector(".submission-title").textContent = submission.title;

    const metaParts = [
      submission.channel || "No channel",
      submission.requiredBy ? `Required ${formatDate(submission.requiredBy)}` : "No due date",
      `${submission.priority || "Medium"} priority`
    ];
    if (submission.assignee) metaParts.push(`Owner ${submission.assignee}`);
    node.querySelector(".submission-meta").textContent = metaParts.join(" • ");
    node.querySelector(".designer-note-text").textContent = submission.brief || "No designer note added.";

    const attachmentsView = node.querySelector(".task-attachments-view");
    const chips = [];
    const safeReferenceLink = sanitizeUrl(submission.referenceLink || "");
    if (safeReferenceLink) {
      chips.push(
        `<a class="attachment-chip" href="${escapeHtml(safeReferenceLink)}" target="_blank" rel="noopener">Reference Link</a>`
      );
    }
    attachmentsView.innerHTML = chips.join("");

    const badge = node.querySelector(".submission-badge");
    const badgeText = submission.archived ? "Archived" : submission.status;
    badge.textContent = badgeText;
    badge.className = `badge submission-badge ${badgeText.replace(/\s/g, "")}`;

    const archiveBtn = node.querySelector(".archive-btn");
    archiveBtn.dataset.id = submission.id;
    archiveBtn.textContent = submission.archived ? "Unarchive" : "Archive";

    const deleteBtn = node.querySelector(".delete-btn");
    deleteBtn.dataset.id = submission.id;

    const detailsForm = node.querySelector(".details-form");
    const editDetailsBtn = node.querySelector(".edit-details-btn");
    const hasDetails = Boolean(submission.details);
    detailsForm.dataset.id = submission.id;
    if (editDetailsBtn) editDetailsBtn.dataset.id = submission.id;
    detailsForm.hidden = Boolean(submission.detailsCollapsed && hasDetails);
    if (editDetailsBtn) editDetailsBtn.hidden = !(submission.detailsCollapsed && hasDetails);

    if (submission.details) {
      detailsForm.elements.copy.value = submission.details.copy;
      detailsForm.elements.pricing.value = submission.details.pricing;
      detailsForm.elements.notes.value = submission.details.notes;
    }

    const detailsView = node.querySelector(".details-view");
    const saveIndicator = node.querySelector(".save-indicator");
    if (saveIndicator) {
      saveIndicator.textContent = submission.details?.updatedAt
        ? `Saved ${formatDateTime(submission.details.updatedAt)}`
        : "Not saved yet";
    }
    detailsView.innerHTML = submission.details
      ? `<div class="details-grid">
          <p class="span-2 gateway-note-label">FROM GATEWAY</p>
          <p><strong>Copy / Messaging:</strong> ${escapeHtml(submission.details.copy || "-")}</p>
          <p><strong>Pricing / Promotion:</strong> ${escapeHtml(submission.details.pricing || "-")}</p>
          <p class="span-2"><strong>Additional Notes:</strong> ${escapeHtml(submission.details.notes || "-")}</p>
          <p class="span-2 meta">Updated ${formatDateTime(submission.details.updatedAt)}</p>
        </div>`
      : "";

    const threadItems = submission.thread || [];
    const threadList = node.querySelector(".thread-list");
    threadList.innerHTML = threadItems.length
      ? threadItems
          .map(
            (item) =>
              `<div class="feedback-item"><strong>${escapeHtml(item.author)}</strong><p>${escapeHtml(
                item.message
              )}</p><span class="meta">${formatDate(item.createdAt)}</span></div>`
          )
          .join("")
      : '<div class="empty">No replies yet.</div>';

    const threadForm = node.querySelector(".thread-form");
    threadForm.dataset.id = submission.id;

    card.dataset.id = submission.id;
    el.submissionList.appendChild(node);
  });
}

function renderReviews() {
  if (!el.reviewsList) return;

  if (!state.submissions.length) {
    el.reviewsList.innerHTML = '<div class="empty">No content tasks yet.</div>';
    return;
  }

  el.reviewsList.innerHTML = state.submissions
    .map((submission) => {
      const work = submission.designWork || createDefaultDesignWork();
      const previewLink = sanitizeUrl(work.previewLink || "");
      const attachmentHtml = work.attachmentDataUrl
        ? `<div class="design-attachment"><strong>Attachment:</strong><img class="preview-image" src="${work.attachmentDataUrl}" alt="Design attachment preview" /></div>`
        : "<p><strong>Attachment:</strong> None</p>";
      const reviewStatus = work.reviewStatus || "Pending Review";

      const feedbackRows = (submission.designFeedback || [])
        .map(
          (item) =>
            `<div class="feedback-item"><strong>${escapeHtml(item.author)} · ${escapeHtml(item.decision)}</strong><p>${escapeHtml(
              item.comment
            )}</p><span class="meta">${formatDate(item.createdAt)}</span></div>`
        )
        .join("");

      return `<article class="item">
        <div class="item-top">
          <strong>${escapeHtml(submission.title || "Untitled Task")}</strong>
          <span class="badge ${reviewStatus.replace(/\s/g, "")}">${escapeHtml(reviewStatus)}</span>
        </div>
        <span class="meta">${escapeHtml(submission.channel || "No channel")} • Required ${
        submission.requiredBy ? formatDate(submission.requiredBy) : "-"
      }</span>

        <div class="details-block">
          <h4>Design Work</h4>
          <form class="design-work-form" data-id="${submission.id}">
            <div class="form-grid compact-grid">
              <label>
                Asset Title
                <input name="assetTitle" value="${escapeHtml(work.assetTitle || "")}" placeholder="Homepage Hero Banner V3" />
              </label>
              <label>
                Owner
                <input name="owner" value="${escapeHtml(work.owner || "")}" placeholder="Alex" />
              </label>
              <label>
                Due Date
                <input name="dueDate" type="date" value="${escapeHtml(work.dueDate || "")}" />
              </label>
              <label>
                Preview Link
                <input name="previewLink" value="${escapeHtml(work.previewLink || "")}" placeholder="https://www.figma.com/..." />
              </label>
              <label class="span-2">
                Attachment (Image)
                <input name="attachment" type="file" accept="image/*" />
              </label>
              <div class="span-2 actions">
                <button class="btn" type="submit">Save Design Work</button>
              </div>
            </div>
          </form>

          <div class="details-grid design-work-view">
            <p><strong>Asset Title:</strong> ${escapeHtml(work.assetTitle || "-")}</p>
            <p><strong>Owner:</strong> ${escapeHtml(work.owner || "-")}</p>
            <p><strong>Due Date:</strong> ${work.dueDate ? formatDate(work.dueDate) : "-"}</p>
            <p><strong>Preview Link:</strong> ${
              previewLink ? `<a href="${escapeHtml(previewLink)}" target="_blank" rel="noopener">Open Preview</a>` : "-"
            }</p>
            <p class="span-2"><strong>Attachment Name:</strong> ${escapeHtml(work.attachmentName || "None")}</p>
            <div class="span-2">${attachmentHtml}</div>
          </div>
        </div>

        <div class="details-block">
          <h4>Feedback &amp; Approvals</h4>
          <div class="design-feedback-list">${feedbackRows || '<div class="empty">No design feedback yet.</div>'}</div>
          <form class="design-feedback-form" data-id="${submission.id}">
            <input name="author" placeholder="Your name (optional)" />
            <textarea name="comment" rows="2" placeholder="Add design feedback or approval notes"></textarea>
            <label>
              Approval State
              <select name="decision" class="review-decision-select" data-id="${submission.id}">
                <option ${submission.contentDecision === "None Chosen" ? "selected" : ""}>None Chosen</option>
                <option ${submission.contentDecision === "Approved" ? "selected" : ""}>Approved</option>
                <option ${submission.contentDecision === "Needs Correction" ? "selected" : ""}>Needs Correction</option>
              </select>
            </label>
            <div class="actions">
              <button type="submit" class="btn">Submit</button>
            </div>
          </form>
        </div>
      </article>`;
    })
    .join("");
}

function addSubmissionDesignFeedback(id, payload) {
  const submission = state.submissions.find((entry) => entry.id === id);
  if (!submission) return;
  if (!submission.designFeedback) submission.designFeedback = [];

  const decision = String(payload.decision || "").trim();
  const author = String(payload.author || "").trim() || "Collaborator";
  const comment = String(payload.comment || "").trim();
  if (!decision && !comment) return;

  submission.designFeedback.unshift({
    id: uid(),
    author,
    decision,
    comment,
    createdAt: new Date().toISOString()
  });

  if (!submission.designWork) submission.designWork = createDefaultDesignWork();
  if (decision === "Approve" || decision === "Approved") submission.designWork.reviewStatus = "Approved";
  if (decision === "Needs Correction") submission.designWork.reviewStatus = "Needs Correction";
  if (decision === "None Chosen") submission.designWork.reviewStatus = "Pending Review";

  save();
  renderSubmissions();
  renderDueSoon();
  renderReviews();
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read attachment"));
    reader.readAsDataURL(file);
  });
}

async function addOrUpdateSubmissionDesignWork(id, form) {
  const submission = state.submissions.find((entry) => entry.id === id);
  if (!submission) return;

  const formData = new FormData(form);
  const existing = submission.designWork || createDefaultDesignWork();
  const designWork = {
    ...existing,
    assetTitle: String(formData.get("assetTitle") || "").trim(),
    owner: String(formData.get("owner") || "").trim(),
    dueDate: String(formData.get("dueDate") || "").trim(),
    previewLink: String(formData.get("previewLink") || "").trim()
  };

  const attachment = formData.get("attachment");
  if (attachment instanceof File && attachment.size > 0 && attachment.type.startsWith("image/")) {
    designWork.attachmentName = attachment.name;
    designWork.attachmentDataUrl = await readImageFile(attachment);
  }

  submission.designWork = designWork;

  save();
  renderSubmissions();
  renderDueSoon();
  renderReviews();
}

function addOrUpdateSubmissionDetails(id, formData) {
  const submission = state.submissions.find((entry) => entry.id === id);
  if (!submission) return;

  submission.details = {
    copy: String(formData.get("copy") || "").trim(),
    pricing: String(formData.get("pricing") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
    updatedAt: new Date().toISOString()
  };
  submission.status = "In Progress";
  submission.detailsCollapsed = true;
  save();
}

function deriveStatusFromDecision(submission, decision) {
  if (decision === "Approved") return "Ready";
  if (decision === "Needs Correction") return "In Progress";
  return submission.details ? "In Progress" : "Queued";
}

function addSubmissionReply(id, message) {
  const submission = state.submissions.find((entry) => entry.id === id);
  if (!submission) return;

  const text = String(message || "").trim();
  if (!text) return;

  submission.thread.unshift({
    id: uid(),
    author: "Collaborator",
    message: text,
    createdAt: new Date().toISOString()
  });

  save();
  renderSubmissions();
}

function updateSubmissionDecision(id, decision) {
  const submission = state.submissions.find((entry) => entry.id === id);
  if (!submission) return;

  submission.contentDecision = decision;
  submission.status = deriveStatusFromDecision(submission, decision);
  if (!submission.designWork) submission.designWork = createDefaultDesignWork();

  if (decision === "Approved") submission.designWork.reviewStatus = "Approved";
  if (decision === "Needs Correction") submission.designWork.reviewStatus = "Needs Correction";
  if (decision === "None Chosen") submission.designWork.reviewStatus = "Pending Review";

  save();
  renderSubmissions();
  renderDueSoon();
  renderReviews();
}

function toggleArchiveSubmission(id) {
  const submission = state.submissions.find((entry) => entry.id === id);
  if (!submission) return;
  submission.archived = !submission.archived;
  save();
  renderSubmissions();
  renderDueSoon();
  renderReviews();
}

function deleteSubmission(id) {
  state.submissions = state.submissions.filter((entry) => entry.id !== id);
  state.calendarEvents = state.calendarEvents.filter((entry) => entry.linkedTaskId !== id);
  save();
  renderSubmissions();
  renderDueSoon();
  renderCalendar();
  renderReviews();
}

function renderDueSoon() {
  if (!el.dueSoonList) return;

  const due = state.submissions
    .filter((entry) => !entry.archived)
    .filter((entry) => isWithinNextDays(entry.requiredBy, 7))
    .sort((a, b) => String(a.requiredBy || "").localeCompare(String(b.requiredBy || "")));

  if (!due.length) {
    el.dueSoonList.innerHTML = '<div class="empty">No tasks due in the next 7 days.</div>';
    return;
  }

  el.dueSoonList.innerHTML = due
    .map((entry) => {
      const badge = entry.status || "Queued";
      return `<div class="due-item">
        <div class="due-top">
          <a href="#" data-open-task="${escapeHtml(entry.id)}">${escapeHtml(entry.title || "Untitled")}</a>
          <span class="badge ${badge.replace(/\s/g, "")}">${escapeHtml(badge)}</span>
        </div>
        <div class="meta">Due ${entry.requiredBy ? formatDate(entry.requiredBy) : "-"} • ${escapeHtml(entry.channel || "No channel")}</div>
      </div>`;
    })
    .join("");
}

function renderCalendar() {
  if (!el.calendarGrid || !el.calendarLabel) return;

  const month = state.calendarMonth;
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  el.calendarLabel.textContent = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric"
  }).format(month);

  const first = new Date(year, monthIndex, 1);
  const startShift = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const cells = weekdays.map((day) => `<div class="weekday">${day}</div>`);

  const eventsMap = new Map();
  state.calendarEvents.forEach((event) => {
    const dateObj = new Date(`${event.date}T00:00:00`);
    if (dateObj.getFullYear() !== year || dateObj.getMonth() !== monthIndex) return;
    const day = dateObj.getDate();
    if (!eventsMap.has(day)) eventsMap.set(day, []);
    eventsMap.get(day).push(event);
  });

  for (let i = 0; i < startShift; i += 1) cells.push('<div class="day muted-day"></div>');

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = isoDate(new Date(year, monthIndex, day));
    const events = (eventsMap.get(day) || []).sort((a, b) => a.time.localeCompare(b.time));
    const eventsHtml = events
      .map((event) => {
        const color = event.color || "#5b6e36";
        const bg = hexToRgba(color, 0.18);
        const linkedMark = event.linkedTaskId ? " · Task" : "";
        return `<button class="event" data-event-id="${event.id}" style="border-left-color:${escapeHtml(
          color
        )};background:${escapeHtml(bg)}"><span>${escapeHtml(event.time)}${linkedMark}</span><strong>${escapeHtml(
          event.title
        )}</strong></button>`;
      })
      .join("");

    cells.push(`<div class="day" data-day="${date}"><div class="day-num">${day}</div>${eventsHtml}</div>`);
  }

  el.calendarGrid.innerHTML = cells.join("");
}

function openEventModal(eventId, datePrefill, prefill = null) {
  if (!el.eventModalTemplate) return;

  const existing = state.calendarEvents.find((entry) => entry.id === eventId) || null;
  const fragment = el.eventModalTemplate.content.cloneNode(true);
  const backdrop = fragment.querySelector(".modal-backdrop");
  const title = fragment.querySelector("#eventModalTitle");
  const form = fragment.querySelector("#eventForm");
  const deleteBtn = fragment.querySelector("#deleteEventBtn");

  title.textContent = existing ? "Edit Calendar Event" : "New Calendar Event";
  deleteBtn.hidden = !existing;

  form.elements.title.value = existing?.title || prefill?.title || "";
  form.elements.date.value = existing?.date || prefill?.date || datePrefill || isoDate(new Date());
  form.elements.time.value = existing?.time || prefill?.time || "09:00";
  form.elements.notes.value = existing?.notes || prefill?.notes || "";
  form.elements.color.value = existing?.color || prefill?.color || "#5b6e36";

  const linkedSelect = form.querySelector("#linkedTaskSelect");
  const openTaskBtn = fragment.querySelector("#openLinkedTaskBtn");

  if (linkedSelect) {
    const options = [`<option value="">No linked task</option>`].concat(
      state.submissions
        .filter((entry) => !entry.archived)
        .map((entry) => `<option value="${escapeHtml(entry.id)}">${escapeHtml(entry.title || "Untitled")}</option>`)
    );
    linkedSelect.innerHTML = options.join("");
    linkedSelect.value = existing?.linkedTaskId || prefill?.linkedTaskId || "";
  }

  const syncOpenBtn = () => {
    const current = linkedSelect?.value || "";
    if (!openTaskBtn) return;
    openTaskBtn.hidden = !current;
  };

  syncOpenBtn();
  linkedSelect?.addEventListener("change", syncOpenBtn);

  openTaskBtn?.addEventListener("click", () => {
    const id = linkedSelect?.value || "";
    if (!id) return;
    backdrop.remove();
    openTaskById(id);
  });

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop || event.target.hasAttribute("data-modal-close")) backdrop.remove();
  });

  deleteBtn.addEventListener("click", () => {
    if (!existing) return;
    state.calendarEvents = state.calendarEvents.filter((entry) => entry.id !== existing.id);
    save();
    renderCalendar();
    renderDueSoon();
    backdrop.remove();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    const payload = {
      id: existing?.id || uid(),
      title: String(formData.get("title") || "").trim() || "Untitled Event",
      date: String(formData.get("date") || "").trim() || isoDate(new Date()),
      time: String(formData.get("time") || "").trim() || "09:00",
      notes: String(formData.get("notes") || "").trim(),
      color: String(formData.get("color") || "").trim() || "#5b6e36",
      linkedTaskId: String(formData.get("linkedTaskId") || "").trim()
    };

    if (existing) {
      const index = state.calendarEvents.findIndex((entry) => entry.id === existing.id);
      if (index >= 0) state.calendarEvents[index] = payload;
    } else {
      state.calendarEvents.push(payload);
    }

    save();
    renderCalendar();
    renderDueSoon();
    backdrop.remove();
  });

  document.body.appendChild(backdrop);
}

function onSubmissionsInteraction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const eventButton = target.closest(".event");
  if (eventButton instanceof HTMLButtonElement) {
    openEventModal(eventButton.dataset.eventId);
    return;
  }

  const dayCell = target.closest(".day");
  if (dayCell) {
    const day = dayCell.dataset.day;
    if (day) openEventModal(null, day);
  }
}

async function onSubmissionFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(el.submissionForm);
  await addSubmission(formData);
  if (el.statusFilter) el.statusFilter.value = "all";
  if (el.decisionFilter) el.decisionFilter.value = "all";
  renderSubmissions();
  el.submissionForm.reset();
}

async function onSubmissionListSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;

  if (form.matches(".details-form")) {
    event.preventDefault();
    addOrUpdateSubmissionDetails(form.dataset.id, new FormData(form));
    form.reset();
    renderSubmissions();
    renderDueSoon();
    return;
  }

  if (form.matches(".thread-form")) {
    event.preventDefault();
    const formData = new FormData(form);
    addSubmissionReply(form.dataset.id, formData.get("message"));
    form.reset();
  }
}

async function onReviewsSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;

  if (form.matches(".design-feedback-form")) {
    event.preventDefault();
    const formData = new FormData(form);
    const decision = String(formData.get("decision") || "None Chosen");
    const author = String(formData.get("author") || "").trim() || "Collaborator";
    const comment = String(formData.get("comment") || "").trim();

    updateSubmissionDecision(form.dataset.id, decision);
    addSubmissionDesignFeedback(form.dataset.id, {
      author,
      decision,
      comment: comment || `Approval state set to ${decision}.`
    });
    form.reset();
    return;
  }

  if (form.matches(".design-work-form")) {
    event.preventDefault();
    await addOrUpdateSubmissionDesignWork(form.dataset.id, form);
  }
}

function onReviewsChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  if (!target.matches(".review-decision-select")) return;
  return;
}

function onSubmissionListClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const archiveBtn = target.closest("[data-action='archive']");
  if (archiveBtn instanceof HTMLButtonElement) {
    toggleArchiveSubmission(archiveBtn.dataset.id);
    return;
  }

  const deleteBtn = target.closest("[data-action='delete']");
  if (deleteBtn instanceof HTMLButtonElement) {
    const confirmed = window.confirm("Are you sure you want to delete this Task?");
    if (!confirmed) return;
    deleteSubmission(deleteBtn.dataset.id);
    return;
  }

  const editDetailsBtn = target.closest("[data-action='edit-details']");
  if (editDetailsBtn instanceof HTMLButtonElement) {
    const submission = state.submissions.find((entry) => entry.id === editDetailsBtn.dataset.id);
    if (!submission) return;
    submission.detailsCollapsed = false;
    save();
    renderSubmissions();
    return;
  }

  const continueBtn = target.closest("[data-action='continue-reviews']");
  if (continueBtn instanceof HTMLButtonElement) {
    setTab("reviews");
    renderReviews();
  }
}

function wireEvents() {
  el.tabs.forEach((tab) => tab.addEventListener("click", () => setTab(tab.dataset.tab)));

  el.submissionForm?.addEventListener("submit", onSubmissionFormSubmit);
  el.submissionList?.addEventListener("submit", onSubmissionListSubmit);
  el.submissionList?.addEventListener("click", onSubmissionListClick);

  if (el.reviewsList) {
    el.reviewsList.addEventListener("submit", onReviewsSubmit);
    el.reviewsList.addEventListener("change", onReviewsChange);
  }

  el.statusFilter?.addEventListener("change", renderSubmissions);
  el.decisionFilter?.addEventListener("change", renderSubmissions);
  el.prevMonth?.addEventListener("click", () => {
    state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() - 1, 1);
    renderCalendar();
  });

  el.nextMonth?.addEventListener("click", () => {
    state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  el.newEventBtn?.addEventListener("click", () => openEventModal());
  el.calendarGrid?.addEventListener("click", onSubmissionsInteraction);

  if (el.dueSoonList) {
    el.dueSoonList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const link = target.closest("[data-open-task]");
      if (link instanceof HTMLAnchorElement) {
        event.preventDefault();
        openTaskById(link.dataset.openTask);
      }
    });
  }
}

function init() {
  if (el.buildVersion) el.buildVersion.textContent = BUILD_VERSION;
  if (el.todayDate) {
    el.todayDate.textContent = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date());
  }

  load();
  wireEvents();
  renderSubmissions();
  renderCalendar();
  renderDueSoon();
  renderReviews();
}

init();
