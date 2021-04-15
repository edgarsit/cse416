//f is the text file uploaded by the client
//department is the department of the GPD that is uploading the file
//the department for the degree must match the department of the GPD, otherwise throw an error

//will be written in pseudocodish until it can be changed to react format

/*
atm only 2 degrees will be implemented
if (department=="AMS")
{
    AMSDegreeParser(f)
}
elif(department=="CE")
{
    CEDegreeParser(f)
}

AMSDegreeParser(f)
{
    try
    {

        // There might have to be checks for the valeus exctracted in each row
        //ex: Minimum Cumulative GPA: E      should be invalid
        //also maybe check length of 
        var line=0
        var r=readline(f)
        line=line+1
        if(r.indexOf("Applied Mathematics and Statistics")!=-1)//make it not case sensitive if possible, same for the other checks
        {// boolean check is to see if that line has the right format
            throw err("File must possess degree requirements for Applied Mathematics and Statistics")
        }

        r=readline(f)
        line=line+1
        if(r.indexOf("Requirement Version: ")==-1)
        {
            throw err("Invalid file format on line "+line)
        }
        var temp=r.split(" ")
        var req_vers= temp[2]+" "+temp[3] //req_vers for Degree Requirements class

        r=readline(f)
        line=line+1
        if(r.indexOf("Minimum Cumulative GPA: ")==-1)
        {
            throw err("Invalid file format on line "+line)
        }
        var temp=r.split(" ")
        var min_cumulative_gpa=temp[3]//minimum cumulative gpa 

        r=readline(f)
        line=line+1
        if(r.indexOf("Minimum Cumulative GPA: ")==-1)
        {
            throw err("Invalid file format on line "+line)
        }
        var temp=r.split(" ")
        var min_cumulative_gpa=temp[3]//minimum cumulative gpa 

        r=readline(f)
        line=line+1
        if(r.indexOf( or more credits of all courses taken must carry a grade of at least ")==-1)
        {
            throw err("Invalid file format on line "+line)
        }
        var temp=r.split(" ")
        var num_courses_min_gpa=temp[0]+temp[15]//at least temp[0] need to have a grade of at least temp[15]

        r=readline(f)
        line=line+1
        if(r.indexOf("Minimum Core Courses GPA: ")==-1)
        {
            throw err("Invalid file format on line "+line)
        }
        var temp=r.split(" ")
        var min_core_gpa=temp[4]//minimum gpa for core courses

        r=readline(f)
        line=line+1
        if(r.indexOf("Final Recommendation: ")==-1)
        {
            throw err("Invalid file format on line "+line)
        }
        var temp=r.split(" ")
        var final_recommendation=false
        if(temp[2]=="Required")//see if the check can be not case sensitive
        {
            final_recommendation=true
        }
        
        r=readline(f)
        line=line+1
        if(r.indexOf("Time Limit: ")==-1)
        {
            throw err("Invalid file format on line "+line)
        }
        var temp=r.split(" ")
        var time_limit=temp[2]

    }
    catch
    {
        alert(err.message())
    }
}

*/