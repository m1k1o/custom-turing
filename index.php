<?php
// debuging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$source_name = "data/main";

if(!empty($_GET["action"]) && $_GET["action"] == 'save') {
	$code_file = $source_name.'.c';

	// Save code
	$code = @$_POST["code"];
	file_put_contents($code_file, $code);

	die('1');
}

if(!empty($_GET["action"]) && $_GET["action"] == 'stop') {
	$pid_file = $source_name.'.pid';
	
	$pid = file_get_contents($pid_file);
	if($pid) {
		exec("kill -9 ".escapeshellarg($pid));
	}

	file_put_contents($pid_file, '');
	die(1);
}

if(!empty($_GET["action"]) && $_GET["action"] == 'run') {
	$output_file = $source_name.'.out';
	$input_file  = $source_name.'.in';
	$code_file   = $source_name.'.c';
	$pid_file = $source_name.'.pid';

	// Save code
	$code = $_POST["code"];
	file_put_contents($code_file, $code);

	// Save input
	$input = $_POST["input"];
	file_put_contents($input_file, $input);

	// Execution type
	$debug = $_POST["type"] == 'debug';

	// If GCC is with erorrs
	if(exec(
		"gcc ".escapeshellarg($code_file).
			" -std=gnu99".
			" -o ".escapeshellarg($output_file).
			($debug ? " -g -O3" : "").
			" -lm".
		" 2>&1", $output
	)){
		$output[] = "Compilation Error.";
		die(implode(PHP_EOL, $output));
	}

	// If Program is with erorrs
	$startTime = microtime(true);
	if($debug) {
		exec("valgrind ./".escapeshellarg($output_file)." < ".escapeshellarg($input_file)." 2>&1 & echo $! > ".escapeshellarg($pid_file), $output);
	} else {
		exec("./".escapeshellarg($output_file)." < ".escapeshellarg($input_file)." 2>&1 & echo $! > ".escapeshellarg($pid_file), $output);
	}

	if(!preg_match("/\(core dumped\)/", end($output))) {
		$output[] = sprintf("Done: %d ms.", floatval(microtime(true) - $startTime)*1000);
	}

	file_put_contents($pid_file, '');
	die(implode(PHP_EOL, $output));
}

$json_input = @json_encode(file_get_contents($source_name.'.in'));
$json_code = @json_encode(file_get_contents($source_name.'.c'));

if(!is_writable('data/')) {
	die('Data directory is not writable.');
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Custom Turing</title>
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
	<link rel="stylesheet" href="static/editor.css"/>
</head>
<body>
	<div id="-main-action">
		<div id="-main-action-save" onclick="action_save();">Save (Ctrl+S)</div>
		<div id="-main-action-debug" onclick="action_run('debug');">Debug (F6)</div>
		<div id="-main-action-run" onclick="action_run();">Run (F7)</div>
		<!--<div id="-main-action-update" onclick="">Choose file...</div>-->
		<div id="-main-action-stop" onclick="action_stop()" style="display:none;">Stop (Shift+F7)</div>
		<div id="-main-action-msg"></div>
	</div>

	<div id="container"></div>
	<div id="resize"></div>
	<div id="io">
		<div id="output_editor"></div>
		<div id="input_editor"></div>
	</div>

	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.14.3/min/vs/loader.js"></script>

	<script>
		var Exports_Input = <?php echo $json_input; ?>;
		var Exports_Output = <?php echo $json_code; ?>;
	</script>
	<script type="text/javascript" src="static/editor.js"></script>
</body>
</html>