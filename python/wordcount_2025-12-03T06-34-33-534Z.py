/*
Title: wordcount_2025-12-03T06-34-33-534Z.py
Description: BDA
Date: 12/3/2025, 12:04:33 PM
*/

Mapper:
import java.io.IOException;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapred.*;

public class WCMapper extends MapReduceBase
        implements Mapper<LongWritable, Text, Text, IntWritable> {

    public void map(LongWritable key, Text value,
        OutputCollector<Text, IntWritable> output, Reporter rep)
        throws IOException {

        String[] words = value.toString().split(" ");
        for (String w : words)
            if (w.length() > 0)
                output.collect(new Text(w), new IntWritable(1));
    }
}

Reducer:
import java.io.IOException;
import java.util.Iterator;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapred.*;

public class WCReducer extends MapReduceBase
        implements Reducer<Text, IntWritable, Text, IntWritable> {

    public void reduce(Text key, Iterator<IntWritable> values,
        OutputCollector<Text, IntWritable> output, Reporter rep)
        throws IOException {

        int count = 0;
        while (values.hasNext())
            count += values.next().get();

        output.collect(key, new IntWritable(count));
    }
}

Driver:
import org.apache.hadoop.conf.Configured;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapred.*;
import org.apache.hadoop.util.*;

public class WCDriver extends Configured implements Tool {

    public int run(String[] args) throws Exception {
        JobConf conf = new JobConf(WCDriver.class);
        FileInputFormat.setInputPaths(conf, new Path(args[0]));
        FileOutputFormat.setOutputPath(conf, new Path(args[1]));

        conf.setMapperClass(WCMapper.class);
        conf.setReducerClass(WCReducer.class);
        conf.setMapOutputKeyClass(Text.class);
        conf.setMapOutputValueClass(IntWritable.class);
        conf.setOutputKeyClass(Text.class);
        conf.setOutputValueClass(IntWritable.class);

        JobClient.runJob(conf);
        return 0;
    }

    public static void main(String[] args) throws Exception {
        ToolRunner.run(new WCDriver(), args);
    }
}
