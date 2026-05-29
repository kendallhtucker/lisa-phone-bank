document.addEventListener("DOMContentLoaded", function () {
  var STORAGE_KEY = "lisa-phone-bank";

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  var state = loadState();

  document.querySelectorAll(".call-card").forEach(function (card) {
    var callId = card.getAttribute("data-call");
    var checkbox = card.querySelector('input[type="checkbox"]');
    var toggleBtn = card.querySelector(".toggle-script");
    var scriptContent = card.querySelector(".script-content");
    var whenInput = card.querySelector(".log-when");
    var notesInput = card.querySelector(".log-notes");
    var saveBtn = card.querySelector(".save-log");
    var saveConfirm = card.querySelector(".save-confirm");

    // Restore saved state
    if (state[callId]) {
      if (state[callId].checked) {
        checkbox.checked = true;
        card.classList.add("completed");
      }
      if (state[callId].when) {
        whenInput.value = state[callId].when;
      }
      if (state[callId].notes) {
        notesInput.value = state[callId].notes;
      }
    }

    // Checkbox toggle
    checkbox.addEventListener("change", function () {
      if (!state[callId]) state[callId] = {};
      state[callId].checked = checkbox.checked;
      card.classList.toggle("completed", checkbox.checked);
      saveState(state);
    });

    // Script toggle
    toggleBtn.addEventListener("click", function () {
      var expanded = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", !expanded);
      toggleBtn.textContent = expanded ? "Show Script" : "Hide Script";
      scriptContent.hidden = expanded;
    });

    // Save notes
    saveBtn.addEventListener("click", function () {
      if (!state[callId]) state[callId] = {};
      state[callId].when = whenInput.value;
      state[callId].notes = notesInput.value;
      saveState(state);
      saveConfirm.hidden = false;
      setTimeout(function () {
        saveConfirm.hidden = true;
      }, 2000);
    });
  });
});
