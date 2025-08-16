<?php

$ref = $_GET["ref_code"];
$url = "http://192.168.100.10:8069";
$db = "odoo";
$username = "admin";
$password = "s@ly@n#hosp";

require_once('ripcord.php');

$final_array = ["total" => 0];

//odoo validation billing
$today_date = date('Y-m-d');


$common = ripcord::client("$url/xmlrpc/2/common");
// print_r ($common->version());
$uid = $common->authenticate($db, $username, $password, array());
//  echo $uid;
$models = ripcord::client("$url/xmlrpc/2/object");

$access_right = $models->execute_kw(
    $db,
    $uid,
    $password,
    'res.partner',
    'check_access_rights',
    array('read'),
    array('raise_exception' => false)
);

$cuid = $models->execute_kw(
    $db,
    $uid,
    $password,
    'res.partner',
    'search',
    array(
        array(
            array('ref', '=like', $ref),
            array('active', '=', true)
        )
    )
);

//odoo validation billing
$category_names = ['Test', 'Panel'];

$prod_cat_ids = $models->execute_kw($db, $uid, $password, 'product.category', 'search', array(array(array('name', 'in', $category_names))));


$sord = $models->execute_kw(
    $db,
    $uid,
    $password,
    'sale.order',
    'search_read',
    array(array(
        array('partner_id', '=', $cuid),
        array('state', '=', 'draft'),
        array('team_id', '=', 4),
        array('date_order', '>=', $today_date),
        array('date_order', '<', $today_date . ' 23:59:59')
    )),
    array('fields' => array('state', 'date_order', 'name'))
);


$sord_array = [];
for ($i = 0; $i < sizeof($sord); $i++) {


    $sordline = $models->execute_kw($db, $uid, $password, 'sale.order.line', 'search_read', array(array(array('order_id', '=', $sord[$i]["id"]), array('product_id.categ_id.name', 'in', $category_names))), array('fields' => array('name', 'product_id', 'quantity')));


    $item = "";
    if (sizeof($sordline) > 0) {
        for ($j = 0; $j < sizeof($sordline); $j++) {


            $sale_line_array = array(
                "sno" => $j,
                "id" => $sordline[$j]["id"],
                "item" => $sordline[$j]["product_id"],
                "product_uom_qty" => $sordline[$j]["product_uom_qty"]

            );
            if ($sordline[$j]["name"]) {
                $item = $item . ($j + 1) . ". " . $sordline[$j]["name"] . "[" . $sordline[$j]["product_uom_qty"] . "]" . "</br>";
            }
        }
    }

    $sale_array = array(
        "sno" => $i + 1,
        "id" => $sord[$i]["id"],
        "date_order" => $sord[$i]["date_order"],
        "state" => $sord[$i]["state"],
        "item" => $item
    );

    if ($sale_array['item']):
        array_push($sord_array, $sale_array);
    endif;
}

//odoo validation billing ends here


$ainv = $models->execute_kw(
    $db,
    $uid,
    $password,
    'account.invoice',
    'search_read',
    array(array(
        array('partner_id', '=', $cuid),
        array('state', '=', 'paid'),
        array('team_id', '=', 4)
    )),
    array('fields' => array('number', 'date_invoice', 'residual'))
);
//  print_r($ainv);

$final_array["total"] = sizeof($ainv);
$account_array = [];
for ($i = 0; $i < sizeof($ainv); $i++) {
    $ainvline = $models->execute_kw(
        $db,
        $uid,
        $password,
        'account.invoice.line',
        'search_read',
        array(array(array('invoice_id', '=', $ainv[$i]["id"]))),
        array('fields' => array('name', 'product_id', 'quantity'))
    );


    $item = "";
    for ($j = 0; $j < sizeof($ainvline); $j++) {
        $invoice_line_array = array(
            "sno" => $j,
            "id" => $ainvline[$j]["id"],
            "item" => $ainvline[$j]["name"],
            "quantity" => $ainvline[$j]["quantity"]

        );
        $item = $item . ($j + 1) . ". " . $ainvline[$j]["name"] . "[" . $ainvline[$j]["quantity"] . "]" . "</br>";
        // array_push($invoice_array,$invoice_line_array);
    }

    $invoice_array = array(
        "sno" => $i + 1,
        "id" => $ainv[$i]["id"],
        "date_invoice" => $ainv[$i]["date_invoice"],
        "number" => $ainv[$i]["number"],
        "residual" => $ainv[$i]["residual"],
        "item" => $item
    );
    array_push($account_array, $invoice_array);
    // $account_array[]=$invoice_array;
}

//odoo validation billing
array_push($final_array, $account_array, $sord_array);


// print_r($ainvline);


header('Content-Type: application/json');
echo json_encode($final_array, JSON_PRETTY_PRINT);
