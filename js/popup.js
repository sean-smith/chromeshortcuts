// Copyright Sean Smith 2017
// Just kidding
// I'm not a lawyer
// So copy all you want 🤑

// Click handler (jquery because I'm lazy af)
$(function () {
  getSpecificSetting("dont_show_message").then(dontShow => {
	const isShowMessage = !dontShow
	if (isShowMessage) {
		Swal.fire({
		  title: "New version available",
		  heightAuto: false,
		  html: `<br>Dear Users,<br><br>
				You're invited to explore Hive, the next generation of Shortcut-Manager app.<br><br> Hive offers enhanced features, improved performance, and a user-friendly interface. available <a href='https://chromewebstore.google.com/detail/hive-bookmarks/mgpaacedpjkjfnmjhbfiolffpmpdebdo?utm_source=sm_omni_app_popup' target='_blank'>HERE</a>.<br><br> To ensure a smooth transition, we recommend exporting your aliases and importing them to Hive.<br> <a href="https://www.youtube.com/watch?v=diSAS294hFY" target="_blank">Here is a step-by-step video guide of how to migrate to Hive </a>.  For further assistance, contact us <a href="mailto:hive.ext@gmail.com"> HERE </a>
				.<br><br>
	 <img src="https://lh3.googleusercontent.com/DoT1F3h0kbD_QCTmndj4UR8jjavckLvXfh3D9a9MhOaF2lg14c-Q9YDWlv92TADeyqwYG2awG3LLMggzpXulS2UsFQU=s60"><br><br>
	 <div style="display:flex; flex-direction:row;margin:0;padding:0"><input type="checkbox" id="dont_show"><p style="font-size:15px;margin:0px">don't show me this message again</p></input></div>`,
		  preConfirm: () => {
			const dontShow_box = document.querySelector("#dont_show").checked;
			if (dontShow_box) {
			  chrome.storage.sync.set({ _settings_: { dont_show_message: true } });
			}
		  },
		});
	  }
  })

  get();

  $("#clear").click(function () {
    clear();
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
      url: "https://github.com/sean-smith/chrome_shortcuts",
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
    }

    set(alias, url);
    return false;
  });

});

function getSpecificSetting(setting) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("_settings_", function (settings_obj) {
    resolve(settings_obj["_settings_"]?.[setting]);
    });
  });
}

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
    for (let o in obj) {
      if (o === "_settings_") {
        continue;
      }
      insert(o, obj[o]);
    }
  });
}

function clear() {
  chrome.storage.sync.clear(function () {
    console.log("cleared!");
  });
  $("#aliases").html("");
}

function remove(alias) {
  chrome.storage.sync.remove(alias, function () {
    $("#" + alias).remove();
  });
}

function insert(alias, url) {
	if(alias === '_settings_'){
		return
	}
  $("#aliases").append(
    `<div class='row'><div class='pill alias'>${alias}</div><img class='icon arrow' src='img/arrow_right.svg'><div class='pill url'>${url}</div></div>`
  );
}

window.addEventListener("DOMContentLoaded", (event) => {
  document
    .querySelector("#export")
    .addEventListener("click", () => handleExportAsync());
});

function handleExportAsync() {
  chrome.storage.sync.get(null, function (obj) {
    delete obj["_settings_"];
    downloadObjectAsJson(obj, "Chrome-Shortcut-Manager links export");
  });
}

function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
