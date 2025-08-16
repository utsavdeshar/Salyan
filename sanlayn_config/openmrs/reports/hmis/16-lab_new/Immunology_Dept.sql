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
      and cast(r.lastupdated as date) BETWEEN '#startDate#' AND '#endDate#'
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
      ts.name = 'Immunology Deptartment' 
    GROUP BY 
      ts.name, 
      t.name, 
      t.id
  ) raw_data on lmt.ehr_test_name = raw_data.name 
  and lmt.department = raw_data.department 
where 
  lmt.department = 'Immunology Deptartment' 
  and lmt.is_active = 'Y' 
group by 
  lmt.department, 
  lmt.dhis2_test_name 
order by 
  case when lmt.dhis2_test_name = 'PREGNANCY TEST(UPT)' then 1 when lmt.dhis2_test_name = 'ASO' then 2 when lmt.dhis2_test_name = 'CRP' then 3 when lmt.dhis2_test_name = 'RA FACTOR' then 4 when lmt.dhis2_test_name = 'ANA' then 5 when lmt.dhis2_test_name = 'ANTI-DSDNA' then 6 when lmt.dhis2_test_name = 'PRPR/VDRL' then 7 when lmt.dhis2_test_name = 'CEA' then 8 when lmt.dhis2_test_name = 'CA-125' then 9 when lmt.dhis2_test_name = 'CA-19.9' then 10 when lmt.dhis2_test_name = 'CA-15.3' then 11 when lmt.dhis2_test_name = 'TOXO' then 12 when lmt.dhis2_test_name = 'RUBELLA' then 13 when lmt.dhis2_test_name = 'CMV' then 14 when lmt.dhis2_test_name = 'HSV' then 15 when lmt.dhis2_test_name = 'MEASLES' then 16 when lmt.dhis2_test_name = 'ECHINOCOCCUS' then 17 when lmt.dhis2_test_name = 'AMOEBIASIS' then 18 when lmt.dhis2_test_name = 'PSA' then 19 when lmt.dhis2_test_name = 'FERRITIN' then 20 when lmt.dhis2_test_name = 'CYSTICERCOSIS' then 21 when lmt.dhis2_test_name = 'BRUCELLA' then 22 when lmt.dhis2_test_name = 'THYROGLOBULIN' then 23 when lmt.dhis2_test_name = 'ANTI TPO' then 24 when lmt.dhis2_test_name = 'PROTIEN ELECTROPHORESIS' then 25 
  when lmt.dhis2_test_name = 'ANTI-CCP' then 26
  when lmt.dhis2_test_name = 'RK-39' then 27 when lmt.dhis2_test_name = 'DENGUE' then 28 when lmt.dhis2_test_name = 'RAPID MP TEST' then 29 when lmt.dhis2_test_name = 'Mantoux Test' then 30 when lmt.dhis2_test_name = 'CHIKUNGUNYA' then 31
  when lmt.dhis2_test_name = 'SCRUB TYPHUS' then 32 when lmt.dhis2_test_name = 'H. PYLORI' then 33 when lmt.dhis2_test_name = 'LEPTOSPIRA' then 34 when lmt.dhis2_test_name = 'WIDAL TEST' then 35 when lmt.dhis2_test_name = 'OTHER' then 36 end
