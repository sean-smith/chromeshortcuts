$(function() {
  get();

  $(".removeBtn").click(function(e) {
    console.log(e.target);
    //remove();
  });

  $("#clear").click(function() {
    clear();
  });

  $("#current").click(function(event) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
      tabs
    ) {
      if (tabs[0] != null) {
        $("#alias").val(tabs[0].title);
        $("#url").val(tabs[0].url);
      }
      $("#alias").select();
    });
  });

  $("#github").click(function() {
    chrome.tabs.update({
      url: "https://github.com/sean-smith/chrome_shortcuts"
    });
    return false;
  });

  // Form submission handler
  $("#new_alias").submit(function(event) {
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

// Store newly input keys
function set(alias, url) {
  var obj = {};
  obj[alias] = url;
  chrome.storage.sync.set(obj, function() {
    $("#alias").val("");
    $("#url").val("");
  });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    var storageChange = changes[key];
    if (storageChange.newValue != null) {
      insert(key, storageChange.newValue);
    }
  }
});

// Get keys and display
function get() {
  chrome.storage.sync.get(null, function(obj) {
    for (o in obj) {
      insert(o, obj[o]);
    }
  });
}

function clear() {
  chrome.storage.sync.clear(function() {
    console.log("cleared!");
  });
  $("#aliases").html("");
}

function remove(alias) {
  chrome.storage.sync.remove(alias, function() {
    $("#" + alias).remove();
  });
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

var _gaq = _gaq || [];
_gaq.push(["_setAccount", "UA-91305548-1"]);
_gaq.push(["_trackPageview"]);

(function() {
  var ga = document.createElement("script");
  ga.type = "text/javascript";
  ga.async = true;
  ga.src = "https://ssl.google-analytics.com/ga.js";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(ga, s);
})();
