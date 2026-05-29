document.addEventListener("DOMContentLoaded", function () {
  var LOCAL_KEY = "lisa-phone-bank";
  var state = {};

  function loadLocal() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveLocal() {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  }

  function renderAll() {
    document.querySelectorAll(".call-card").forEach(function (card) {
      var callId = card.getAttribute("data-call");
      var checkbox = card.querySelector('input[type="checkbox"]');
      var logList = card.querySelector(".log-entries");

      if (state[callId]) {
        if (state[callId].checked) {
          checkbox.checked = true;
          card.classList.add("completed");
        } else {
          checkbox.checked = false;
          card.classList.remove("completed");
        }

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

  // Reference toggle
  var refToggle = document.querySelector(".toggle-reference");
  var refContent = document.querySelector(".reference-content");
  if (refToggle && refContent) {
    refToggle.addEventListener("click", function () {
      var expanded = refToggle.getAttribute("aria-expanded") === "true";
      refToggle.setAttribute("aria-expanded", !expanded);
      refContent.hidden = expanded;
    });
  }

  // Load state and render
  state = loadLocal();
  renderAll();

  // Bind events
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
      saveLocal();
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

      saveLocal();

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
});
