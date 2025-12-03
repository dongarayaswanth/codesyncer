/*
Title: matrix_mapreduce_2025-12-03T10-17-42-705Z.java
Description: BDA
Date: 12/3/2025, 3:47:42 PM
*/

Mapper
import java.io.IOException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.mapreduce.Mapper;

public class MatrixMapper extends Mapper<LongWritable, Text, Text, Text> {
 @Override
 public void map(LongWritable key, Text value, Context context)
  throws IOException, InterruptedException {

  Configuration conf = context.getConfiguration();
  int m = Integer.parseInt(conf.get("m"));
  int p = Integer.parseInt(conf.get("p"));

  String[] parts = value.toString().split(",");
  // parts: [MatrixId, row, col, value]
  Text outKey = new Text();
  Text outVal = new Text();

  if (parts[0].equals("M")) {
   // M,row,col,val -> emit for k=0..p-1 as (row,k) -> "M,col,val"
   for (int k=0; k<p; k++) {
    outKey.set(parts[1] + "," + k);
    outVal.set("M," + parts[2] + "," + parts[3]);
    context.write(outKey, outVal);
   }
  } else { // N (B matrix named N in PDF)
   // N,row,col,val -> emit for i=0..m-1 as (i,col) -> "N,row,val"
   for (int i=0; i<m; i++) {
    outKey.set(i + "," + parts[2]);
    outVal.set("N," + parts[1] + "," + parts[3]);
    context.write(outKey, outVal);
   }
  }
 }
}
Reducer
import java.io.IOException;
import java.util.HashMap;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

public class MatrixReducer extends Reducer<Text, Text, Text, Text> {
 @Override
 public void reduce(Text key, Iterable<Text> values, Context context)
  throws IOException, InterruptedException {

  HashMap<Integer, Float> hashA = new HashMap<>();
  HashMap<Integer, Float> hashB = new HashMap<>();

  for (Text t : values) {
   String[] v = t.toString().split(",");
   if (v[0].equals("M")) hashA.put(Integer.parseInt(v[1]), Float.parseFloat(v[2]));
   else hashB.put(Integer.parseInt(v[1]), Float.parseFloat(v[2]));
  }

  int n = Integer.parseInt(context.getConfiguration().get("n"));
  float result = 0.0f;
  for (int j=0; j<n; j++) {
   float a = hashA.containsKey(j) ? hashA.get(j) : 0.0f;
   float b = hashB.containsKey(j) ? hashB.get(j) : 0.0f;
   result += a * b;
  }

  if (result != 0.0f)
   context.write(null, new Text(key.toString() + "," + Float.toString(result)));
 }
}
MatrixDriver