<?php
require_once("config.php");

require_once("nepali-date.php");
$all_data = [];

$patient_uuid = $_GET["patient"];
$visit_uuid = $_GET["visit"];

function convertMil2Date($mil)
{
    $seconds = $mil / 1000;
    return date("Y-m-d H:i:s", $seconds);
}

function nepali_date($datetime)
{
    $nepali_date = new nepali_date();

    $timestamp = strtotime($datetime);
    $dateOnly = date('Y-m-d', $timestamp);
    $e_date = explode('-', $dateOnly);
    $bday = $nepali_date->get_nepali_date($e_date['0'], $e_date['1'], $e_date['2']);
    $date = $bday['y'] . ' ' . $bday['M'] . ' ' . $bday['d'];
    return $nepali_date->convertToNepaliFont($date);
}

function nepali_date_time($datetime)
{
    $nepali_date = new nepali_date();

    $timestamp = strtotime($datetime);
    $dateOnly = date('Y-m-d', $timestamp);
    $timeOnly = date('h:i A', $timestamp);


    $e_date = explode('-', $dateOnly);
    $bday = $nepali_date->get_nepali_date($e_date['0'], $e_date['1'], $e_date['2']);
    $date = $bday['y'] . ' ' . $bday['M'] . ' ' . $bday['d'];
    $final_date =  $date . ' | ' . $timeOnly;
    return $nepali_date->convertToNepaliFont($final_date);
}




$response = require_once("get_data.php");

array_push($all_data, json_decode($response, true));


$patient_name = $all_data[0]['patient_details'][0]['full_name'];
$patient_address = $all_data[0]['patient_details'][0]['Address'];
$patient_age = $all_data[0]['patient_details'][0]['age_years'];

$patient_dob = explode("T", $all_data[0]['patient_details'][0]['birth_date'])[0];
$nhis_number = $all_data[0]['patient_details'][0]['nhis_number'];
$claim_code = $all_data[0]['patient_details'][0]['claim_code'];
$identifier = $all_data[0]['patient_details'][0]['identifier'];


//  patient details ends 


// // Getting diagnoses starts


$diagnoses = $all_data[0]['diagnosis'];

$diagnoses_table = "";
for ($i = 0; $i < sizeof($diagnoses); $i++) {

    $diagnoses_table = $diagnoses_table . '<tr >
    <td style="width: 33%;">
    ' . $diagnoses[$i]['Diagnosis'] . '
    </td>
    
    <td style="width: 33%;">
        ' . $diagnoses[$i]['Diagnosis Certainty'] . ' ' . $diagnoses[$i]['Diagnosis Order'] . ' 
    </td>
    <td style="width: 33%;">
        ' . ($diagnoses[$i]['Diagnosis Datetime'] ? nepali_date_time($diagnoses[$i]['Diagnosis Datetime']) : '') . ' - ' . $diagnoses[$i]['provider'] . ' 
    </td>
</tr>';
}
// Getting diagnoses ends 


// get dispositions starts

$condition = $all_data[0]['condition'];


$con_table = "";
for ($i = 0; $i < sizeof($condition); $i++) {
    if (!empty($condition[$i]['conditions'])) {

        $con_table = $con_table .
            '     <tr>
    <td style="width: 50%;" >
      ' . $condition[$i]['conditions'] . '
    </td>
    <td style="width: 50%;" >
      ' . $condition[$i]['condition_status'] . '
    </td>
   
</tr>';
    }
}
// get dispositions ends 


// getting observation 


$observe = $all_data[0]['observation'];

$bed_no = $observe[0]['bed_number'];

$location = $observe[0]['location'];
$blood_group = $observe[0]['blood_group'];
$discharge_admission_date = '';
$discharge_discharge_date = '';
$discharge_admission_date_nep = '';
$discharge_discharge_date_nep = '';
$checked_by = '';


