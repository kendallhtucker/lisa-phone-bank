document.addEventListener("DOMContentLoaded", function () {
  var BLOB_URL = "https://jsonblob.com/api/jsonBlob/019e73d0-677d-73d9-b60c-33fbb2bb9dc2";
  var POLL_INTERVAL = 10000;
  var state = {};
  var syncing = false;

  function fetchState(callback) {
    fetch(BLOB_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state = data || {};
        if (callback) callback();
      })
      .catch(function () {
        if (callback) callback();
      });
  }

  function pushState() {
    if (syncing) return;
    syncing = true;
    fetch(BLOB_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    })
      .then(function () { syncing = false; })
      .catch(function () { syncing = false; });
  }

  function renderAll() {
    document.querySelectorAll(".call-card").forEach(function (card) {
      var callId = card.getAttribute("data-call");
      var checkbox = card.querySelector('input[type="checkbox"]');
      var whenInput = card.querySelector(".log-when");
      var notesInput = card.querySelector(".log-notes");
      var logList = card.querySelector(".log-entries");

      if (state[callId]) {
        if (state[callId].checked) {
          checkbox.checked = true;
          card.classList.add("completed");
        } else {
          checkbox.checked = false;
          card.classList.remove("completed");
        }

        // Render all log entries
        if (logList && state[callId].logs) {
          logList.innerHTML = "";
          state[callId].logs.forEach(function (entry) {
            var li = document.createElement("li");
            li.className = "log-entry";
            var header = document.createElement("div");
            header.className = "log-entry-header";
            header.innerHTML = "<strong>" + escapeHtml(entry.name) + "</strong>";
            if (entry.when) {
              var d = new Date(entry.when);
              header.innerHTML += " &mdash; " + d.toLocaleString();
            }
            li.appendChild(header);
            if (entry.notes) {
              var notes = document.createElement("div");
              notes.className = "log-entry-notes";
              notes.textContent = entry.notes;
              li.appendChild(notes);
            }
            logList.appendChild(li);
          });
        }
      }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Initial load, then start polling
  fetchState(function () {
    renderAll();
    bindEvents();
    setInterval(function () {
      fetchState(renderAll);
    }, POLL_INTERVAL);
  });

  function bindEvents() {
    document.querySelectorAll(".call-card").forEach(function (card) {
      var callId = card.getAttribute("data-call");
      var checkbox = card.querySelector('input[type="checkbox"]');
      var toggleBtn = card.querySelector(".toggle-script");
      var scriptContent = card.querySelector(".script-content");
      var nameInput = card.querySelector(".log-name");
      var whenInput = card.querySelector(".log-when");
      var notesInput = card.querySelector(".log-notes");
      var saveBtn = card.querySelector(".save-log");
      var saveConfirm = card.querySelector(".save-confirm");

      checkbox.addEventListener("change", function () {
        if (!state[callId]) state[callId] = {};
        state[callId].checked = checkbox.checked;
        card.classList.toggle("completed", checkbox.checked);
        pushState();
      });

      toggleBtn.addEventListener("click", function () {
        var expanded = toggleBtn.getAttribute("aria-expanded") === "true";
        toggleBtn.setAttribute("aria-expanded", !expanded);
        toggleBtn.textContent = expanded ? "Show Script" : "Hide Script";
        scriptContent.hidden = expanded;
      });

      saveBtn.addEventListener("click", function () {
        var name = nameInput.value.trim();
        var when = whenInput.value;
        var notes = notesInput.value.trim();

        if (!name) {
          nameInput.style.borderColor = "#dc2626";
          nameInput.focus();
          return;
        }
        nameInput.style.borderColor = "";

        if (!state[callId]) state[callId] = {};
        if (!state[callId].logs) state[callId].logs = [];

        state[callId].logs.push({
          name: name,
          when: when,
          notes: notes,
          savedAt: new Date().toISOString()
        });

        pushState();

        nameInput.value = "";
        whenInput.value = "";
        notesInput.value = "";

        saveConfirm.hidden = false;
        setTimeout(function () {
          saveConfirm.hidden = true;
        }, 2000);

        renderAll();
      });
    });
  }
});
