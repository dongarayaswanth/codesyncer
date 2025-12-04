/*
Title: Pig_script_2025-12-04T00-58-04-362Z.java
Description: BDA
Date: 12/4/2025, 6:28:04 AM
*/

A = LOAD 'emp.txt' USING PigStorage(',') 
    AS (id:int, name:chararray, dept:chararray);

GroupedData = GROUP A BY dept;

DUMP GroupedData;

A = LOAD 'student.txt' USING PigStorage(',') AS (id:int, name:chararray);
B = LOAD 'marks.txt' USING PigStorage(',') AS (id:int, marks:int);

C = JOIN A BY id, B BY id;

DUMP C;

A = LOAD 'marks.txt' USING PigStorage(',') AS (id:int, marks:int);

SortedA = ORDER A BY marks DESC;

DUMP SortedA;

A = LOAD 's1.txt' USING PigStorage(',') AS (id:int, name:chararray);
B = LOAD 's2.txt' USING PigStorage(',') AS (id:int, name:chararray);

C = UNION A, B;

DUMP C;

A = LOAD 'marks.txt' USING PigStorage(',')
    AS (id:int, name:chararray, marks:int);

SPLIT A INTO Pass IF marks >= 50, Fail IF marks < 50;

DUMP Pass;
DUMP Fail;