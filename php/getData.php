<?php
	include('DBconnect.php');
	$target = $_POST['target'];
	$output;
	switch($target) {
		case "etages":
			$q = "SELECT * FROM etage";
			$e = mysqli_query($db, $q);
			$a = [];
			while($etage = mysqli_fetch_object($e)) {
				array_push($a, [$etage->ID, $etage->name, $etage->catID]);
			}
			$output = json_encode($a);
		break;
		case "categories":
			$q = "SELECT * FROM etagecategories";
			$e = mysqli_query($db, $q);
			$a = [];
			while($etage = mysqli_fetch_object($e)) {
				array_push($a, [$etage->ID, $etage->name]);
			}
			$output = json_encode($a);
		break;
		case "user":
			$q = "SELECT * FROM user WHERE ID = '1'";
			$user = mysqli_fetch_object(mysqli_query($db, $q));
			$output = json_encode($user);
		break;
	}

	echo $output;

?>