select
   lmt.department as department,
   lmt.dhis2_test_name as test_name,
   COALESCE(SUM(raw_data.total_count), 0) AS total,
   COALESCE(SUM(raw_data.positive), 0) AS positive,
   COALESCE(SUM(raw_data.negative), 0) AS negative
from
   lab_map_test lmt 
   left join
      (
         SELECT DISTINCT
            ts.name AS department,
            t.name AS name,
            count(r.id) AS total_count,
            CASE
               WHEN
                  t.id IN 
                  (
                     SELECT
                        test_id 
                     FROM
                        clinlims.test_result 
                     WHERE
                        tst_rslt_type = 'D'
                  )
               THEN
                  count(r1.id) 
               ELSE
                  NULL 
            END
            AS positive, 
            CASE
               WHEN
                  t.id IN 
                  (
                     SELECT
                        test_id 
                     FROM
                        clinlims.test_result 
                     WHERE
                        tst_rslt_type = 'D'
                  )
               THEN
                  count(r2.id) 
               ELSE
                  NULL 
            END
            AS negative 
         FROM
            clinlims.test_section ts 
            INNER JOIN
               clinlims.test t 
               ON ts.id = t.test_section_id 
               AND t.is_active = 'Y' 
            LEFT OUTER JOIN
               clinlims.analysis a 
               ON t.id = a.test_id 
            LEFT OUTER JOIN
               clinlims.result r 
               ON a.id = r.analysis_id 
               and cast(r.lastupdated as date) BETWEEN '#startDate#' AND '#endDate#' 
               and r.value != '' 
            LEFT OUTER JOIN
               clinlims.result r1 
               ON r1.result_type = 'D' 
               and r1.value != '' 
               and r.id = r1.id 
               and r1.abnormal = true 
            LEFT OUTER JOIN
               clinlims.result r2 
               on r2.result_type = 'D' 
               and r2.value != '' 
               and r.id = r2.id 
               and r2.abnormal = false 
         WHERE
            ts.name = 'Haematology Department' 
         GROUP BY
            ts.name, t.name, t.id
      )
      raw_data 
      on lmt.ehr_test_name = raw_data.name 
      and lmt.department = raw_data.department 
where
   lmt.department = 'Haematology Department' 
   and lmt.is_active = 'Y' 
group by
   lmt.department , lmt.dhis2_test_name 
order by
   case
      when
         lmt.dhis2_test_name = 'HB' 
      then
         1 
      when
         lmt.dhis2_test_name = 'RBC COUNT' 
      then
         2 
      when
         lmt.dhis2_test_name = 'TLC' 
      then
         3 
      when
         lmt.dhis2_test_name = 'PLATELETS COUNT' 
      then
         4 
      when
         lmt.dhis2_test_name = 'DLC' 
      then
         5 
      when
         lmt.dhis2_test_name = 'ESR' 
      then
         6 
      when
         lmt.dhis2_test_name = 'MCV' 
      then
         7 
      when
         lmt.dhis2_test_name = 'MCH' 
      then
         8 
      when
         lmt.dhis2_test_name = 'MCHC' 
      then
         9 
      when
         lmt.dhis2_test_name = 'BLOOD GROUP & RH TYPE' 
      then
         10 
      when
         lmt.dhis2_test_name = 'Coombs test' 
      then
         11 
      when
         lmt.dhis2_test_name = 'RETICS' 
      then
         12 
      when
         lmt.dhis2_test_name = 'PBS/PBF' 
      then
         13 
      when
         lmt.dhis2_test_name = 'HBA1C' 
      then
         14 
      when
         lmt.dhis2_test_name = 'SICKLING TEST' 
      then
         15 
         when
         lmt.dhis2_test_name = 'URINE FOR HEMOSIDERIN' 
      then
         16
      when
         lmt.dhis2_test_name = 'BT' 
      then
         17
      when
         lmt.dhis2_test_name = 'CT' 
      then
         18 
      when
         lmt.dhis2_test_name = 'PT-INR' 
      then
         19 
      when
         lmt.dhis2_test_name = 'APTT' 
      then
         20 
               when
         lmt.dhis2_test_name = 'BONE MARROW ANALYSIS' 
      then
         21 
          when
         lmt.dhis2_test_name = 'ALDHYDE TEST' 
      then
         22
      when
         lmt.dhis2_test_name = 'SMEAR MP POS' 
      then
         23 
          when
         lmt.dhis2_test_name = 'LD BODIES' 
      then
         24         
          when
         lmt.dhis2_test_name = 'HB ELECTROPHORESIS' 
      then
         25 
          when
         lmt.dhis2_test_name = 'LE CELL' 
      then
         26
           when
         lmt.dhis2_test_name = 'AEF' 
      then
         27
          when
         lmt.dhis2_test_name = 'FDP' 
      then
         28
      when
         lmt.dhis2_test_name = 'D-DIMER' 
      then
         29 
         when
         lmt.dhis2_test_name = 'FAC VIII' 
      then
         30
           when
         lmt.dhis2_test_name = 'FAC IX' 
      then
         31
      when
         lmt.dhis2_test_name = 'CROSS MATCHING' 
      then
         32
      when
         lmt.dhis2_test_name = 'OTHER' 
      then
         33 
   end