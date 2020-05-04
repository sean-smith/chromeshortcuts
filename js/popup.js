// Copyright Sean Smith 2017
// Just kidding
// I'm not a lawyer
// So copy all you want 🤑


// Click handler (jquery because I'm lazy af)
$(function() {

	get();

	$("#clearall").click(function() {
		confirm();
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

	$("#github").click(function() {
		chrome.tabs.update({ url: "https://github.com/sean-smith/chromeshortcuts" } );
		return false; 
	});

	// Form submission handler
	$("#new_alias").submit(function(event) {
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
	chrome.storage.sync.clear(function() {
		console.log('cleared!')
	});
	$("#aliases").html("");
}

function remove(alias) {
	chrome.storage.sync.remove(alias, function() {
		$("#"+alias).parent().remove();
	});
}

function insert(alias, url) {
	$("#aliases").append(`<div class='row'><a class='remove' id="${alias}"><svg class="icon" enable-background="new 0 0 32 32" height="32px" version="1.1" viewBox="0 0 32 32" width="32px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M20.377,16.519l6.567-6.566c0.962-0.963,0.962-2.539,0-3.502l-0.876-0.875c-0.963-0.964-2.539-0.964-3.501,0  L16,12.142L9.433,5.575c-0.962-0.963-2.538-0.963-3.501,0L5.056,6.45c-0.962,0.963-0.962,2.539,0,3.502l6.566,6.566l-6.566,6.567  c-0.962,0.963-0.962,2.538,0,3.501l0.876,0.876c0.963,0.963,2.539,0.963,3.501,0L16,20.896l6.567,6.566  c0.962,0.963,2.538,0.963,3.501,0l0.876-0.876c0.962-0.963,0.962-2.538,0-3.501L20.377,16.519z" fill="#515151"/></svg></a><div class='pill alias'>${alias}</div><img class='icon arrow' src='img/arrow_right.svg'><div class='pill url'>${url}</div></div>`);
	$(".remove").click(function(event) {
		var alias = $(".remove").attr('id');
		remove(alias);
		return false;
	});
}

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-91305548-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