$obs_table = "";
for ($i = 0; $i < sizeof($observe); $i++) {

    if (!empty($observe[$i]['Observation DateTime'])) {
        $value = $observe[$i]['obs_value'];
        if ($observe[$i]['observation_name'] == 'Discharge-Discharge date') {
            $discharge_discharge_date = $observe[$i]['obs_value'];
            $value = $discharge_discharge_date_nep = nepali_date_time($discharge_discharge_date);
        }
        if ($observe[$i]['observation_name'] == 'Discharge-Admission date') {
            $discharge_admission_date = $observe[$i]['obs_value'];
            $value = $discharge_admission_date_nep = nepali_date_time($discharge_admission_date);
        }
        if ($observe[$i]['observation_name'] == 'Discharge-Admission date') {
            $checked_by = $observe[$i]['Observation Provider'];
        }

        if ($value == 'True') {
            $value = 'Yes';
        }
        if ($value == 'False') {
            $value = 'No';
        }
        $obs_table = $obs_table .
            '

        <tr>
        
            <td style="width: 20%;" class="text-start">
            '   . (!$value ? '<strong>' : '') . '' . $observe[$i]['observation_name']  . (!$value ? '</strong>' : '') . '
            </td>
            <td style="width: 20%;">
            ' . $value . '
            </td>
             <td style="width: 20%;">
            ' . $observe[$i]['comments'] . '
            </td>
            <td style="width:20%">' . ($observe[$i]['Observation DateTime'] && $value ? nepali_date_time($observe[$i]['Observation DateTime']) : '') . ' - ' . $observe[$i]['Observation Provider'] . '</td>
        </tr>';
    }
}
// // getting observation ends 

if (!empty($discharge_admission_date) && !empty($discharge_discharge_date)) {

    $admissionTimestamp = strtotime($discharge_admission_date);
    $dischargeTimestamp = strtotime($discharge_discharge_date);



    $totalSeconds = $dischargeTimestamp - $admissionTimestamp;


    $total_stay = (floor($totalSeconds / (60 * 60 * 24)) +1) . ' days';
} else {
    $total_stay = '';
}



$vital = $all_data[0]['vitals'];



$groupedVital = [];

foreach ($vital as $item) {

    $date = !empty($item['Vitals DateTime']) ? $item['Vitals DateTime'] : ' ';

    if (!isset($groupedVital[$date])) {
        $groupedVital[$date] = [];
    }

    $groupedVital[$date][] = [

        'Vital Sign' => $item['Vital Sign'],
        'Vital Value' => $item['Vital Value'],
        'Vital Provider' => $item['Vital Provider']

    ];
}

//print_r($groupedVital);


$vital_table = "";
for ($i = 0; $i < sizeof($vital); $i++) {
    if (!empty($vital[$i]['Vitals DateTime'])) {
        $vital_table = $vital_table .
            '

        <tr>
        
            <td style="width: 33%;" class="text-start"> 
            ' . (!$vital[$i]['Vital Value'] ? '<strong>' : '') . '' . $vital[$i]['Vital Sign']  . (!$vital[$i]['Vital Value'] ? '</strong>' : '') . '
            </td>
            <td style="width: 33%;">
            ' . $vital[$i]['Vital Value'] . '
            </td>
            <td style="width:33%">' . ($vital[$i]['Vitals DateTime'] && $vital[$i]['Vital Value'] ? nepali_date_time($vital[$i]['Vitals DateTime']) : '') . ' - ' . $vital[$i]['Vital Provider'] . '</td>
        </tr>';
    }
}
// getting observation ends 

// get dispositions starts

$disposition = $all_data[0]['disposition'];


