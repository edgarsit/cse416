import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
public class scrapeCourseInformation{
//  it prints the name of the ID, name, credits, and listed semester
    public static void main(String[] arg) throws IOException {
        File file = new File("cse416/Java/gradcourses-spring2021-edited (1).txt");

        BufferedReader br = new BufferedReader(new FileReader(file));

        String st;
        int blankLines = 0;
        List<String> courses = new ArrayList<String>();
        String temp = "";
        int index =0;
        while ((st = br.readLine()) != null) {
            if(courseName(st)){
                courses.add(temp);
                temp=st;
            }
            else{
                temp+=st+ "/";
            }
        }
        courses.add(temp);
        courses.remove(0);
        List<course> listOfCourse = new ArrayList<course>();
        course temp2;
        for(String course:courses){
            temp2 = new course(
                    getCourseName(course),
                    courseID(course),
                    getCredit(course),
                    prereq(course),
                    courseSemester(course));
            System.out.println(temp2.toString());
            //System.out.println(course);
        }
    }

    static Boolean courseName(String st){
        //get the actual course name tool
        String courseNameRegex = "[A-Z][A-Z][A-Z]\\s\\d\\d\\d:";
        Pattern courseNamePattern = Pattern.compile(courseNameRegex);
        Matcher m = courseNamePattern.matcher(st);
        if(m.find()){
            return true;
        }
        else{
            return false;
        }
    }

    static String courseID(String st){
        String id = st.substring(0,7);
        return id;
    }

    static String getCourseName(String st){
        String name = st.substring(9,st.indexOf("/"));
        return name;
    }

    static String getCredit(String st){
        int index = st.indexOf("credits");
        String credit = "\\d-\\d credits";
        Pattern creditPattern = Pattern.compile(credit);
        Matcher m = creditPattern.matcher(st);
        if(m.find()){
            return m.group(0);
        }
        credit = "\\d credits";
        creditPattern = Pattern.compile(credit);
        m = creditPattern.matcher((st));
        if(m.find()){
            return m.group(0);
        }
        else{
            return "N/A";
        }
    }

    static List<String> courseSemester(String st){
        String semester = "(Fall|Spring|Winter|Summer)";
        Pattern semesterPattern = Pattern.compile(semester);
        Matcher m = semesterPattern.matcher(st);
        List<String> season = new ArrayList<String>();
        while(m.find()){
            season.add((m.group()));
        }
        return season;
    }

    static String prereq(String st){
        String prereq = "Prerequisite";
        int index = st.indexOf(prereq);
        if(index ==-1){
            return "None\n";
        }
        st = st.substring(index);
        if(st.contains(".")){
            return st.substring(0,st.indexOf("."))+"\n";
        }
        index = st.indexOf("//");
        return st.substring(0,index);
    }

}

class course{
    String name;
    String id; /// CSE 101
    String prereq;
    List<String> semester;
    String credit;

    public course(String name,String id,String credit, String prereq,List<String> semester){
        this.name =name;
        this.id =id;
        this.prereq=prereq;
        this.semester = semester;
        this.credit=credit;
    }

    public String toString(){
        return id+"\n"+name+"\n"+credit+"\n"+semester.toString()+"\n"+prereq;
    }

    public String getCredit(){
        return credit;
    }
    public String getName() {
        return name;
    }

    public String getId() {
        return id;
    }

    public String getPrereq() {
        return prereq;
    }

    public List<String> getSemester() {
        return semester;
    }
}
