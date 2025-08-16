<?php
require 'config.php';
$config = new imisConfig(); 
echo($config->getData('Patient/?identifier='. $_GET["identifier"])); 