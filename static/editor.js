var p = document.getElementById('resize');
p.addEventListener('mousedown', initDrag, false);

var doc_height;
function initDrag(e) {
	doc_height = $(document).height();
	document.documentElement.addEventListener('mousemove', doDrag, false);
	document.documentElement.addEventListener('mouseup', stopDrag, false);
}

function doDrag(e) {
	var h = (doc_height - e.clientY);
	if(h <= 50) h = 50;
	if(h >= doc_height-41) h = doc_height-41;

	$("#io").css("height", h + 'px');
	$("#container").css("bottom", h+5 + 'px');
	$("#resize").css("bottom", h + 'px');
}

function stopDrag(e) {
	document.documentElement.removeEventListener('mousemove', doDrag, false);
	document.documentElement.removeEventListener('mouseup', stopDrag, false);
}

function topbarLog(txt){
	return $("#-main-action-msg").stop( true, true ).show().html(txt);
}

function action_save() {
	var value = window.editor.getValue();
	if(value == "") {
		topbarLog("<span style=\"color:darkorange; font-weight:bold;\">Client error: Empty data.</span>");
		return 0;
	}
	
	topbarLog("<span style=\"font-weight:bold;\">Saving...</span>");
	
	$.post("index.php?action=save", {
		code: value
	}, function(data) {
		console.log(data);

		if (data !== "1") {
			topbarLog("<span style=\"color:darkorange; font-weight:bold;\">Engine error: "+data+"</span>");
		} else {
			topbarLog("<span style=\"color:#0A0; font-weight:bold;\">Saved</span>").delay(3000).fadeOut(400);
		}
	}, 'text').fail(function(xhr, status, error) {
		topbarLog("<span style=\"color:#0A0;font-weight:bold;\"> Error "+status+" </span>");
	});
}

var running_interval, run_xhr;
function action_stop() {
	run_xhr.abort()

	$.post("index.php?action=stop", {

	}, function(data) {
		topbarLog("<span style=\"color:darkorange;font-weight:bold;\"> Terminated </span>").delay(5000).fadeOut(400);
	}).fail(function(xhr, status, error) {
		topbarLog("<span style=\"color:#0A0;font-weight:bold;\"> Error "+status+" </span>");
	});
}

function action_run(type = "compile") {
	var time = 0;

	var elem = $("<span style=\"font-weight:bold;\">Compiling...</span>");
	topbarLog(elem);
	
	$("#-main-action-stop, #-main-action-run").toggle();
	running_interval = setInterval(function(){
		elem.text(time+"ms");
		time += 35;
	}, 35);

	run_xhr = $.post("index.php?action=run", {
		type: type,
		code: window.editor.getValue(),
		input: window.input_editor.getValue()
	}, function(data) {
		clearInterval(running_interval);
		$("#-main-action-stop, #-main-action-run").toggle();

		var str = data.split(/\r?\n/).pop();
		if(str == "Compilation Error.") {
			topbarLog("<span style=\"color:darkorange;font-weight:bold;\">"+str+"</span>");
		} else if(str.indexOf("(core dumped)") != -1) {
			topbarLog("<span style=\"color:#A00;font-weight:bold;\">"+str+"</span>");
		} else {
			topbarLog("<span style=\"font-weight:bold;\">"+str+"</span>");
		}

		window.output_editor.setValue(data.substring(0, data.lastIndexOf("\n")));
	}).fail(function(xhr, status, error) {
		clearInterval(running_interval);
		$("#-main-action-stop, #-main-action-run").toggle();

		topbarLog("<span style=\"color:#0A0;font-weight:bold;\"> Error "+status+" </span>");
	});
}

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.14.3/min/vs' }});
require(['vs/editor/editor.main'], function() {
	window.output_editor = monaco.editor.create(document.getElementById("output_editor"), {
		lineNumbers: true,
		roundedSelection: false,
		scrollBeyondLastLine: false,
		automaticLayout: true,
		readOnly: true,
		detectIndentation: true,
		theme: "vs-dark",
	});

	window.input_editor = monaco.editor.create(document.getElementById("input_editor"), {
		value: Exports_Input,
		lineNumbers: true,
		roundedSelection: false,
		scrollBeyondLastLine: false,
		automaticLayout: true,
		detectIndentation: true,
		theme: "vs-dark",
	});

	window.editor = monaco.editor.create(document.getElementById("container"), {
		value: Exports_Output,
		language: "c",
		scrollBeyondLastLine: false,
		automaticLayout: true,
		theme: "vs-dark"
	});
	
	var f6 = window.editor.addCommand(monaco.KeyCode.F6, function() {
		action_run('debug');
	});

	var f7 = window.editor.addCommand(monaco.KeyCode.F7, function() {
		action_run();
	});

	var ctrl_s = window.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
		action_save();
	});
});