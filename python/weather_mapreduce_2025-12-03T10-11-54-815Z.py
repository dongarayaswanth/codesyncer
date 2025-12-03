/*
Title: weather_mapreduce_2025-12-03T10-11-54-815Z.py
Description: BDA
Date: 12/3/2025, 3:42:48 PM
*/

Mapper
import java.io.IOException;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.Mapper;

public class MaxTemperatureMapper
 extends Mapper<LongWritable,Text,Text,IntWritable> {

 private static final int MISSING=9999;

 public void map(LongWritable key,Text value,Context ctx)
 throws IOException,InterruptedException {

  String line=value.toString();
  String year=line.substring(15,19);

  int airTemp;
  if(line.charAt(87)=='+')
   airTemp=Integer.parseInt(line.substring(88,92));
  else
   airTemp=Integer.parseInt(line.substring(87,92));

  String quality=line.substring(92,93);

  if(airTemp!=MISSING && quality.matches("[01459]"))
   ctx.write(new Text(year),new IntWritable(airTemp));
 }
}
Reducer
import java.io.IOException;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.Reducer;

public class MaxTemperatureReducer
 extends Reducer<Text,IntWritable,Text,IntWritable> {

 public void reduce(Text key,Iterable<IntWritable> values,Context ctx)
 throws IOException,InterruptedException {

  int max=Integer.MIN_VALUE;
  for(IntWritable v:values)
   max=Math.max(max,v.get());

  ctx.write(key,new IntWritable(max));
 }
}
Driver
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class MaxTemperature {
 public static void main(String[] args) throws Exception {
  if(args.length!=2){ System.err.println("error"); System.exit(-1); }
  Job job=new Job();
  job.setJarByClass(MaxTemperature.class);
  job.setJobName("Max Temperature");
  FileInputFormat.addInputPath(job,new Path(args[0]));
  FileOutputFormat.setOutputPath(job,new Path(args[1]));
  job.setMapperClass(MaxTemperatureMapper.class);
  job.setReducerClass(MaxTemperatureReducer.class);
  job.setOutputKeyClass(Text.class);
  job.setOutputValueClass(IntWritable.class);
  System.exit(job.waitForCompletion(true)?0:1);
 }
}
