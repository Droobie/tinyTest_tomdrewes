<?php
	include('DBconnect.php');
	$userid = $_POST['userid'];
	$etages = $_POST['etages'];
	$money = $_POST['money'];

	$q = "UPDATE user SET etages = '" .$etages. "', money = '" .$money. "' WHERE ID = '" .$userid. "'";
	$e = mysqli_query($db, $q);

	echo $q;
?>