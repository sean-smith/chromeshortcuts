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

	$("#clearall").click(function() {
		confirm();
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


	$("#github").click(function() {
		chrome.tabs.update({ url: "https://github.com/sean-smith/chromeshortcuts" } );
		return false;
	});

	$("#seanhome").click(function() {
		chrome.tabs.update({ url: "https://seanssmith.net" } );
		return false;
	});

	// Form submission handler
	$("#new_alias").submit(function(event) {
		var alias = $("#alias").val().replace(/[^\w]/g, '');
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

function confirm() {
	$("#aliases").prepend(`<div id="confirm"><p>Are you sure you want to remove all aliases?</p><button type='button' id='confirmclearall' class='button red'>Yes</button><button type='button' id='cancelclearall' class='button'>No</button></div>`);
	$("#confirmclearall").click(function(event) {
		clear();
		return false;
	});
	$("#cancelclearall").click(function(event) {
		$("#confirm").html("");
	});
}

function clear() {
  chrome.storage.sync.clear(function () {
    console.log("cleared!");
  })
  $("#aliases").html("");
}

function remove(alias) {
	chrome.storage.sync.remove(alias, function() {
		$(`#${alias}`).parent().remove();
	});
}

function insert(alias, url) {
  if(alias === '_settings_'){
		return
	}
	$("#aliases").append(`<div class='row'><a class='remove' id="${alias}"><svg class="icon" enable-background="new 0 0 32 32" height="32px" version="1.1" viewBox="0 0 32 32" width="32px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M20.377,16.519l6.567-6.566c0.962-0.963,0.962-2.539,0-3.502l-0.876-0.875c-0.963-0.964-2.539-0.964-3.501,0  L16,12.142L9.433,5.575c-0.962-0.963-2.538-0.963-3.501,0L5.056,6.45c-0.962,0.963-0.962,2.539,0,3.502l6.566,6.566l-6.566,6.567  c-0.962,0.963-0.962,2.538,0,3.501l0.876,0.876c0.963,0.963,2.539,0.963,3.501,0L16,20.896l6.567,6.566  c0.962,0.963,2.538,0.963,3.501,0l0.876-0.876c0.962-0.963,0.962-2.538,0-3.501L20.377,16.519z" fill="#515151"/></svg></a><div class='pill alias'>${alias}</div><img class='icon arrow' src='img/arrow_right.svg'><div class='pill url'>${url}</div></div>`);
	$(`#${alias}`).click(function(event) {
		console.log(alias);
		remove(alias);
		return false;
	});
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
  downloadAnchorNode.setAttribute("download", exportName + ".smd");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
