<!DOCTYPE html>
<html lang="en">

<head>
    <title>Nepal EHR One Pager</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" />

    <style>
        /* Set height of the grid so .sidenav can be 100% (adjust if needed) */
        .row.content {
            height: 1500px
        }

        /* Set gray background color and 100% height */
        .sidenav {
            background-color: #f1f1f1;
            height: 100%;
        }

        /* Set black background color, white text and some padding */
        footer {
            padding: 15px;
            font-size: 12px;
        }

        .info-font {
            font-size: 12px;
        }

        /* On small screens, set height to 'auto' for sidenav and grid */
        @media screen and (max-width: 767px) {
            .sidenav {
                height: auto;
                padding: 15px;
            }

            .row.content {
                height: auto;
            }


        }

        @media print {
            .text-decoration-underline {
                text-decoration: none !important;
            }

            /* Set the page size to A4 with no margins */
            @page {
                size: A4;
                margin: 0 !important;
                padding-top: 5px !important;
                padding-bottom: 3px !important;
            }

            @page :first {
                margin: 0;
                padding-top: 0 !important;
            }

            /* Ensure subtitle background color prints correctly */
            .subtitle {
                background-color: #acacac !important;
                -webkit-print-color-adjust: exact;
                /* Ensures color prints exactly */
            }

            /* Remove padding, margin, and set a specific width for containers */
            .container,
            .container-fluid {
                padding: 0 !important;

                margin: 5px !important;
                max-width: 8.26772in !important;

                width: 8.26772in !important;
            }

            /* Set html and body to take full width and height, and remove margins */
            html,
            body {
                /* width: 100%;
                height: 100%; */
                margin: 0 !important;
                padding: 0 !important;
            }

            hr {
                border: none;
                border-top: 1px solid #000;
                margin: 10px 0;
                height: 0;
                background-color: transparent;
            }

            .no-break {
                page-break-inside: avoid !important;
                display: block;
            }


            table tr {
                page-break-inside: auto !important;
            }

            /* Optional: Control page breaks for each table */
            table {
                page-break-after: auto !important;
                /* Ensure no breaks after the table */
            }

            .head-logo {
                height: auto;
                width: 90px;
            }

            /* .no-break+.no-break {
                page-break-before: always;
            } */


        }


        .col-3 {
            width: 25% !important;
            float: left;
        }

        .col-6 {
            width: 50% !important;
            float: left;
        }

        .col-4 {
            width: 33.33% !important;
            float: left;
        }

        .col-sm-3 {
            width: 25% !important;
            float: left;
        }

        .col-sm-6 {
            width: 50% !important;
            float: left;
        }

        .parent {
            text-align: center;
        }

        .child {
            display: inline-block;

            vertical-align: middle;
        }

        .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }

        .head-logo {
            height: auto;
            width: 90px;
        }

        table {
            font-size: 12px;
        }
    </style>
</head>

