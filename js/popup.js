// Copyright Sean Smith 2017
// Just kidding
// I'm not a lawyer
// So copy all you want 🤑


// Click handler (jquery because I'm lazy af)
$(function() {

	get();

	$("#clear").click(function() {
		clear();
	});

	$("#current").click(function(event) {
		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
			if (tabs[0] != null) {
				$("#alias").val(tabs[0].title);
				$("#url").val(tabs[0].url);
			}
			$("#alias").select();
		});
	});

	$(".url").click(function(event) {
		// var url = $(this).text();
		alert("hi");
		chrome.tabs.update({ url: "https://google.com" } ); 
	});

	$("#github").click(function() {
		chrome.tabs.update({ url: "https://github.com/sean-smith/chrome_shortcuts" } );
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
		console.log('cleared!')
	});
	$("#aliases").html("");
}

function remove(alias) {
	chrome.storage.sync.remove(alias, function() {
		$("#"+alias).remove();
	});
}

function insert(alias, url) {
	$("#aliases").append(`<div class='row'><div class='pill alias'>${alias}</div><img class='icon arrow' src='img/arrow_right.svg'><div class='pill url'>${url}</div></div>`);
}
