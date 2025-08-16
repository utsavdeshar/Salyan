select 
  lmt.department as department, 
  lmt.dhis2_test_name as test_name, 
  COALESCE(SUM(raw_data.total_count), 0) AS total,
   COALESCE(SUM(raw_data.positive), 0) AS positive,
   COALESCE(SUM(raw_data.negative), 0) AS negative 
from 
  lab_map_test lmt 
  left join (
    SELECT 
      DISTINCT ts.name AS department, 
      t.name AS name, 
      count(r.id) AS total_count, 
      CASE WHEN t.id IN (
        SELECT 
          test_id 
        FROM 
          clinlims.test_result 
        WHERE 
          tst_rslt_type = 'D'
      ) THEN count(r1.id) ELSE NULL END AS positive, 
      CASE WHEN t.id IN (
        SELECT 
          test_id 
        FROM 
          clinlims.test_result 
        WHERE 
          tst_rslt_type = 'D'
      ) THEN count(r2.id) ELSE NULL END AS negative 
    FROM 
      clinlims.test_section ts 
      INNER JOIN clinlims.test t ON ts.id = t.test_section_id 
      AND t.is_active = 'Y' 
      LEFT OUTER JOIN clinlims.analysis a ON t.id = a.test_id 
      LEFT OUTER JOIN clinlims.result r ON a.id = r.analysis_id 
      and cast(r.lastupdated as date) BETWEEN '#startDate#' and '#endDate#' 
      and r.value != '' 
      LEFT OUTER JOIN clinlims.result r1 ON r1.result_type = 'D' 
      and r1.value != '' 
      and r.id = r1.id 
      and r1.abnormal = true 
      LEFT OUTER JOIN clinlims.result r2 on r2.result_type = 'D' 
      and r2.value != '' 
      and r.id = r2.id 
      and r2.abnormal = false 
    WHERE 
      ts.name = 'Biochemistry Department' 
    GROUP BY 
      ts.name, 
      t.name, 
      t.id
  ) raw_data on lmt.ehr_test_name = raw_data.name 
  and lmt.department = raw_data.department 
where 
  lmt.department = 'Biochemistry Department' 
  and lmt.is_active = 'Y' 
group by 
  lmt.department, 
  lmt.dhis2_test_name 
order by 
  case when lmt.dhis2_test_name = 'SUGAR' then 1 when lmt.dhis2_test_name = 'BLOOD UREA' then 2 when lmt.dhis2_test_name = 'CREATININE' then 3 when lmt.dhis2_test_name = 'SODIUM(NA)' then 4 when lmt.dhis2_test_name = 'POTASSIUM(K)' then 5 when lmt.dhis2_test_name = 'CALCIUM' then 6 when lmt.dhis2_test_name = 'PHOSPHORUS' then 7 when lmt.dhis2_test_name = 'MAGNESIUM' then 8 when lmt.dhis2_test_name = 'URIC ACID' then 9 when lmt.dhis2_test_name = 'TOTAL CHOLESTEROL' then 10 when lmt.dhis2_test_name = 'TRIGLYCERIDES' then 11 when lmt.dhis2_test_name = 'HDL' then 12 when lmt.dhis2_test_name = 'LDL' then 13 when lmt.dhis2_test_name = 'AMYLASE' then 14 when lmt.dhis2_test_name = 'BILIRUBIN' then 15 when lmt.dhis2_test_name = 'SGPT' then 16 when lmt.dhis2_test_name = 'ALK PHOS' then 17 when lmt.dhis2_test_name = 'SGOT' then 18 when lmt.dhis2_test_name = 'TOTAL PROTIEN' then 19 when lmt.dhis2_test_name = 'GAMMA GT' then 20 when lmt.dhis2_test_name = '24 HR URINE PROTEIN' then 21 when lmt.dhis2_test_name = 'IRON' then 23 when lmt.dhis2_test_name = 'TIBC' then 24 when lmt.dhis2_test_name = 'CPK-MB' then 25 when lmt.dhis2_test_name = 'CPK-NAC' then 26 when lmt.dhis2_test_name = 'LDH' then 27 when lmt.dhis2_test_name = 'ISO- TROP -I' then 28 when lmt.dhis2_test_name = 'OTHER' then 29 end