$disp_table = "";
for ($i = 0; $i < sizeof($disposition); $i++) {
    if (!empty($disposition[$i]['Disposition'])) {

        $disp_table = $disp_table .
            '     <tr>
    <td style="width: 33%;" >
      ' . $disposition[$i]['Disposition'] . '
    </td>
    <td style="width: 33%;" >
      ' . $disposition[$i]['Disposition Note'] . '
    </td>
    <td style="width: 33%;">

      ' . ($disposition[$i]['Disposition Time'] ? nepali_date_time($disposition[$i]['Disposition Time']) : '') . ' - ' . $disposition[$i]['Disposition By'] . '
    </td>
</tr>';
    }
}
// get dispositions ends 




// // get investigation details 




$lab_url = $URL . 'bahmnicore/labOrderResults?visitUuids=' . $visit_uuid;

$lab_details = getData($lab_url);
array_push($all_data, json_decode($lab_details));


$labs = json_decode($lab_details);

$lab_table_new = '';

$groupedData = [];

$groupedData = [];

foreach ($labs->results as $item) {

    // Assuming the panel name is being fetched correctly from the item
    $panelName = !empty($item->panelName) ? $item->panelName : 'Other Tests';

    // If the panelName doesn't exist yet in groupedData, initialize it
    if (!isset($groupedData[$panelName])) {
        $groupedData[$panelName] = [];
    }

    // Add the item to the correct panel group
    $groupedData[$panelName][] = [
        'testName' => $item->testName,
        'result' => $item->result,
        'resultDateTime' => $item->resultDateTime,
        'provider' => $item->provider
    ];
}



foreach ($groupedData as $panelName => $tests) {

    $lab_table_new .= "<tr><td class='text-start' colspan='3' style='font-weight: bold;'>$panelName</td></tr>";


    foreach ($tests as $test) {
        $lab_table_new .=
            '     <tr>
                <td style="width: 33%;" class="text-start">
                    ' . $test['testName'] . '
                </td>
                <td style="width: 33%;">
                    ' . $test['result'] . '
                </td>
                <td style="width: 33%;">
                    <font style="font-size: 12px;">
                        ' . ($test['resultDateTime'] ? nepali_date_time(convertMil2Date($test['resultDateTime'])) : '')  . ' - ' . $test['provider'] . '
                    </font>
                </td>
            </tr>';
    }
}

// get investigation details ends 


// get treatment 



$treat_url = $URL . 'bahmnicore/drugOrders/prescribedAndActive?getEffectiveOrdersOnly=false&getOtherActive=false&numberOfVisits=1&patientUuid=' . $patient_uuid . '&visitUuids=' . $visit_uuid;

$treat_details = getData($treat_url);

array_push($all_data, json_decode($treat_details));


$treats = json_decode($treat_details);


