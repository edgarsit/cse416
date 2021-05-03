import { Course } from "../model/course";
import { Student } from "../model/user";
import { CoursePlanModel, DegreeRequirementsModel } from "../server/models";

/*
for the summary information, requirements are counted as follows.  
for requirements involving core (mandatory) and elective courses are counted, 
each such course is counted as a separate requirement, to provide more fine-grained measurement of progress.  
for example, if a student needs to take 5 core courses and 4 electives, 
there are 9 requirements to be satisfied.  a project or thesis counts as 1 requirement, 
even if it is satisfied by taking multiple courses, e.g., 
CSE advanced project requirement is satisfied by taking CSE 523 and CSE 524, 
and the BMI/CSE/ESE thesis requirement is satisfied by taking at least 6 credits of BMI/CSE/ESE 599, 
which is usually (though not necessarily) done by taking that course twice for 3 credits each.  
GPA requirement counts as 1 requirement, even if it is multi-faceted, e.g., 
even if it imposes minimums on both cumulative GPA and departmental GPA. number-of-credits requirement counts as 1 requirement.
*/

function requirementStatus (s: Student){
    let reqStatus: [number, number, number] = [0, 0, 0];//satisfied,pending,unsatisfied
    let coursePlans=CoursePlanModel.find({sbuId : s.sbuId})
    let degree=DegreeRequirementsModel.find(requirementVersion:s.entrySemester+" "+s.entryYear)
    switch(s.department) { //each department has different requirements so the counts are determined based on what the department of the student is
        case "AMS": { 
            /*

            //Need to handle the generic gpa requirement and credit requirement



            Get track of student
            let unsatisfiedCoursesNum=core courses in track + numCourses in elective
            let numElectives=track.elective.numCourses
            //create variable/array, tempName, to keep track of x courses in range, maybe this can be simplified if not gonna be tested during demo
            for every string in additionalCoreCourseRequirements
            {
                unsatisfiedCoursesNum+= +string[0]//the integer value realistically wouldnt be over 9. In 
                //case we want to deal with that case regardless, split the string by whitespace
                //and use the integer value for the first element in the split string array

                //update the variable/array tempName with string parsed into x and range
            }
            For every course in courseplan
            {
                if course is in track.coreCourses
                {
                    //not sure if more conditionals are needed to separate changes by the semester in courseplan
                    //this also applies to the other cases as well
                    reqStatus[0]+=1
                    unsatisfiedCourseNum-=1
                }
                else
                {
                    let coreCourse=False
                    for e in tempName  //once again this might be overboard and could probably be simplified to just the hard coded case in the file
                    {
                        if e[0]>0 && isCourseInRange(course,e[1])
                        {
                            reqStatus[0]+=1
                            unsatisfiedCourseNum-=1
                            e[0]-=1
                            coreCourse=True
                        }
                    }
                    if(!coreCourse && numElectives>0)
                    {
                        if track.elective.range is not empty
                        {
                            if(isCourseInRange(course,track.elective.range))
                            {
                                reqStatus[0]+=1
                                unsatisfiedCourseNum-=1
                                numElectives-=1
                            }
                            else
                            {
                                check substitutions // I can write pseudocode or code for it tomorrow, dont have the time for
                                //writing it out tonight
                            }
                        }
                        else
                        {
                            //i think if this case is reached, the course is considered an elective course
                            //and reqStatus,unsatisfiedCourseNum, and numElectives get updated
                        }
                    }
                }
            }
            */
           break; 
        } 
        case "BMI": { 
           
           break; 
        } 
        case "CSE": { 
           
           break; 
        } 
        case "ECE": { 
            
           break; 
        } 
        default: { 
           //maybe throw an error 
           break; 
        } 
     } 
}

function isCourseInRange (c: Course, r: string){
    let dep=r.substr(0,3)
    let min: number=+r.substr(4,3)//lower bound for range
    let max: number=+r.substr(8,9)//upper bound for range
    return (c.department==dep && c.number>=min && c.number<=max)
}