<body>
    <?php require_once("get_data_html.php"); ?>
    <div class="container pt-2">
        <div class=" container-fluid">
            <!-- page title start  -->
            <div class="parent py-3">

                <div class="child">
                    <img class="img-fluid head-logo" src="https://localhost/onepager/img/logo.png" />
                </div>
                <div class="child text-center">

                    <h3>Salyan District Hospital</h3>


                    <p>Sarada Municipality-2 [088-520461]</p>

                    <strong><?php echo  $bed_no ? "Discharge Summary Report" : "Patient One Pager Report"; ?></strong>

                </div>

            </div>
            <!-- page title ends -->
            <div class="patient-name">

                <hr>
                <p>
                    <strong class="text-decoration-underline ">
                        <?php
                        echo $patient_name ?> </strong>[<?php echo  $identifier; ?> ] -
                    <?php
                    echo $patient_address;
                    ?>
                </p>
            </div>
            <!-- Patient details starts -->
            <div class="row justify-space-between info-font">



                <div class="col col-3 col-xs-3 col-sm-3 col-md-3 py-0 pt-1">
                    <?php
                    echo "<p><strong>Date of Birth:</strong> "  . $patient_dob . "</p>";
                    ?>
                    <p> <strong>Age: </strong> <?php echo $patient_age; ?></p>
                    <?php if ($bed_no): ?> <p> <strong>Blood Group: </strong> <?php echo $blood_group; ?></p> <?php endif; ?>


                </div>
                <div class="col col-3 col-xs-3  col-md-3 col-sm-3  py-0 pt-1">
                    <?php
                    echo "<p><strong>Claim Code:</strong> " . $claim_code . '</p><p> <strong>NHIS Number:</strong> ' . $nhis_number . '</p>';

                    ?>

                </div>
                <?php if ($bed_no): ?>
                    <div class="col col-3 col-xs-3 col-sm-3 col-md-3  py-0 pt-1">
                        <?php
                        echo "<p><strong>Bed No:</strong> "  . $bed_no .  "</p>";
                        echo "<p><strong>Ward:</strong> "  . $location . "</p>";
                        ?>



                    </div>


                    <div class="col col-3 col-xs-3 col-sm-3 col-md-3  py-0 pt-1">
                        <?php
                        echo "<p><strong>Date of Admission:</strong> "  . $discharge_admission_date_nep . "</p>";
                        echo "<p><strong>Date of Discharge :</strong> "  . $discharge_discharge_date_nep .  "</p>";
                        ?>
                        <p> <strong>Total Stay: </strong> <?php echo $total_stay; ?></p>

                    </div>
                <?php endif; ?>
            </div>

            <!-- Patient details ends -->


            <hr>
            <!-- Diagnoses starts -->
            <br />
            <h5 class="text-decoration-underline pt-3">Diagnosis</h5>
            <?php if ($diagnoses_table): ?>

                <div class="row">
                    <div class="col-12">
                        <table class="table table-sm table-bordered text-center m-0">

                            <?php echo $diagnoses_table; ?>

                        </table>
                    </div>
                </div>
            <?php else: ?>

                <p class="p-0 m-0">No diagnosis available!</p>

            <?php endif; ?>
            <!-- Diagnoses ends -->




            <!-- Observation starts -->

            <h5 class="text-decoration-underline pt-3">Observation</h5>
            <?php if ($obs_table): ?>

                <div class="col-12 col-sm-12">
                    <table class="table table-sm table-bordered text-center m-0">

                        <?php echo $obs_table; ?>



                    </table>
                </div>
            <?php else: ?>

                <p class="p-0 m-0">No observation available!</p>

            <?php endif; ?>

            <!-- Observation ends -->




            <!-- Disposition starts -->

            <h5 class="text-decoration-underline pt-3">Disposition</h5>
            <?php if ($disp_table): ?>


                <div class="col-12 col-sm-12">
                    <table class="table table-sm table-bordered text-center m-0">

                        <?php echo $disp_table; ?>

                    </table>
                </div>
            <?php else: ?>

                <p class="p-0 m-0">No disposition available!</p>

            <?php endif; ?>

            <!-- Disposition ends  -->



            <!-- investigation starts -->

            <h5 class="text-decoration-underline pt-3">Innvestigation Chart</h5>
            <?php if ($lab_table_new): ?>

                <div class="row">
                    <div class="col-12 col-sm-12">
                        <table class="table table-sm table-bordered text-center m-0">
                            <?php echo $lab_table_new; ?>


                        </table>
                    </div>
                </div>
            <?php else: ?>

                <p class="p-0 m-0">No investigation chart available!</p>

            <?php endif; ?>

            <!-- investigation ends  -->


            <!-- treatment starts -->

            <h5 class="text-decoration-underline pt-3">Treatments</h5>
            <?php if ($treat_table_new): ?>

                <div class="row">
                    <div class="col-12 col-sm-12">
                        <table class="table table-sm table-bordered text-center m-0">

                            <?php echo $treat_table_new; ?>


                        </table>
                    </div>
                </div>
            <?php else: ?>

                <p>No treatment available!</p>

            <?php endif; ?>

            <!-- treatment ends  -->
            <h5 class="text-decoration-underline pt-3">Packages</h5>
            <?php if ($procedure_table_new): ?>

                <div class="row">
                    <div class="col-12 col-sm-12">
                        <table class="table table-sm table-bordered text-center m-0">
                            <tr>
                                <th>
                                    Code
                                </th>
                                <th>Package</th>
                                <th>Quantity</th>
                                <th>Remarks</th>
                            </tr>
                            <?php echo $procedure_table_new; ?>


                        </table>
                    </div>
                </div>
            <?php else: ?>

                <p>No Package available!</p>

            <?php endif; ?>

            <!-- Radiology  starts -->

            <h5 class="text-decoration-underline pt-3">Radiology </h5>
            <?php if ($radio_table): ?>

                <div class="row">
                    <div class="col-12 col-sm-12">
                        <table class="table table-sm table-bordered text-center m-0">

                            <?php echo $radio_table; ?>


                        </table>
                    </div>
                </div>
            <?php else: ?>

                <p class="p-0 m-0">No radiology available!</p>

            <?php endif; ?>

            <!-- Radiology ends  -->




            <!-- Other orders starts -->

            <h5 class="text-decoration-underline pt-3">Other Others</h5>
            <?php if ($other_table_new): ?>

                <div class="row">

                    <div class="col-12 col-sm-12">
                        <table class="table table-sm table-bordered text-center m-0">

                            <?php echo $other_table_new; ?>


                        </table>
                    </div>

                </div>
            <?php else: ?>

                <p class="p-0 m-0">No others records available!</p>

            <?php endif; ?>

            <!-- Other orders ends  -->
            <?php if ($bed_no): ?>
                <hr>
                <footer>
                    <div class="row">
                        <div class="col-4 col-sm-4">
                            <p>PREPARED BY: </p>
                            <p>Dr. Name: </p>
                            <p>NMC NO: </p>
                            <p>Signature: </p>
                            &nbsp;
                            &nbsp;
                        </div>
                        <div class="col-4 col-sm-4">
                            <p>CHECKED BY: </p>
                            <p>Dr. Name: <?php echo $checked_by; ?></p>
                            <p>NMC NO: </p>
                            <p>Signature: </p>
                            &nbsp;
                            &nbsp;
                        </div>
                        <div class="col-4 col-sm-4">
                            <p>CONSULTANT:</p>
                            <p>Dr. Name: </p>
                            <p>NMC No:</p>
                            <p>Signature: </p>

                        </div>
                    </div>
                </footer>
            <?php endif; ?>
        </div>


    </div>
</body>

</html>