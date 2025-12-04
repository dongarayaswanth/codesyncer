/*
Title: pig_udf_to_convert_string_to_uppercase_2025-12-03T04-48-20-974Z.java
Description: javac -cp `pig -classpath` UpperCaseUDF.java
jar -cf uppercaseudf.jar UpperCaseUDF.class
REGISTER 'uppercaseudf.jar';

DEFINE toUpper UpperCaseUDF();

data = LOAD 'names.txt' USING PigStorage(',') AS (name:chararray);

upperNames = FOREACH data GENERATE toUpper(name);

DUMP upperNames;
Date: 12/3/2025, 10:18:20 AM
*/

import java.io.IOException;
import org.apache.pig.EvalFunc;
import org.apache.pig.data.Tuple;

public class UpperCaseUDF extends EvalFunc<String> {

    @Override
    public String exec(Tuple input) throws IOException {
        if (input == null || input.size() == 0 || input.get(0) == null)
            return null;

        String name = (String) input.get(0);
        return name.toUpperCase();
    }
}
