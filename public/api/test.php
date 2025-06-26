<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://stiles.southafricanorth.cloudapp.azure.com:5006/Stock/GetAllStockWebItems',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_HTTPHEADER => array(
    'Authorization: Basic ' . base64_encode('WebUser1142:e$Ye6!g]I~X@K!D')
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;
