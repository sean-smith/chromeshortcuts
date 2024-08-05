$(function () {
  Swal.fire({
    title: "Important Announcement",
    html: `Dear Shortcut Manager DELUXE Users,<br>
    We regret to inform you that Shortcut Manager DELUXE is no longer supported.<br><br>We invite you to explore Hive available <a href='https://chromewebstore.google.com/detail/hive-bookmarks/mgpaacedpjkjfnmjhbfiolffpmpdebdo?utm_source=smdapp' target='_blank'>HERE</a>. <br><br>Hive offers enhanced features, improved performance, and a user-friendly interface.<br><br> To ensure a smooth transition, we recommend exporting your aliases and importing them to Hive.<br> <a href="https://www.youtube.com/watch?v=diSAS294hFY" target="_blank">Here is a step-by-step video guide of how to migrate to Hive </a>.  Thank you for your understanding, and for any assistance, contact us <a href="mailto:hive.ext@gmail.com"> HERE </a>
    .<br><br>
    Best,
    Hive team <br> <img src="https://lh3.googleusercontent.com/DoT1F3h0kbD_QCTmndj4UR8jjavckLvXfh3D9a9MhOaF2lg14c-Q9YDWlv92TADeyqwYG2awG3LLMggzpXulS2UsFQU=s60">`,
  });
  get();

  $("#clear").click(function () {
    swalAlert
      .fire({
        title: "Are you sure?",
        text: "You're about do clear your alias list",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.value) {
          clear();
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
        }
      });
  });

  $("#current").click(function (event) {
    chrome.tabs.query(
      { active: true, lastFocusedWindow: true },
      function (tabs) {
        if (tabs[0] != null) {
          $("#alias").val(tabs[0].title);
          $("#url").val(tabs[0].url);
        }
        $("#alias").select();
      }
    );
  });

  $("#github").click(function () {
    chrome.tabs.update({
      url: "https://github.com/tamir-nakar/chrome_shortcuts",
    });
    return false;
  });

  // Form submission handler
  $("#new_alias").submit(function (event) {
    var alias = $("#alias").val();
    var url = $("#url").val();

    if (alias == "" || url == "") {
      event.preventDefault();
      alert("You must enter an alias and url...");
      return;
    }

    set(alias, url);
    return false;
  });
});

const swalAlert = Swal.mixin({
  customClass: {
    confirmButton: "button success",
    cancelButton: "button danger",
  },
  buttonsStyling: false,
});

// Store newly input keys
function set(alias, url) {
  var obj = {};
  obj[alias] = url;
  chrome.storage.sync.set(obj, function () {
    $("#alias").val("");
    $("#url").val("");
  });
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (key in changes) {
    var storageChange = changes[key];
    if (storageChange.newValue != null) {
      insert(key, storageChange.newValue);
    }
  }
});

// Get keys and display
function get() {
  chrome.storage.sync.get(null, function (obj) {
    for (o in obj) {
      insert(o, obj[o]);
    }
    insert('Get Hive', 'https://chromewebstore.google.com/detail/hive-bookmarks/mgpaacedpjkjfnmjhbfiolffpmpdebdo')
    insert('Hive on Facebook', 'https://www.facebook.com/Hive.bookmarks')
  });
}

function clear(refillObj) {
  chrome.storage.sync.clear(function () {
    if (refillObj) {
      Object.keys(refillObj).forEach((el) => set(el, refillObj[el]));
    }
    if (!refillObj) {
      Swal.fire("Success!", "Clear Succedded", "success");
    }
  });
  $("#aliases").html("");
}

function remove(alias) {
  swalAlert
    .fire({
      title: "Are you sure?",
      text: `Delete '${alias}' ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.value) {
        chrome.storage.sync.remove(alias, function () {
          $(`[id='${alias}']`).remove();
        });
        Swal.fire("Success!", `'${alias}' was deleted successfully`, "success");
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
      }
    });
}

function handleExportAsync() {
  const d = new Date();
  chrome.storage.sync.get(null, function (obj) {
    downloadObjectAsJson(
      obj,
      `Aliases Backup ${d.getUTCMonth()}/${d.getUTCDate()}/${d.getUTCFullYear()}`
    );
  });
}

function handleImport() {
  try {
    const files = document.getElementById("selectFiles").files;
    if (files.length <= 0) {
      return false;
    }

    var fr = new FileReader();

    fr.onload = function (e) {
      try {
        var result = JSON.parse(e.target.result);
        clear(result);
        Swal.fire("Success!", "Improt process ended successfully", "success");
      } catch {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong! Please make sure to load an '.smd' file and try again",
        });
      }
    };

    fr.readAsText(files.item(0));
  } catch (e) {}
}

function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".smd");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function insert(alias, url) {
  const divElemToAdd = document.createElement("div");
  divElemToAdd.classList.add("row");
  divElemToAdd.setAttribute("id", alias);
  divElemToAdd.innerHTML = `<img class='removeBtn' src='img/x-square.svg'><div class='pill alias'>${alias}</div><img class='icon arrow' src='img/arrow_right.svg'><div class='pill url'>${url}</div>`;
  divElemToAdd
    .querySelector(".removeBtn")
    .addEventListener("click", () => remove(alias));

  $("#aliases").append(divElemToAdd);
}


window.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");
  // document
  //   .querySelector("#import")
  //   .addEventListener("click", () => handleImport());

  document
    .querySelector("#export")
    .addEventListener("click", () => handleExportAsync());

  document
    .querySelector("#selectFiles")
    .addEventListener("change", () => handleImport());
});
