import java.io.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
public class scrapeCourseInformation{
    public static void main(String[] arg) throws IOException {
        System.out.println("helo");
        File file = new File("cse416/Java/gradcourses-fall2020.txt");

        BufferedReader br = new BufferedReader(new FileReader(file));

        String st;
        int x=0;
        while ((st = br.readLine()) != null){
            System.out.print(x++);
            System.out.println(courseName(st));
            System.out.print(preRequiste(st));
            System.out.print(semester(st));}
    }

    static String courseName(String st){
        //get the actual course name tool
        String courseNameRegex = "[A-Z][A-Z][A-Z]\\s\\d\\d\\d:";
        Pattern courseNamePattern = Pattern.compile(courseNameRegex);
        Matcher m = courseNamePattern.matcher(st);
        if(m.find()){
            return m.group(0);
        }
        else{
            return "";
        }
    }

    static String preRequiste(String st){
        //not sure how to get the course name from
        //prereq, since it can be on multiple lines and there are some lines like
        //SCI 510, 520, 541, 542...
        String Prerequisite = "Prerequisite";
        Pattern prerequisitePattern = Pattern.compile(Prerequisite);
        Matcher m = prerequisitePattern.matcher(st);
        if(m.find()){
            return st;
        }
        else{
            return "";
        }
    }

    static String semester(String st){
        String semester = "(Summer|Winter|Spring|Fall)";
        Pattern semesterPattern = Pattern.compile(semester);
        Matcher m = semesterPattern.matcher(st);
        String temp ="";
        if(m.find()){
            for(int i=0;i<m.groupCount();i++){
                temp += m.group(i);
            }
            return temp;
        }
        else{
            return "";
        }
    }
    }