$treat_table_new = '';
for ($i = 0; $i < sizeof($treats->visitDrugOrders); $i++) {
    if ($treats->visitDrugOrders[$i]->dateStopped || $treats->visitDrugOrders[$i]->orderType == 'Procedure Order') {
        continue;
    }
    $value = '';

    if ($treats->visitDrugOrders[$i]->dosingInstructions->frequency) {
        $value .= ', ' . $treats->visitDrugOrders[$i]->dosingInstructions->frequency;
    }

    if ($treats->visitDrugOrders[$i]->dosingInstructions->route) {
        $value .= ', ' . $treats->visitDrugOrders[$i]->dosingInstructions->route;
    }

    if ($treats->visitDrugOrders[$i]->duration) {
        $value .= '-' . $treats->visitDrugOrders[$i]->duration . ' ' . $treats->visitDrugOrders[$i]->durationUnits;
    }

    if (empty($treats->visitDrugOrders[$i]->duration)) {
        $value .= '-' . $treats->visitDrugOrders[$i]->dosingInstructions->quantity;
    }


    $treat_table_new = $treat_table_new .
        ' <tr>
    <td style="width: 33%;" class="text-start">
        ' . $treats->visitDrugOrders[$i]->drug->name . '
    </td>
    <td style="width: 33%;">
    ' . $treats->visitDrugOrders[$i]->dosingInstructions->dose .
        ' ' . $treats->visitDrugOrders[$i]->dosingInstructions->doseUnits .
        $value . '
    </td>
    <td style="width: 33%;">
<font style="font-size: 12px;">
' . ($treats->visitDrugOrders[$i]->visit->startDateTime ? nepali_date_time(convertMil2Date($treats->visitDrugOrders[$i]->visit->startDateTime)) : '') . ' - ' . $treats->visitDrugOrders[$i]->provider->name . ' 
                            </font>
    </td>
</tr>';
}
// get treatment ends 


 // get packages
    $procedure_url = $URL . 'bahmnicore/drugOrders/prescribedAndActive?getEffectiveOrdersOnly=false&getOtherActive=false&numberOfVisits=1&patientUuid=' . $patient_uuid . '&visitUuids=' . $visit_uuid;
    $procedure_details = getData($procedure_url);

    array_push($all_data, json_decode($procedure_details));


    $procedures = json_decode($procedure_details);

    $item_code = $all_data[0]['procedures'];

    $item_code_lookup = [];
    foreach ($item_code as $item) {

        if (isset($item['name']) && isset($item['item_code'])) {
            $item_code_lookup[$item['name']] = $item['item_code'];
        }
    }

    $procedure_table_new = '';

    for ($i = 0; $i < sizeof($procedures->visitDrugOrders); $i++) {
        if ($treats->visitDrugOrders[$i]->dateStopped) {
            continue;
        }
        $value = '';


        if ($procedures->visitDrugOrders[$i]->orderType == 'Procedure Order') {
            $drug_name = $procedures->visitDrugOrders[$i]->drug->name;

            $procedure_table_new = $procedure_table_new .
                ' <tr>
    
    
    <td style="width: 25%;">
    ' . $item_code_lookup[$drug_name] . '
    </td>
    <td style="width: 25%;" class="text-start">
        ' . $procedures->visitDrugOrders[$i]->drug->name . '
    </td>
    <td style="width: 25%;">
    ' . $procedures->visitDrugOrders[$i]->dosingInstructions->quantity . '
    </td>
    <td style="width: 25%;">
<font style="font-size: 12px;">
' . ($procedures->visitDrugOrders[$i]->visit->startDateTime ? nepali_date_time(convertMil2Date($procedures->visitDrugOrders[$i]->visit->startDateTime)) : '') . ' - ' . $procedures->visitDrugOrders[$i]->provider->name . ' 
                            </font>
    </td>
</tr>';
        }
    }


//get radiology
$radiology = $all_data[0]['radiology'];



$radio_table = '';

for ($i = 0; $i < sizeof($radiology); $i++) {
    if (!empty($radiology[$i]['Radiology DateTime'])) {
        $radio_table = $radio_table .
            '<tr>
    
    <td  style="width: 50%;">

      ' . $radiology[$i]['Radiology Name'] . '
    </td>
    
        <td style="width: 50%;">
<font style="font-size: 12px;">
' . ($radiology[$i]['Radiology DateTime'] ? nepali_date_time($radiology[$i]['Radiology DateTime']) : '') . ' - ' . $radiology[$i]['Radiology Provider'] . '
                            </font>
    </td>
</tr>';
    }
}
//radiology ends here


//  get other orders
$others = $all_data[0]['other_diagnostics'];

$other_table_new = '';
for ($i = 0; $i < sizeof($others); $i++) {
    if (!empty($others[$i]['other DateTime'])) {

        $other_table_new = $other_table_new .
            '<tr>
    
        <td  class="text-start">


        ' . $others[$i]['other Name'] .
            '
        </td>
        <td >
<font style="font-size: 12px;">
                ' . ($others[$i]['other DateTime'] ? nepali_date_time($others[$i]['[other DateTime']) : " ") . ' - ' . $others[$i]['other Provider'] . '
            </font>
    </td>
</tr>';
    }
}
